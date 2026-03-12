import { Html, Head, Body, Container, Text, Link, Preview, Section } from "@react-email/components";

interface SubscriptionSuccessProps {
    name: string;
    planName: string;
    amount: number;
    billingCycle: string;
}

function formatPrice(price: number) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
}

export default function SubscriptionSuccessTemplate({ name, planName, amount, billingCycle }: SubscriptionSuccessProps) {
    return (
        <Html>
            <Head />
            <Preview>Langganan {planName} Anda telah aktif</Preview>
            <Body style={main}>
                <Container style={container}>
                    <Text style={h1}>Terima Kasih, {name}! 🎉</Text>
                    <Text style={text}>
                        Pembayaran berlangganan Anda sebesar <strong>{formatPrice(amount)}</strong> telah berhasil kami terima.
                    </Text>
                    <Text style={text}>
                        Paket <strong>{planName} ({billingCycle})</strong> Anda sekarang sudah aktif. Anda dapat mengakses semua fitur premium dan kursus eksklusif yang tersedia dalam paket ini.
                    </Text>
                    <Section style={btnContainer}>
                        <Link href="https://luminus.id/dashboard" style={button}>
                            Masuk ke Dashboard
                        </Link>
                    </Section>
                    <Text style={text}>Salam Sukses,<br />Tim Luminus</Text>
                </Container>
            </Body>
        </Html>
    );
}

const main = { backgroundColor: "#f6f9fc", fontFamily: "sans-serif" };
const container = { backgroundColor: "#ffffff", padding: "40px", borderRadius: "10px", margin: "40px auto", border: "1px solid #eee" };
const h1 = { color: "#333", fontSize: "24px", fontWeight: "bold", padding: "0", margin: "0 0 20px 0" };
const text = { color: "#555", fontSize: "16px", lineHeight: "24px" };
const btnContainer = { textAlign: "center" as const, margin: "30px 0" };
const button = { backgroundColor: "#696EFF", color: "#fff", padding: "12px 20px", borderRadius: "5px", textDecoration: "none", display: "inline-block", fontWeight: "bold" };
