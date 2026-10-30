"use client";

import { motion } from "framer-motion";
import { useRef, useState, useLayoutEffect } from "react";

export type TabState = "sm-seva" | "trend-seva" | "book-order";

const GRADIENT_ENDS: Record<TabState, string> = {
  "sm-seva": "#CCD7FF",
  "trend-seva": "#D6C1FF",
  "book-order": "#F6C7FF",
};

const TRANSITION = { duration: 0.2, ease: [0.4, 0, 0.2, 1] as const };

const K = 8.284;
const R = 15;
const LEFT = 4;
const RIGHT = 374;
const TOP = 1;
const VALLEY = 42;
const C = R - K;

function boundary(index: number, count: number) {
  return Math.round(LEFT + ((RIGHT - LEFT) * index) / count);
}

function buildPath(activeIndex: number, count: number, h: number): string {
  const B = h;
  const BO = h + R;

  const base = `M ${RIGHT},${B} C ${RIGHT},${B + K} ${RIGHT - C},${BO} ${RIGHT - R},${BO} L ${LEFT + R},${BO} C ${LEFT + C},${BO} ${LEFT},${B + K} ${LEFT},${B}`;

  const yFor = (index: number) => (index === activeIndex ? TOP : VALLEY);

  let d = base;

  if (activeIndex === 0) {
    d += ` L ${LEFT},${TOP + R} C ${LEFT},${TOP + C} ${LEFT + C},${TOP} ${LEFT + R},${TOP}`;
  } else {
    d += ` L ${LEFT},${VALLEY + R} C ${LEFT},${VALLEY + C} ${LEFT + C},${VALLEY} ${LEFT + R},${VALLEY}`;
  }

  for (let index = 0; index < count; index++) {
    const y = yFor(index);
    const segmentRight =
      index === count - 1 ? RIGHT - R : boundary(index + 1, count) - R;

    if (index > 0) {
      const prevY = yFor(index - 1);
      const x = boundary(index, count);

      if (prevY !== y) {
        if (prevY === TOP) {
          d += ` L ${x - R},${TOP} C ${x - C},${TOP} ${x},${TOP + C} ${x},${TOP + R}`;
          d += ` L ${x},${VALLEY - R} C ${x},${VALLEY - C} ${x + C},${VALLEY} ${x + R},${VALLEY}`;
        } else {
          d += ` L ${x - R},${VALLEY} C ${x - C},${VALLEY} ${x},${VALLEY - C} ${x},${VALLEY - R}`;
          d += ` L ${x},${TOP + R} C ${x},${TOP + C} ${x + C},${TOP} ${x + R},${TOP}`;
        }
      }
    }

    d += ` L ${segmentRight},${y}`;
  }

  const lastY = yFor(count - 1);

  if (lastY === TOP) {
    d += ` C ${RIGHT - C},${TOP} ${RIGHT},${TOP + C} ${RIGHT},${TOP + R}`;
    d += ` L ${RIGHT},${VALLEY - R}`;
    d += ` C ${RIGHT},${VALLEY - C} ${RIGHT},${VALLEY} ${RIGHT},${VALLEY}`;
    d += ` C ${RIGHT},${VALLEY + C} ${RIGHT},${VALLEY + R} ${RIGHT},${VALLEY + R}`;
  } else {
    d += ` C ${RIGHT - C},${VALLEY} ${RIGHT},${VALLEY + C} ${RIGHT},${VALLEY + R}`;
  }

  d += ` L ${RIGHT},${B} Z`;

  return d;
}

function buildPaths(
  tabs: readonly TabState[],
  h: number,
): Record<string, string> {
  return Object.fromEntries(
    tabs.map((tab, index) => [tab, buildPath(index, tabs.length, h)]),
  );
}

interface TabShapeBgProps {
  activeTab: TabState;
  tabs: readonly TabState[];
}

export function TabShapeBg({ activeTab, tabs }: TabShapeBgProps) {
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

  const paths = buildPaths(tabs, height);
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
          {tabs.map((tab) => (
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

        {tabs.map((tab) => (
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
