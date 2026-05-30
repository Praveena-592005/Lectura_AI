import { Document, Packer, Paragraph, TextRun } from 'docx';
import html2pdf from 'html2pdf.js';

export const downloadAsTXT = (title, content) => {
  const element = document.createElement("a");
  const file = new Blob([content], { type: 'text/plain;charset=utf-8' });
  element.href = URL.createObjectURL(file);
  element.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_summary.txt`;
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
};

export const downloadAsDOCX = async (title, content) => {
  const lines = content.split('\n');
  const docParagraphs = lines.map(line => {
    let cleanLine = line;

    if (line.startsWith('### ')) {
      return new Paragraph({
        children: [new TextRun({ text: line.replace('### ', ''), bold: true, size: 28 })],
        spacing: { before: 200, after: 100 }
      });
    }
    if (line.startsWith('## ')) {
      return new Paragraph({
        children: [new TextRun({ text: line.replace('## ', ''), bold: true, size: 32 })],
        spacing: { before: 240, after: 120 }
      });
    }
    if (line.startsWith('* ') || line.startsWith('- ')) {
      cleanLine = line.substring(2);
      return new Paragraph({
        bullet: { level: 0 },
        children: [new TextRun({ text: cleanLine })]
      });
    }

    return new Paragraph({
      children: [new TextRun({ text: cleanLine })],
      spacing: { after: 120 }
    });
  });

  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        new Paragraph({
          children: [new TextRun({ text: title, bold: true, size: 40 })],
          spacing: { after: 300 }
        }),
        ...docParagraphs
      ]
    }]
  });

  const blob = await Packer.toBlob(doc);
  const element = document.createElement("a");
  element.href = URL.createObjectURL(blob);
  element.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_summary.docx`;
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
};

export const downloadAsPDF = (title, content) => {
  const element = document.createElement('div');
  element.style.padding = '30px';
  element.style.fontFamily = 'Arial, sans-serif';
  element.style.lineHeight = '1.6';
  
  const formattedHtml = content
    .replace(/^### (.*)$/gm, '<h3 style="color:#1e3a8a;margin-top:16px;">$1</h3>')
    .replace(/^## (.*)$/gm, '<h2 style="color:#2563eb;margin-top:20px;border-bottom:1px solid #e2e8f0;padding-bottom:4px;">$1</h2>')
    .replace(/^\* (.*)$/gm, '<li style="margin-left:20px;margin-bottom:6px;">$1</li>')
    .replace(/^- (.*)$/gm, '<li style="margin-left:20px;margin-bottom:6px;">$1</li>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br/>');

  element.innerHTML = `<h1 style="color:#111827;text-align:center;margin-bottom:24px;">${title}</h1><div>${formattedHtml}</div>`;

  const opt = {
    margin:       15,
    filename:     `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_summary.pdf`,
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2 },
    jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  html2pdf().set(opt).from(element).save();
};