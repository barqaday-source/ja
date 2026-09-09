import { Share } from "react-native";

export type ShoppableReel = {
  id: string;
  videoUrl: string;
  thumbnailUrl?: string;
  caption?: string;
  creatorName: string;
  productId?: string;
  productName?: string;
  productPrice?: number;
  productImageUrl?: string;
};

export type CustomerExperience = {
  id: string;
  customerName: string;
  rating: number;
  text?: string;
  imageUrl?: string;
  videoUrl?: string;
  productId: string;
  createdAt: string;
};

export type SharedList = {
  id: string;
  title: string;
  productIds: string[];
  ownerId: string;
  updatedAt: string;
};

export async function shareList(list: SharedList, shareBaseUrl: string) {
  return Share.share({
    title: list.title,
    message: `${list.title}\n${shareBaseUrl.replace(/\/$/, "")}/lists/${encodeURIComponent(list.id)}`,
  });
}

export function formatCommunityPrice(value?: number) {
  return value === undefined || !Number.isFinite(value) ? "غير متاح" : `${value.toLocaleString("en-US")} د.ع`;
}
