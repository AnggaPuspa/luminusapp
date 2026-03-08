import { NextResponse } from 'next/server';
import { streamText, convertToModelMessages, UIMessage } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import prisma from '@/lib/prisma';
import { checkSubscriberAccess } from '@/lib/access-control';
import { verifySession } from '@/lib/auth';

const qwen = createOpenAI({
    baseURL: 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1',
    apiKey: process.env.QWEN_API_KEY,
});

// Allowed to run for up to 60 seconds
export const maxDuration = 60;

// Build personalized context from user's DB data
async function getUserContext(userId: string) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            name: true,
            createdAt: true,
            enrollments: {
                where: { status: { in: ['ACTIVE', 'COMPLETED'] } },
                select: {
                    courseId: true,
                    source: true,
                    course: {
                        select: {
                            title: true,
                            modules: {
                                select: {
                                    lessons: { select: { id: true } }
                                }
                            }
                        }
                    }
                }
            },
            lessonProgress: {
                where: { completed: true },
                select: {
                    lesson: {
                        select: {
                            module: {
                                select: { courseId: true }
                            }
                        }
                    }
                }
            },
            quizAttempts: {
                orderBy: { createdAt: 'desc' },
                take: 5,
                select: {
                    score: true,
                    totalQ: true,
                    createdAt: true,
                }
            },
            subscriptions: {
                where: { status: 'ACTIVE', currentPeriodEnd: { gt: new Date() } },
                select: { plan: { select: { name: true, tier: true } } },
                take: 1
            }
        }
    });

    if (!user) return null;

    // Calculate per-course progress
    const completedByCourseId = new Map<string, number>();
    for (const lp of user.lessonProgress) {
        const courseId = lp.lesson.module.courseId;
        completedByCourseId.set(courseId, (completedByCourseId.get(courseId) || 0) + 1);
    }

    const courseSummaries = user.enrollments.map(e => {
        const totalLessons = e.course.modules.reduce((sum, m) => sum + m.lessons.length, 0);
        const completed = completedByCourseId.get(e.courseId) || 0;
        const percent = totalLessons > 0 ? Math.round((completed / totalLessons) * 100) : 0;
        return `- ${e.course.title} (${percent}% selesai, ${completed}/${totalLessons} lesson, akses: ${e.source})`;
    });

    const quizSummary = user.quizAttempts.length > 0
        ? user.quizAttempts.map(q => `${q.score}/${q.totalQ}`).join(', ')
        : 'Belum ada quiz';

    const activePlan = user.subscriptions[0]?.plan;

    return {
        name: user.name,
        memberSince: user.createdAt.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }),
        totalCourses: user.enrollments.length,
        courseSummaries,
        quizSummary,
        planName: activePlan?.name || null,
        planTier: activePlan?.tier || null,
    };
}

export async function POST(req: Request) {
    try {
        // 1. Session Auth
        const session = await verifySession();
        if (!session?.user) {
            return new Response('Unauthorized', { status: 401 });
        }

        // 2. Subscription & Quota Check
        const access = await checkSubscriberAccess(session.user.id);
        if (!access.isSubscriber) {
            return new Response('Premium feature requires active subscription', { status: 403 });
        }

        if (access.aiQuotaRemaining !== undefined && access.aiQuotaRemaining <= 0) {
            return new Response('AI Chat quota exceeded for this month. Upgrade your plan or wait for the reset.', { status: 429 });
        }

        // 3. Parse chat history
        const { messages }: { messages: UIMessage[] } = await req.json();

        if (!messages || !Array.isArray(messages)) {
            return new Response('Invalid request payload', { status: 400 });
        }

        // 4. Fetch personalized user context + course catalog from DB
        const [ctx, allCourses] = await Promise.all([
            getUserContext(session.user.id),
            prisma.course.findMany({
                where: { status: 'PUBLISHED', deletedAt: null },
                select: { title: true, description: true },
                orderBy: { createdAt: 'desc' }
            })
        ]);

        // 5. Build personalized system prompt
        const systemPrompt = `Kamu adalah Senior Tech Career Mentor bernama 'Luminus AI Mentor' di platform e-learning Luminus.

PERAN & GAYA:
- Kamu mentor yang suportif, to-the-point, dan kasih advice yang actionable
- Panggil user dengan nama mereka
- Jawab dalam Bahasa Indonesia (kecuali diminta lain)
- Kalau ditanya di luar topik tech/karir/coding, tolak sopan dan redirect ke topik belajar

${ctx ? `PROFIL MURID:
- Nama: ${ctx.name}
- Member sejak: ${ctx.memberSince}
- Langganan: ${ctx.planName ? `${ctx.planName} (${ctx.planTier})` : 'Tidak aktif'}
- Total kelas diikuti: ${ctx.totalCourses}

KELAS YANG SEDANG DIIKUTI:
${ctx.courseSummaries.length > 0 ? ctx.courseSummaries.join('\n') : '- Belum ada kelas aktif'}

SKOR QUIZ TERAKHIR: ${ctx.quizSummary}` : 'Data murid tidak tersedia.'}

KATALOG KELAS LUMINUS (yang tersedia di platform):
${allCourses.map(c => `- ${c.title}${c.description ? `: ${c.description.substring(0, 80)}` : ''}`).join('\n')}

INSTRUKSI KONTEKS:
- Gunakan data di atas untuk memberikan saran yang PERSONAL. Contoh: kalau progress kelas rendah, motivasi mereka untuk lanjut. Kalau quiz score bagus, puji.
- Kalau murid tanya "kelas apa yang harus diprioritasin?", jawab berdasarkan data progress di atas.
- Kalau murid belum punya kelas, sarankan kelas dari KATALOG di atas.
- HANYA sebut kelas yang ada di KATALOG KELAS LUMINUS di atas. JANGAN PERNAH mengarang nama kelas yang tidak ada.
- JANGAN pernah fabricate data yang tidak ada di profil mereka.`;

        // 6. Stream Response from Alibaba Qwen
        const result = streamText({
            model: qwen.chat('qwen-plus'),
            system: systemPrompt,
            messages: await convertToModelMessages(messages),
            async onFinish({ usage }) {
                // 7. Deduct Quota
                try {
                    const activeSub = await prisma.userSubscription.findFirst({
                        where: {
                            userId: session.user.id,
                            status: 'ACTIVE',
                            currentPeriodEnd: { gt: new Date() }
                        }
                    });

                    if (activeSub) {
                        await prisma.userSubscription.update({
                            where: { id: activeSub.id },
                            data: { aiChatUsedThisMonth: { increment: 1 } }
                        });
                    }
                } catch (dbError) {
                    console.error("Failed to deduct AI quota for user:", session.user.id, dbError);
                }
            },
        });

        return result.toUIMessageStreamResponse();
    } catch (error: any) {
        console.error("Qwen API Error:", error);
        return new Response(error.message || 'Internal Server Error', { status: 500 });
    }
}
