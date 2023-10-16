import { Client, Databases, Query } from 'node-appwrite';
import  { appwriteEndpoint, adb, adbc } from './config.js';

export type Task = {
  id?: string
  scheduleType: ScheduleType
}

export enum ScheduleType {
  WORK_HOURS,
  OUTSIDE_WORK_HOURS,
  WEEKEND,
  NONE
}

export default async ({ req, res, error }) => {
  try {
    const client = new Client();

    const databases = new Databases(client);

    client
      .setEndpoint(appwriteEndpoint)
      .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
      .setKey(process.env.APPWRITE_API_KEY);

    const collection = await databases.listDocuments(adb['App'], adbc['Events'], [
      Query.select(['$id', 'scheduleType', 'folder' ]),
    ]);

    const promises = [];
    (Array.isArray(collection?.documents) ? collection.documents : [])
      .forEach((document: any) => {
        promises.push(databases.updateDocument(adb['App'], adbc['Events'], document.$id, {
          scheduleType: document.scheduleType === 'BEFORE_WORK_HOURS' || document.scheduleType === 'AFTER_WORK_HOURS' ? 'OUTSIDE_WORK_HOURS' : document.scheduleType,
          folderID: document.folder ? document.folder.$id : null,
        }));
      });

    const results = await Promise.all(promises);

    res.json(results);

  } catch (e) {
    error(e);
  }
}