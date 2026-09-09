
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

export const SOCIAL_ACCOUNTS: SocialAccount[] = [];

export const SOCIAL_CONTENT: SocialContent[] = [];

const DEFAULT_STATE: SocialState = { followedIds: [], blockedIds: [] };

export async function getSocialState(): Promise<SocialState> {
  return DEFAULT_STATE;
}

export async function saveSocialState(state: SocialState): Promise<void> {
  void state;
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
