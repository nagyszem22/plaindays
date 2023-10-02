// appwrite client
export const appwriteEndpoint: string = 'https://cloud.appwrite.io/v1';

// appwrite function ids
export const af: any = {
  ['schedule-tasks']: '650d7f4fa106f174d42f'
};

// appwrite database ids
export const adb: any = {
  ['App']: '64d2c0765d92b052b3e0'
}

// appwrite collection ids
export const adbc: any = {
  ['Events']: '6501cbe36f6bb2db7c6f'
}

const config = {
  appwriteEndpoint,
  af,
  adb,
  adbc
};

export default config;