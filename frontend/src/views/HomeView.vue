<template>
  <v-container class="fill-height">
    <v-responsive class="align-center fill-height">
      <v-row>
        <v-col cols="12" md="8" offset-md="2">
          <div class="logo mb-8">PlainDays</div>
          <p class="subtitle pb-4">Less complexity more control - Simple and fully automated task scheduling for a stress-free life.</p>
          <p class="punchline">Manage all your tasks in one place and never miss a deadline anymore.</p>
          <div class="text-center mt-9">
            <v-btn class="mr-6" color="primary" variant="outlined" size="large"  @click="() => $router.push({ name: 'LoginView' })">🧑 Sign In</v-btn>
            <v-btn color="primary" variant="flat" size="large"  @click="() => $router.push({ name: 'SignupView' })">👋 Sign Up</v-btn>
          </div>
        </v-col>
      </v-row>
    </v-responsive>
  </v-container>
</template>

<style scoped>
  .logo {
    font-family: 'Pacifico', cursive;
    font-size: 56px;
    color: #F6416C;
  }
  .subtitle {
    font-size: 24px;
    font-style: italic;
    color: #444;
  }
  .punchline {
    font-size: 20px;
    font-weight: bold;
    color: #444;
  }
</style>
