import { NextResponse } from 'next/server';
import { exportFinanceTransactions, getFinanceStats } from '@/services/finance.service';
import { verifySession } from '@/lib/auth';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

function fmtRp(n: number) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })
        .format(n)
        .replace(/\u00A0/g, ' '); // Replace non-breaking space with regular space
}

export async function GET(request: Request) {
    try {
        const session = await verifySession();
        if (!session?.user || session.user.role !== 'ADMIN') {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const monthParam = searchParams.get('month');
        const yearParam = searchParams.get('year');

        const year = yearParam ? parseInt(yearParam) : new Date().getFullYear();
        const month = monthParam === 'all' ? 'all' : (monthParam ? parseInt(monthParam) : new Date().getMonth());

        const [transactions, stats] = await Promise.all([
            exportFinanceTransactions(month, year),
            getFinanceStats(month, year)
        ]);

        const MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
        const dateLabel = month === 'all' 
            ? `Tahun ${year}` 
            : `${MONTHS[month as number]} ${year}`;

        // Build Accounting-Standard CSV string
        // \uFEFF is the Byte Order Mark (BOM) needed so Excel knows this is UTF-8
        let csvContent = "\uFEFF";
        
        // --- HEADER SECTION (P&L STATEMENT) ---
        csvContent += `"PT LUMINUS APPLICATION"\n`;
        csvContent += `"LAPORAN LABA RUGI (PROFIT & LOSS)"\n`;
        csvContent += `"Periode:","${dateLabel}"\n\n`;

        csvContent += `"KETERANGAN","","JUMLAH (Rp)"\n`;
        csvContent += `"PENDAPATAN (REVENUE)"\n`;
        csvContent += `"Pendapatan Kursus","","${fmtRp(stats.courseRevenue.current)}"\n`;
        csvContent += `"Pendapatan Berlangganan (MRR)","","${fmtRp(stats.subscriptionRevenue.current)}"\n`;
        csvContent += `"TOTAL PENDAPATAN KOTOR","","${fmtRp(stats.grossRevenue.current)}"\n\n`;

        csvContent += `"PENGURANGAN & BEBAN (DEDUCTIONS)"\n`;
        csvContent += `"Pajak Dipungut (PPN 11%)","","${fmtRp(-stats.taxCollected.current)}"\n`;
        csvContent += `"Dampak Diskon Kupon","","${fmtRp(-stats.couponImpact.current)}"\n`;
        const totalDeductions = stats.taxCollected.current + stats.couponImpact.current;
        csvContent += `"TOTAL PENGURANGAN","","${fmtRp(-totalDeductions)}"\n\n`;

        csvContent += `"PENDAPATAN BERSIH (NET REVENUE)","","${fmtRp(stats.netRevenue.current)}"\n\n`;
        csvContent += `"=================================================="\n\n`;

        // --- TRANSACTIONS SECTION ---
        csvContent += `"RINCIAN TRANSAKSI"\n`;
        const headers = ['Tanggal', 'Nama Pelanggan', 'Email', 'Item', 'Tipe', 'Gross Amount', 'Tax (PPN 11%)', 'Net Amount', 'Status'];
        csvContent += headers.map(h => `"${h}"`).join(',') + '\n';

        transactions.forEach(t => {
            const formattedDate = format(new Date(t.date), "dd MMM yyyy - HH:mm", { locale: id });
            // Escape quotes inside CSV fields
            const name = `"${(t.customerName || "-").replace(/"/g, '""')}"`;
            const email = `"${(t.customerEmail || "-").replace(/"/g, '""')}"`;
            const item = `"${(t.item || "-").replace(/"/g, '""')}"`;

            const row = [
                `"${formattedDate}"`,
                name,
                email,
                item,
                `"${t.type}"`,
                `"${fmtRp(t.amount)}"`,
                `"${fmtRp(t.tax)}"`,
                `"${fmtRp(t.net)}"`,
                `"${t.status}"`
            ];

            csvContent += row.join(',') + '\n';
        });

        // Current date for filename
        const timeStr = format(new Date(), 'yyyyMMdd_HHmm');
        const filename = `financial_report_${year}_${month === 'all' ? 'all' : month}_${timeStr}.csv`;

        return new NextResponse(csvContent, {
            headers: {
                'Content-Type': 'text/csv',
                'Content-Disposition': `attachment; filename="${filename}"`
            }
        });

    } catch (error) {
        console.error('Error exporting finance data:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
