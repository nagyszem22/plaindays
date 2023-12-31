<template>
  <v-container class="fill-height">
    <v-responsive class="align-center fill-height">
      <v-row>
        <v-col cols="12" sm="8" offset-sm="2" md="4" offset-md="4">
          <v-card class="pa-6">
            <div class="logo mb-8" @click="() => $router.push({ name: 'HomeView' })">PlainDays</div>
            <v-spacer class="mt-3"></v-spacer>
            <v-text-field v-bind="name" label="Full Name" />
            <v-text-field v-bind="email" label="Email" />
            <v-text-field v-bind="password" label="Password" type="password" />
            <v-text-field v-bind="passwordConfirmation" label="Password Confirmation" type="password" />
            <v-divider class="mb-4" />
            <v-checkbox v-bind="terms" label="I agree with the Terms and Conditions and Privacy Policy" />
            <v-divider class="mb-4" />
            <v-btn class="mt-2" block @click="submit" :loading="loading">Sign Up</v-btn>
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
import { useRouter } from 'vue-router';
import { Account, ID } from 'appwrite';
import { client } from './../config';
import { useForm } from 'vee-validate';
import { store } from '@/store';
import * as yup from 'yup';

const notification = ref({ show: false, text: '', variant: 'success' });
const loading = ref(false);
const router = useRouter();

const { defineComponentBinds, handleSubmit } = useForm({
  validationSchema: yup.object({
    name: yup.string().required().label('Name'),
    email: yup.string().email().required().label('E-mail'),
    password: yup.string().min(8).required(),
    passwordConfirm: yup
      .string()
      .oneOf([yup.ref('password')], 'Passwords must match')
      .required()
      .label('Password confirmation'),
    terms: yup
      .boolean()
      .required()
      .oneOf([true], 'You must agree to terms and conditions'),
  }),
});

const fieldConfig = (state) => ({
  props: {
    'error-messages': state.errors,
  },
});

const name = defineComponentBinds('name', fieldConfig);
const email = defineComponentBinds('email', fieldConfig);
const password = defineComponentBinds('password', fieldConfig);
const passwordConfirmation = defineComponentBinds('passwordConfirm', fieldConfig);
const terms = defineComponentBinds('terms', fieldConfig);

const submit = handleSubmit( async ({ name, email, password }) => {
  const account = new Account(client);
  
  loading.value = true;
  try {
    await account.create(ID.unique(), email, password, name);
    await account.createEmailSession(email, password);
    store.account = await account.get();
    await account.updatePrefs({
      dayStart: 8,
      dayEnd: 22,
      workStart: 9,
      workEnd: 18,
      timeZone: Intl?.DateTimeFormat().resolvedOptions().timeZone || null,
    });
    router.push({ name: 'OnboardingView' });
  } catch (error) {
    notification.value = { show: true, text: error.message, variant: 'error' };
    console.error(error);
  }
  loading.value = false;
});
</script>

<style scoped>
  .logo {
    text-align: center;
    font-family: 'Pacifico', cursive;
    font-size: 38px;
    color: #F6416C;
    cursor: pointer;
  }
</style>
