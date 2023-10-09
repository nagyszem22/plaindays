import { Client } from 'appwrite';

// appwrite client
const client = new Client();
client
  .setEndpoint('https://cloud.appwrite.io/v1')
  .setProject('64c90b8c2c2dd9235383');

  // appwrite function ids
  const af = {
    ['schedule-tasks']: '650d7f4fa106f174d42f'
  };

  // appwrite database ids
  const adb = {
    ['App']: '64d2c0765d92b052b3e0'
  }

  // appwrite collection ids
  const adbc = {
    ['Events']: '6501cbe36f6bb2db7c6f',
    ['Folders']: '650300c5512bf91c6d2b'
  }

export {
  client,
  af,
  adb,
  adbc,
};