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
    <nav className="fixed inset-x-0 bottom-0 z-[90] border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)] md:hidden">
      <ul className="flex h-16 w-full shrink-0 flex-row items-center justify-between gap-1 px-0.5">
        {items.map((item) => {
          const isActive = item.href === pathname;
          return (
            <li key={`nav-${item.label}`} className="flex flex-1 h-full">
              <Link
                className={cn(
                  "flex gap-1 w-full rounded-sm h-full items-center justify-center",
                  {
                    "bg-linear-to-b from-[#ffedbf] to-[#ffc053]": isActive,
                  },
                )}
                href={item.href}
                replace
              >
                <Image
                  alt={`${item.label}-media`}
                  src={item.image}
                  width={45}
                  height={45}
                />
                <div className="w-10">
                  <p
                    className={cn("text-wrap leading-4 text-xs text-center", {
                      "font-bold": isActive,
                    })}
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
