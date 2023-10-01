<template>
  <v-container class="fill-height">
    <v-responsive class="align-center fill-height">
      <v-row>
        <v-col cols="12" sm="8" offset-sm="2" md="6" offset-md="3" lg="4" offset-lg="4">
          <v-card class="pa-6" elevation="3">
            <div class="logo mb-8" @click="() => $router.push({ name: 'HomeView' })">PlainDays</div>
            <v-spacer class="mt-3"></v-spacer>
            <v-text-field label="Email" variant="outlined"></v-text-field>
            <v-text-field label="Password" variant="outlined"></v-text-field>
            <v-divider class="mb-5"></v-divider>
            <v-btn block color="primary">Log In</v-btn>
          </v-card>
        </v-col>
      </v-row>
    </v-responsive>
  </v-container>
</template>

<script setup>
  import { Account } from 'appwrite';
  import { client } from '@/config';
  import { onMounted } from 'vue';

  onMounted(async () => {
    const account = new Account(client);
    try {
      // const response = await account.create(ID.unique(), 'takacsmarton22+bla', 'password123');
      // console.log(response);
      const user = await account.get();
      console.log(user);
      // const session = await account.createEmailSession('martontg94@gmail.com', 'password123');
      // console.log(session);
    } catch (error) {
      console.log(error);
      console.log(error.message);
    }
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
