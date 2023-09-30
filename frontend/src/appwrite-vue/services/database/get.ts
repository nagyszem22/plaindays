import { Ref, ref, watchEffect, toValue, onUnmounted } from 'vue';
import { v4 as uuidv4 } from 'uuid';
import { Client, RealtimeResponseEvent, ID } from 'appwrite';
import { AppwriteVueException } from '../../shared/errors';
import { subscriptionStore } from '../../store/subscription';
import { documentStore } from '../../store/document';

// Things to test:
// - navigate to another page and back
// - navigate to another page and back, but with a different active document
// - using the same composition key in two different components
// - using the same composition key in two different components, but with different active documents
// - using the same composition key in two different components that unmount at the same time
// - using the same composition key in two different components that unmount at different times
// - build health functions of different stores
// - write unit tests to cover these scenarios

type AppwriteVueDatabaseGetOptions = {
  client: Client,
  database: string,
  collection: string,
  id: Ref<string>,
}

type AppwriteVueDatabaseGetOutput = {
  data: Ref<any>,
  error: Ref<AppwriteVueException>
}

function handleSubscription(response: RealtimeResponseEvent<any>, key: string, client: Client): void {
  if (!response?.payload || !Array.isArray(response?.events)) {
    return;
  }
  if (response.events.includes(`${key}.update`)) {
    documentStore.update(key, client, response.payload);
  }
  if (response.events.includes(`${key}.delete`)) {
    documentStore.delete(key, client);
  }
}

function useGetDocument(options: AppwriteVueDatabaseGetOptions): AppwriteVueDatabaseGetOutput {
  const { client, database, collection, id } = options;
  const data: Ref<any> = ref(null);
  const error: Ref<AppwriteVueException> = ref(null);
  const compositionKey: string = uuidv4();

  const subscriptionKeys: string[] = [];

  watchEffect(async (): Promise<any> => {
    data.value = null;
    error.value = null;
    const documentID: string = toValue(id);
    const key: string = `databases.${database}.collections.${collection}.documents.${documentID}`;
    try {
      subscriptionStore.add(key, client, compositionKey, (key, response) => {
        handleSubscription(response, key, client);
      });
      subscriptionKeys.push(key);
      data.value = await documentStore.get(key, client, { database, collection, id: documentID });
    } catch (error: any) {
      data.value = null;
      error.value = error;
    }
  });

  onUnmounted(() => {
    subscriptionKeys.forEach(key => subscriptionStore.remove(key, compositionKey));
    const activeKeys: string[] = subscriptionStore.getKeys();

    // remove every document that no longer have any active subscriptions
    const keysToRemove: string[] = subscriptionKeys.filter(sk => !activeKeys.find(ak => !sk.includes(ak)));
    keysToRemove.forEach(key => documentStore.remove(key));
  });

  return { data, error }
}

export { useGetDocument }

