"use client";

import { motion } from "framer-motion";
import { useRef, useState, useLayoutEffect } from "react";

export type TabState = "sm-seva" | "trend-seva" | "book-order";

const GRADIENT_ENDS: Record<TabState, string> = {
  "sm-seva": "#CCD7FF",
  "trend-seva": "#D6C1FF",
  "book-order": "#F6C7FF",
};

const TABS = Object.keys(GRADIENT_ENDS) as TabState[];

const TRANSITION = { duration: 0.2, ease: [0.4, 0, 0.2, 1] as const };

const K = 8.284;
const R = 15;

function buildPaths(h: number): Record<TabState, string> {
  const B = h;
  const BO = h + R;

  const base = `M 374,${B} C 374,${B + K} 367.284,${BO} 359,${BO} L 19,${BO} C 10.7157,${BO} 4,${B + K} 4,${B}`;
  const close = `C 367.284,42 374,48.7157 374,57 L 374,${B} Z`;

  return {
    "sm-seva": `${base} L 4,57 C 4,48.7157 4,42 4,42 L 4,42 C 4,35.2843 4,27 4,27 L 4,16 C 4,7.71572 10.7157,1 19,1 L 112,1 C 120.284,1 127,7.71573 127,16 L 127,27 C 127,35.2843 133.716,42 142,42 L 359,42 ${close}`,

    "trend-seva": `${base} L 4,57 C 4,48.7157 10.7157,42 19,42 L 113,42 C 121.284,42 128,35.2843 128,27 L 128,16 C 128,7.71573 134.716,1 143,1 L 236,1 C 244.284,1 251,7.71573 251,16 L 251,27 C 251,35.2843 257.716,42 266,42 L 359,42 ${close}`,

    "book-order": `${base} L 4,57 C 4,48.7157 10.7157,42 19,42 L 236,42 C 244.284,42 251,35.2843 251,27 L 251,16 C 251,7.71573 257.716,1 266,1 L 359,1 C 367.284,1 374,7.71573 374,16 L 374,27 C 374,35.2843 374,42 374,42 L 374,42 C 374,48.7157 374,57 374,57 L 374,${B} Z`,
  };
}

interface TabShapeBgProps {
  activeTab: TabState;
}

export function TabShapeBg({ activeTab }: TabShapeBgProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useLayoutEffect(() => {
    const parent = wrapRef.current?.parentElement;
    if (!parent) return;
    const ro = new ResizeObserver(([entry]) => {
      setHeight(entry.contentRect.height);
    });
    ro.observe(parent);
    return () => ro.disconnect();
  }, []);

  const paths = buildPaths(height);
  const viewBoxH = height + R + 7;

  if (height === 0)
    return (
      <div ref={wrapRef} className="absolute inset-0 pointer-events-none" />
    );

  return (
    <div ref={wrapRef} className="absolute inset-0 pointer-events-none">
      <svg
        viewBox={`0 0 378 ${viewBoxH}`}
        preserveAspectRatio="none"
        className="w-full h-full"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          {TABS.map((tab) => (
            <linearGradient
              key={tab}
              id={`tab-grad-${tab}`}
              x1="189"
              y1="1"
              x2="189"
              y2={viewBoxH}
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="white" />
              <stop offset="1" stopColor={GRADIENT_ENDS[tab]} />
            </linearGradient>
          ))}

          <filter
            id="tab-shadow"
            x="-1.1%"
            y="0%"
            width="102.1%"
            height="101.8%"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feColorMatrix
              in="SourceAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
              result="hardAlpha"
            />
            <feOffset dy="3" />
            <feGaussianBlur stdDeviation="2" />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.22 0"
            />
            <feBlend
              mode="normal"
              in2="BackgroundImageFix"
              result="effect1_dropShadow"
            />
            <feBlend
              mode="normal"
              in="SourceGraphic"
              in2="effect1_dropShadow"
              result="shape"
            />
          </filter>
        </defs>

        {TABS.map((tab) => (
          <motion.path
            key={tab}
            initial={false}
            animate={{
              d: paths[activeTab],
              opacity: activeTab === tab ? 1 : 0,
            }}
            transition={TRANSITION}
            fill={`url(#tab-grad-${tab})`}
            fillOpacity={0.7}
            filter="url(#tab-shadow)"
            shapeRendering="crispEdges"
          />
        ))}
      </svg>
    </div>
  );
}
