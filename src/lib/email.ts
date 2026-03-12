import nodemailer from 'nodemailer';
import { render } from '@react-email/render';
import WelcomeEmailTemplate from '@/components/emails/WelcomeEmailTemplate';
import PaymentSuccessTemplate from '@/components/emails/PaymentSuccessTemplate';
import CourseCompletionTemplate from '@/components/emails/CourseCompletionTemplate';
import SubscriptionSuccessTemplate from '@/components/emails/SubscriptionSuccessTemplate';
import SubscriptionExpiredTemplate from '@/components/emails/SubscriptionExpiredTemplate';

// Create a single transporter instance
const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST || 'smtp.gmail.com',
    port: Number(process.env.MAIL_PORT) || 587,
    secure: process.env.MAIL_ENCRYPTION === 'ssl', // true for 465, false for other ports
    auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD,
    },
});

const defaultFrom = `"${process.env.MAIL_FROM_NAME || 'Luminus'}" <${process.env.MAIL_FROM_ADDRESS || process.env.MAIL_USERNAME}>`;

export async function sendWelcomeEmail(name: string, email: string) {
    if (!process.env.MAIL_USERNAME) {
        console.log(`[MOCK EMAIL] Welcome Email sent to ${email} for ${name}`);
        return;
    }

    try {
        const emailHtml = await render(WelcomeEmailTemplate({ name }));
        await transporter.sendMail({
            from: defaultFrom,
            to: email,
            subject: `Selamat datang di Luminus, ${name}! 🎓`,
            html: emailHtml,
        });
    } catch (error) {
        console.error("Failed to send Welcome Email:", error);
    }
}

export async function sendPaymentSuccessEmail(name: string, email: string, courseTitle: string, amount: number) {
    if (!process.env.MAIL_USERNAME) {
        console.log(`[MOCK EMAIL] Payment Success Email sent to ${email} for ${courseTitle}`);
        return;
    }

    try {
        const emailHtml = await render(PaymentSuccessTemplate({ name, courseTitle, amount }));
        await transporter.sendMail({
            from: defaultFrom,
            to: email,
            subject: `Pembayaran Berhasil: ${courseTitle} 🎉`,
            html: emailHtml,
        });
    } catch (error) {
        console.error("Failed to send Payment Success Email:", error);
    }
}

export async function sendCourseCompletionEmail(name: string, email: string, courseTitle: string) {
    if (!process.env.MAIL_USERNAME) {
        console.log(`[MOCK EMAIL] Course Completion Email sent to ${email} for ${courseTitle}`);
        return;
    }

    try {
        const emailHtml = await render(CourseCompletionTemplate({ name, courseTitle }));
        await transporter.sendMail({
            from: defaultFrom,
            to: email,
            subject: `Selamat atas kelulusan Anda di ${courseTitle}! 🏆`,
            html: emailHtml,
        });
    } catch (error) {
        console.error("Failed to send Course Completion Email:", error);
    }
}

export async function sendSubscriptionSuccessEmail(name: string, email: string, planName: string, amount: number, billingCycle: string) {
    if (!process.env.MAIL_USERNAME) {
        console.log(`[MOCK EMAIL] Subscription Success Email sent to ${email} for ${planName} (${billingCycle})`);
        return;
    }

    try {
        const emailHtml = await render(SubscriptionSuccessTemplate({ name, planName, amount, billingCycle }));
        await transporter.sendMail({
            from: defaultFrom,
            to: email,
            subject: `Langganan Aktif: ${planName} 🎉`,
            html: emailHtml,
        });
    } catch (error) {
        console.error("Failed to send Subscription Success Email:", error);
    }
}

export async function sendSubscriptionExpiredEmail(name: string, email: string, planName: string) {
    if (!process.env.MAIL_USERNAME) {
        console.log(`[MOCK EMAIL] Subscription Expired Email sent to ${email} for ${planName}`);
        return;
    }

    try {
        const emailHtml = await render(SubscriptionExpiredTemplate({ name, planName }));
        await transporter.sendMail({
            from: defaultFrom,
            to: email,
            subject: `Masa Langganan Anda Berakhir - ${planName} 🛑`,
            html: emailHtml,
        });
    } catch (error) {
        console.error("Failed to send Subscription Expired Email:", error);
    }
}
