import { UrssafAdminDashboard } from "@/components/admin/urssaf/UrssafAdminDashboard";

export const dynamic = "force-dynamic";

export default function AdminUrssafPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <UrssafAdminDashboard />
    </div>
  );
}
