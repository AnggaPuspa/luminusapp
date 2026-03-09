import { NextResponse } from 'next/server';
import { createOpenAI } from '@ai-sdk/openai';
import { generateText } from 'ai';
import prisma from '@/lib/prisma';

const qwen = createOpenAI({
    baseURL: 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1',
    apiKey: process.env.QWEN_API_KEY,
});

export const maxDuration = 60;

// POST /api/ai/assessment
// mode: "generate" → generate quiz questions
// mode: "analyze"  → analyze answers and give results
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { mode, topic, questionCount, answers } = body;

        if (mode === 'generate') {
            return await handleGenerate(topic, questionCount || 5);
        } else if (mode === 'analyze') {
            return await handleAnalyze(topic, answers);
        }

        return NextResponse.json({ error: 'Invalid mode' }, { status: 400 });
    } catch (error: any) {
        console.error("Assessment API Error:", error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}

async function handleGenerate(topic: string, count: number) {
    if (!topic) {
        return NextResponse.json({ error: 'Topic is required' }, { status: 400 });
    }

    const clampedCount = Math.min(Math.max(count, 3), 15);

    const { text } = await generateText({
        model: qwen.chat('qwen-plus'),
        prompt: `Kamu adalah pembuat soal assessment skill untuk platform e-learning.

TOPIK: ${topic}
JUMLAH SOAL: ${clampedCount}

INSTRUKSI:
- Buat ${clampedCount} soal pilihan ganda untuk menilai kemampuan DASAR hingga MENENGAH seseorang di topik "${topic}"
- Mulai dari soal SANGAT MUDAH (beginner pemula) lalu bertahap paling maksimal ke tingkat MENENGAH (intermediate).
- JANGAN PERNAH membuat soal yang terlalu sulit, rumit, atau level 'Dewa' (advanced). Fokus ke fondasi.
- Setiap soal punya 4 pilihan jawaban (A, B, C, D)
- Tandai jawaban yang benar
- Soal harus relevan dengan apa yang biasanya dipelajari di bulan pertama belajar topik ini.
- Boleh menggunakan soal teori dasar maupun hal praktis sederhana.
- Gunakan Bahasa Indonesia untuk pertanyaan, tapi istilah teknis tetap dalam bahasa Inggris
- JIKA ada potongan kode (code snippet) baik di pertanyaan maupun pilihan jawaban (misal HTML tag seperti <div>, function, script), WAJIB bungkus dengan markdown backticks (\`kode\`) agar tidak merusak tampilan UI.

RESPONSE FORMAT (JSON array, TANPA markdown code block pada keseluruhan body JSON-nya):
[{"question":"...","options":[{"label":"...","value":"A"},{"label":"...","value":"B"},{"label":"...","value":"C"},{"label":"...","value":"D"}],"correct":"A","difficulty":"easy"},{"question":"...","options":[...],"correct":"B","difficulty":"medium"}]

PENTING: Response HARUS berupa JSON array murni, TANPA backtick, TANPA markdown.`,
    });

    try {
        // Clean potential markdown wrapper
        let cleaned = text.trim();
        if (cleaned.startsWith('```')) {
            cleaned = cleaned.replace(/^```\w*\n?/, '').replace(/\n?```$/, '');
        }
        const questions = JSON.parse(cleaned);
        return NextResponse.json({ questions });
    } catch (e) {
        console.error("Failed to parse AI questions:", text);
        return NextResponse.json({ error: 'AI gagal generate soal, coba lagi' }, { status: 500 });
    }
}

async function handleAnalyze(topic: string, answers: { question: string; userAnswer: string; correct: string; difficulty: string }[]) {
    if (!answers || !Array.isArray(answers) || answers.length === 0) {
        return NextResponse.json({ error: 'Answers are required' }, { status: 400 });
    }

    // Fetch real course catalog
    const allCourses = await prisma.course.findMany({
        where: { status: 'PUBLISHED', deletedAt: null },
        select: { title: true, slug: true, description: true, thumbnailUrl: true },
    });

    const totalCorrect = answers.filter(a => a.userAnswer === a.correct).length;
    const totalQuestions = answers.length;
    const percentage = Math.round((totalCorrect / totalQuestions) * 100);

    const answerSummary = answers.map((a, i) =>
        `${i + 1}. [${a.difficulty}] ${a.question} → Jawaban user: ${a.userAnswer}, Benar: ${a.correct} (${a.userAnswer === a.correct ? '✅' : '❌'})`
    ).join('\n');

    const catalogList = allCourses.map(c => `- ${c.title} (slug: ${c.slug}): ${c.description?.substring(0, 80) || 'No description'}`).join('\n');

    const { text } = await generateText({
        model: qwen.chat('qwen-plus'),
        prompt: `Kamu adalah AI skill assessor di platform e-learning Luminus.

TOPIK ASSESSMENT: ${topic}
SKOR: ${totalCorrect}/${totalQuestions} (${percentage}%)

DETAIL JAWABAN:
${answerSummary}

KATALOG KELAS LUMINUS:
${catalogList}

INSTRUKSI:
Analisa jawaban di atas dan tentukan level user. Berikan response dalam JSON format (TANPA backtick, TANPA markdown):

{
  "level": "Beginner" atau "Intermediate" atau "Advanced",
  "score": "${totalCorrect}/${totalQuestions}",
  "percentage": ${percentage},
  "summary": "Penjelasan singkat 2-3 kalimat tentang kekuatan dan kelemahan user",
  "recommendation": "Saran kelas dari KATALOG LUMINUS di atas yang paling cocok. HANYA sebut kelas yang ada di katalog. Jika tidak ada yang cocok, bilang 'Belum ada kelas yang sesuai di Luminus untuk topik ini'",
  "recommendedCourseSlug": "slug kelas yang direkomendasikan (dari katalog) atau null"
}

KRITERIA LEVEL:
- Beginner: Score < 40% ATAU gagal di soal-soal easy
- Intermediate: Score 40-75% DAN bisa jawab soal easy + sebagian medium
- Advanced: Score > 75% DAN bisa jawab soal hard

PENTING: Response HARUS berupa JSON murni, TANPA backtick.`,
    });

    try {
        let cleaned = text.trim();
        if (cleaned.startsWith('```')) {
            cleaned = cleaned.replace(/^```\w*\n?/, '').replace(/\n?```$/, '');
        }
        const result = JSON.parse(cleaned);

        // Attach course thumbnail if we got a slug
        if (result.recommendedCourseSlug) {
            const course = allCourses.find(c => c.slug === result.recommendedCourseSlug);
            if (course) {
                result.recommendedCourseTitle = course.title;
                result.recommendedCourseThumbnail = course.thumbnailUrl;
                result.recommendedCourseSlug = course.slug;
            }
        }

        return NextResponse.json(result);
    } catch (e) {
        console.error("Failed to parse AI analysis:", text);
        // Fallback with basic level determination
        const level = percentage >= 75 ? 'Advanced' : percentage >= 40 ? 'Intermediate' : 'Beginner';
        return NextResponse.json({
            level,
            score: `${totalCorrect}/${totalQuestions}`,
            percentage,
            summary: `Kamu menjawab ${totalCorrect} dari ${totalQuestions} soal dengan benar.`,
            recommendation: 'Coba explore kelas-kelas yang tersedia di Luminus!',
            recommendedCourseSlug: null,
        });
    }
}
