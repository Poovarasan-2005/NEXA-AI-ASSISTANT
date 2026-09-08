import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { generateExecutivePptx } from "@/lib/documents/pptxGenerator";
import { recordArtifact } from "@/lib/artifacts/artifactService";

export async function GET(req: NextRequest) {
  try {
    const sessionData = await getServerSession();
    if (!sessionData) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const title = searchParams.get("title") || "NEXA Sovereign AI Operating System Architecture";
    const subtitle =
      searchParams.get("subtitle") || "Executive Presentation Deck: Governance, Multimodal Creation & Security";

    const { buffer, hash } = await generateExecutivePptx({
      title,
      subtitle,
      authorName: sessionData.user.name,
      authorEmail: sessionData.user.email,
    });

    const filename = `nexa_presentation_deck_${Date.now()}.pptx`;
    const downloadUrl = `/api/app/files/export-pptx?filename=${filename}`;

    // Record artifact in database
    await recordArtifact({
      userId: sessionData.user.id,
      title,
      type: "PRESENTATION_PPTX",
      mimeType: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      downloadUrl,
      fileSize: buffer.length,
      previewData: `Presentation Deck: ${title} (6 Slides: Title, Overview, Architecture, Metrics, Roadmap, Attestation)`,
      metadata: { format: "pptx", slideCount: 6, theme: "Dark Modern Cyan", hash },
      integrityHash: hash,
    });

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    console.error("PPTX export error:", error);
    return new NextResponse("Failed to export PPTX presentation", { status: 500 });
  }
}
