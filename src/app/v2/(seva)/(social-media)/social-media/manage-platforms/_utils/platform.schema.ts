import * as Yup from "yup";
import type {
  Platform,
  PlatformFeature,
  PlatformFeatureValues,
  PlatformFormValues,
} from "../_types/manage-platforms.types";

export const platformSchema = Yup.object({
  title: Yup.string().trim().required("Platform title is required"),
});

export function emptyFeatureValues(): PlatformFeatureValues {
  return { id: "", title: "", sequence: "", icon: "", iconName: "" };
}

export function emptyPlatformValues(): PlatformFormValues {
  return { title: "", icon: "", iconName: "", features: [] };
}

export function toFeatureValues(
  feature: PlatformFeature,
): PlatformFeatureValues {
  return {
    id: feature.id,
    title: feature.title,
    sequence: String(feature.sequence),
    icon: feature.icon,
    iconName: feature.iconName,
  };
}

export function toFormValues(platform: Platform): PlatformFormValues {
  return {
    title: platform.title,
    icon: platform.icon,
    iconName: platform.iconName,
    features: platform.features.map(toFeatureValues),
  };
}

export function buildPlatform(
  values: PlatformFormValues,
  context: { id: string },
): Platform {
  return {
    id: context.id,
    title: values.title.trim(),
    icon: values.icon,
    iconName: values.iconName,
    features: values.features
      .filter((feature) => feature.title.trim() !== "")
      .map((feature, index) => ({
        id: feature.id || `${context.id}-feature-${index}`,
        title: feature.title.trim(),
        sequence: Number(feature.sequence) || index + 1,
        icon: feature.icon,
        iconName: feature.iconName,
      })),
  };
}
