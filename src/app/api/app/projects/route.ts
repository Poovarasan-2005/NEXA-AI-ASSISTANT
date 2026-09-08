import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { getUserProjects, createProject } from "@/lib/projects/projectService";

export async function GET(req: NextRequest) {
  try {
    const sessionData = await getServerSession();
    if (!sessionData) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const projects = await getUserProjects(sessionData.user.id);
    return NextResponse.json({ success: true, projects });
  } catch (error: any) {
    console.error("Projects GET error:", error);
    return new NextResponse("Failed to fetch projects", { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const sessionData = await getServerSession();
    if (!sessionData) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { name, description, status } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json({ error: "Project name is required" }, { status: 400 });
    }

    const project = await createProject(sessionData.user.id, {
      name: name.trim(),
      description: description?.trim(),
      status,
    });

    return NextResponse.json({ success: true, project });
  } catch (error: any) {
    console.error("Projects POST error:", error);
    return new NextResponse("Failed to create project", { status: 500 });
  }
}
