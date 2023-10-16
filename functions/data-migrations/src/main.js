import { Client, Databases, Query } from 'node-appwrite';
import  { appwriteEndpoint, adb, adbc } from './config.js';

export default async ({ req, res, error, log }) => {
  try {
    const client = new Client();

    const databases = new Databases(client);

    client
      .setEndpoint(appwriteEndpoint)
      .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
      .setKey(process.env.APPWRITE_API_KEY);

    log(process.env.APPWRITE_FUNCTION_PROJECT_ID);
    log(process.env.APPWRITE_API_KEY);
    log(appwriteEndpoint);
    log(adb['App']);
    log(adbc['Events']);

    const collection = await databases.listDocuments(adb['App'], adbc['Events'], [Query.limit(150)]);

    log({ length: collection.documents.length });

    for (let i = 0; i < collection.documents.length; i += 1) {
      const data = {
        scheduleType: collection.documents[i].scheduleType === 'BEFORE_WORK_HOURS' || collection.documents[i].scheduleType === 'AFTER_WORK_HOURS' ? 'OUTSIDE_WORK_HOURS' : collection.documents[i].scheduleType,
        folderID: collection.documents[i].folder ? collection.documents[i].folder.$id : null,
      };
      log(i);
      log(data);
      log(collection.documents[i].$id);
      log('--- --- ---')
      await databases.updateDocument(adb['App'], adbc['Events'], collection.documents[i].$id, data);
    }
  } catch (e) {
    error(e);
  }

  return res.empty();
}