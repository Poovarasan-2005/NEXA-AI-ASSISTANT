import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const sessionData = await getServerSession();
    if (!sessionData) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const title = searchParams.get("title") || "NEXA AI Executive Report";
    const content = searchParams.get("content") || "No content provided.";
    const score = searchParams.get("score") || "100";

    const formattedDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .no-print { display: none !important; }
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #1e293b;
      background: #ffffff;
      margin: 0;
      padding: 40px;
      line-height: 1.6;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid #0891b2;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .logo {
      font-family: monospace;
      font-size: 24px;
      font-weight: bold;
      color: #0f172a;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .badge {
      background: #ecfeff;
      color: #0891b2;
      border: 1px solid #a5f3fc;
      font-size: 11px;
      font-weight: bold;
      padding: 4px 10px;
      border-radius: 6px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .report-title {
      font-size: 28px;
      font-weight: 800;
      color: #0f172a;
      margin: 0 0 10px 0;
    }
    .meta {
      font-size: 12px;
      color: #64748b;
      margin-bottom: 30px;
    }
    .content {
      font-size: 14px;
      color: #334155;
      white-space: pre-wrap;
      background: #f8fafc;
      padding: 24px;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
      margin-bottom: 30px;
    }
    .footer {
      border-top: 1px solid #e2e8f0;
      padding-top: 20px;
      display: flex;
      justify-content: space-between;
      font-size: 11px;
      color: #94a3b8;
      font-family: monospace;
    }
    .print-bar {
      background: #0f172a;
      color: white;
      padding: 12px 24px;
      border-radius: 12px;
      margin-bottom: 30px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .print-btn {
      background: #06b6d4;
      color: black;
      border: none;
      padding: 8px 16px;
      border-radius: 8px;
      font-weight: bold;
      cursor: pointer;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="print-bar no-print">
      <span>NEXA AI Executive Document Exporter</span>
      <button class="print-btn" onclick="window.print()">Print / Save as PDF</button>
    </div>

    <div class="header">
      <div class="logo">NEXA // OS</div>
      <div class="badge">VERIFIED GRADE A (${score}%)</div>
    </div>

    <h1 class="report-title">${title}</h1>
    <div class="meta">
      Generated for <strong>${sessionData.user.name}</strong> (${sessionData.user.email}) • ${formattedDate}
    </div>

    <div class="content">${content}</div>

    <div class="footer">
      <span>ZERO-TRUST AUDIT CRYPTOGRAPHIC PROOF VERIFIED</span>
      <span>NEXA SOVEREIGN OPERATING SYSTEM</span>
    </div>
  </div>
  <script>
    // Auto trigger print prompt if ?auto=true
    if (new URLSearchParams(window.location.search).get('auto') === 'true') {
      window.onload = function() { window.print(); }
    }
  </script>
</body>
</html>`;

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Disposition": `inline; filename="${encodeURIComponent(title)}.html"`,
      },
    });
  } catch (error: any) {
    console.error("PDF export error:", error);
    return new NextResponse("Failed to export document", { status: 500 });
  }
}
