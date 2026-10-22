import Button from "@/components/Button";
import React, { useEffect, useRef } from "react";
import { useRouter } from "next/router";

const DownloadPage = () => {
  const prompt = useRef<Event | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (window.matchMedia("(display-mode: standalone)").matches) {
      router.replace("/login");
    }
    const userAgentString = navigator.userAgent;
    let chromeAgent = userAgentString.indexOf("Chrome") > -1;
    const CriOS = userAgentString.indexOf("CriOS") > -1;
    const mobileSafari = userAgentString.indexOf("Mobile Safari") > -1;
    const iPhone = userAgentString.indexOf("iPhone") > -1;
    const Android = userAgentString.indexOf("Android") > -1;
    const iPad = userAgentString.indexOf("iPad") > -1;

    if (
      !(Android && chromeAgent && mobileSafari) &&
      !((iPhone || iPad) && CriOS)
    ) {
      if (Android) {
        router.replace(
          "https://play.google.com/store/apps/details?id=com.android.chrome"
        );
      }
      if (iPad || iPhone) {
        router.replace(
          "https://apps.apple.com/in/app/google-chrome/id535886823"
        );
      }
    }
    const handler = (e: Event) => {
      e.preventDefault();
      prompt.current = e;
    };
    window.addEventListener("beforeinstallprompt", handler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const onClick = async () => {
    if (prompt.current) {
      // @ts-ignore
      prompt.current?.prompt();
      // @ts-ignore
      const { outcome } = await prompt.current?.userChoice;
      if (outcome === "accepted") {
        prompt.current = null;
      }
    }
  };
  return (
    <div className="w-full h-screen flex items-center justify-center">
      <Button onClick={onClick}>Install</Button>
    </div>
  );
};

export default DownloadPage;
