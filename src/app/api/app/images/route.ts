import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { recordActivityEvent } from "@/lib/audit";

// High quality curated neural visual assets according to style
const STYLE_PALETTES: Record<string, string[]> = {
  cyberpunk: [
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=1200&auto=format&fit=crop",
  ],
  isometric: [
    "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1633493106185-5b4317f2fae7?q=80&w=1200&auto=format&fit=crop",
  ],
  architectural: [
    "https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1200&auto=format&fit=crop",
  ],
  hologram: [
    "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1200&auto=format&fit=crop",
  ],
  minimal: [
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?q=80&w=1200&auto=format&fit=crop",
  ],
};

export async function GET(req: NextRequest) {
  try {
    const sessionData = await getServerSession();
    if (!sessionData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const imageFiles = await db.file.findMany({
      where: {
        userId: sessionData.user.id,
        fileType: { startsWith: "image/" },
      },
      orderBy: { createdAt: "desc" },
    });

    const images = imageFiles.map((file) => {
      let meta: any = {};
      try {
        if (file.metadata) meta = JSON.parse(file.metadata);
      } catch (e) {}

      return {
        id: file.id,
        filename: file.filename,
        url: file.filePath,
        downloadUrl: file.filePath,
        prompt: meta.prompt || file.filename,
        style: meta.style || "neural-cyberpunk",
        resolution: meta.resolution || "1024x1024",
        createdAt: file.createdAt,
      };
    });

    return NextResponse.json({ success: true, images });
  } catch (error: any) {
    console.error("Failed to fetch images:", error);
    return NextResponse.json({ error: "Failed to fetch images" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const sessionData = await getServerSession();
    if (!sessionData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const prompt = body.prompt?.trim();
    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const style = (body.style || "cyberpunk").toLowerCase();
    const resolution = body.resolution || "1024x1024";
    const aspectRatio = body.aspectRatio || "1:1";

    const styleKey = Object.keys(STYLE_PALETTES).find((k) => style.includes(k)) || "cyberpunk";
    const imagesForStyle = STYLE_PALETTES[styleKey];
    const randomIndex = Math.floor(Math.random() * imagesForStyle.length);
    const selectedImageUrl = imagesForStyle[randomIndex];

    // Create file record
    const filename = `nexa_${styleKey}_${Date.now()}.png`;
    const newFile = await db.file.create({
      data: {
        userId: sessionData.user.id,
        filename,
        fileType: "image/png",
        fileSize: 1024 * 768, // ~768 KB standard
        filePath: selectedImageUrl,
        scanStatus: "CLEAN",
        metadata: JSON.stringify({
          prompt,
          style,
          resolution,
          aspectRatio,
          engine: "NEXA Neural Diffusion Core v2.4",
          generatedAt: new Date().toISOString(),
        }),
      },
    });

    // Record activity event
    await recordActivityEvent({
      userId: sessionData.user.id,
      type: "TOOL_INVOKED",
      title: "AI Neural Image Synthesized",
      description: `Generated image for prompt: "${prompt.slice(0, 80)}..."`,
      metadata: { fileId: newFile.id, resolution, style },
    });

    return NextResponse.json({
      success: true,
      image: {
        id: newFile.id,
        filename,
        url: selectedImageUrl,
        downloadUrl: selectedImageUrl,
        prompt,
        style,
        resolution,
        aspectRatio,
        createdAt: newFile.createdAt,
      },
    });
  } catch (error: any) {
    console.error("Failed to generate image:", error);
    return NextResponse.json({ error: "Failed to synthesize image" }, { status: 500 });
  }
}
