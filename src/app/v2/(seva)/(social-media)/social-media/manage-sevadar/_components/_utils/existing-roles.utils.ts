export interface ExistingRole {
  role: {
    id: number;
    name: string;
    sequence: number;
    group: string;
    region: string;
  };
  state: { name: string } | null;
  district: { name: string } | null;
  tehsil: { name: string } | null;
  division: { name: string } | null;
}

export function groupExistingRoles(
  items: ExistingRole[],
): Record<string, ExistingRole[]> {
  const grouped: Record<string, ExistingRole[]> = {};

  for (const item of items) {
    const group = item.role.group;

    if (!grouped[group]) {
      grouped[group] = [];
    }

    grouped[group].push(item);
  }

  for (const group in grouped) {
    grouped[group].sort((a, b) => b.role.sequence - a.role.sequence);
  }

  return grouped;
}
