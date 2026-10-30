"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/shared/functions/utils";

interface NavItems {
  href: string;
  label: string;
  image: string;
}

interface MobileNavProps {
  items: NavItems[];
}

export const MobileNav: React.FC<MobileNavProps> = ({ items }) => {
  // `usePathname` must be called once per component, not inside the `.map`
  // callback, otherwise the amount of hooks changes with the amount of items
  // and React throws "Rendered more hooks than during the previous render".
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-[90] border-t border-orange-200 bg-[#fffaf0] pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_16px_rgba(154,52,18,0.08)] md:hidden">
      <ul className="flex h-[72px] w-full shrink-0 flex-row items-center justify-between gap-2.5 px-3.5 py-2">
        {items.map((item) => {
          const isActive = item.href === pathname;
          return (
            <li key={`nav-${item.label}`} className="flex flex-1 h-full">
              <Link
                className={cn(
                  "flex h-full w-full min-w-0 flex-col items-center justify-center gap-0.5 rounded-[14px] px-2 py-1.5 text-[#7c2d12]",
                  {
                    "bg-linear-to-br from-[#fdba74] to-[#fbbf24] text-[#431407] shadow-[0_3px_10px_rgba(245,158,11,0.35)]":
                      isActive,
                  },
                )}
                href={item.href}
                replace
              >
                <Image
                  alt={`${item.label}-media`}
                  src={item.image}
                  width={28}
                  height={28}
                />
                <div>
                  <p
                    className={cn(
                      "leading-4 text-[13px] font-semibold text-center",
                      {
                        "font-bold": isActive,
                      },
                    )}
                  >
                    {item.label}
                  </p>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};
