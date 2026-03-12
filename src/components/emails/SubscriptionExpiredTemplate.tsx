import { Html, Head, Body, Container, Text, Link, Preview, Section } from "@react-email/components";

interface SubscriptionExpiredProps {
    name: string;
    planName: string;
}

export default function SubscriptionExpiredTemplate({ name, planName }: SubscriptionExpiredProps) {
    return (
        <Html>
            <Head />
            <Preview>Masa Langganan {planName} Berakhir</Preview>
            <Body style={main}>
                <Container style={container}>
                    <Text style={h1}>Halo, {name}</Text>
                    <Text style={text}>
                        Kami informasikan bahwa masa berlangganan untuk paket <strong>{planName}</strong> Anda telah berakhir dan saat ini tidak aktif (EXPIRED).
                    </Text>
                    <Text style={text}>
                        Akses ke fitur premium dan kursus berbayar telah dihentikan. Anda dapat berlangganan kembali kapan saja untuk melanjutkan proses belajar Anda.
                    </Text>
                    <Section style={btnContainer}>
                        <Link href="https://luminus.id/pricing" style={button}>
                            Perbarui Langganan
                        </Link>
                    </Section>
                    <Text style={text}>Terima kasih telah belajar bersama kami.<br />Tim Luminus</Text>
                </Container>
            </Body>
        </Html>
    );
}

const main = { backgroundColor: "#f6f9fc", fontFamily: "sans-serif" };
const container = { backgroundColor: "#ffffff", padding: "40px", borderRadius: "10px", margin: "40px auto", border: "1px solid #eee", borderTop: "4px solid #EF4444" };
const h1 = { color: "#333", fontSize: "24px", fontWeight: "bold", padding: "0", margin: "0 0 20px 0" };
const text = { color: "#555", fontSize: "16px", lineHeight: "24px" };
const btnContainer = { textAlign: "center" as const, margin: "30px 0" };
const button = { backgroundColor: "#EF4444", color: "#fff", padding: "12px 20px", borderRadius: "5px", textDecoration: "none", display: "inline-block", fontWeight: "bold" };
