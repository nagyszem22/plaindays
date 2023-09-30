import { onMounted, onUnmounted } from 'vue';
import { client } from '@/config';
import { subscriptionStore } from '@/store/subscription';
import { accountStore } from '@/store/account';

export const useAccountSubscription = () => {

  const subscribe = () => {
    const existingSubscription = subscriptionStore.get('account');
    if (existingSubscription) {
      console.log('Account subscription already exists');
      return;
    }
    const unsubscribe = client.subscribe('account', response => {
      console.log('Account subscription response', response);
      if (!response?.payload || !Array.isArray(response?.events)) {
        return;
      }
      if (response.events.includes('users.*.update')) {
        accountStore.update(response?.payload);
      }
    });
    subscriptionStore.add('account', unsubscribe);
  }

  onMounted(() => {
    accountStore.init();
    subscribe();
  });
  
  onUnmounted(() => {
    const unsubscribe = subscriptionStore.get('account');
    if (unsubscribe) {
      unsubscribe();
      subscriptionStore.remove('account');
    }
  });

  return {
    subscribe,
    accountStore, 
  };
};