<template>
  <v-app-bar :elevation="1">
    <!-- Logo -->
    <v-app-bar-title class="text-primary">
      <v-icon icon="mdi-test-tube" class="mr-2" /><b>GPT</b>ground
    </v-app-bar-title>

    <!-- Spacer -->
    <v-spacer></v-spacer>

    <!-- Sign Out -->
    <v-menu>
      <template v-slot:activator="{ props }">
        <v-chip v-bind="props" variant="text" class="pt-4 pb-4 mr-5">
          <v-avatar color="secondary" class="mr-2">
            <span>{{ getFirstLetter(store?.account?.name) }}</span>
          </v-avatar>
          <span>{{ store?.account?.name }}</span>
        </v-chip>
      </template>
      <v-list>
        <v-list-item style="font-size: 14px" density="compact" prepend-icon="mdi-account">
          Account
        </v-list-item>
        <v-divider></v-divider>
        <v-list-item style="font-size: 14px" density="compact" prepend-icon="mdi-logout" @click="signOut">
          Sign Out
        </v-list-item>
      </v-list>
    </v-menu>

    <v-btn variant="flat" class="ml-0 mr-6" size="small" prepend-icon="mdi-plus" @click.stop="addTasksDrawer = !addTasksDrawer">Add Tasks</v-btn>

  </v-app-bar>

  <v-navigation-drawer
    v-model="addTasksDrawer"
    location="right"
    width="500"
    temporary
  >
    <upsert-multiple-tasks @close="addTasksDrawer = false" />
  </v-navigation-drawer>

  <div v-if="!store?.account?.emailVerification && false" style="position: fixed; top: 60px; z-index: 1000;" class="w-100">
    <v-alert color="secondary" :icon="false">
      <div class="d-md-flex justify-space-between align-center">
        <span class="mr-3">You have not verified your email yet. In order to use all the available features you will need to verify your email first.</span>
        <v-btn color="white" variant="text" @click="sendVerificationEmail">Resend Verification Email</v-btn>
      </div>
    </v-alert>
  </div>

  <!-- Notification -->
  <v-snackbar v-model="notification.show" :color="notification.variant" close-delay="2000">
    {{ notification.text }}
    <template v-slot:actions>
      <v-btn variant="text" @click="notification.show = false" color="white">Close</v-btn>
    </template>
  </v-snackbar>
</template>

<script setup>
  import { ref } from 'vue';
  import { useRouter } from 'vue-router'
  import { Account } from 'appwrite';
  import { Functions } from 'appwrite';
  import { af } from '@/config';
  import { client } from '@/config';
  import { store } from '@/store';
  import UpsertMultipleTasks from '@/components/tasks/UpsertMultipleTasks.vue';

  const notification = ref({ show: false, text: '', variant: 'success' });
  const addTasksDrawer = ref(false);
  const router = useRouter();

  const getFirstLetter = (name) => {
    if (!name) return '';
    return name.charAt(0).toUpperCase();
  }

  const sendVerificationEmail = async () => {
    const functions = new Functions(client);
    try {
      await functions.createExecution(af['Account:SendEmailVerification']);
    } catch (error) {
      console.log(error);
      notification.value = { show: true, text: error.message, variant: 'error' };
    }
  };

  const signOut = async () => {
    const account = new Account(client);
    try {
      await account.deleteSession('current');
      router.push({ name: 'LoginView' });
    } catch (error) {
      console.log(error);
      notification.value = { show: true, text: error.message, variant: 'error' };
    }
  }
</script>
