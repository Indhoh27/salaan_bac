import PDFDocument from "pdfkit";
import type { IncomeExpenseReportPayload } from "./incomeExpenseReportCompute";

function fmt(n: number): string {
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function buildIncomeExpensePdfBuffer(data: IncomeExpenseReportPayload): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 48, size: "A4" });
    const chunks: Buffer[] = [];
    doc.on("data", (c: Buffer) => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.fontSize(16).text("Salaan — Income & expense report", { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10).fillColor("#333333");
    doc.text(`Period: ${data.period}`);
    doc.text(
      `Range: ${new Date(data.start).toLocaleDateString()} → ${new Date(data.endExclusive).toLocaleDateString()}`,
    );
    doc.text(`Generated: ${new Date().toLocaleString()}`);
    doc.moveDown();

    doc.fontSize(12).fillColor("#000000").text("Summary", { underline: true });
    doc.moveDown(0.3);
    doc.fontSize(10);
    doc.text(`Total income:    ${fmt(data.income)}`);
    doc.text(`Total expenses:  ${fmt(data.expenses)}`);
    doc.text(`Profit:          ${fmt(data.profit)}`);
    doc.moveDown();

    doc.fontSize(12).text("Income breakdown", { underline: true });
    doc.moveDown(0.3);
    doc.fontSize(10);
    doc.text(`Sellings: ${fmt(data.incomeBreakdown.sellings)}`);
    doc.text(`Jobs:     ${fmt(data.incomeBreakdown.jobs)}`);
    doc.moveDown();

    doc.fontSize(12).text("Expense breakdown", { underline: true });
    doc.moveDown(0.3);
    doc.fontSize(10);
    doc.text(`Purchase payments: ${fmt(data.expenseBreakdown.purchasePayments)}`);
    doc.text(`Other expenses:    ${fmt(data.expenseBreakdown.otherExpenses)}`);
    doc.moveDown();

    doc.fontSize(12).text("By day", { underline: true });
    doc.moveDown(0.3);
    doc.fontSize(9);
    if (data.breakdown.length === 0) {
      doc.text("No activity in this range.");
    } else {
      const rowH = 14;
      let y = doc.y;
      const left = doc.page.margins.left;
      const w = doc.page.width - doc.page.margins.left - doc.page.margins.right;
      doc.font("Helvetica-Bold");
      doc.text("Day", left, y, { width: w * 0.22 });
      doc.text("Income", left + w * 0.22, y, { width: w * 0.22, align: "right" });
      doc.text("Expense", left + w * 0.44, y, { width: w * 0.22, align: "right" });
      doc.text("Profit", left + w * 0.66, y, { width: w * 0.34, align: "right" });
      y += rowH;
      doc.font("Helvetica");
      for (const row of data.breakdown) {
        if (y > doc.page.height - doc.page.margins.bottom - 40) {
          doc.addPage();
          y = doc.page.margins.top;
        }
        doc.text(row.day, left, y, { width: w * 0.22 });
        doc.text(fmt(row.income), left + w * 0.22, y, { width: w * 0.22, align: "right" });
        doc.text(fmt(row.expense), left + w * 0.44, y, { width: w * 0.22, align: "right" });
        doc.text(fmt(row.profit), left + w * 0.66, y, { width: w * 0.34, align: "right" });
        y += rowH;
      }
    }

    doc.end();
  });
}
