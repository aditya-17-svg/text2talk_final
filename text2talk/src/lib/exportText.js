export const FORMATS = [['txt', 'Text (.txt)'], ['docx', 'Word (.docx)'], ['pdf', 'PDF (.pdf)'], ['md', 'Markdown (.md)'], ['html', 'Web page (.html)'], ['rtf', 'Rich text (.rtf)'], ['json', 'JSON (.json)']]
const safe = n => (n || 'text2talk').replace(/[^\p{L}\p{N}\- ]+/gu, '').trim().slice(0, 60) || 'text2talk'
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const rtfEsc = s => s.replace(/[\\{}]/g, '\\$&').replace(/\r?\n/g, '\\par\n').replace(/[^\x00-\x7f]/g, c => { const n = c.charCodeAt(0); return `\\u${n > 32767 ? n - 65536 : n}?` })
function save(blob, name) {
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; a.click()
  setTimeout(() => URL.revokeObjectURL(a.href), 1000)
}
const blob = (t, type) => new Blob([t], { type: `${type};charset=utf-8` })

export async function exportText(text, title, fmt) {
  const name = safe(title); const head = title || 'Text2Talk'
  if (fmt === 'txt') save(blob(text, 'text/plain'), `${name}.txt`)
  else if (fmt === 'md') save(blob(`# ${head}\n\n${text}\n`, 'text/markdown'), `${name}.md`)
  else if (fmt === 'json') save(blob(JSON.stringify({ title: head, text, exportedAt: new Date().toISOString() }, null, 2), 'application/json'), `${name}.json`)
  else if (fmt === 'rtf') save(blob(`{\\rtf1\\ansi\\deff0 {\\b ${rtfEsc(head)}}\\par\\par\n${rtfEsc(text)}}`, 'application/rtf'), `${name}.rtf`)
  else if (fmt === 'html') save(blob(`<!doctype html><meta charset="utf-8"><title>${esc(head)}</title><body style="font-family:sans-serif;max-width:700px;margin:40px auto;line-height:1.6"><h1>${esc(head)}</h1>${text.split(/\n+/).map(p => `<p>${esc(p)}</p>`).join('')}</body>`, 'text/html'), `${name}.html`)
  else if (fmt === 'docx') {
    const { Document, Packer, Paragraph, TextRun, HeadingLevel } = await import('docx')
    const doc = new Document({ sections: [{ children: [new Paragraph({ text: head, heading: HeadingLevel.HEADING_1 }), ...text.split(/\r?\n/).map(l => new Paragraph({ children: [new TextRun(l)] }))] }] })
    save(await Packer.toBlob(doc), `${name}.docx`)
  } else if (fmt === 'pdf') {
    const { jsPDF } = await import('jspdf')
    const d = new jsPDF(); d.setFontSize(16); d.text(head, 15, 20); d.setFontSize(11)
    let y = 32
    for (const l of d.splitTextToSize(text, 180)) { if (y > 280) { d.addPage(); y = 20 } d.text(l, 15, y); y += 6 }
    d.save(`${name}.pdf`)
  }
}
