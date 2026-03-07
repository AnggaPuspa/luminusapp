import { Html, Head, Body, Container, Text, Link, Preview, Section } from "@react-email/components";

interface CourseCompletionProps {
    name: string;
    courseTitle: string;
}

export default function CourseCompletionTemplate({ name, courseTitle }: CourseCompletionProps) {
    return (
        <Html>
            <Head />
            <Preview>Selamat! Anda telah menyelesaikan kelas {courseTitle}</Preview>
            <Body style={main}>
                <Container style={container}>
                    <Text style={h1}>Luar Biasa, {name}! 🏆</Text>
                    <Text style={text}>
                        Selamat! Anda telah berhasil menyelesaikan semua materi dalam kursus <strong>{courseTitle}</strong>.
                    </Text>
                    <Text style={text}>
                        Sertifikat kelulusan Anda sekarang sudah tersedia dan dapat diunduh langsung dari halaman dashboard Anda.
                        Jangan lupa bagikan sertifikat Anda di LinkedIn!
                    </Text>
                    <Section style={btnContainer}>
                        <Link href="https://luminus.id/dashboard/courses" style={button}>
                            Unduh Sertifikat Saya
                        </Link>
                    </Section>
                    <Text style={text}>Keep Learning,<br />Tim Luminus</Text>
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
