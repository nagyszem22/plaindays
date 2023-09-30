import { Client } from 'appwrite';

// appwrite client
const client = new Client();
client
  .setEndpoint('https://cloud.appwrite.io/v1')
  .setProject('64c90b8c2c2dd9235383');

  // appwrite function ids
  const af = {
    ['Account:SendEmailVerification']: '64d16a736bb21ef0c675'
  };

  // appwrite database ids
  const adb = {
    ['App']: '64d2c0765d92b052b3e0'
  }

  // appwrite collection ids
  const adbc = {
    ['UserNotifications']: '64d2c08665fe3c0a585d',
    ['Events']: '6501cbe36f6bb2db7c6f'
  }

export {
  client,
  af,
  adb,
  adbc,
};