<template>
  <v-app-bar :elevation="1">
    <v-app-bar-title class="text-primary">
      <v-icon icon="mdi-test-tube" class="mr-2" /><b>GPT</b>ground
    </v-app-bar-title>
    <v-spacer></v-spacer>
    <v-btn v-if="$route.name === 'LoginView'" color="primary" @click="$router.push({ name: 'SignupView' })">Sign Up</v-btn>
    <v-btn v-if="$route.name === 'SignupView'" color="primary" @click="$router.push({ name: 'LoginView' })">Log In</v-btn>
  </v-app-bar>
</template>

<script setup>
  //
</script>
