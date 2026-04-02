import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifySession } from "@/lib/auth";

export async function GET(request: Request) {
    try {
        const session = await verifySession();
        // Check if user is logged in AND is an ADMIN
        if (!session?.user || session.user.role !== "ADMIN") {
            return NextResponse.json({ message: "Unauthorized accesses. Admin only." }, { status: 401 });
        }

        // Fetch all users with basic relation counts to see activity
        const users = await prisma.user.findMany({
            orderBy: {
                createdAt: "desc",
            },
            include: {
                _count: {
                    select: {
                        enrollments: true,
                        transactions: true,
                    }
                },
                enrollments: {
                    take: 5,
                    orderBy: {
                        enrolledAt: "desc"
                    },
                    include: {
                        course: {
                            select: {
                                title: true,
                                thumbnailUrl: true
                            }
                        }
                    }
                },
                reviews: {
                    take: 5,
                    orderBy: {
                        createdAt: "desc"
                    },
                    include: {
                        course: {
                            select: {
                                title: true
                            }
                        }
                    }
                },
                transactions: {
                    take: 5,
                    orderBy: {
                        createdAt: "desc"
                    },
                    select: {
                        id: true,
                        paymentToken: true,
                        status: true,
                        createdAt: true,
                        amount: true
                    }
                }
            }
        });

        // Omit passwords explicitly before sending to client
        const safeUsers = users.map((user: any) => {
            const { password, ...safeUser } = user;
            return safeUser;
        });

        return NextResponse.json(safeUsers, { status: 200 });
    } catch (error: any) {
        console.error("Failed to fetch users:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
