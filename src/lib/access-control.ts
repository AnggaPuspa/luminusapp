import prisma from "@/lib/prisma";
import { cache } from "react";
import { SubscriptionTier, SubscriptionPlan, UserSubscription } from "../../prisma/generated/client";

export type AccessResult = {
    hasAccess: boolean;
    accessType: 'PURCHASE' | 'SUBSCRIPTION' | 'ADMIN' | null;
    subscription?: { tier: SubscriptionTier; expiresAt: Date; plan: SubscriptionPlan } | null;
};

// React.cache() deduplicates this call per server request lifecycle
// If checkCourseAccess + checkSubscriberAccess both call this, DB is hit only 1x
export const getActiveSubscription = cache(async (userId: string) => {
    return prisma.userSubscription.findFirst({
        where: {
            userId,
            status: 'ACTIVE',
            currentPeriodEnd: { gt: new Date() }
        },
        include: { plan: true }
    });
});

export async function checkCourseAccess(userId: string, courseId: string): Promise<AccessResult> {
    // STEP 1: Cek enrollment langsung (indexed, O(1) via @@unique)
    const enrollment = await prisma.enrollment.findUnique({
        where: { userId_courseId: { userId, courseId } }
    });

    if (enrollment && ['ACTIVE', 'COMPLETED'].includes(enrollment.status)) {
        if (enrollment.source === 'PURCHASE') {
            return { hasAccess: true, accessType: 'PURCHASE' };
        }
        // source = SUBSCRIPTION → verify masih aktif
        const sub = await getActiveSubscription(userId);
        if (sub) {
            return {
                hasAccess: true, accessType: 'SUBSCRIPTION', subscription: {
                    tier: sub.plan.tier,
                    expiresAt: sub.currentPeriodEnd,
                    plan: sub.plan
                }
            };
        }
        // Expired → deny (enrollment tetap ada tapi SUSPENDED by cron)
        return { hasAccess: false, accessType: null };
    }

    // STEP 2: No enrollment → cek apakah plan-nya cover kelas ini
    const sub = await getActiveSubscription(userId);
    if (sub) {
        const included = sub.plan.allCoursesIncluded ||
            await prisma.planCourse.findUnique({
                where: { planId_courseId: { planId: sub.plan.id, courseId } }
            });

        if (included) {
            // Lazy enrollment — upsert untuk avoid race condition (multi-tab)
            // dan reactivate SUSPENDED enrollment saat user resubscribe
            await prisma.enrollment.upsert({
                where: { userId_courseId: { userId, courseId } },
                create: { userId, courseId, source: 'SUBSCRIPTION', status: 'ACTIVE' },
                update: { status: 'ACTIVE' }
            });
            return {
                hasAccess: true, accessType: 'SUBSCRIPTION', subscription: {
                    tier: sub.plan.tier,
                    expiresAt: sub.currentPeriodEnd,
                    plan: sub.plan
                }
            };
        }
    }

    return { hasAccess: false, accessType: null };
}

export async function checkSubscriberAccess(userId: string): Promise<{
    isSubscriber: boolean;
    tier?: SubscriptionTier;
    expiresAt?: Date;
    communityUrl?: string;
    aiQuotaRemaining?: number;
}> {
    const sub = await getActiveSubscription(userId);
    if (!sub) return { isSubscriber: false };
    return {
        isSubscriber: true,
        tier: sub.plan.tier,
        expiresAt: sub.currentPeriodEnd,
        communityUrl: sub.plan.communityInviteUrl || undefined,
        aiQuotaRemaining: sub.plan.aiMentorQuota === 0
            ? Infinity  // unlimited
            : sub.plan.aiMentorQuota - sub.aiChatUsedThisMonth,
    };
}
