const sdk = require('node-appwrite');
const config = require('./config.js');

export default async ({ req, res, error }) => {
  try {
    const { appwriteEndpoint, adb, adbc } = config;
    const client = new sdk.Client();

    const databases = new sdk.Databases(client);

    client
      .setEndpoint(appwriteEndpoint)
      .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
      .setKey(process.env.APPWRITE_API_KEY);

    const collection = await databases.listDocuments(adb['App'], adbc['Events'], [
      Query.select(['$id', 'scheduleType', 'folder' ]),
    ]);

    const promises = [];
    (Array.isArray(collection?.documents) ? collection.documents : [])
      .forEach((document) => {
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