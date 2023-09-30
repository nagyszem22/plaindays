import { onMounted, onUnmounted } from 'vue';
import { client, adb, adbc } from '@/config';
import { subscriptionStore } from '@/store/subscription';
import { notificationsStore } from '@/store/notifications';

export const useNotificationsSubscription = () => {

  const subscriptionKey = `databases.${adb['App']}.collections.${adbc['UserNotifications']}.documents`;

  const subscribe = () => {
    const existingSubscription = subscriptionStore.get(subscriptionKey);
    if (existingSubscription) {
      console.log('Notifications subscription already exists');
      return;
    }
    const unsubscribe = client.subscribe(subscriptionKey, response => {
      console.log('Notifications subscription response', response);
      if (!response?.payload || !Array.isArray(response?.events)) {
        return;
      }
      if (response.events.includes(`${subscriptionKey}.*.update`)) {
        notificationsStore.update(response.payload);
      }
      // continue here with notificationsStore.update
    });
    subscriptionStore.add(subscriptionKey, unsubscribe);
  }

  onMounted(() => {
    notificationsStore.init();
    subscribe();
  });
  
  onUnmounted(() => {
    const unsubscribe = subscriptionStore.get(subscriptionKey);
    if (unsubscribe) {
      unsubscribe();
      subscriptionStore.remove(subscriptionKey);
    }
  });

  return {
    subscribe,
    notificationsStore, 
  };
};