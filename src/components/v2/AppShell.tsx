import { PageHeader, PageHeaderProps } from "./PageHeader";

interface Props extends PageHeaderProps {
  children?: React.ReactNode;
}

export function AppShell({ children, ...props }: Props) {
  return (
    <div
      className="relative flex flex-col h-full bg-[#fffaf0] overflow-y-auto"
      style={{
        backgroundImage:
          "radial-gradient(circle at 100% 0%, rgba(253,186,116,0.35), transparent 45%), radial-gradient(circle at 0% 100%, rgba(253,230,138,0.35), transparent 45%)",
      }}
    >
      <PageHeader {...props} />
      <div className="flex-1 pb-24 sm:pb-0">{children}</div>
    </div>
  );
}
