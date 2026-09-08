import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { getUserArtifacts, getArtifactLineageGraph, recordArtifact } from "@/lib/artifacts/artifactService";

export async function GET(req: NextRequest) {
  try {
    const sessionData = await getServerSession();
    if (!sessionData) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const artifacts = await getUserArtifacts(sessionData.user.id);
    const graph = await getArtifactLineageGraph(sessionData.user.id);

    return NextResponse.json({
      success: true,
      artifacts,
      graph,
      summary: {
        totalArtifacts: artifacts.length,
        verifiedCount: artifacts.filter((a) => a.verifiedStatus === "VERIFIED").length,
        types: Array.from(new Set(artifacts.map((a) => a.type))),
      },
    });
  } catch (error: any) {
    console.error("Artifacts GET error:", error);
    return new NextResponse("Failed to fetch artifacts", { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const sessionData = await getServerSession();
    if (!sessionData) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const artifact = await recordArtifact({
      userId: sessionData.user.id,
      title: body.title,
      type: body.type,
      mimeType: body.mimeType,
      downloadUrl: body.downloadUrl,
      fileSize: body.fileSize,
      previewData: body.previewData,
      metadata: body.metadata,
      parentArtifactId: body.parentArtifactId,
      taskId: body.taskId,
      projectId: body.projectId,
      integrityHash: body.integrityHash,
    });

    return NextResponse.json({ success: true, artifact });
  } catch (error: any) {
    console.error("Artifacts POST error:", error);
    return new NextResponse("Failed to record artifact", { status: 500 });
  }
}
