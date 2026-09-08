import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { generateDiagram, DiagramType } from "@/lib/diagrams/diagramGenerator";
import { recordArtifact } from "@/lib/artifacts/artifactService";
import crypto from "crypto";

export async function GET(req: NextRequest) {
  try {
    const sessionData = await getServerSession();
    if (!sessionData) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type = (searchParams.get("type") || "ARCHITECTURE").toUpperCase() as DiagramType;
    const prompt = searchParams.get("prompt") || undefined;

    const diagram = generateDiagram(type, prompt);
    return NextResponse.json({ success: true, diagram });
  } catch (error: any) {
    console.error("Diagram GET error:", error);
    return new NextResponse("Failed to fetch diagram", { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const sessionData = await getServerSession();
    if (!sessionData) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const type = (body.type || "ARCHITECTURE").toUpperCase() as DiagramType;
    const prompt = body.prompt || undefined;

    const diagram = generateDiagram(type, prompt);
    const hash = crypto.createHash("sha256").update(diagram.svgMarkup).digest("hex");

    // Record as Artifact
    const artifact = await recordArtifact({
      userId: sessionData.user.id,
      title: diagram.title,
      type: "DIAGRAM_SVG",
      mimeType: "image/svg+xml",
      downloadUrl: `/api/app/diagrams?type=${type}`,
      fileSize: Buffer.byteLength(diagram.svgMarkup, "utf8"),
      previewData: diagram.mermaidCode,
      metadata: { diagramType: type, hash },
      integrityHash: hash,
    });

    return NextResponse.json({
      success: true,
      diagram,
      artifactId: artifact.id,
      hash,
    });
  } catch (error: any) {
    console.error("Diagram POST error:", error);
    return new NextResponse("Failed to generate diagram", { status: 500 });
  }
}
