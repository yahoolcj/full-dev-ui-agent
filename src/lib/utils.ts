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
    logo_square: "LOGO 正方",
    logo_square_wordmark: "LOGO 正方带文字",
    login_background: "登录页背景",
    custom_image: "其他图",
  };
  return labels[assetType] ?? assetType;
}
