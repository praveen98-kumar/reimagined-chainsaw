import { List } from "@/components/v2/ui/list";
import { AllotSevadarCard } from "./allot-sevadar-card";

export function AllotSevadarUserList({ items }: { items: any[] }) {
  return (
    <List
      className="space-y-3"
      items={items}
      renderItem={(item) => <AllotSevadarCard user={item} />}
    />
  );
}
