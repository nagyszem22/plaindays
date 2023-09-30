<template>
  <v-container class="fill-height pa-0" fluid>
    <v-responsive class="align-center fill-height">
      <v-row class="fill-height">
        <v-col>
          <v-sheet height="100%">
            <vue-cal
              :selected-date="new Date()"
              :disable-views="['years', 'year']"
              :snap-to-time="5"
              events-on-month-view="short"
              @eventDragCreate="onEventCreate"
              @eventDurationChange="onEventChange"
              :editable-events="{ title: false, drag: false, resize: false, delete: false, create: true }"
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
import { store } from '@/store';
import { ref, onMounted, onUnmounted } from 'vue';

const databases = new Databases(client);

const events = ref([]);
let unsubscribe = null;

onMounted(async () => {
  // get account and load account to store
  console.log({ account: store.account })
  try {
    const data = await databases.listDocuments(adb['App'], adbc['Events']);
    events.value = data?.documents?.map((event) => {
      const { eid, start, end, ...rest } = event;
      return {
        ...rest,
        _eid: eid,
        start: new Date(start),
        end: new Date(end),
        content: undefined
      };
    });
    console.log({ data, events: events.value });
  } catch (error) {
    error.value = error;
  }

  // subscribe to event updates
  // subscribe to schedule function instead
  // const channel = `databases.${adb['App']}.collections.${adbc['Events']}.documents`;
  // unsubscribe = client.subscribe([channel], response => {
  //   console.log({ response });
  //   if (!response?.payload || !Array.isArray(response?.events)) {
  //     return;
  //   }
  //   if (response.events.includes(`${channel}.*.update`)) {
  //     events.value = events.value.map((event) => {
  //       if (event.$id === response.payload.$id) {
  //         const { $collectionId, $createdAt, $updatedAt, $databaseId, $permissions, start, end, ...rest } = response.payload;
  //         return {
  //           ...event,
  //           ...rest,
  //           start: new Date(start),
  //           end: new Date(end)
  //         };
  //       }
  //       return event;
  //     });
  //   }
  //   if (response.events.includes(`${channel}.*.delete`)) {
  //     events.value = events.value.filter((event) => event.$id !== response.payload.$id);
  //   }
  // });
});

onUnmounted(() => {
  if (unsubscribe) {
    unsubscribe();
  }
});

const onEventCreate = async (event) => {
  console.log('Event created:', event);
  // try {
  //   const { title, _eid, startTimeMinutes, endTimeMinutes, ...rest } = event;
  //   await databases.createDocument(adb['App'], adbc['Events'], ID.unique(), {
  //     userID: store.account.$id,
  //     ...Object.keys(rest).reduce((acc, key) => ({ ...acc, [key]: rest[key] || null }), {}),
  //     title: title || 'Untitled Event'
  //   });
  // } catch (error) {
  //   console.log(error);
  // }
};

const onEventChange = (event) => {
  console.log('Event changed:', event);
  return event;
};

</script>

<style>
.vuecal__event {
  background-color: #2980b9;
  border: 1px solid #185d8b;
  font-weight: bold;
  font-size: 14px;
  border-radius: 4px;
  padding: 10px;
  color: #fff;
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

