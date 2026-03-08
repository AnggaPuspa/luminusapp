import { PrismaClient } from './generated/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Membuat dummy data Subscription Plans (Paket Langganan)...');

    // Bersihkan data lama jika diperlukan (opsional, dikomen untuk keamanan)
    // await prisma.subscriptionPlan.deleteMany();

    const plans = [
        {
            name: 'Paket Pemula (Basic)',
            slug: 'paket-pemula-basic',
            tier: 'BIASA',
            description: 'Sangat cocok untuk kamu yang baru mulai belajar coding dari nol.',
            monthlyPrice: 49000,
            yearlyPrice: 490000, // Diskon 2 bulan
            isActive: true,
            features: JSON.stringify([
                'Akses 3 kelas dasar pilihan',
                'Video resolusi standar 720p',
                'Tanya jawab di forum umum',
                'Sertifikat kelulusan digital'
            ]),
            allCoursesIncluded: false,
            aiMentorQuota: 10,
            sortOrder: 1,
        },
        {
            name: 'Paket Murid (Pro)',
            slug: 'paket-murid-pro',
            tier: 'MURID',
            description: 'Akses semua kelas utama untuk mempercepat karir tech-mu.',
            monthlyPrice: 99000,
            yearlyPrice: 990000,
            isActive: true,
            features: JSON.stringify([
                'Akses SEMUA kelas yang ada',
                'Video resolusi tinggi 1080p',
                'Download Source Code premium',
                'Tantangan koding (Challenge)',
                'Review code dari sesama murid'
            ]),
            allCoursesIncluded: true,
            aiMentorQuota: 100, // 100x chat / bulan
            sortOrder: 2,
        },
        {
            name: 'Expert (Profesional)',
            slug: 'expert-profesional',
            tier: 'PROFESIONAL',
            description: 'Cocok untuk upgrade skill, akses tanpa batas & mentor VIP.',
            monthlyPrice: 199000,
            yearlyPrice: 1990000,
            isActive: true,
            features: JSON.stringify([
                'Semua fitur VIP di Paket Murid',
                'Konsultasi portofolio karir',
                'Prioritas review & QnA Mentor',
                'Diskon khusus event Luminus'
            ]),
            allCoursesIncluded: true,
            communityInviteUrl: 'https://discord.gg/luminus-vip',
            aiMentorQuota: 9999, // Dianggap unlimited
            sortOrder: 3,
        }
    ];

    for (const plan of plans) {
        await prisma.subscriptionPlan.upsert({
            where: { slug: plan.slug },
            update: {}, // Hanya buat jika belum ada
            create: {
                name: plan.name,
                slug: plan.slug,
                tier: plan.tier as any,
                description: plan.description,
                monthlyPrice: plan.monthlyPrice,
                yearlyPrice: plan.yearlyPrice,
                isActive: plan.isActive,
                features: plan.features,
                allCoursesIncluded: plan.allCoursesIncluded,
                aiMentorQuota: plan.aiMentorQuota,
                communityInviteUrl: plan.communityInviteUrl,
                sortOrder: plan.sortOrder,
            }
        });
        console.log(`✅ Berhasil seeding plan: ${plan.name}`);
    }

    console.log('Selesai!');
}

main()
    .catch((e) => {
        console.error('Error seeding data:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
