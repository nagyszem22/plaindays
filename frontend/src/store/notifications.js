import { reactive } from 'vue';
import { Databases, Query } from 'appwrite';
import { client, adb, adbc } from '@/config';
import cache from '@/cache';

export const notificationsStore = reactive({
  notifications: null,
  page: 1,
  limit: 2,
  query: null,
  total: 0,
  totalUnseen: 0,
  error: null,
  fields: [
    '$id',
    '$createdAt',
    '$updatedAt',
    'title',
    'eventName',
    'description',
    'refetchObjects',
    'refetchIDs',
    'redirectURL',
    'relatedObjects',
    'relatedIDs',
    'seenAt',
    'createdAt',
    'userID',
    'userIDs'
  ],
  async init() {
    const { page, limit } = this;
    const databases = new Databases(client);
    const cacheKey = `notifications::page=${page}::limit=${limit}`;
    
    // init visible notification list and total number of notifications
    const cachedNotifications = cache.get(cacheKey);
    if (cachedNotifications) {
      this.notifications = cachedNotifications;
    } else {
      try {
        const response = await databases.listDocuments(adb['App'], adbc['UserNotifications'], [
          Query.limit(limit),
          Query.offset((page - 1) * this.limit)
        ]);
        const { documents, total } = response;
        const mapped = documents.map(el => this.mapResponse(el));
        cache.set(cacheKey, mapped);
        cache.set('notifications_total', total);
        this.notifications = mapped;
        this.total = total;
      } catch (error) {
        this.error = error;
      }
    }

    // init unseen notification count
    const cachedUnseenTotal = cache.get('notifications_total');
    if (cachedUnseenTotal) {
      this.totalUnseen = cachedUnseenTotal;
    } else {
      try {
        const response = await databases.listDocuments(adb['App'], adbc['UserNotifications'], [
          Query.isNull('seenAt'),
          Query.limit(0),
          Query.offset(0)
        ]);
        const { total } = response;
        cache.set('notifications_total_unseen', total);
        this.totalUnseen = total;
      } catch (error) {
        this.error = error;
      }
    }
  },
  create(payload) {
    console.log('notificationsStore.create', payload);
    // const mapped = this.mapResponse(payload)
    // cache.set('account', mapped);
    // this.account = mapped;
  },
  update(payload) {
    console.log('notificationsStore.update', payload);
    const mapped = this.mapResponse(payload)
    cache.forEach((value, key) => {
      if(key.includes('notifications') && Array.isArray(value) && value.map(el => el.$id).includes(mapped.$id)) {
        const newValue = value.map(el => {
          if(el.$id === mapped.$id) {
            el = mapped;
          }
        });
        cache.set(key, newValue);
      }
    });
    
    // this.account = mapped;
  },
  mapResponse(response) {
    return this.fields.reduce((r, key) => {
      r[key] = response[key];
      return r;
    }, {});
  }
})