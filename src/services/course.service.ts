import prisma from "@/lib/prisma";
import { cache } from "react";

// --- Types ---
export interface CourseDetail {
    id: string;
    title: string;
    slug: string;
    description: string | null;
    thumbnailUrl: string | null;
    originalPrice: number;
    discountedPrice: number | null;
    duration: number;
    status: string;
    deletedAt: Date | null;
    modules: {
        id: string;
        title: string;
        sortOrder: number;
        lessons: {
            id: string;
            title: string;
            duration: number;
        }[];
    }[];
    reviews: {
        id: string;
        rating: number;
        comment: string | null;
        createdAt: Date;
        user: {
            name: string;
            avatarUrl: string | null;
        };
    }[];
}

/**
 * Fetch a published course by slug with modules, lessons, and reviews.
 * Uses React.cache() so generateMetadata + page share one DB call per request.
 */
export const getCourseBySlug = cache(async (slug: string): Promise<CourseDetail | null> => {
    return prisma.course.findUnique({
        where: {
            slug,
            status: "PUBLISHED",
            deletedAt: null
        },
        include: {
            modules: {
                orderBy: { sortOrder: 'asc' },
                include: {
                    lessons: {
                        orderBy: { sortOrder: 'asc' },
                        select: { id: true, title: true, duration: true }
                    }
                }
            },
            reviews: {
                include: {
                    user: { select: { name: true, avatarUrl: true } }
                },
                orderBy: { createdAt: 'desc' },
                take: 10
            }
        }
    }) as any;
});

/**
 * Fetch all published courses for the public catalog.
 */
export async function getPublishedCourses() {
    return prisma.course.findMany({
        where: {
            status: "PUBLISHED",
            deletedAt: null
        },
        orderBy: { createdAt: "desc" },
    });
}
