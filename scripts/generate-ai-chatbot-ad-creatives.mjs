import sharp from "sharp";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const outDir = path.join(root, "public", "ad-creatives", "ai-chatbot-development");

const W = 1080;
const H = 1080;

const creatives = [
  {
    source: "backplate-after-hours.png",
    output: "creative-01-stop-losing-customers.png",
    eyebrow: "AI CHATBOT DEVELOPMENT",
    headline: ["Stop Losing", "Customers While", "You're Offline."],
    subline: "Custom AI chatbots that reply, qualify leads, and book appointments 24/7.",
    cta: "Book Free Consultation",
  },
  {
    source: "backplate-workflow.png",
    output: "creative-02-turn-chats-into-bookings.png",
    eyebrow: "WEBSITE + WHATSAPP + CRM",
    headline: ["Turn Chats", "Into Booked", "Calls."],
    subline: "Connect your chatbot to calendars, lead capture, CRM updates, and human handoff.",
    cta: "Build My AI Chatbot",
  },
  {
    source: "backplate-multichannel.png",
    output: "creative-03-automate-support.png",
    eyebrow: "BUSINESS AUTOMATION",
    headline: ["Automate Support.", "Capture More", "Leads."],
    subline: "Custom AI agents for websites, WhatsApp, Discord, Telegram, and internal workflows.",
    cta: "Chat Live With Founder",
  },
];

function esc(text) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function headlineLines(lines) {
  return lines
    .map((line, index) => {
      const y = 292 + index * 86;
      const accent = index === lines.length - 1 ? ' fill="#67e8f9"' : ' fill="#ffffff"';
      return `<text x="72" y="${y}"${accent} font-size="76" font-weight="900" letter-spacing="0">${esc(line)}</text>`;
    })
    .join("");
}

function overlaySvg(creative) {
  const ctaWidth = Math.min(520, Math.max(356, creative.cta.length * 18 + 92));

  return `
  <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="shade" x1="0" x2="1" y1="0" y2="0">
        <stop offset="0%" stop-color="#020617" stop-opacity="0.96"/>
        <stop offset="45%" stop-color="#020617" stop-opacity="0.82"/>
        <stop offset="72%" stop-color="#020617" stop-opacity="0.22"/>
        <stop offset="100%" stop-color="#020617" stop-opacity="0.02"/>
      </linearGradient>
      <linearGradient id="bottom" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stop-color="#020617" stop-opacity="0"/>
        <stop offset="100%" stop-color="#020617" stop-opacity="0.72"/>
      </linearGradient>
      <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="14" stdDeviation="18" flood-color="#000000" flood-opacity="0.36"/>
      </filter>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#shade)"/>
    <rect width="${W}" height="${H}" fill="url(#bottom)"/>

    <g font-family="Inter, Arial, Helvetica, sans-serif">
      <g transform="translate(72 68)">
        <rect x="0" y="0" width="292" height="58" rx="16" fill="#0f172a" fill-opacity="0.72" stroke="#ffffff" stroke-opacity="0.14"/>
        <circle cx="30" cy="29" r="14" fill="#22d3ee"/>
        <text x="56" y="36" fill="#ffffff" font-size="25" font-weight="800" letter-spacing="0">Relay<tspan fill="#67e8f9">Works</tspan></text>
      </g>

      <text x="72" y="204" fill="#67e8f9" font-size="24" font-weight="900" letter-spacing="4">${esc(creative.eyebrow)}</text>
      ${headlineLines(creative.headline)}

      <foreignObject x="72" y="560" width="500" height="150">
        <div xmlns="http://www.w3.org/1999/xhtml" style="font-family: Inter, Arial, Helvetica, sans-serif; color: #cbd5e1; font-size: 31px; line-height: 1.28; font-weight: 600;">
          ${esc(creative.subline)}
        </div>
      </foreignObject>

      <g transform="translate(72 756)" filter="url(#shadow)">
        <rect x="0" y="0" width="${ctaWidth}" height="76" rx="22" fill="#22d3ee"/>
        <text x="34" y="49" fill="#020617" font-size="27" font-weight="900" letter-spacing="0">${esc(creative.cta)}</text>
      </g>

      <g transform="translate(72 878)">
        <rect x="0" y="0" width="480" height="96" rx="18" fill="#020617" fill-opacity="0.66" stroke="#ffffff" stroke-opacity="0.12"/>
        <text x="28" y="38" fill="#e2e8f0" font-size="23" font-weight="800">Website • WhatsApp • CRM • Calendar</text>
        <text x="28" y="70" fill="#94a3b8" font-size="21" font-weight="600">relayworks.dev/ai-chatbot-development</text>
      </g>
    </g>
  </svg>`;
}

await Promise.all(
  creatives.map(async (creative) => {
    const src = path.join(outDir, creative.source);
    const dest = path.join(outDir, creative.output);
    const svg = Buffer.from(overlaySvg(creative));

    await sharp(src)
      .resize(W, H, { fit: "cover" })
      .composite([{ input: svg, top: 0, left: 0 }])
      .png({ quality: 95, compressionLevel: 9 })
      .toFile(dest);
  })
);

console.log(`Generated ${creatives.length} AI chatbot ad creatives in ${outDir}`);
