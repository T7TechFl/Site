// Sends a short, personal thank-you email to whoever submits a form on t7techfl.com.
//
// Netlify runs this automatically for every verified (non-spam) form submission,
// because the file is named "submission-created". Emails go out through Resend.
//
// Settings (Netlify → Site configuration → Environment variables):
//   RESEND_API_KEY  required. Without it, nothing is sent and the site keeps working.
//   THANKS_FROM     optional. Default: "Michael Tanner <info@t7techfl.com>"
//   THANKS_REPLY_TO optional. Default: "info@t7techfl.com"
//
// The form notification emails to info@ are separate and keep working either way.

const SITE = "https://t7techfl.com";
const FROM = process.env.THANKS_FROM || "Michael Tanner <info@t7techfl.com>";
const REPLY_TO = process.env.THANKS_REPLY_TO || "info@t7techfl.com";

// One entry per form. The key is the form's name="" on the site.
const MESSAGES = {
  contact: {
    subject: "Thanks for reaching out",
    body: [
      "Thanks for reaching out about your business. I'll read through what you sent and get back to you soon.",
      "If anything else comes to mind before then, just reply to this email.",
    ],
  },
  "leak-finder": {
    subject: "Thanks for taking the Leak Finder",
    body: [
      "Thanks for taking the Leak Finder. I'm looking forward to going over your results with you soon.",
      "If anything in your score surprised you, just reply to this email.",
    ],
  },
  "hour-worth": {
    subject: "Thanks for trying the hourly value calculator",
    body: [
      "Thanks for trying the “What’s your hour worth?” calculator. I'm looking forward to going over your numbers with you soon.",
      "If anything in your result surprised you, just reply to this email.",
    ],
  },
};

// Used for any new form added later that isn't listed above.
const FALLBACK = {
  subject: "Thanks for getting in touch",
  body: [
    "Thanks for filling out the form on my site. I'll be in touch soon.",
    "If anything else comes to mind before then, just reply to this email.",
  ],
};

export default async (req) => {
  let payload;
  try {
    ({ payload } = await req.json());
  } catch {
    return new Response("Bad request", { status: 400 });
  }

  const formName = payload?.form_name || payload?.data?.["form-name"] || "";
  const data = payload?.data || {};

  // The Leak Finder posts again when someone adds their dollar figures or leaves the page.
  // Only thank them once, for the first submission.
  if (formName === "leak-finder" && data.stage && data.stage !== "Unlocked results") {
    return skip(`leak-finder follow-up (${data.stage})`);
  }

  const to = String(data.email || payload?.email || "").trim();
  if (!/^[^\s@<>,;]+@[^\s@<>,;]+\.[^\s@<>,;]+$/.test(to) || to.length > 254) {
    return skip("no valid email address");
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return skip("RESEND_API_KEY is not set");

  const firstName = cleanName(data.name);
  const msg = MESSAGES[formName] || FALLBACK;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "Idempotency-Key": `thanks-${payload?.id || `${formName}-${to}-${payload?.created_at || ""}`}`,
    },
    body: JSON.stringify({
      from: FROM,
      to: [to],
      reply_to: REPLY_TO,
      subject: msg.subject,
      html: renderHtml(firstName, msg.body),
      text: renderText(firstName, msg.body),
    }),
  });

  if (!res.ok) {
    // Logged in Netlify → Logs → Functions. Returning 200 keeps Netlify from retrying.
    console.error(`Thank-you email failed for form "${formName}": ${res.status} ${await res.text()}`);
    return new Response("Email not sent", { status: 200 });
  }

  console.log(`Thank-you email sent for form "${formName}".`);
  return new Response("Sent", { status: 200 });
};

function skip(reason) {
  console.log(`Thank-you email skipped: ${reason}.`);
  return new Response("Skipped", { status: 200 });
}

// "michael tanner" → "Michael". Keeps only the first word, drops odd characters.
function cleanName(raw) {
  const first = String(raw || "").trim().split(/\s+/)[0] || "";
  const safe = first.replace(/[^\p{L}\p{M}'\-.]/gu, "").slice(0, 40);
  if (!safe) return "";
  return safe.charAt(0).toUpperCase() + safe.slice(1);
}

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderText(firstName, body) {
  return [
    firstName ? `Hey ${firstName},` : "Hey there,",
    "",
    ...body.flatMap((p) => [p, ""]),
    "Michael Tanner",
    "T7 Technology Solutions",
    "info@t7techfl.com · t7techfl.com",
  ].join("\n");
}

export function renderHtml(firstName, body) {
  const ink = "#13202B";
  const bg = "#F6F6F2";
  const accent = "#0B6B58";
  const font = "Manrope, 'Segoe UI', Helvetica, Arial, sans-serif";
  const greeting = firstName ? `Hey ${esc(firstName)},` : "Hey there,";
  const paras = body
    .map((p) => `<p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:${ink}">${esc(p)}</p>`)
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light">
<title>T7 Technology Solutions</title>
</head>
<body style="margin:0;padding:0;background:${bg}">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${bg}">
<tr><td align="center" style="padding:32px 16px">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background:#FFFFFF;border-radius:12px;font-family:${font}">
    <tr><td style="padding:28px 32px 8px">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
        <td style="vertical-align:middle"><img src="${SITE}/images/t7-logo-96.png" width="40" height="40" alt="T7" style="display:block;border:0"></td>
        <td style="vertical-align:middle;padding-left:10px;font-family:${font};font-size:14px;line-height:1.1;font-weight:800;color:${ink};letter-spacing:-0.2px">Technology<br>Solutions</td>
      </tr></table>
    </td></tr>
    <tr><td style="padding:20px 32px 4px;font-family:${font}">
      <p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:${ink}">${greeting}</p>
      ${paras}
    </td></tr>
    <tr><td style="padding:8px 32px 28px">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-top:1px solid #E3E5E0;padding-top:18px;width:100%"><tr>
        <td width="72" style="vertical-align:middle;padding-top:18px"><img src="${SITE}/images/headshot-160-round.png" width="64" height="64" alt="Michael Tanner" style="display:block;border:0;border-radius:50%"></td>
        <td style="vertical-align:middle;padding-top:18px;padding-left:6px;font-family:${font}">
          <div style="font-size:16px;font-weight:700;color:${accent}">Michael Tanner</div>
          <div style="font-size:14px;color:${ink}">T7 Technology Solutions</div>
          <div style="font-size:14px"><a href="mailto:info@t7techfl.com" style="color:${accent};text-decoration:none">info@t7techfl.com</a> <span style="color:#8A948F">&middot;</span> <a href="${SITE}" style="color:${accent};text-decoration:none">t7techfl.com</a></div>
        </td>
      </tr></table>
    </td></tr>
  </table>
</td></tr>
</table>
</body>
</html>`;
}
