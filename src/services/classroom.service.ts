import prisma from "@/lib/prisma";
import { checkCourseAccess, checkSubscriberAccess } from "@/lib/access-control";
import { sendCourseCompletionEmail } from "@/lib/email";

// ─── Shared Helper ───────────────────────────────────────────────

async function verifyEnrollment(userId: string, slug: string, role: string) {
    if (role === "ADMIN") return; // Admin bypass

    const course = await prisma.course.findUnique({
        where: { slug },
        include: {
            enrollments: {
                where: { userId, status: { in: ["ACTIVE", "COMPLETED"] } }
            }
        }
    });

    if (!course || course.enrollments.length === 0) {
        throw Object.assign(new Error("Not enrolled"), { status: 403 });
    }

    return course;
}

// ─── Classroom Data ──────────────────────────────────────────────

export async function getClassroomData(userId: string, slug: string, role: string) {
    const course = await prisma.course.findUnique({
        where: { slug },
        include: {
            modules: {
                orderBy: { sortOrder: "asc" },
                include: {
                    quiz: { select: { id: true, title: true } },
                    lessons: {
                        orderBy: { sortOrder: "asc" },
                        include: {
                            progress: {
                                where: { userId },
                                select: { completed: true, completedAt: true }
                            }
                        }
                    }
                }
            }
        }
    });

    if (!course) {
        throw Object.assign(new Error("Course not found"), { status: 404 });
    }

    if (role !== "ADMIN") {
        const access = await checkCourseAccess(userId, course.id);
        if (!access.hasAccess) {
            throw Object.assign(new Error("Access Denied: You must be enrolled or have an active subscription covering this course."), { status: 403 });
        }
        (course as any).accessType = access.accessType;

        const subAccess = await checkSubscriberAccess(userId);
        (course as any).isSubscriber = subAccess.isSubscriber;
    }

    return course;
}

// ─── Mark Lesson Complete ────────────────────────────────────────

interface MarkLessonSession {
    name?: string;
    email: string;
}

export async function markLessonComplete(
    userId: string,
    lessonId: string,
    role: string,
    session: MarkLessonSession
) {
    if (!lessonId) {
        throw Object.assign(new Error("lessonId is required"), { status: 400 });
    }

    const lesson = await prisma.lesson.findUnique({
        where: { id: lessonId },
        include: {
            module: {
                select: {
                    courseId: true,
                    course: { select: { title: true } }
                }
            }
        }
    });

    if (!lesson) {
        throw Object.assign(new Error("Lesson not found"), { status: 404 });
    }

    if (role !== "ADMIN") {
        const enrollment = await prisma.enrollment.findUnique({
            where: { userId_courseId: { userId, courseId: lesson.module.courseId } }
        });

        if (!enrollment || enrollment.status !== "ACTIVE") {
            throw Object.assign(new Error("Access Denied: Not enrolled in this course."), { status: 403 });
        }
    }

    const progress = await prisma.lessonProgress.upsert({
        where: { userId_lessonId: { userId, lessonId } },
        update: { completed: true, completedAt: new Date() },
        create: { userId, lessonId, completed: true, completedAt: new Date() },
    });

    const totalLessons = await prisma.lesson.count({
        where: { module: { courseId: lesson.module.courseId } }
    });

    const completedLessons = await prisma.lessonProgress.count({
        where: { userId, completed: true, lesson: { module: { courseId: lesson.module.courseId } } }
    });

    const isCourseCompleted = totalLessons > 0 && completedLessons >= totalLessons;

    if (isCourseCompleted) {
        const currentEnrollment = await prisma.enrollment.findUnique({
            where: { userId_courseId: { userId, courseId: lesson.module.courseId } }
        });

        if (currentEnrollment && currentEnrollment.status !== "COMPLETED") {
            await prisma.enrollment.update({
                where: { id: currentEnrollment.id },
                data: { status: "COMPLETED" }
            });

            sendCourseCompletionEmail(
                session.name || "Student",
                session.email,
                lesson.module.course.title
            ).catch(err => console.error("Course completion email error:", err));
        }
    }

    return { progress, isCourseCompleted };
}

// ─── Quiz: Fetch ─────────────────────────────────────────────────

export async function getQuizForStudent(userId: string, slug: string, moduleId: string, role: string) {
    await verifyEnrollment(userId, slug, role);

    const quiz = await prisma.quiz.findUnique({
        where: { moduleId },
        include: {
            questions: {
                select: { id: true, questionText: true, options: true, sortOrder: true },
                orderBy: { sortOrder: 'asc' }
            }
        }
    });

    if (!quiz) {
        throw Object.assign(new Error("Quiz not found"), { status: 404 });
    }

    const bestAttempt = await prisma.quizAttempt.findFirst({
        where: { userId, quizId: quiz.id },
        orderBy: { score: 'desc' }
    });

    return {
        quiz,
        bestScore: bestAttempt ? `${bestAttempt.score}/${bestAttempt.totalQ}` : null,
        bestScoreRaw: bestAttempt ? Math.round((bestAttempt.score / bestAttempt.totalQ) * 100) : 0,
    };
}

// ─── Quiz: Submit ────────────────────────────────────────────────

export async function submitQuizAnswers(
    userId: string,
    slug: string,
    moduleId: string,
    answers: Record<string, number>,
    role: string
) {
    if (!answers || typeof answers !== 'object') {
        throw Object.assign(new Error("Invalid answers format"), { status: 400 });
    }

    await verifyEnrollment(userId, slug, role);

    const quiz = await prisma.quiz.findUnique({
        where: { moduleId },
        include: { questions: true }
    });

    if (!quiz) {
        throw Object.assign(new Error("Quiz not found"), { status: 404 });
    }

    if (quiz.questions.length === 0) {
        throw Object.assign(new Error("Quiz has no questions"), { status: 400 });
    }

    let score = 0;
    const totalQ = quiz.questions.length;
    const gradedAnswers = [];

    for (const question of quiz.questions) {
        const submittedIndex = answers[question.id];
        const isCorrect = submittedIndex === question.correctIndex;
        if (isCorrect) score++;

        gradedAnswers.push({
            questionId: question.id,
            selectedIndex: submittedIndex ?? null,
            isCorrect,
            correctIndex: question.correctIndex,
        });
    }

    await prisma.quizAttempt.create({
        data: { userId, quizId: quiz.id, score, totalQ, answers: gradedAnswers }
    });

    return {
        score,
        totalQ,
        percentage: Math.round((score / totalQ) * 100),
        gradedAnswers,
    };
}
