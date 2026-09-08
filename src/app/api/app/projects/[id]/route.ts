import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { getProjectDetails, updateProject, deleteProject } from "@/lib/projects/projectService";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const sessionData = await getServerSession();
    if (!sessionData) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const project = await getProjectDetails(params.id, sessionData.user.id);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, project });
  } catch (error: any) {
    console.error("Project details GET error:", error);
    return new NextResponse("Failed to fetch project details", { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const sessionData = await getServerSession();
    if (!sessionData) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { name, description, status } = body;

    const updated = await updateProject(params.id, sessionData.user.id, {
      name,
      description,
      status,
    });

    if (!updated) {
      return NextResponse.json({ error: "Project not found or unauthorized" }, { status: 404 });
    }

    return NextResponse.json({ success: true, project: updated });
  } catch (error: any) {
    console.error("Project PATCH error:", error);
    return new NextResponse("Failed to update project", { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const sessionData = await getServerSession();
    if (!sessionData) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const success = await deleteProject(params.id, sessionData.user.id);
    if (!success) {
      return NextResponse.json({ error: "Project not found or unauthorized" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Project DELETE error:", error);
    return new NextResponse("Failed to delete project", { status: 500 });
  }
}
