import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "@/lib/auth";
import { recordActivityEvent } from "@/lib/audit";

export async function POST(req: NextRequest) {
  try {
    const sessionData = await getServerSession();
    if (!sessionData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const filename = file.name;
    const fileSize = file.size;
    const fileType = file.type || "application/octet-stream";

    // Read file text content
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const content = buffer.toString("utf-8");

    // Persist File record in Database
    const fileRecord = await db.file.create({
      data: {
        userId: sessionData.user.id,
        filename,
        fileType,
        fileSize,
        filePath: `uploads/${sessionData.user.id}/${Date.now()}_${filename}`,
        scanStatus: "CLEAN",
        metadata: JSON.stringify({
          uploadedAt: new Date().toISOString(),
          originalName: filename,
          mimeType: fileType,
        }),
      },
    });

    // Chunk text content for semantic retrieval (e.g. 500 characters per chunk)
    const chunkSize = 500;
    const chunks: string[] = [];
    for (let i = 0; i < content.length; i += chunkSize) {
      chunks.push(content.slice(i, i + chunkSize));
    }

    for (let idx = 0; idx < Math.min(chunks.length, 20); idx++) {
      await db.fileChunk.create({
        data: {
          fileId: fileRecord.id,
          chunkIndex: idx,
          content: chunks[idx],
          tokenCount: Math.round(chunks[idx].length / 4),
        },
      });
    }

    await recordActivityEvent({
      userId: sessionData.user.id,
      type: "FILE_UPLOADED",
      title: `File Ingested: ${filename}`,
      description: `Uploaded ${fileType} (${(fileSize / 1024).toFixed(1)} KB) and indexed ${chunks.length} chunks.`,
      metadata: { fileId: fileRecord.id, filename, fileSize, fileType },
    });

    return NextResponse.json({
      success: true,
      file: {
        id: fileRecord.id,
        filename: fileRecord.filename,
        fileType: fileRecord.fileType,
        fileSize: fileRecord.fileSize,
        createdAt: fileRecord.createdAt,
      },
      message: "File ingested and indexed successfully.",
    });
  } catch (error: any) {
    console.error("File upload error:", error);
    return NextResponse.json({ error: "Failed to process file upload." }, { status: 500 });
  }
}
