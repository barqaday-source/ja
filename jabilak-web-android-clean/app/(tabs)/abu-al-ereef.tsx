import { Redirect } from "expo-router";

/**
 * The assistant is surfaced as a central tab, while its conversation remains
 * outside the customer/merchant conversation list at /chat/abu-al-ereef.
 */
export default function AbuAlEreefTab() {
  return <Redirect href="/chat/abu-al-ereef" />;
}
