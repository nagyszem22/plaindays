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

    const collection = await databases.listDocuments(adb['App'], adbc['Events']);

    log({ documents: collection.documents, length: collection.documents.length });

    const promises = [];
    (Array.isArray(collection?.documents) ? collection.documents : [])
      .forEach((document) => {
        promises.push(databases.updateDocument(adb['App'], adbc['Events'], document.$id, {
          scheduleType: document.scheduleType === 'BEFORE_WORK_HOURS' || document.scheduleType === 'AFTER_WORK_HOURS' ? 'OUTSIDE_WORK_HOURS' : document.scheduleType,
          folderID: document.folder ? document.folder.$id : null,
        }));
      });
    
    log({ promises });

    await Promise.all(promises);

  } catch (e) {
    error(e);
  }

  return res.empty();
}