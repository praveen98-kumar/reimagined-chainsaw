import { PageHeader, PageHeaderProps } from "./PageHeader";

interface Props extends PageHeaderProps {
  children?: React.ReactNode;
}

export function AppShell({ children, ...props }: Props) {
  return (
    <div className="relative flex flex-col h-full overflow-y-auto">
      <PageHeader {...props} />
      <div className="flex-1 pb-16 sm:pb-0">{children}</div>
    </div>
  );
}
