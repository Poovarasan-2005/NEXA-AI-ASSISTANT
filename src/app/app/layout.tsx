import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth";
import { isAdmin } from "@/lib/rbac";
import { db } from "@/lib/db";
import { AppSidebar } from "@/components/app/AppSidebar";
import { CommandPalette } from "@/components/app/CommandPalette";

export const dynamic = "force-dynamic";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sessionData = await getServerSession();

  if (!sessionData) {
    redirect("/login");
  }

  // Fetch pending approvals count for user badge
  const pendingApprovalsCount = await db.approval.count({
    where: {
      userId: sessionData.user.id,
      status: "PENDING",
    },
  });

  const isUserAdmin = isAdmin(sessionData.user);

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col md:flex-row selection:bg-cyan-500/30 selection:text-cyan-200">
      <AppSidebar
        user={sessionData.user}
        isAdmin={isUserAdmin}
        pendingApprovalsCount={pendingApprovalsCount}
      />
      <main className="flex-1 overflow-y-auto max-h-screen p-4 sm:p-6 lg:p-8">
        {children}
      </main>
      <CommandPalette />
    </div>
  );
}
