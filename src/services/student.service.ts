import prisma from "@/lib/prisma";
import { checkSubscriberAccess } from "@/lib/access-control";
import { createSession } from "@/lib/auth";
import bcrypt from "bcryptjs";

// ─── Shared Helper ───────────────────────────────────────────────

function calculateCourseProgress(modules: any[], userId: string) {
    let totalLessons = 0;
    let completedLessons = 0;

    for (const mod of modules) {
        for (const lesson of mod.lessons) {
            totalLessons++;
            if (lesson.progress && lesson.progress.length > 0 && lesson.progress[0].completed) {
                completedLessons++;
            }
        }
    }

    return {
        totalLessons,
        completedLessons,
        progressPercent: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0,
    };
}

// ─── Overview ────────────────────────────────────────────────────

export async function getStudentOverview(userId: string) {
    const [activeCourses, completedCourses, totalTransactions, pendingTransactions, recentEnrollments] = await Promise.all([
        prisma.enrollment.count({
            where: { userId, status: { in: ["ACTIVE", "COMPLETED"] } },
        }),
        prisma.enrollment.count({
            where: { userId, status: "COMPLETED" },
        }),
        prisma.transaction.count({
            where: { userId },
        }),
        prisma.transaction.count({
            where: { userId, status: "PENDING" },
        }),
        prisma.enrollment.findMany({
            where: { userId, status: { in: ["ACTIVE", "COMPLETED"] } },
            orderBy: { enrolledAt: "desc" },
            take: 3,
            include: {
                course: {
                    select: {
                        id: true, title: true, slug: true, thumbnailUrl: true,
                        modules: {
                            include: {
                                lessons: {
                                    select: {
                                        id: true,
                                        progress: {
                                            where: { userId, completed: true }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }),
    ]);

    const recentCourses = recentEnrollments.map((e: any) => {
        const { totalLessons, completedLessons: completedCourseLessons, progressPercent } = calculateCourseProgress(e.course.modules, userId);
        return {
            id: e.course.id,
            title: e.course.title,
            slug: e.course.slug,
            thumbnailUrl: e.course.thumbnailUrl,
            enrolledAt: e.enrolledAt,
            totalLessons,
            completedLessons: completedCourseLessons,
            progressPercent
        };
    });

    const inProgressCourses = recentCourses.filter(
        (c: any) => c.completedLessons >= 1 && c.progressPercent < 100
    );

    const subscriptionDetails = await checkSubscriberAccess(userId);

    return {
        activeCourses,
        completedCourses,
        totalTransactions,
        pendingTransactions,
        recentCourses: inProgressCourses,
        subscription: subscriptionDetails,
    };
}

// ─── Student Courses ─────────────────────────────────────────────

export async function getStudentCourses(userId: string) {
    const enrollments = await prisma.enrollment.findMany({
        where: {
            userId,
            status: { in: ["ACTIVE", "COMPLETED"] },
            course: { status: "PUBLISHED", deletedAt: null }
        },
        select: {
            enrolledAt: true,
            source: true,
            course: {
                select: {
                    id: true, title: true, slug: true, description: true,
                    thumbnailUrl: true, originalPrice: true, discountedPrice: true, duration: true,
                    modules: {
                        select: {
                            lessons: {
                                select: {
                                    id: true,
                                    progress: { where: { userId }, select: { completed: true } }
                                }
                            }
                        }
                    }
                }
            }
        },
        orderBy: { enrolledAt: "desc" },
    });

    const courses = enrollments.map((e: any) => {
        const allLessons = e.course.modules.flatMap((m: any) => m.lessons);
        const completedLessons = allLessons.filter((l: any) => l.progress[0]?.completed === true);
        const { modules, ...courseData } = e.course;

        return {
            ...courseData,
            userId: e.userId || userId,
            enrolledAt: e.enrolledAt,
            source: e.source,
            totalLessons: allLessons.length,
            completedLessons: completedLessons.length,
            progressPercent: allLessons.length > 0
                ? Math.round((completedLessons.length / allLessons.length) * 100)
                : 0,
        };
    });

    return courses.filter(
        (c: any) => c.source === 'PURCHASE' || c.completedLessons >= 1
    );
}

// ─── Available Courses (Subscription) ────────────────────────────

export async function getAvailableCourses(userId: string) {
    const activeSub = await prisma.userSubscription.findFirst({
        where: {
            userId,
            status: 'ACTIVE',
            currentPeriodEnd: { gt: new Date() }
        },
        include: {
            plan: { include: { includedCourses: true } }
        }
    });

    if (!activeSub) {
        return { courses: [] };
    }

    const isAllCoursesIncluded = activeSub.plan.allCoursesIncluded;
    const includedCourseIds = activeSub.plan.includedCourses.map(pc => pc.courseId);

    const existingEnrollments = await prisma.enrollment.findMany({
        where: { userId, status: { in: ["ACTIVE", "COMPLETED", "SUSPENDED"] } },
        select: {
            courseId: true,
            course: {
                select: {
                    modules: {
                        select: {
                            lessons: {
                                select: {
                                    progress: {
                                        where: { userId, completed: true },
                                        select: { id: true }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    });

    const activelyLearningCourseIds = existingEnrollments
        .filter(e => {
            const completedCount = e.course.modules
                .flatMap((m: any) => m.lessons)
                .filter((l: any) => l.progress.length > 0)
                .length;
            return completedCount >= 1;
        })
        .map(e => e.courseId);

    let whereClause: any = {
        status: "PUBLISHED",
        deletedAt: null,
        id: { notIn: activelyLearningCourseIds }
    };

    if (!isAllCoursesIncluded) {
        whereClause.id.in = includedCourseIds;
    }

    const availableCourses = await prisma.course.findMany({
        where: whereClause,
        select: {
            id: true, title: true, slug: true, description: true,
            thumbnailUrl: true, duration: true,
            modules: { select: { id: true } }
        },
        orderBy: { createdAt: "desc" }
    });

    const formattedCourses = availableCourses.map(course => ({
        id: course.id,
        title: course.title,
        slug: course.slug,
        description: course.description,
        thumbnailUrl: course.thumbnailUrl,
        duration: course.duration,
        totalLessons: course.modules.length > 0 ? -1 : 0,
        progressPercent: 0,
        completedLessons: 0,
        isAvailableToStart: true,
    }));

    return { courses: formattedCourses };
}

// ─── Transactions ────────────────────────────────────────────────

export async function getStudentTransactions(userId: string) {
    const [courseTransactions, subscriptionInvoices] = await Promise.all([
        prisma.transaction.findMany({
            where: { userId },
            include: { course: { select: { title: true, thumbnailUrl: true } } },
            orderBy: { createdAt: "desc" },
        }),
        prisma.subscriptionInvoice.findMany({
            where: { subscription: { userId } },
            include: {
                subscription: { include: { plan: { select: { name: true } } } }
            },
            orderBy: { createdAt: "desc" },
        })
    ]);

    const normalizedCourse = courseTransactions.map((tx: any) => ({
        id: tx.id,
        type: "COURSE" as const,
        title: tx.course?.title || "Kelas",
        thumbnailUrl: tx.course?.thumbnailUrl || null,
        subtitle: "Pembelian Kelas",
        amount: tx.amount,
        status: tx.status,
        createdAt: tx.createdAt,
        mayarInvoiceUrl: tx.mayarInvoiceUrl || null,
    }));

    const normalizedSub = subscriptionInvoices.map((inv: any) => ({
        id: inv.id,
        type: "SUBSCRIPTION" as const,
        title: inv.subscription?.plan?.name || "Langganan",
        thumbnailUrl: null,
        subtitle: "Langganan Bulanan",
        amount: inv.amount,
        status: inv.status,
        createdAt: inv.createdAt,
        mayarInvoiceUrl: inv.mayarInvoiceUrl || null,
    }));

    return [...normalizedCourse, ...normalizedSub]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

// ─── Analytics ───────────────────────────────────────────────────

export async function getStudentAnalytics(userId: string) {
    const quizAttempts = await prisma.quizAttempt.findMany({
        where: { userId },
        orderBy: { score: 'desc' },
        include: { user: { select: { name: true } } }
    });

    type QuizAttemptType = typeof quizAttempts[0];

    const detailedAttempts = await Promise.all(quizAttempts.map(async (attempt: QuizAttemptType) => {
        const quiz = await prisma.quiz.findUnique({
            where: { id: attempt.quizId },
            select: { title: true, module: { select: { courseId: true } } }
        });
        return {
            ...attempt,
            quizTitle: quiz?.title || "Kuis",
            courseId: quiz?.module?.courseId || null,
        };
    }));

    let avgScore = 0;
    if (quizAttempts.length > 0) {
        const sumScores = quizAttempts.reduce((acc: number, curr: QuizAttemptType) => acc + (curr.score / curr.totalQ), 0);
        avgScore = Math.round((sumScores / quizAttempts.length) * 100);
    }

    return {
        bestScore: detailedAttempts.length > 0 ? detailedAttempts[0] : null,
        recentAttempts: detailedAttempts,
        avgScore,
    };
}

// ─── Profile ─────────────────────────────────────────────────────

export async function getStudentProfile(userId: string) {
    return prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true, email: true, avatarUrl: true, role: true, createdAt: true }
    });
}

export async function updateStudentProfile(userId: string, data: { name?: string; email?: string; password?: string }) {
    const updatedData: any = {};
    if (data.name) updatedData.name = data.name;
    if (data.email) updatedData.email = data.email;
    if (data.password) {
        updatedData.password = await bcrypt.hash(data.password, 10);
    }

    const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: updatedData,
        select: { id: true, name: true, email: true, avatarUrl: true, role: true }
    });

    if (data.name || data.email) {
        await createSession({
            id: updatedUser.id,
            email: updatedUser.email,
            name: updatedUser.name,
            role: updatedUser.role,
        });
    }

    return updatedUser;
}

// ─── Reviews ─────────────────────────────────────────────────────

export async function submitCourseReview(
    userId: string,
    role: string,
    data: { courseId: string; rating: number; comment?: string }
) {
    const { courseId, rating, comment } = data;

    if (!courseId || !rating || typeof rating !== 'number' || rating < 1 || rating > 5) {
        throw Object.assign(new Error("Invalid input. CourseId and rating (1-5) are required."), { status: 400 });
    }

    if (role !== "ADMIN") {
        const enrollment = await prisma.enrollment.findUnique({
            where: { userId_courseId: { userId, courseId } }
        });

        if (!enrollment || enrollment.status !== "ACTIVE") {
            throw Object.assign(new Error("Access Denied: You must be actively enrolled to leave a review."), { status: 403 });
        }

        const totalLessons = await prisma.lesson.count({
            where: { module: { courseId } }
        });

        const completedLessons = await prisma.lessonProgress.count({
            where: { userId, completed: true, lesson: { module: { courseId } } }
        });

        const progressPercentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

        if (progressPercentage < 50) {
            throw Object.assign(new Error("Anda harus menyelesaikan minimal 50% materi kelas untuk memberikan ulasan."), { status: 403 });
        }
    }

    return prisma.courseReview.upsert({
        where: { userId_courseId: { userId, courseId } },
        update: { rating, comment, updatedAt: new Date() },
        create: { userId, courseId, rating, comment },
    });
}
