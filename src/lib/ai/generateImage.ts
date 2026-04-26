type GenerateImageInput = {
  prompt: string;
  size: string;
  format: string;
};

export function generateMockImage({ prompt, size }: GenerateImageInput) {
  const [width = "1024", height = "1024"] = size.split("x");
  const summary = prompt.split("\n").slice(0, 4).join(" ").slice(0, 160);
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="100%" height="100%" fill="#f8fafc"/>
  <rect x="6%" y="8%" width="88%" height="84%" rx="32" fill="#ffffff" stroke="#d9dde5"/>
  <circle cx="24%" cy="34%" r="12%" fill="#2563eb" opacity="0.92"/>
  <rect x="42%" y="25%" width="36%" height="8%" rx="12" fill="#172033"/>
  <rect x="42%" y="39%" width="29%" height="5%" rx="10" fill="#10b981"/>
  <rect x="16%" y="62%" width="68%" height="4%" rx="8" fill="#cbd5e1"/>
  <rect x="16%" y="72%" width="48%" height="4%" rx="8" fill="#e2e8f0"/>
  <text x="16%" y="87%" fill="#475569" font-family="Arial, sans-serif" font-size="22">${escapeXml(summary)}</text>
</svg>`;

  return {
    fileUrl: `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`,
    contentType: "image/svg+xml",
  };
}

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
