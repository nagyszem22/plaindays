<template>
  <v-container class="fill-height pa-0" fluid>
    <v-responsive class="align-center fill-height">
      <v-row class="fill-height">
        <v-col>
          <v-sheet height="100%">
            <vue-cal
              :selected-date="new Date()"
              :disable-views="['years', 'year', 'month']"
              :special-hours="specialHours"
              :time-from="timeFrom"
              :timeCellHeight="50"
              :time-to="timeTo"
              :snap-to-time="5"
              :watchRealTime="true"
              :editable-events="{ title: false, drag: false, resize: false, delete: false, create: false }"
              :events="events"
              :onEventClick="selectEvent"
            />
          </v-sheet>
        </v-col>
      </v-row>

      <v-dialog
        v-model="editEventDialog"
        width="auto"
      >
        <v-card class="pa-3">
          <task-editor-card
            :value="selectedEvent" 
            @update:value="(value) => editedEvent = value"
            :canDelete="false"
          />
          <div class="pt-3 d-flex justify-space-between">
            <v-btn size="small" variant="outlined" color="success" prepend-icon="mdi-check" @click="markAsDone">Mark as Done</v-btn>
            <confetti-explosion v-if="confetti" />
            <v-btn size="small" variant="flat" color="primary" @click="updateEvent">Update</v-btn>
          </div>
        </v-card>
      </v-dialog>
    </v-responsive>

    <!-- Notification -->
    <v-snackbar v-model="notification.show" :color="notification.variant" close-delay="2000">
      {{ notification.text }}
      <template v-slot:actions>
        <v-btn variant="text" color="white" @click="notification.show = false">Close</v-btn>
      </template>
    </v-snackbar>

    <!-- Loader -->
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
import VueCal from 'vue-cal';
import 'vue-cal/dist/vuecal.css';
import { Databases, Account, Functions, Query } from 'appwrite';
import { client, adb, adbc, af } from '@/config';
import { ref, onMounted, watch, nextTick } from 'vue';
import { store } from '@/store';
import TaskEditorCard from '@/components/tasks/TaskEditorCard.vue';
import ConfettiExplosion from 'vue-confetti-explosion';

const databases = new Databases(client);
const functions = new Functions(client);

const notification = ref({ show: false, text: '', variant: 'success' });
const loading = ref(false);

const events = ref([]);
const timeFrom = ref(0);
const timeTo = ref(24 * 60);
const specialHours = ref({
  1: { from: 9 * 60, to: 19 * 60, class: 'work-hours' },
  2: { from: 9 * 60, to: 19 * 60, class: 'work-hours' },
  3: { from: 9 * 60, to: 19 * 60, class: 'work-hours' },
  4: { from: 9 * 60, to: 19 * 60, class: 'work-hours' },
  5: { from: 9 * 60, to: 19 * 60, class: 'work-hours' }
});
const editEventDialog = ref(false);
const selectedEvent = ref(null);
const editedEvent = ref(null);
const confetti = ref(false);

watch(
  () => store.refreshTasks,
  async () => {
  if (store.refreshTasks) {
    await getEvents();
  }
  store.refreshTasks = false;
});

onMounted(async () => {
  const account = new Account(client);
  const preferences = await account.getPrefs();
  const { dayStart, dayEnd, workStart, workEnd } = preferences || {};
  timeFrom.value = (dayStart * 60) - 60 > 0 ? (dayStart * 60) - 60 : 0;
  timeTo.value = (dayEnd * 60) + 60 > 24 * 60 ? (dayEnd * 60) + 60 : 24 * 60;
  if (workStart && workEnd) {
    specialHours.value = {
      1: { from: workStart * 60, to: workEnd * 60, class: 'work-hours' },
      2: { from: workStart * 60, to: workEnd * 60, class: 'work-hours' },
      3: { from: workStart * 60, to: workEnd * 60, class: 'work-hours' },
      4: { from: workStart * 60, to: workEnd * 60, class: 'work-hours' },
      5: { from: workStart * 60, to: workEnd * 60, class: 'work-hours' }
    };
  }

  await getEvents();
});

const selectEvent = (event) => {
  selectedEvent.value = events.value.find(({ $id }) => $id === event.$id);
  editEventDialog.value = true;
};

const updateEvent = async () => {
  try {
    loading.value = true;
    const { $id } = selectedEvent.value;
    const { ...data } = editedEvent.value;
    console.log({ $id, data });
    await databases.updateDocument(adb['App'], adbc['Events'], $id, data);
    await functions.createExecution(af['schedule-tasks']);
    selectedEvent.value = null;
    editEventDialog.value = false;
    store.refreshTasks = true;
  } catch (error) {
    notification.value = { show: true, text: error.message, variant: 'error' };
  }
  loading.value = false;
};

const markAsDone = async () => {
    confetti.value = false;
    await nextTick();
    confetti.value = true;
    setTimeout(async () => {
      try {
        loading.value = true;
        const { $id } = selectedEvent.value;
        await databases.updateDocument(adb['App'], adbc['Events'], $id, { isDone: true });
        await functions.createExecution(af['schedule-tasks']);
        selectedEvent.value = null;
        editEventDialog.value = false;
        store.refreshTasks = true;
        loading.value = false;
        confetti.value = false;
      } catch (error) {
        notification.value = { show: true, text: error.message, variant: 'error' };
        loading.value = false;
        confetti.value = false;
      }
    }, 1000);
};

const getEvents = async () => {
  try {
    const data = await databases.listDocuments(adb['App'], adbc['Events'], [
      Query.equal('isDone', [ false ]),
    ]);
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
.work-hours {
  background-color: #f3fbf892;
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

