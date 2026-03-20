import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true", // false for port 587 (STARTTLS)
  requireTLS: true, // Gmail requires TLS upgrade on 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const FROM = process.env.EMAIL_FROM || "noreply@opportunityboard.com";

function baseTemplate(content: string) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background:#050510;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:560px;margin:40px auto;padding:0 16px;">
    <!-- Logo -->
    <div style="margin-bottom:32px;">
      <span style="font-size:20px;font-weight:700;background:linear-gradient(to right,#a855f7,#3b82f6);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">
        OpportunityBoard
      </span>
    </div>
    <!-- Card -->
    <div style="background:#0d0d1a;border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:32px;">
      ${content}
    </div>
    <!-- Footer -->
    <p style="color:#4b5563;font-size:12px;text-align:center;margin-top:24px;">
      You're receiving this because you use OpportunityBoard ·
      <a href="${APP_URL}" style="color:#7c3aed;text-decoration:none;">Visit site</a>
    </p>
  </div>
</body>
</html>`;
}

// Sent to student when they receive a crypto payment
export async function sendPaymentReceivedEmail({
  to, studentName, gigTitle, amount, currency, txHash, fromName,
}: {
  to: string; studentName: string; gigTitle: string;
  amount: string; currency: string; txHash: string; fromName: string;
}) {
  const etherscanUrl = `https://sepolia.etherscan.io/tx/${txHash}`;
  const content = `
    <h2 style="color:#fff;margin:0 0 8px;">💸 You just got paid!</h2>
    <p style="color:#9ca3af;font-size:14px;margin:0 0 24px;">Hi ${studentName}, a payment has been sent to your wallet.</p>
    <div style="background:rgba(34,197,94,0.08);border:1px solid rgba(34,197,94,0.2);border-radius:12px;padding:20px;margin-bottom:24px;">
      <p style="color:#9ca3af;font-size:12px;font-weight:600;margin:0 0 4px;text-transform:uppercase;letter-spacing:0.05em;">Gig</p>
      <p style="color:#fff;font-size:16px;font-weight:600;margin:0 0 16px;">${gigTitle}</p>
      <p style="color:#9ca3af;font-size:12px;font-weight:600;margin:0 0 4px;text-transform:uppercase;letter-spacing:0.05em;">Amount</p>
      <p style="color:#22c55e;font-size:28px;font-weight:800;margin:0 0 16px;">${amount} ${currency}</p>
      <p style="color:#9ca3af;font-size:12px;font-weight:600;margin:0 0 4px;text-transform:uppercase;letter-spacing:0.05em;">From</p>
      <p style="color:#fff;font-size:14px;margin:0 0 16px;">${fromName}</p>
      <p style="color:#9ca3af;font-size:12px;font-weight:600;margin:0 0 4px;text-transform:uppercase;letter-spacing:0.05em;">Transaction Hash</p>
      <p style="color:#818cf8;font-size:11px;font-family:monospace;margin:0;word-break:break-all;">${txHash}</p>
    </div>
    <a href="${etherscanUrl}" style="display:inline-block;background:linear-gradient(to right,#22c55e,#10b981);color:#fff;font-size:14px;font-weight:600;padding:12px 24px;border-radius:10px;text-decoration:none;">
      View on Etherscan ↗
    </a><br/>
    <a href="${APP_URL}/dashboard" style="display:inline-block;margin-top:12px;color:#7c3aed;font-size:13px;text-decoration:none;">
      Go to Dashboard →
    </a>`;

  await transporter.sendMail({
    from: `"OpportunityBoard" <${FROM}>`,
    to,
    subject: `💸 You received ${amount} ${currency} for "${gigTitle}"`,
    html: baseTemplate(content),
  });
}

// Sent to opportunity poster when someone applies
export async function sendNewApplicationEmail({
  to,
  posterName,
  applicantName,
  opportunityTitle,
  opportunityId,
  applicationId,
}: {
  to: string;
  posterName: string;
  applicantName: string;
  opportunityTitle: string;
  opportunityId: string;
  applicationId: string;
}) {
  const content = `
    <h2 style="color:#fff;margin:0 0 8px;">New Application Received 📨</h2>
    <p style="color:#9ca3af;font-size:14px;margin:0 0 24px;">Hi ${posterName}, someone just applied to your opportunity.</p>

    <div style="background:rgba(139,92,246,0.08);border:1px solid rgba(139,92,246,0.2);border-radius:12px;padding:16px;margin-bottom:24px;">
      <p style="color:#a78bfa;font-size:12px;font-weight:600;margin:0 0 4px;text-transform:uppercase;letter-spacing:0.05em;">Opportunity</p>
      <p style="color:#fff;font-size:16px;font-weight:600;margin:0 0 12px;">${opportunityTitle}</p>
      <p style="color:#9ca3af;font-size:13px;margin:0;">Applicant: <span style="color:#fff;font-weight:500;">${applicantName}</span></p>
    </div>

    <a href="${APP_URL}/dashboard/applications"
      style="display:inline-block;background:linear-gradient(to right,#7c3aed,#2563eb);color:#fff;font-size:14px;font-weight:600;padding:12px 24px;border-radius:10px;text-decoration:none;">
      Review Application →
    </a>`;

  await transporter.sendMail({
    from: `"OpportunityBoard" <${FROM}>`,
    to,
    subject: `New application for "${opportunityTitle}"`,
    html: baseTemplate(content),
  });
}

