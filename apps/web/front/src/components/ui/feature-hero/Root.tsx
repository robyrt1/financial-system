import React from "react";
import type { FeatureHeroRootProps } from "./types";

export const FeatureHeroRoot: React.FC<FeatureHeroRootProps> = ({
  title,
  description,
  children,
  className = "",
}) => {
  return (
    <div
      className={`z-10 flex-1 flex flex-col justify-center my-8 ${className}`}
    >
      <h2 className="text-4xl font-bold leading-tight mb-6 text-slate-800 dark:text-white">
        {title}
      </h2>

      <p className="text-slate-600 dark:text-slate-300 text-base leading-relaxed mb-8">
        {description}
      </p>

      {children && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>
      )}
    </div>
  );
};
