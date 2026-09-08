import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { generateExecutiveXlsx } from "@/lib/documents/xlsxGenerator";
import { recordArtifact } from "@/lib/artifacts/artifactService";

export async function GET(req: NextRequest) {
  try {
    const sessionData = await getServerSession();
    if (!sessionData) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const title = searchParams.get("title") || "NEXA Sovereign AI System Metrics & Governance Workbook";
    const recordCount = Math.min(Math.max(parseInt(searchParams.get("rows") || "50", 10), 5), 500);

    const { buffer, hash } = generateExecutiveXlsx({
      title,
      recordCount,
      userName: sessionData.user.name,
      userEmail: sessionData.user.email,
    });

    const filename = `nexa_metrics_workbook_${Date.now()}.xlsx`;
    const downloadUrl = `/api/app/files/export-xlsx?rows=${recordCount}`;

    // Record artifact in database
    await recordArtifact({
      userId: sessionData.user.id,
      title,
      type: "SPREADSHEET_XLSX",
      mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      downloadUrl,
      fileSize: buffer.length,
      previewData: `Excel Workbook: ${recordCount} records across 3 tabs (Executive Summary, System Records, Constitution Matrix)`,
      metadata: { format: "xlsx", sheetCount: 3, rowCount: recordCount, hash },
      integrityHash: hash,
    });

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    console.error("XLSX export error:", error);
    return new NextResponse("Failed to export Excel workbook", { status: 500 });
  }
}
