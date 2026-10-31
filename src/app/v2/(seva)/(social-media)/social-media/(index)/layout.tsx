import { SocialMediaNav } from "../_components/Nav";

export default function SocialMediaDashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="relative flex h-svh flex-col overflow-hidden">
      <div className="min-h-0 flex-1 overflow-auto">{children}</div>
      <SocialMediaNav />
    </div>
  );
}
