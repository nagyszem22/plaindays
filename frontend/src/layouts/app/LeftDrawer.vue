<template>
  <v-navigation-drawer permanent>
    <v-list class="pb-0 pt-0">
      <v-list-item
        class="pt-4 pb-4"
        title="Calendar"
        prepend-icon="mdi-calendar-month-outline"
        color="secondary"
        :to="{ name: 'DashboardView' }"
      ></v-list-item>
    </v-list>

    <v-divider></v-divider>

    <v-list class="pb-0 pt-0">
      <v-list-item
        class="pt-4 pb-4"
        title="Notes"
        prepend-icon="mdi-note-multiple-outline"
        color="secondary"
        :to="{ name: 'NotesView' }"
      ></v-list-item>
    </v-list>

    <template v-if="$route.name === 'NotesView'">
      <v-list :lines="false" density="compact" nav>
        <v-list-group value="Admin">
          <template v-slot:activator="{ props }">
            <v-list-item
              v-bind="props"
              title="Admin"
            ></v-list-item>
          </template>

          <v-list-item
            v-for="([title], i) in admins"
            :key="i"
            :title="title"
            :value="title"
          ></v-list-item>
        </v-list-group>
      </v-list>

      <v-list class="mt-0 pt-0" :lines="false" density="compact" nav>
        <v-list-group value="Admin">
          <template v-slot:activator="{ props }">
            <v-list-item
              v-bind="props"
              title="Another folder"
            ></v-list-item>
          </template>

          <v-list-item
            v-for="([title], i) in admins"
            :key="i"
            :title="title"
            :value="title"
          ></v-list-item>
        </v-list-group>
      </v-list>
    </template>

    <v-divider></v-divider>
  </v-navigation-drawer>
</template>

<script setup>
 const admins = [
    ['Management'],
    ['Settings'],
    ['+'],
  ];
</script>