export const FORMATS = [
  ['txt', 'Text (.txt)'],
  ['docx', 'Word (.docx)'],
  ['pdf', 'PDF (.pdf)'],
  ['md', 'Markdown (.md)'],
  ['html', 'Web page (.html)'],
  ['rtf', 'Rich text (.rtf)'],
  ['json', 'JSON (.json)'],
];

function safeFileName(name) {
  const cleaned = (name || 'text2talk')
    .replace(/[^\p{L}\p{N}\- ]+/gu, '')
    .trim()
    .slice(0, 60);
  return cleaned || 'text2talk';
}

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function escapeRtf(text) {
  return (
    text
      .replace(/[\\{}]/g, '\\$&')
      .replace(/\r?\n/g, '\\par\n')
      // eslint-disable-next-line no-control-regex
      .replace(/[^\x00-\x7f]/g, (char) => {
        const code = char.charCodeAt(0);
        const signed = code > 32767 ? code - 65536 : code;
        return `\\u${signed}?`;
      })
  );
}

function makeBlob(content, type) {
  return new Blob([content], { type: `${type};charset=utf-8` });
}

function saveBlob(blob, filename) {
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 1000);
}

async function exportDocx(text, heading, fileName) {
  const { Document, Packer, Paragraph, TextRun, HeadingLevel } =
    await import('docx');
  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({ text: heading, heading: HeadingLevel.HEADING_1 }),
          ...text
            .split(/\r?\n/)
            .map((line) => new Paragraph({ children: [new TextRun(line)] })),
        ],
      },
    ],
  });
  saveBlob(await Packer.toBlob(doc), `${fileName}.docx`);
}

async function exportPdf(text, heading, fileName) {
  const { jsPDF } = await import('jspdf');
  const pdf = new jsPDF();
  pdf.setFontSize(16);
  pdf.text(heading, 15, 20);
  pdf.setFontSize(11);
  let y = 32;
  for (const line of pdf.splitTextToSize(text, 180)) {
    if (y > 280) {
      pdf.addPage();
      y = 20;
    }
    pdf.text(line, 15, y);
    y += 6;
  }
  pdf.save(`${fileName}.pdf`);
}

export async function exportText(text, title, format) {
  const fileName = safeFileName(title);
  const heading = title || 'Text2Talk';

  if (format === 'txt') {
    saveBlob(makeBlob(text, 'text/plain'), `${fileName}.txt`);
  } else if (format === 'md') {
    saveBlob(
      makeBlob(`# ${heading}\n\n${text}\n`, 'text/markdown'),
      `${fileName}.md`
    );
  } else if (format === 'json') {
    const data = { title: heading, text, exportedAt: new Date().toISOString() };
    saveBlob(
      makeBlob(JSON.stringify(data, null, 2), 'application/json'),
      `${fileName}.json`
    );
  } else if (format === 'rtf') {
    const rtf = `{\\rtf1\\ansi\\deff0 {\\b ${escapeRtf(heading)}}\\par\\par\n${escapeRtf(text)}}`;
    saveBlob(makeBlob(rtf, 'application/rtf'), `${fileName}.rtf`);
  } else if (format === 'html') {
    const paragraphs = text
      .split(/\n+/)
      .map((p) => `<p>${escapeHtml(p)}</p>`)
      .join('');
    const page = `<!doctype html><meta charset="utf-8"><title>${escapeHtml(heading)}</title><body style="font-family:sans-serif;max-width:700px;margin:40px auto;line-height:1.6"><h1>${escapeHtml(heading)}</h1>${paragraphs}</body>`;
    saveBlob(makeBlob(page, 'text/html'), `${fileName}.html`);
  } else if (format === 'docx') {
    await exportDocx(text, heading, fileName);
  } else if (format === 'pdf') {
    await exportPdf(text, heading, fileName);
  }
}
