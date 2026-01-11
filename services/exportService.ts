
import { Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun, AlignmentType, WidthType, BorderStyle, PageBreak, ImageRun } from "docx";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { Report, GRADES_CONFIG } from "../types";
import { SIGNATURE_BASE64 } from "../constants";

// Helper to convert base64 to array buffer for docx
const base64ToArrayBuffer = (base64: string) => {
  const binaryString = window.atob(base64.split(',')[1]);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
};

// Fix: Completed the truncated exportToDocx function and added proper signature handling
export const exportToDocx = async (report: Report) => {
  const tableBorders = {
    top: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
    bottom: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
    left: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
    right: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
  };

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          // Logo/Header Text
          new Paragraph({
            children: [
              new TextRun({ text: "BAILLY", size: 48, bold: true, color: "808080" }),
            ],
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "VÉTÉRINAIRES CLINIQUE ÉQUINE", size: 24, color: "808080" }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 600 },
          }),

          // Horse name and date block
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE },
              left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE },
              insideHorizontal: { style: BorderStyle.NONE }, insideVertical: { style: BorderStyle.NONE },
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 40, type: WidthType.PERCENTAGE },
                    borders: tableBorders,
                    children: [
                      new Paragraph({
                        children: [new TextRun({ text: report.horseName.toUpperCase(), bold: true, size: 32 })],
                        alignment: AlignmentType.CENTER,
                        spacing: { before: 200, after: 200 },
                      }),
                    ],
                  }),
                  new TableCell({
                    width: { size: 60, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ text: "Lecture Radiographique, le ", size: 24 }),
                          new TextRun({ text: report.date, size: 24, bold: true, underline: {} }),
                        ],
                        alignment: AlignmentType.RIGHT,
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),

          new Paragraph({ text: "", spacing: { after: 400 } }),

          // Main Table
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({ 
                    children: [new Paragraph({ text: "Région anatomique", bold: true, alignment: AlignmentType.CENTER })],
                    width: { size: 30, type: WidthType.PERCENTAGE },
                    shading: { fill: "F2F2F2" }
                  }),
                  new TableCell({ 
                    children: [new Paragraph({ text: "COMMENTAIRES", bold: true, alignment: AlignmentType.CENTER })],
                    width: { size: 55, type: WidthType.PERCENTAGE },
                    shading: { fill: "F2F2F2" }
                  }),
                  new TableCell({ 
                    children: [new Paragraph({ text: "SCORE RADIOGRAPHIQUE", bold: true, alignment: AlignmentType.CENTER })],
                    width: { size: 15, type: WidthType.PERCENTAGE },
                    shading: { fill: "F2F2F2" }
                  }),
                ],
              }),
              ...report.regions
                .filter(r => r.isIncluded)
                .map(r => new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: r.label, size: 18, bold: true, underline: {} })], alignment: AlignmentType.CENTER })] }),
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: r.comment, size: 20 })], alignment: AlignmentType.CENTER })] }),
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: String(r.grade), size: 20, bold: true, underline: {} })], alignment: AlignmentType.CENTER })] }),
                  ],
                })),
            ],
          }),

          new Paragraph({
            children: [
              new TextRun({ text: `\nSCORE TOTAL : ${report.totalScore}`, bold: true, size: 32 }),
            ],
            spacing: { before: 400, after: 600 },
          }),

          // Signature section
          new Paragraph({
            children: [
              new ImageRun({
                data: base64ToArrayBuffer(SIGNATURE_BASE64),
                transformation: { width: 150, height: 75 },
              }),
            ],
            alignment: AlignmentType.RIGHT,
          }),
          new Paragraph({
            children: [
              new TextRun({ text: report.veterinary, bold: true, size: 20 }),
            ],
            alignment: AlignmentType.RIGHT,
          }),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Rapport_${report.horseName}_${report.date}.docx`;
  a.click();
  window.URL.revokeObjectURL(url);
};

// Fix: Added missing exportToPdf function used in PatientRecords.tsx
export const exportToPdf = async (report: Report) => {
  const doc = new jsPDF();
  
  // Header section
  doc.setFontSize(22);
  doc.setTextColor(128, 128, 128);
  doc.text("BAILLY VÉTÉRINAIRES", 105, 20, { align: "center" });
  doc.setFontSize(14);
  doc.text("CLINIQUE ÉQUINE", 105, 30, { align: "center" });
  
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(18);
  doc.text(`CHEVAL : ${report.horseName.toUpperCase()}`, 20, 50);
  
  doc.setFontSize(12);
  doc.text(`Le ${report.date}`, 190, 50, { align: "right" });

  const tableData = report.regions
    .filter(r => r.isIncluded)
    .map(r => [
      r.label,
      r.comment,
      GRADES_CONFIG[r.grade].points.toString()
    ]);

  // Using jspdf-autotable to render the report table
  (doc as any).autoTable({
    startY: 60,
    head: [['Région anatomique', 'Commentaires', 'Score']],
    body: tableData,
    headStyles: { fillColor: [242, 242, 242], textColor: [0, 0, 0], fontStyle: 'bold' },
    styles: { fontSize: 10, cellPadding: 5 },
    columnStyles: {
      0: { cellWidth: 40 },
      1: { cellWidth: 'auto' },
      2: { cellWidth: 20, halign: 'center' }
    }
  });

  const finalY = (doc as any).lastAutoTable.finalY + 20;
  doc.setFontSize(16);
  doc.text(`SCORE TOTAL : ${report.totalScore}`, 20, finalY);

  // Add signature if space permits
  if (finalY < 250) {
    doc.addImage(SIGNATURE_BASE64, 'PNG', 140, finalY, 50, 25);
    doc.setFontSize(12);
    doc.text(report.veterinary, 165, finalY + 30, { align: "center" });
  }

  doc.save(`Rapport_${report.horseName}_${report.date}.pdf`);
};
