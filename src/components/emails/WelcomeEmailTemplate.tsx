import { Html, Head, Body, Container, Text, Link, Preview, Section } from "@react-email/components";

interface WelcomeEmailProps {
    name: string;
}

export default function WelcomeEmailTemplate({ name }: WelcomeEmailProps) {
    return (
        <Html>
            <Head />
            <Preview>Selamat datang di Luminus!</Preview>
            <Body style={main}>
                <Container style={container}>
                    <Text style={h1}>Selamat Datang di Luminus, {name}! 🎓</Text>
                    <Text style={text}>
                        Kami sangat senang Anda bergabung dengan Luminus. Temukan ribuan kursus menarik
                        dan mulai perjalanan belajar Anda bersama mentor-mentor terbaik.
                    </Text>
                    <Section style={btnContainer}>
                        <Link href="https://luminus.id/kursus" style={button}>
                            Mulai Belajar Sekarang
                        </Link>
                    </Section>
                    <Text style={text}>
                        Terima kasih,
                        <br />
                        Tim Luminus
                    </Text>
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
