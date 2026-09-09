import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function registerForPushNotificationsAsync(): Promise<string | null> {
  if (Platform.OS === "web") return null;

  const existing = await Notifications.getPermissionsAsync();
  let status = existing.status;
  if (status !== "granted") {
    const requested = await Notifications.requestPermissionsAsync();
    status = requested.status;
  }
  if (status !== "granted") return null;

  const token = await Notifications.getExpoPushTokenAsync();
  return token.data;
}

export async function notifyOrderStatusChanged(status: string, orderId?: string) {
  return Notifications.scheduleNotificationAsync({
    content: { title: "تحديث حالة الطلب", body: orderId ? `الطلب #${orderId}: ${status}` : status, data: { type: "order_status", orderId } },
    trigger: null,
  });
}

export async function notifyNewMessage(senderName: string) {
  return Notifications.scheduleNotificationAsync({
    content: { title: "رسالة جديدة", body: `لديك رسالة جديدة من ${senderName}`, data: { type: "new_message" } },
    trigger: null,
  });
}
