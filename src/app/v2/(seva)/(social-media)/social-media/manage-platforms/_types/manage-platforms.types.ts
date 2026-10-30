export interface PlatformFeature {
  id: string;
  title: string;
  sequence: number;
  icon: string;
  iconName: string;
}

export interface Platform {
  id: string;
  title: string;
  icon: string;
  iconName: string;
  features: PlatformFeature[];
}

export interface PlatformFeatureValues {
  id: string;
  title: string;
  sequence: string;
  icon: string;
  iconName: string;
}

export interface PlatformFormValues {
  title: string;
  icon: string;
  iconName: string;
  features: PlatformFeatureValues[];
}

export type PlatformTab = "add" | "list";
