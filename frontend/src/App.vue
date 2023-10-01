<template>
  <v-overlay
    v-if="isLoading"
    :model-value="isLoading"
    class="align-center justify-center"
    :persistent="true"
  >
    <v-progress-circular
      color="primary"
      indeterminate
      size="64"
    ></v-progress-circular>
  </v-overlay>
  <router-view v-else />
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { Account } from 'appwrite';
import { client } from '@/config';
import { store } from '@/store';

// NEXT STEPS:
// 1. ✅ Update app bar and add user name with drop down menu for sign out and profile
// 2. Add notifications to the top right of the app bar
//  - Manage notifications (e.g. - seen at date, pagination etc.) - use the new store system
// 3. ✅ Add a banner that user is not verified yet (with resend verification code) - remove it once they are
// 4. Build proper sign out logic with clearing cache and store and remove subscriptions
// 5. Add block user logic, if user is blocked, redirect them to a blocked page (sending the the router down to the composition API)
// 6. Add remove user logic, if user is removed log them out using the logic mentioned above (proper sign out logic)
// 7. Add login logic
// 8. Add email verification logic
// 9. Add password reset logic
// 10. Add profile page with update logic (take care of reactivity)
// 10. Test the whole flow with Cypress (try to avoid testing manually as much as possible)

const isLoading = ref(true);

onMounted(async () => {
  // get account and load account to store
  try {
    const account = new Account(client);
    store.account = await account.get();
  } catch (error) {
    console.log(error);
  }

  // stop loading page
  isLoading.value = false;
});
</script>
