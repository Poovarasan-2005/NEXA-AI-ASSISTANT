import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "@/lib/auth";

export async function GET() {
  try {
    const sessionData = await getServerSession();
    if (!sessionData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const files = await db.file.findMany({
      where: { userId: sessionData.user.id },
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { chunks: true } },
      },
    });

    const formatted = files.map((f) => ({
      id: f.id,
      filename: f.filename,
      fileType: f.fileType,
      fileSize: f.fileSize,
      scanStatus: f.scanStatus,
      chunksCount: f._count.chunks,
      createdAt: f.createdAt,
    }));

    return NextResponse.json({ files: formatted });
  } catch (error: any) {
    console.error("Fetch files error:", error);
    return NextResponse.json({ error: "Failed to fetch files." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const sessionData = await getServerSession();
    if (!sessionData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const fileId = searchParams.get("id");

    if (!fileId) {
      return NextResponse.json({ error: "File ID required." }, { status: 400 });
    }

    // IDOR Check
    const file = await db.file.findUnique({ where: { id: fileId } });
    if (!file || file.userId !== sessionData.user.id) {
      return NextResponse.json({ error: "File not found." }, { status: 404 });
    }

    await db.file.delete({ where: { id: fileId } });

    return NextResponse.json({ success: true, message: "File removed from workspace." });
  } catch (error: any) {
    console.error("Delete file error:", error);
    return NextResponse.json({ error: "Failed to delete file." }, { status: 500 });
  }
}
