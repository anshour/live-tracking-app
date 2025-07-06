import { AuthenticatedLayout, SharingLocationMap } from "~/components";
import { StatusInfoCard } from "~/components/tracking/status-info-card";

export default function Page() {
  return (
    <div className="min-h-screen bg-gray-100 relative">
      <StatusInfoCard />
      <SharingLocationMap />
    </div>
  );
}

Page.layout = function (page: any) {
  return <AuthenticatedLayout>{page}</AuthenticatedLayout>;
};
