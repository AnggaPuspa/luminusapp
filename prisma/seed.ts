import { PrismaClient, CourseStatus } from './generated/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

function slugify(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
}

// ============================================================
// 1. Admin User Seed
// ============================================================
async function seedAdmin() {
    const adminEmail = 'admin@luminus.com'
    const adminPasswordRaw = 'Password123!'
    const hashedPassword = await bcrypt.hash(adminPasswordRaw, 10)

    await prisma.user.upsert({
        where: { email: adminEmail },
        update: {
            password: hashedPassword,
            role: 'ADMIN',
            phoneNumber: '08123456789',
        },
        create: {
            email: adminEmail,
            name: 'Luminus Admin',
            password: hashedPassword,
            role: 'ADMIN',
            phoneNumber: '08123456789',
        },
    })

    console.log('✅ Admin user seeded')
    console.log(`   Email: ${adminEmail}`)
    console.log(`   Password: ${adminPasswordRaw}\n`)
}

// ============================================================
// 2. Courses, Modules & Lessons Seed
// ============================================================
interface LessonData {
    title: string
    videoUrl?: string
    duration: number
    content?: string
    resources?: { title: string; url: string }[]
}

interface ModuleData {
    title: string
    lessons: LessonData[]
}

const COURSES_DATA = [
    {
        title: 'UI/UX Masterclass: Designing SaaS Dashboards',
        description:
            'Belajar merancang antarmuka aplikasi SaaS tingkat lanjut menggunakan Figma. Kita akan fokus pada UX layouting, pembuatan komponen Bento Box bergaya modern, dan menyusun Design System yang rapi untuk di-handover ke tim Frontend.',
        originalPrice: 450000,
        discountedPrice: 149000,
        duration: 12,
        status: CourseStatus.PUBLISHED,
        thumbnailUrl:
            'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=450&fit=crop',
        modules: [
            {
                title: 'Figma Fundamentals & Auto Layout',
                lessons: [
                    { title: 'Mengenal Interface Figma', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', duration: 15, content: '# Mengenal Interface Figma\n\nDi lesson ini kita akan mempelajari dasar-dasar interface Figma, termasuk toolbar, layers panel, dan canvas navigation.' },
                    { title: 'Mastering Auto Layout', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', duration: 22, content: '# Auto Layout\n\nAuto Layout adalah fitur paling powerful di Figma untuk membuat responsive components.' },
                    { title: 'Hands-on: Membuat Card Component', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', duration: 30, content: '# Praktik Card Component\n\nKita akan membuat reusable card component dengan Auto Layout dan variants.', resources: [{ title: 'Starter File - Card Component.fig', url: 'https://drive.google.com/file/d/example1' }, { title: 'Figma Shortcut Cheatsheet.pdf', url: 'https://drive.google.com/file/d/example2' }] },
                ],
            },
            {
                title: 'Wireframing & Prototyping',
                lessons: [
                    { title: 'Low-Fidelity Wireframe Basics', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', duration: 18, content: '# Wireframing\n\nPelajari cara membuat wireframe yang efektif sebelum masuk ke high-fidelity design.' },
                    { title: 'Interactive Prototyping dengan Smart Animate', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', duration: 25, content: '# Smart Animate\n\nBuat prototype yang hidup dengan transisi animasi Figma.' },
                ],
            },
            {
                title: 'Developer Handover Process',
                lessons: [
                    { title: 'Design Token & Style Guide', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', duration: 20, content: '# Design Tokens\n\nBagaimana cara menyusun design token agar mudah di-implementasi oleh developer.', resources: [{ title: 'Design Token Template.json', url: 'https://drive.google.com/file/d/example3' }] },
                    { title: 'Export Assets & Dev Mode', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', duration: 15, content: '# Dev Mode\n\nGunakan Dev Mode di Figma untuk handover yang seamless ke tim frontend.', resources: [{ title: 'Handover Checklist.pdf', url: 'https://drive.google.com/file/d/example4' }] },
                ],
            },
        ] as ModuleData[],
    },
    {
        title: 'Scalable Backend with Go & PostgreSQL',
        description:
            'Tingkatkan skill backend kamu ke level senior menggunakan Golang. Kita akan membangun RESTful API yang super cepat, mengimplementasikan arsitektur Microservices, JWT authentication, dan optimasi query database untuk ribuan concurrent users.',
        originalPrice: 950000,
        discountedPrice: 399000,
        duration: 28,
        status: CourseStatus.PUBLISHED,
        thumbnailUrl:
            'https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=800&h=450&fit=crop',
        modules: [
            {
                title: 'Golang Basics & Clean Architecture',
                lessons: [
                    { title: 'Setup Go Environment & First Program', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', duration: 20, content: '# Hello Go!\n\nInstalasi Go, setup workspace, dan menulis program pertama.' },
                    { title: 'Structs, Interfaces & Error Handling', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', duration: 35, content: '# Core Go Concepts\n\nMemahami struct, interface, dan idiomatic error handling di Go.' },
                    { title: 'Clean Architecture Pattern', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', duration: 28, content: '# Clean Architecture\n\nMenerapkan prinsip Clean Architecture di project Go.', resources: [{ title: 'Boilerplate Go Clean Architecture', url: 'https://github.com/example/go-clean-arch' }, { title: 'Diagram Arsitektur.png', url: 'https://drive.google.com/file/d/example5' }] },
                ],
            },
            {
                title: 'Database Design & GORM',
                lessons: [
                    { title: 'PostgreSQL Schema Design', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', duration: 25, content: '# Schema Design\n\nMerancang schema database PostgreSQL yang optimal.' },
                    { title: 'GORM: Model, Migration & Query', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', duration: 30, content: '# GORM ORM\n\nMenggunakan GORM untuk interaksi database di Go.' },
                ],
            },
            {
                title: 'JWT Security & Redis Caching',
                lessons: [
                    { title: 'Implementasi JWT Authentication', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', duration: 30, content: '# JWT Auth\n\nMembuat sistem autentikasi dengan JSON Web Token.' },
                    { title: 'Redis Caching Strategy', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', duration: 25, content: '# Redis Cache\n\nOptimalkan performa API dengan Redis caching layer.' },
                    { title: 'Rate Limiting & Security Best Practices', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', duration: 20, content: '# Security\n\nProteksi API dengan rate limiter dan security headers.', resources: [{ title: 'Nginx Rate Limit Config.conf', url: 'https://drive.google.com/file/d/example6' }] },
                ],
            },
        ] as ModuleData[],
    },
    {
        title: 'Panduan Dasar Git & GitHub untuk Pemula',
        description:
            'Kelas wajib untuk semua developer! Pelajari perintah dasar Git dari nol, cara mengatasi merge conflict yang menyebalkan, dan best practice kolaborasi tim menggunakan repository GitHub.',
        originalPrice: 150000,
        discountedPrice: null,
        duration: 3,
        status: CourseStatus.PUBLISHED,
        thumbnailUrl:
            'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=800&h=450&fit=crop',
        modules: [
            {
                title: 'Instalasi & Setup Git',
                lessons: [
                    { title: 'Download & Install Git', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', duration: 8, content: '# Install Git\n\nCara install Git di Windows, Mac, dan Linux.' },
                    { title: 'Konfigurasi Awal: Name, Email & SSH Key', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', duration: 12, content: '# Git Config\n\nSetup identitas dan SSH key untuk GitHub.' },
                ],
            },
            {
                title: 'Commit, Push, dan Pull',
                lessons: [
                    { title: 'git init, add & commit — Alur Dasar', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', duration: 15, content: '# Basic Git Flow\n\nMemahami staging area dan membuat commit pertama.' },
                    { title: 'Push ke GitHub & Clone Repository', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', duration: 12, content: '# Remote Repository\n\nMenghubungkan local repo ke GitHub.' },
                ],
            },
            {
                title: 'Resolving Merge Conflicts',
                lessons: [
                    { title: 'Branching Strategy: main, dev, feature', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', duration: 18, content: '# Git Branching\n\nStrategi branching untuk kolaborasi tim.' },
                    { title: 'Cara Resolve Merge Conflict Step-by-Step', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', duration: 20, content: '# Merge Conflicts\n\nPanduan lengkap mengatasi merge conflict tanpa panik.', resources: [{ title: 'Git Commands Cheatsheet.pdf', url: 'https://drive.google.com/file/d/example7' }, { title: '.gitignore Templates Collection', url: 'https://github.com/github/gitignore' }] },
                ],
            },
        ] as ModuleData[],
    },
    {
        title: 'Mastering React Native: Build iOS & Android Apps',
        description:
            'Kelas komprehensif membuat aplikasi mobile lintas platform dengan React Native dan Expo. Dari desain UI mobile hingga upload ke Play Store dan App Store.',
        originalPrice: 800000,
        discountedPrice: null,
        duration: 35,
        status: CourseStatus.DRAFT,
        thumbnailUrl:
            'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=450&fit=crop',
        modules: [] as ModuleData[], // Test case: kelas tanpa modul
    },
]

async function seedCourses() {
    console.log('📚 Seeding courses, modules & lessons...\n')

    for (const data of COURSES_DATA) {
        const slug = slugify(data.title)

        const course = await prisma.course.upsert({
            where: { slug },
            update: {
                title: data.title,
                description: data.description,
                originalPrice: data.originalPrice,
                discountedPrice: data.discountedPrice,
                duration: data.duration,
                status: data.status,
                thumbnailUrl: data.thumbnailUrl,
            },
            create: {
                title: data.title,
                slug,
                description: data.description,
                originalPrice: data.originalPrice,
                discountedPrice: data.discountedPrice,
                duration: data.duration,
                status: data.status,
                thumbnailUrl: data.thumbnailUrl,
            },
        })

        console.log(
            `✅ Course: "${course.title}" [${course.status}] (${course.id})`
        )

        if (data.modules.length > 0) {
            // Hapus modul lama → cascade hapus lessons juga (idempotent)
            await prisma.module.deleteMany({ where: { courseId: course.id } })

            for (let i = 0; i < data.modules.length; i++) {
                const modData = data.modules[i]
                const mod = await prisma.module.create({
                    data: {
                        courseId: course.id,
                        title: modData.title,
                        sortOrder: i + 1,
                    },
                })
                console.log(`   📦 Module ${i + 1}: "${mod.title}"`)

                // Create lessons for this module
                for (let j = 0; j < modData.lessons.length; j++) {
                    const lessonData = modData.lessons[j]
                    const lesson = await prisma.lesson.create({
                        data: {
                            moduleId: mod.id,
                            title: lessonData.title,
                            videoUrl: lessonData.videoUrl || null,
                            duration: lessonData.duration,
                            content: lessonData.content || null,
                            sortOrder: j + 1,
                            resources: lessonData.resources
                                ? JSON.stringify(lessonData.resources)
                                : undefined,
                        },
                    })
                    console.log(`      📝 Lesson ${j + 1}: "${lesson.title}" (${lesson.duration}min)`)
                }
            }
        } else {
            console.log('   📦 (Tanpa modul — Draft test case)')
        }

        console.log('')
    }
}

// ============================================================
// Main
// ============================================================
async function main() {
    console.log('🌱 Starting database seed...\n')

    await seedAdmin()
    await seedCourses()

    console.log('🎉 Seeding complete!')
}

main()
    .catch((e) => {
        console.error('❌ Seeding failed:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
