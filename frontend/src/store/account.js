import { reactive } from 'vue';
import { Account } from 'appwrite';
import { client } from '@/config';
import cache from '@/cache';

export const accountStore = reactive({
  account: null,
  fields: [
    '$id',
    '$createdAt',
    '$updatedAt',
    'name',
    'email',
    'emailVerification',
    'passwordUpdate',
    'phone',
    'phoneVerification',
    'registration',
    'status'
  ],
  init() {
    const cached = cache.get('account');
    if (cached) {
      this.account = cached;
    } else {
      const account = new Account(client);
      account.get().then(response => {
        const mapped = this.mapResponse(response);
        cache.set('account', mapped);
        this.account = mapped;
      }, error => {
        console.log(error);
      });
    }
  },
  update(payload) {
    const mapped = this.mapResponse(payload)
    cache.set('account', mapped);
    this.account = mapped;
  },
  mapResponse(response) {
    return this.fields.reduce((r, key) => {
      r[key] = response[key];
      return r;
    }, {});
  }
})