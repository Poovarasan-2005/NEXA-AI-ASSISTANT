import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "@/lib/auth";
import { recordActivityEvent } from "@/lib/audit";
import { clearAllUserMemory } from "@/lib/ai/memoryEngine";

export async function GET(req: NextRequest) {
  try {
    const sessionData = await getServerSession();
    if (!sessionData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const typeFilter = searchParams.get("type");
    const query = searchParams.get("q")?.toLowerCase();

    const whereClause: any = {
      userId: sessionData.user.id,
      isArchived: false,
    };

    if (typeFilter && typeFilter !== "ALL") {
      whereClause.type = typeFilter;
    }

    const memories = await db.memory.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
    });

    let filtered = memories;
    if (query) {
      filtered = memories.filter(
        (m) =>
          m.content.toLowerCase().includes(query) ||
          m.source.toLowerCase().includes(query) ||
          m.type.toLowerCase().includes(query)
      );
    }

    return NextResponse.json({ memories: filtered });
  } catch (error: any) {
    console.error("Fetch memories error:", error);
    return NextResponse.json({ error: "Failed to fetch memory records." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const sessionData = await getServerSession();
    if (!sessionData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { type, content, source, confidence } = body;

    if (!type || !content) {
      return NextResponse.json({ error: "Memory type and content are required." }, { status: 400 });
    }

    const memory = await db.memory.create({
      data: {
        userId: sessionData.user.id,
        type: type.toUpperCase(),
        content: content.trim(),
        source: source?.trim() || "User Direct Entry",
        confidence: confidence ? Number(confidence) : 1.0,
        lastConfirmedAt: new Date(),
      },
    });

    await recordActivityEvent({
      userId: sessionData.user.id,
      type: "MEMORY_RECORDED",
      title: `Memory Saved (${memory.type})`,
      description: memory.content.slice(0, 100),
      metadata: { memoryId: memory.id, type: memory.type },
    });

    return NextResponse.json({ success: true, memory });
  } catch (error: any) {
    console.error("Create memory error:", error);
    return NextResponse.json({ error: "Failed to create memory record." }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const sessionData = await getServerSession();
    if (!sessionData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { memoryId, content, type } = body;

    if (!memoryId) {
      return NextResponse.json({ error: "Memory ID required." }, { status: 400 });
    }

    // IDOR Check
    const memory = await db.memory.findUnique({ where: { id: memoryId } });
    if (!memory || memory.userId !== sessionData.user.id) {
      return NextResponse.json({ error: "Memory record not found." }, { status: 404 });
    }

    const updated = await db.memory.update({
      where: { id: memoryId },
      data: {
        ...(content ? { content: content.trim() } : {}),
        ...(type ? { type: type.toUpperCase() } : {}),
        lastConfirmedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, memory: updated });
  } catch (error: any) {
    console.error("Update memory error:", error);
    return NextResponse.json({ error: "Failed to update memory record." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const sessionData = await getServerSession();
    if (!sessionData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const memoryId = searchParams.get("id");
    const action = searchParams.get("action");

    if (action === "clear_all") {
      await clearAllUserMemory(sessionData.user.id);
      await recordActivityEvent({
        userId: sessionData.user.id,
        type: "MEMORY_CLEARED",
        title: "All Memories Cleared",
        description: "User permanently purged all long-term and episodic memory records.",
      });
      return NextResponse.json({ success: true, message: "All memory records cleared." });
    }

    if (!memoryId) {
      return NextResponse.json({ error: "Memory ID required." }, { status: 400 });
    }

    // IDOR Check
    const memory = await db.memory.findUnique({ where: { id: memoryId } });
    if (!memory || memory.userId !== sessionData.user.id) {
      return NextResponse.json({ error: "Memory record not found." }, { status: 404 });
    }

    await db.memory.delete({ where: { id: memoryId } });

    return NextResponse.json({ success: true, message: "Memory record deleted." });
  } catch (error: any) {
    console.error("Delete memory error:", error);
    return NextResponse.json({ error: "Failed to delete memory record." }, { status: 500 });
  }
}
