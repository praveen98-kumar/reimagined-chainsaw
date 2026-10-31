import { ABeeZee } from "next/font/google";
import { cn } from "@/utils/cn";

import "../styles/globals.css";
import Providers from "./providers";
import { Viewport } from "next";

const abeeZee = ABeeZee({
  variable: "--font-abeezee",
  weight: ["400"],
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body
        className={cn(
          "relative h-screen w-full bg-center bg-cover bg-no-repeat antialiased overflow-hidden bg-app-gradient",
          abeeZee.className,
        )}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
