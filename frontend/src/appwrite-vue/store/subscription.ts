import { reactive } from 'vue';
import { Client, RealtimeResponseEvent } from 'appwrite';

interface SubscriptionStore {
  subscriptions: SubscriptionList
  get: (key: string) => () => void
  getKeys: () => string[]
  add: (
    key: string,
    client: Client,
    compositionKey: string,
    callback: (key: string, response: RealtimeResponseEvent<any>) => void
  ) => void
  remove(key: string, compositionKey: string): void
}
type SubscriptionList = {
  [key: string]: Subscription
}
type Subscription = {
  unsubscribe: () => void
  compositionKeys: string[]
}

const subscriptionStore: SubscriptionStore = reactive({
  subscriptions: {},
  get(key) {
    return this.subscriptions[key];
  },
  getKeys() {
    return Object.keys(this.subscriptions);
  },
  add(key, client, compositionKey, callback) {
    // check if a subscription already exists for this key
    if (this.subscriptions[key] && this.subscriptions[key].compositionKeys.includes(compositionKey)) {
      return;
    } else if (this.subscriptions[key]) {
      this.subscriptions[key].compositionKeys.push(compositionKey);
      return;
    }

    // add new subscription
    const unsubscribe: () => void = client.subscribe(key, response => {
      callback(key, response);
    });
    this.subscriptions[key] = { unsubscribe, compositionKeys: [ compositionKey ] };
  },
  remove(key, compositionKey) {
    const subscription: Subscription = this.subscriptions[key];
    // check if a subscription exists for this key
    if (!subscription) {
      return;
    }

    // remove subscription
    subscription.compositionKeys = subscription.compositionKeys.filter(ck => ck !== compositionKey);
    if (!subscription.compositionKeys.length) {
      subscription.unsubscribe();
      delete this.subscriptions[key];
    }
  }
});

export { subscriptionStore };