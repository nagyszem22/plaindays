import { reactive } from 'vue';

export const subscriptionStore = reactive({
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
})