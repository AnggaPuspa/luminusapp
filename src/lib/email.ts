import { Resend } from 'resend';
import WelcomeEmailTemplate from '@/components/emails/WelcomeEmailTemplate';
import PaymentSuccessTemplate from '@/components/emails/PaymentSuccessTemplate';
import CourseCompletionTemplate from '@/components/emails/CourseCompletionTemplate';

let _resend: Resend | null = null;
function getResend() {
    if (!_resend && process.env.RESEND_API_KEY) {
        _resend = new Resend(process.env.RESEND_API_KEY);
    }
    return _resend;
}

export async function sendWelcomeEmail(name: string, email: string) {
    if (!process.env.RESEND_API_KEY) {
        console.log(`[MOCK EMAIL] Welcome Email sent to ${email} for ${name}`);
        return;
    }

    try {
        await getResend()!.emails.send({
            from: 'Luminus <onboarding@resend.dev>', // Use onboarding@resend.dev for testing without verified domain
            to: email,
            subject: `Selamat datang di Luminus, ${name}! 🎓`,
            react: WelcomeEmailTemplate({ name }),
        });
    } catch (error) {
        console.error("Failed to send Welcome Email:", error);
    }
}

export async function sendPaymentSuccessEmail(name: string, email: string, courseTitle: string, amount: number) {
    if (!process.env.RESEND_API_KEY) {
        console.log(`[MOCK EMAIL] Payment Success Email sent to ${email} for ${courseTitle}`);
        return;
    }

    try {
        await getResend()!.emails.send({
            from: 'Luminus <onboarding@resend.dev>',
            to: email,
            subject: `Pembayaran Berhasil: ${courseTitle} 🎉`,
            react: PaymentSuccessTemplate({ name, courseTitle, amount }),
        });
    } catch (error) {
        console.error("Failed to send Payment Success Email:", error);
    }
}

export async function sendCourseCompletionEmail(name: string, email: string, courseTitle: string) {
    if (!process.env.RESEND_API_KEY) {
        console.log(`[MOCK EMAIL] Course Completion Email sent to ${email} for ${courseTitle}`);
        return;
    }

    try {
        await getResend()!.emails.send({
            from: 'Luminus <onboarding@resend.dev>',
            to: email,
            subject: `Selamat atas kelulusan Anda di ${courseTitle}! 🏆`,
            react: CourseCompletionTemplate({ name, courseTitle }),
        });
    } catch (error) {
        console.error("Failed to send Course Completion Email:", error);
    }
}
