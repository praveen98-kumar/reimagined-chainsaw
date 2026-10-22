import { List } from "@/components/v2/ui/list";

interface PlatformRendererProps {
  data: Record<string, any[]>;
}

export function PlatformRenderer({ data }: PlatformRendererProps) {
  return <div />;
}
interface Props {
  level: string;
  platforms: Record<string, Record<string, any[]>>;
}
export function SevaLevelRender({ level, platforms }: Props) {
  const items = Array.from(Object.entries(platforms));

  return (
    <>
      <div className="p-2 rounded-t-lg bg-linear-to-r from-yellow-400 to-orange-400">
        <h2 className="text-lg font-medium">{level}</h2>
      </div>
      <List
        items={items}
        renderItem={(item, index) => (
          <PlatformRenderer data={item[1]} key={`${item[0]}-${index}`} />
        )}
      />
    </>
  );
}
