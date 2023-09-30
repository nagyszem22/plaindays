import { reactive } from 'vue';
import { Client, Databases } from 'appwrite';

interface DocumentStore {
  documents: DocumentList
  get: (key: string, client: Client, options: GetDocumentOptions) => Promise<any>
  // add: (key: string, client: Client) => void
  update: (key: string, client: Client, payload: Document) => void
  delete(key: string, client: Client): void
  remove(key: string): void
}

type DocumentList = {
  [key: string]: Document
}
type Document = {
  $id: string
  [key: string]: any
}
type GetDocumentOptions = {
  database: string
  collection: string
  id: string
}

const documentStore: DocumentStore = reactive({
  documents: {},
  async get(key, client, options) {
    if (!this.documents[key]) {
      const databases = new Databases(client);
      const { database, collection, id } = options;
      const response = await databases.getDocument(database, collection, id);
      this.documents[key] = response;
      return this.documents[key];
    }
    return await new Promise(resolve => {
      resolve(this.documents[key]);
    });
  },
  update(key, client, payload) {
    console.log('UPDATE', { client, key, payload });
    if (this.documents[key] && payload?.$id) {
      this.documents[key] = payload;
    }
  },
  delete(key, client) {
    console.log('DELETE', { client, key });
  },
  remove(key) {
    if (this.documents[key]) {
      delete this.documents[key];
    }
  }
});

export { documentStore };