// Sent to applicant when their application status changes
export async function sendApplicationStatusEmail({
  to,
  applicantName,
  opportunityTitle,
  opportunityId,
  status,
  posterName,
  posterEmail,
}: {
  to: string;
  applicantName: string;
  opportunityTitle: string;
  opportunityId: string;
  status: "ACCEPTED" | "REJECTED" | "REVIEWED";
  posterName?: string;
  posterEmail?: string;
}) {
  const statusConfig = {
    ACCEPTED: {
      emoji: "🎉",
      heading: "Application Accepted!",
      message: posterName && posterEmail
        ? `Congratulations! <strong style="color:#fff;">${posterName}</strong> has accepted your application. Reply to this email or reach out directly at <a href="mailto:${posterEmail}" style="color:#a78bfa;">${posterEmail}</a> to get started.`
        : "Congratulations! The poster has accepted your application. Log in to get in touch and get started.",
      color: "#22c55e",
      bg: "rgba(34,197,94,0.08)",
      border: "rgba(34,197,94,0.2)",
    },
    REJECTED: {
      emoji: "😔",
      heading: "Application Update",
      message: "Unfortunately, the poster has decided not to move forward with your application. Keep applying — the right opportunity is out there!",
      color: "#ef4444",
      bg: "rgba(239,68,68,0.08)",
      border: "rgba(239,68,68,0.2)",
    },
    REVIEWED: {
      emoji: "👀",
      heading: "Application Under Review",
      message: "Good news — your application has been reviewed and is being considered. Hang tight!",
      color: "#3b82f6",
      bg: "rgba(59,130,246,0.08)",
      border: "rgba(59,130,246,0.2)",
    },
  };

  const cfg = statusConfig[status];

  const content = `
    <h2 style="color:#fff;margin:0 0 8px;">${cfg.emoji} ${cfg.heading}</h2>
    <p style="color:#9ca3af;font-size:14px;margin:0 0 24px;">Hi ${applicantName},</p>

    <div style="background:${cfg.bg};border:1px solid ${cfg.border};border-radius:12px;padding:16px;margin-bottom:16px;">
      <p style="color:#9ca3af;font-size:12px;font-weight:600;margin:0 0 4px;text-transform:uppercase;letter-spacing:0.05em;">Opportunity</p>
      <p style="color:#fff;font-size:16px;font-weight:600;margin:0 0 12px;">${opportunityTitle}</p>
      <p style="color:${cfg.color};font-size:13px;margin:0;font-weight:500;">Status: ${status}</p>
    </div>

    <p style="color:#9ca3af;font-size:14px;line-height:1.6;margin:0 0 24px;">${cfg.message}</p>

    ${status === "ACCEPTED" && posterName && posterEmail ? `
    <div style="background:rgba(139,92,246,0.08);border:1px solid rgba(139,92,246,0.25);border-radius:12px;padding:16px;margin-bottom:24px;">
      <p style="color:#a78bfa;font-size:12px;font-weight:600;margin:0 0 8px;text-transform:uppercase;letter-spacing:0.05em;">📬 Contact the Poster</p>
      <p style="color:#fff;font-size:15px;font-weight:600;margin:0 0 4px;">${posterName}</p>
      <a href="mailto:${posterEmail}" style="color:#818cf8;font-size:13px;text-decoration:none;">${posterEmail}</a>
    </div>` : ""}

    <a href="${APP_URL}/opportunities/${opportunityId}"
      style="display:inline-block;background:linear-gradient(to right,#7c3aed,#2563eb);color:#fff;font-size:14px;font-weight:600;padding:12px 24px;border-radius:10px;text-decoration:none;">
      View Opportunity →
    </a>`;

  await transporter.sendMail({
    from: `"OpportunityBoard" <${FROM}>`,
    to,
    subject: status === "ACCEPTED"
      ? `🎉 You got accepted to "${opportunityTitle}"`
      : status === "REVIEWED"
      ? `👀 Your application for "${opportunityTitle}" is under review`
      : `Update on your application for "${opportunityTitle}"`,
    html: baseTemplate(content),
  });
}
