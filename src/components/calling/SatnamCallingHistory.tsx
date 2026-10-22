import { HistoryToggleComponent } from "@/components/card/CommonCard";
import { motion } from "framer-motion";

export default function SatnamCallingHistroy({
  historyMap,
}: {
  historyMap: Record<string, string | null | undefined>;
}) {
  return (
    <HistoryToggleComponent>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", maxHeight: "full", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="text-xs flex flex-col gap-y-1 bg-black"
      >
        {Object.entries(historyMap).map(
          ([k, v], i) =>
            v != null &&
            v != "" && (
              <div key={i} className="border-b border-gray-200 px-2">
                <p className="font-semibold text-sm text-white">
                  {k}: <span>{v}</span>
                </p>
              </div>
            )
        )}
      </motion.div>
    </HistoryToggleComponent>
  );
}
