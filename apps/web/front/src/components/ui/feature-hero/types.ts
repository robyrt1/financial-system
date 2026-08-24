import type { ReactNode } from "react";

export interface FeatureHeroRootProps {
  title: ReactNode;
  description: ReactNode;
  children?: ReactNode;
  className?: string;
}

export interface FeatureHeroItemProps {
  title: ReactNode;
  description: ReactNode;
  className?: string;
}
