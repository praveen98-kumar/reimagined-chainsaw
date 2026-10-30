import { AppShell } from "@/components/v2/AppShell";
import { IMAGES } from "@/constants/images";

export default function SearchOrdersPage() {
  return (
    <AppShell title="Search Orders" icon={IMAGES.file}>
      <div className="p-4">Search Orders</div>
    </AppShell>
  );
}
