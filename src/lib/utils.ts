import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDateTime(value: string | Date) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function titleForAssetType(assetType: string) {
  const labels: Record<string, string> = {
    logo: "Logo",
    app_icon: "App 图标",
    hero_banner: "首屏 Banner",
    icon_set: "图标集",
  };
  return labels[assetType] ?? assetType;
}
