import crypto from "crypto";

const MAYAR_API_KEY = process.env.MAYAR_API_KEY!;
const MAYAR_WEBHOOK_SECRET = process.env.MAYAR_WEBHOOK_SECRET!;
const IS_SANDBOX = process.env.MAYAR_IS_SANDBOX === "true";

// Mayar Sandbox API uses api.mayar.club, Production uses api.mayar.id
const BASE_URL = IS_SANDBOX ? "https://api.mayar.club" : "https://api.mayar.id";

export interface CreatePaymentPayload {
    name: string;          // Customer Name
    email: string;         // Customer Email
    amount: number;        // Payment Amount
    description: string;   // Transaction / Product Description
    mobile: string;        // Customer Mobile Number
    redirectUrl?: string;  // Optional redirect after payment
}

export async function createMayarInvoice(payload: CreatePaymentPayload) {
    try {
        const url = `${BASE_URL}/hl/v1/payment/create`;

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${MAYAR_API_KEY}`,
            },
            body: JSON.stringify({
                name: payload.name,
                email: payload.email,
                amount: payload.amount,
                description: payload.description,
                mobile: payload.mobile,
                ...(payload.redirectUrl && { redirectUrl: payload.redirectUrl })
            }),
        });

        if (!response.ok) {
            const errortxt = await response.text();
            console.error("Mayar API Create Payment Failed:", errortxt);
            throw new Error(`Mayar API Error: ${errortxt}`);
        }

        const data = await response.json();
        return data; // expecting { link: 'https://...', id: '...' } inside data
    } catch (error) {
        console.error("error calling mayar api", error);
        throw error;
    }
}

export function verifyMayarWebhook(signature: string, payloadStr: string): boolean {
    if (!MAYAR_WEBHOOK_SECRET) {
        console.error("MAYAR_WEBHOOK_SECRET is not configured! Rejecting webhook.");
        return false;
    }

    try {
        // HMAC SHA256 of the payload body string using the secret
        const expectedSignature = crypto
            .createHmac('sha256', MAYAR_WEBHOOK_SECRET)
            .update(payloadStr)
            .digest('hex');

        // Timing-safe comparison to prevent timing attacks
        if (signature.length !== expectedSignature.length) return false;
        return crypto.timingSafeEqual(
            Buffer.from(signature, 'hex'),
            Buffer.from(expectedSignature, 'hex')
        );
    } catch (e) {
        return false;
    }
}
