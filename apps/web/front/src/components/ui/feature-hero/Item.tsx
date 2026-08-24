import React from "react";
import type { FeatureHeroItemProps } from "./types";

export const FeatureHeroItem: React.FC<FeatureHeroItemProps> = ({
  title,
  description,
  className = "",
}) => {
  return (
    <div
      className={`p-4 rounded-xl bg-white/40 dark:bg-white/5 border border-cyan-400/30 dark:border-cyan-400/20 hover:border-cyan-400/50 dark:hover:border-cyan-400/40 transition duration-300 backdrop-blur-sm ${className}`}
    >
      <div className="text-cyan-600 dark:text-cyan-400 text-2xl font-bold font-mono">
        {title}
      </div>
      <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
        {description}
      </div>
    </div>
  );
};
