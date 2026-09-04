import AsyncStorage from "@react-native-async-storage/async-storage";
import { REAL_IMAGES } from "@/constants/assets";

export type SocialAccount = {
  id: string;
  name: string;
  kind: "store" | "user";
  category: string;
  location: string;
  avatar: string;
  verified?: boolean;
};

export type SocialContent = {
  id: string;
  accountId: string;
  type: "post" | "ad" | "story";
  title: string;
  image: string;
  time: string;
  sponsored?: boolean;
};

export type SocialState = { followedIds: string[]; blockedIds: string[] };

export const SOCIAL_ACCOUNTS: SocialAccount[] = [
  { id: "abu-ali", name: "أبو علي للأقمشة", kind: "store", category: "ملابس", location: "الكرادة، بغداد", avatar: REAL_IMAGES.stores.fashion, verified: true },
  { id: "step-style", name: "ستايـل سبورت", kind: "store", category: "أحذية", location: "المنصور، بغداد", avatar: REAL_IMAGES.products.shoes, verified: true },
  { id: "fashion-boutique", name: "بوتيك رَوان", kind: "store", category: "أزياء", location: "أربيل", avatar: REAL_IMAGES.stores.boutique },
  { id: "layan", name: "ليان محمد", kind: "user", category: "مهتمة بالأزياء", location: "بغداد", avatar: REAL_IMAGES.posts.model },
];

export const SOCIAL_CONTENT: SocialContent[] = [
  { id: "post-shirt", accountId: "abu-ali", type: "post", title: "تشكيلة القمصان الجديدة وصلت اليوم", image: REAL_IMAGES.products.shirt, time: "منذ 18 دقيقة" },
  { id: "ad-shoes", accountId: "step-style", type: "ad", title: "أحذية رياضية للمدينة · عرض خاص", image: REAL_IMAGES.products.shoes, time: "منذ ساعة", sponsored: true },
  { id: "story-rwan", accountId: "fashion-boutique", type: "story", title: "ألوان جديدة وصلت للمتجر", image: REAL_IMAGES.stores.boutique, time: "منذ ساعتين" },
  { id: "post-jacket", accountId: "fashion-boutique", type: "post", title: "إطلالة اليوم بلمسة رَوان", image: REAL_IMAGES.posts.model, time: "منذ 4 ساعات" },
  { id: "post-cotton", accountId: "abu-ali", type: "post", title: "قطنيات خفيفة لأيام الصيف", image: REAL_IMAGES.products.shirt, time: "أمس" },
];

const STORAGE_KEY = "jabilak-social-following";
const DEFAULT_STATE: SocialState = { followedIds: ["abu-ali", "step-style", "fashion-boutique"], blockedIds: [] };

export async function getSocialState(): Promise<SocialState> {
  try {
    const value = await AsyncStorage.getItem(STORAGE_KEY);
    if (!value) return DEFAULT_STATE;
    const parsed = JSON.parse(value) as Partial<SocialState>;
    return { followedIds: parsed.followedIds ?? DEFAULT_STATE.followedIds, blockedIds: parsed.blockedIds ?? [] };
  } catch {
    return DEFAULT_STATE;
  }
}

export async function saveSocialState(state: SocialState): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export async function toggleFollow(state: SocialState, accountId: string): Promise<SocialState> {
  const followedIds = state.followedIds.includes(accountId) ? state.followedIds.filter((id) => id !== accountId) : [...state.followedIds, accountId];
  const next = { ...state, followedIds };
  await saveSocialState(next);
  return next;
}

export async function toggleBlock(state: SocialState, accountId: string): Promise<SocialState> {
  const blockedIds = state.blockedIds.includes(accountId) ? state.blockedIds.filter((id) => id !== accountId) : [...state.blockedIds, accountId];
  const next = { ...state, blockedIds, followedIds: blockedIds.includes(accountId) ? state.followedIds.filter((id) => id !== accountId) : state.followedIds };
  await saveSocialState(next);
  return next;
}
