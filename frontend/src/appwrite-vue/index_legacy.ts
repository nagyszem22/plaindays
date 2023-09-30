import { onMounted, onUnmounted } from 'vue';
import { notificationsStore } from '@/store/notifications';
import { Client, RealtimeResponseEvent } from 'appwrite';
import { reactive } from 'vue';

interface SubscriptionStore {
  subscriptions: subscriptionList
  get: (key: string) => () => void
  add: (key: string, subscription: () => void) => void
  remove(key: string): void
}

type subscriptionList = {
  [key: string]: () => void;
}

const subscriptionStore: SubscriptionStore = reactive({
  subscriptions: {},
  get(key) {
    return this.subscriptions[key];
  },
  add(key, subscription) {
    this.subscriptions[key] = subscription;
  },
  remove(key) {
    delete this.subscriptions[key];
  }
});

type AppwriteVueDatabaseOptions = {
  database: string,
  collection: string,
}

type AppwriteVueOptions = {
  client: Client,
  service: 'database' | 'account',
  options: AppwriteVueDatabaseOptions,
};

class AppwriteVueException extends Error {
  code: number;
  response: string;
  type: string;
  constructor(message: string, code: number = 0, type: string = '', response: string = '') {
      super(message);
      this.name = 'AppwriteVueException';
      this.message = message;
      this.code = code;
      this.type = type;
      this.response = response;
  }
}

function manageSubscriptions(response: RealtimeResponseEvent<any>, key: String): void {
  if (!response?.payload || !Array.isArray(response?.events)) {
    return;
  }
  if (response.events.includes(`${key}.*.create`)) {
    notificationsStore.create(response.payload);
  }
  if (response.events.includes(`${key}.*.update`)) {
    notificationsStore.update(response.payload);
  }
  if (response.events.includes(`${key}.*.delete`)) {
    notificationsStore.delete(response.payload);
  }
}

function useDatabase(client: Client, options: AppwriteVueDatabaseOptions): void {
  const { database, collection } = options;
  const key: string = `databases.${database}.collections.${collection}.documents`;

  function subscribe(): void {
    const existingSubscription = subscriptionStore.get(key);
    if (existingSubscription) {
      return;
    }
    const unsubscribe: () => void = client.subscribe(key, response => {
      manageSubscriptions(response, key);
    });
    subscriptionStore.add(key, unsubscribe);
  }

  function get(where: any): any {
    // query the database
  }

  function query(where: any): any {
    // query the database
  }



  onMounted(() => {
    notificationsStore.init();
    subscribe();
  });
  
  onUnmounted(() => {
    const unsubscribe = subscriptionStore.get(key);
    if (unsubscribe) {
      unsubscribe();
      subscriptionStore.remove(key);
    }
  });

  return {
    subscribe,
    notificationsStore, 
  };
}

function useAppwriteVue(
  options: AppwriteVueOptions
): void {
  const { service } = options;
  switch (service) {
    case 'database':
      console.log('database');
      break;
    default:
      throw new AppwriteVueException(`${service} is not a valid service. Valid services are: 'database', 'account'`);
  }
}

export { useAppwriteVue };