<template>
  <v-app-bar :elevation="1">
    <!-- Logo -->
    <div class="text-primary logo" @click="$router.push({ name: 'DashboardView' })">PlainDays</div>

    <v-btn
      class="ml-3"
      size="small"
      prepend-icon="mdi-checkbox-marked-circle-outline"
      :active="$route.name === 'TasksView'"
      @click="$router.push({ name: 'TasksView' })"
    >Tasks</v-btn>
    <v-btn
      class="ml-3"
      size="small"
      prepend-icon="mdi-calendar-blank-outline"
      :active="$route.name === 'DashboardView'"
      @click="$router.push({ name: 'DashboardView' })"
    >Calendar</v-btn>

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
        <v-list-item style="font-size: 14px" density="compact" prepend-icon="mdi-account" @click="$router.push({ name: 'OnboardingView' })">
          Account
        </v-list-item>
        <v-divider></v-divider>
        <v-list-item style="font-size: 14px" density="compact" prepend-icon="mdi-logout" @click="signOut">
          Sign Out
        </v-list-item>
      </v-list>
    </v-menu>

    <v-btn variant="outlined" class="ml-0 mr-6" size="small" @click="refresh()"><v-icon icon="mdi-refresh"></v-icon> Schedule</v-btn>

  </v-app-bar>

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

  <!-- Full page loader -->
  <v-overlay
    :model-value="loading"
    class="align-center justify-center"
    :persistent="true"
  >
    <v-progress-circular
      color="primary"
      indeterminate
      size="64"
    ></v-progress-circular>
  </v-overlay>
</template>

<script setup>
  import { ref } from 'vue';
  import { useRouter } from 'vue-router'
  import { Account } from 'appwrite';
  import { Functions } from 'appwrite';
  import { af } from '@/config';
  import { client } from '@/config';
  import { store } from '@/store';

  const notification = ref({ show: false, text: '', variant: 'success' });
  const loading = ref(false);
  const router = useRouter();

  const refresh = async () => {
    try {
      loading.value = true;
      const functions = new Functions(client);
      await functions.createExecution(af['schedule-tasks']);
      store.refreshTasks = true;
    } catch (error) {
      console.log({ error });
      notification.value = { show: true, text: 'Error saving task', variant: 'error' };
    }
    loading.value = false;
  }

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
      store.account = null;
      router.push({ name: 'HomeView' });
    } catch (error) {
      console.log(error);
      notification.value = { show: true, text: error.message, variant: 'error' };
    }
  }
</script>

<style scoped>
  .logo {
    text-align: center;
    font-family: 'Pacifico', cursive;
    font-size: 22px;
    color: #F6416C;
    cursor: pointer;
    width: 150px;
    border-right: 1px solid #f7f8fe;
  }
</style>
