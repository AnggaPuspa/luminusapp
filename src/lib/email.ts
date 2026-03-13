import { Resend } from 'resend';
import { render } from '@react-email/render';
import WelcomeEmailTemplate from '@/components/emails/WelcomeEmailTemplate';
import PaymentSuccessTemplate from '@/components/emails/PaymentSuccessTemplate';
import CourseCompletionTemplate from '@/components/emails/CourseCompletionTemplate';
import SubscriptionSuccessTemplate from '@/components/emails/SubscriptionSuccessTemplate';
import SubscriptionExpiredTemplate from '@/components/emails/SubscriptionExpiredTemplate';

// Resend menggunakan HTTP API — kompatibel 100% dengan Vercel serverless
// Nodemailer (TCP SMTP) diblokir oleh Vercel di level network
const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_ADDRESS = process.env.MAIL_FROM_ADDRESS || 'noreply@luminusapp.com';
const FROM_NAME = process.env.MAIL_FROM_NAME || 'Luminus';
const defaultFrom = `"${FROM_NAME}" <${FROM_ADDRESS}>`;

export async function sendWelcomeEmail(name: string, email: string) {
    if (!process.env.RESEND_API_KEY) {
        console.log(`[MOCK EMAIL] Welcome Email → ${email} (${name})`);
        return;
    }

    try {
        const emailHtml = await render(WelcomeEmailTemplate({ name }));
        const { error } = await resend.emails.send({
            from: defaultFrom,
            to: email,
            subject: `Selamat datang di Luminus, ${name}! 🎓`,
            html: emailHtml,
        });
        if (error) throw error;
        console.log(`[Email] Welcome email sent → ${email}`);
    } catch (error) {
        console.error("Failed to send Welcome Email:", error);
    }
}

export async function sendPaymentSuccessEmail(name: string, email: string, courseTitle: string, amount: number) {
    if (!process.env.RESEND_API_KEY) {
        console.log(`[MOCK EMAIL] Payment Success Email → ${email} (${courseTitle})`);
        return;
    }

    try {
        const emailHtml = await render(PaymentSuccessTemplate({ name, courseTitle, amount }));
        const { error } = await resend.emails.send({
            from: defaultFrom,
            to: email,
            subject: `Pembayaran Berhasil: ${courseTitle} 🎉`,
            html: emailHtml,
        });
        if (error) throw error;
        console.log(`[Email] Payment success email sent → ${email}`);
    } catch (error) {
        console.error("Failed to send Payment Success Email:", error);
    }
}

export async function sendCourseCompletionEmail(name: string, email: string, courseTitle: string) {
    if (!process.env.RESEND_API_KEY) {
        console.log(`[MOCK EMAIL] Course Completion Email → ${email} (${courseTitle})`);
        return;
    }

    try {
        const emailHtml = await render(CourseCompletionTemplate({ name, courseTitle }));
        const { error } = await resend.emails.send({
            from: defaultFrom,
            to: email,
            subject: `Selamat atas kelulusan Anda di ${courseTitle}! 🏆`,
            html: emailHtml,
        });
        if (error) throw error;
        console.log(`[Email] Course completion email sent → ${email}`);
    } catch (error) {
        console.error("Failed to send Course Completion Email:", error);
    }
}

export async function sendSubscriptionSuccessEmail(name: string, email: string, planName: string, amount: number, billingCycle: string) {
    if (!process.env.RESEND_API_KEY) {
        console.log(`[MOCK EMAIL] Subscription Success Email → ${email} (${planName} / ${billingCycle})`);
        return;
    }

    try {
        const emailHtml = await render(SubscriptionSuccessTemplate({ name, planName, amount, billingCycle }));
        const { error } = await resend.emails.send({
            from: defaultFrom,
            to: email,
            subject: `Langganan Aktif: ${planName} 🎉`,
            html: emailHtml,
        });
        if (error) throw error;
        console.log(`[Email] Subscription success email sent → ${email}`);
    } catch (error) {
        console.error("Failed to send Subscription Success Email:", error);
    }
}

export async function sendSubscriptionExpiredEmail(name: string, email: string, planName: string) {
    if (!process.env.RESEND_API_KEY) {
        console.log(`[MOCK EMAIL] Subscription Expired Email → ${email} (${planName})`);
        return;
    }

    try {
        const emailHtml = await render(SubscriptionExpiredTemplate({ name, planName }));
        const { error } = await resend.emails.send({
            from: defaultFrom,
            to: email,
            subject: `Masa Langganan Anda Berakhir - ${planName} 🛑`,
            html: emailHtml,
        });
        if (error) throw error;
        console.log(`[Email] Subscription expired email sent → ${email}`);
    } catch (error) {
        console.error("Failed to send Subscription Expired Email:", error);
    }
}
