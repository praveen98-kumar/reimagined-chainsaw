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
          // "w-full min-h-screen antialiased relative bg-center bg-cover bg-no-repeat",
          "relative h-screen w-full bg-center bg-cover bg-no-repeat antialiased overflow-hidden",
          abeeZee.className,
        )}
        style={{
          backgroundImage: `url("https://res.cloudinary.com/dwzdwuh4t/image/upload/e_improve,w_300,h_600,c_thumb,g_auto/v1768835270/background_d2la5n.png")`,
        }}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
