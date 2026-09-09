export const ACCOUNT_DELETE_PHRASE = "احذف حسابي";

export function matchesConfirmationPhrase(value: string, expected = ACCOUNT_DELETE_PHRASE) {
  return value.trim() === expected;
}

export function removeById<T extends { id: string }>(items: T[], id: string) {
  return items.filter((item) => item.id !== id);
}

export function removeAll<T>(_items: T[]) {
  return [] as T[];
}
