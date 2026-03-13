import 'dotenv/config';

async function testMayar() {
    const MAYAR_API_KEY = process.env.MAYAR_API_KEY;
    const IS_SANDBOX = process.env.MAYAR_IS_SANDBOX === "true";
    const BASE_URL = IS_SANDBOX ? "https://api.mayar.club" : "https://api.mayar.id";

    // Replicate exactly what api/checkout sends
    const payload = {
        name: "Test Student",
        email: "student@example.com",
        amount: 50000,
        description: "Pembelian Kursus: Kursus Programming",
        mobile: "081234567890"
        // Missing redirectUrl, checking if it causes failure
    };

    console.log("Payload:", payload);

    try {
        const response = await fetch(`${BASE_URL}/hl/v1/payment/create`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${MAYAR_API_KEY}`,
            },
            body: JSON.stringify(payload),
        });

        const text = await response.text();
        console.log(`Status: ${response.status} ${response.statusText}`);
        console.log("Response Body:", text);
    } catch (e) {
        console.error("Fetch failed:", e);
    }
}

testMayar();
