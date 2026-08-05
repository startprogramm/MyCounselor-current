// Generates a Word-compatible .doc file client-side via the classic HTML-MIME
// trick (Blob + application/msword) — no docx/pdf library needed. Word,
// Google Docs, and Pages all open it fine and it stays fully editable.

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export interface RecommendationLetterDocParams {
  studentName: string;
  teacherName: string;
  teacherSubject?: string;
  schoolName?: string;
  bodyText: string;
}

export function downloadRecommendationLetterDoc({
  studentName,
  teacherName,
  teacherSubject,
  schoolName,
  bodyText,
}: RecommendationLetterDocParams) {
  const dateline = new Date().toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const bodyParagraphs = bodyText
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p style="margin:0 0 12pt 0;">${escapeHtml(p).replace(/\n/g, '<br/>')}</p>`)
    .join('\n');

  const signatureLine = [teacherName, teacherSubject, schoolName].filter(Boolean).map(escapeHtml).join('<br/>');

  const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="utf-8"><title>Recommendation Letter</title></head>
<body style="font-family:Georgia,'Times New Roman',serif;font-size:12pt;line-height:1.5;">
  <p style="margin:0 0 24pt 0;">${escapeHtml(dateline)}</p>
  <p style="margin:0 0 12pt 0;">To the Admissions Committee,</p>
  ${bodyParagraphs}
  <p style="margin:24pt 0 0 0;">Sincerely,</p>
  <p style="margin:6pt 0 0 0;">${signatureLine}</p>
</body>
</html>`;

  const blob = new Blob(['﻿', html], { type: 'application/msword' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const safeStudentName = studentName.trim().replace(/[^a-z0-9]+/gi, '_') || 'Student';
  link.download = `Recommendation_Letter_${safeStudentName}.doc`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
