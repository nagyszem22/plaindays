<template>
  <v-container class="fill-height">
    <v-responsive class="align-center fill-height">
      <v-row>
        <v-col cols="12" sm="8" offset-sm="2" md="6" offset-md="3" lg="4" offset-lg="4">
          <v-card class="pa-6" elevation="3">
            <div class="logo mb-8" @click="() => $router.push({ name: 'HomeView' })">PlainDays</div>
            <v-spacer class="mt-3"></v-spacer>
            <v-text-field v-bind="email" label="Email" />
            <v-text-field v-bind="password" label="Password" type="password" />
            <v-divider class="mb-5"></v-divider>
            <v-btn block color="primary" @click="submit">Log In</v-btn>
          </v-card>
        </v-col>
      </v-row>
    </v-responsive>

    <!-- Notification -->
    <v-snackbar v-model="notification.show" :color="notification.variant" close-delay="2000">
      {{ notification.text }}
      <template v-slot:actions>
        <v-btn variant="text" color="white" @click="notification.show = false">Close</v-btn>
      </template>
    </v-snackbar>

    <v-overlay
      v-if="loading"
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
  </v-container>
</template>

<script setup>
  import { ref } from 'vue';
import { useRouter } from 'vue-router'
import { Account } from 'appwrite';
import { client } from './../config';
import { useForm } from 'vee-validate';
import { store } from '@/store';
import * as yup from 'yup';

const notification = ref({ show: false, text: '', variant: 'success' });
const loading = ref(false);
const router = useRouter();

const { defineComponentBinds, handleSubmit } = useForm({
  validationSchema: yup.object({
    email: yup.string().email().required().label('E-mail'),
    password: yup.string().min(8).required(),
  }),
});

const fieldConfig = (state) => ({
  props: {
    'error-messages': state.errors,
  },
});

const email = defineComponentBinds('email', fieldConfig);
const password = defineComponentBinds('password', fieldConfig);

const submit = handleSubmit( async ({ email, password }) => {
  const account = new Account(client);
  
  loading.value = true;
  try {
    await account.createEmailSession(email, password);
    store.account = await account.get();
    router.push({ name: 'DashboardView' });
  } catch (error) {
    notification.value = { show: true, text: error.message, variant: 'error' };
    console.error(error);
  }
  loading.value = false;
});
</script>

<style scoped>
  .logo {
    cursor: pointer;
    text-align: center;
    font-family: 'Pacifico', cursive;
    font-size: 38px;
    color: #F6416C;
  }
</style>
