<template>
  <v-container class="fill-height pa-0" fluid>
    <v-responsive class="align-center fill-height">
      <v-row class="fill-height">
        <v-col>
          <v-sheet height="100%">
            <vue-cal
              :selected-date="new Date()"
              :disable-views="['years', 'year', 'month']"
              :snap-to-time="5"
              events-on-month-view="short"
              :editable-events="{ title: false, drag: false, resize: false, delete: false, create: false }"
              :events="events"
            />
          </v-sheet>
        </v-col>
      </v-row>
    </v-responsive>
  </v-container>
</template>

<script setup>
import VueCal from 'vue-cal';
import 'vue-cal/dist/vuecal.css';
import { Databases } from 'appwrite';
import { client, adb, adbc } from '@/config';
import { ref, onMounted, watch } from 'vue';
import { store } from '@/store';

const databases = new Databases(client);

const events = ref([]);

watch(
  () => store.refreshTasks,
  async () => {
  console.log({ refreshTasks: store.refreshTasks });
  if (store.refreshTasks) {
    await getEvents();
  }
  store.refreshTasks = false;
});

onMounted(async () => {
  await getEvents();
});

const getEvents = async () => {
  try {
    const data = await databases.listDocuments(adb['App'], adbc['Events']);
    events.value = data?.documents?.map((event) => {
      const { start, end, ...rest } = event;
      return {
        ...rest,
        start: new Date(start),
        end: new Date(end),
        content: undefined
      };
    });
    console.log({ data, events: events.value });
  } catch (error) {
    error.value = error;
  }
};

</script>

<style>
.vuecal__event {
  background-color: #E5ECF7;
  border: 1px solid #286EC3;
  font-size: 14px;
  padding: 10px;
  color: #286EC3;
}
.vuecal__view-btn {
  font-size: 16px;
}
.vuecal__title-bar {
  font-size: 16px;
  padding: 12px 0px;
  background-color: #00B8A9;
  color: #fff;
}
</style>

