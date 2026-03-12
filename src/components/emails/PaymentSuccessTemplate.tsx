import { Html, Head, Body, Container, Text, Link, Preview, Section } from "@react-email/components";

interface PaymentSuccessProps {
    name: string;
    courseTitle: string;
    amount: number;
}

function formatPrice(price: number) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
}

export default function PaymentSuccessTemplate({ name, courseTitle, amount }: PaymentSuccessProps) {
    return (
        <Html>
            <Head />
            <Preview>Pembayaran berhasil untuk kursus {courseTitle}</Preview>
            <Body style={main}>
                <Container style={container}>
                    <Text style={h1}>Terima Kasih, {name}! 🎉</Text>
                    <Text style={text}>
                        Pembayaran Anda sebesar <strong>{formatPrice(amount)}</strong> telah berhasil kami terima.
                    </Text>
                    <Text style={text}>
                        Anda sekarang memiliki akses penuh ke kursus <strong>{courseTitle}</strong>.
                    </Text>
                    <Section style={btnContainer}>
                        <Link href="https://luminusapp.vercel.app/dashboard/courses" style={button}>
                            Buka Kelas Saya
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
const button = { backgroundColor: "#10b981", color: "#fff", padding: "12px 20px", borderRadius: "5px", textDecoration: "none", display: "inline-block", fontWeight: "bold" };
