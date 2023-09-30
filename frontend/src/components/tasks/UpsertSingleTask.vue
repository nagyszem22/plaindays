<template>
  <v-card>
    <v-toolbar color="primary" dark>
      <v-btn icon dark @click="$emit('close')">
        <v-icon color="white" icon="mdi-close" />
      </v-btn>
      <v-toolbar-title>Create a Task</v-toolbar-title>
      <v-spacer />
      <v-toolbar-items>
        <v-btn variant="text" @click="saveTask()">
          Save
        </v-btn>
      </v-toolbar-items>
    </v-toolbar>
    <v-row class="pa-6">
      <v-col cols="12" md="8">
        <!-- TITLE -->
        <v-text-field label="Title" v-model="title" />

        <!-- DESCRIPTION -->
        <v-card
          title="Description"
          :border="true"
          :elevation="0"
        >
          <tip-tap-editor />
        </v-card>
      </v-col>
      <v-col cols="12" md="4">

        <!-- PRIORITY -->
        <v-select
          label="Priority"
          v-model="priority"
          :items="priorityOptions"
        ></v-select>

        <!-- SCHEDULE_TYPE -->
        <v-select
          label="Schedule"
          v-model="scheduleType"
          :items="scheduleOptions"
        ></v-select>

        <!-- DURATION -->
        <v-row>
          <v-col cols="6">
            <v-select
              label="Estimated hours"
              v-model="estimatedHours"
              :items="[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]"
              suffix="hours"
            ></v-select>
          </v-col>

          <v-col cols="6">
            <v-select
              label="Estimated minutes"
              v-model="estimatedMinutes"
              :items="[5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]"
              suffix="minutes"
            ></v-select>
          </v-col>
        </v-row>

        <!-- CAN SPLIT -->
        <v-select
          label="Split"
          v-model="canSplit"
          :items="splitOptions"
        ></v-select>

        <!-- DEADLINE & URGENCY -->
        <v-select
          label="Deadline"
          v-model="urgency"
          :items="urgencyOptions"
        ></v-select>

        <!-- DEADLINE IF CUSTOM -->
        <v-date-picker
          class="mb-8"
          :landscape="true"
          style="border: 1px solid rgba(0, 0, 0, 0.3); width: 100%;"
          :elevation="0"
          position="static"
          v-model="customDate"
          width="100%"
          :hide-actions="true"
          v-if="urgency === 'CUSTOM' || urgency === 'FIXED'"
        />

        <!-- DEADLINE IF FIXED -->
        <v-row v-if="urgency === 'CUSTOM' || urgency === 'FIXED'">
          <v-col cols="6">
            <v-select
              label="Hour"
              v-model="fixedHour"
              :items="[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23]"
              suffix="hour"
            ></v-select>
          </v-col>

          <v-col cols="6">
            <v-select
              label="Minute"
              v-model="fixedMinute"
              :items="[5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]"
              suffix="minute"
            ></v-select>
          </v-col>
        </v-row>
      </v-col>
    </v-row>

    <!-- Notification -->
    <v-snackbar v-model="notification.show" :color="notification.variant" close-delay="2000">
      {{ notification.text }}
      <template v-slot:actions>
        <v-btn variant="text" color="white" @click="notification.show = false">Close</v-btn>
      </template>
    </v-snackbar>
  </v-card>
</template>

<script setup>
import { ref, defineEmits } from 'vue';
import TipTapEditor from '@/components/misc/TipTapEditor.vue';
import { client, adb, adbc } from '@/config';
import { Databases, Functions, ID } from 'appwrite';
import { store } from '@/store';

const emit = defineEmits([ 'close' ])

const notification = ref({ show: false, text: '', variant: 'success' });
const title = ref('');
const estimatedHours = ref(0);
const estimatedMinutes = ref(30);
const urgency = ref('TODAY');
const scheduleType = ref('WORK_HOURS');
const canSplit = ref(true);
const priority = ref(2);
const startOfDay = new Date();
startOfDay.setHours(0, 0, 0, 0);
const customDate = ref(startOfDay);
const fixedHour = ref(17);
const fixedMinute = ref(0);

const urgencyOptions = [
  {
    title: 'At some point today',
    value: 'TODAY'
  },
  {
    title: 'At some point tomorrow',
    value: 'TOMORROW'
  },
  {
    title: 'At some point this week',
    value: 'THIS_WEEK'
  },
  {
    title: 'At some point next week',
    value: 'NEXT_WEEK'
  },
  {
    title: 'At some point this month',
    value: 'THIS_MONTH'
  },
  {
    title: 'No deadline',
    value: 'NONE'
  },
  {
    title: 'Fixed time',
    value: 'FIXED'
  },
  {
    title: 'Custom time',
    value: 'CUSTOM'
  }
];

const priorityOptions = [
  {
    title: 'High',
    value: 3
  },
  {
    title: 'Medium',
    value: 2
  },
  {
    title: 'Low',
    value: 1
  }
];

const splitOptions = [
  {
    title: 'It can be split to chunks (min 30 mins/chunk)',
    value: true
  },
  {
    title: 'It can not be split to chunks',
    value: false
  }
];

const scheduleOptions = [
  {
    title: 'Do it during work',
    value: 'WORK_HOURS'
  },
  {
    title: 'Do it after work',
    value: 'AFTER_WORK_HOURS'
  },
  {
    title: 'Do it before work',
    value: 'BEFORE_WORK_HOURS'
  },
  {
    title: 'Do it at any time',
    value: 'NONE'
  }
];

const saveTask = async () => {
  const databases = new Databases(client);
  const functions = new Functions(client);

  try {
    const data = {
      title: title.value,
      content: 'Test',
      priority: priority.value,
      duration: (estimatedHours.value * 60 + estimatedMinutes.value) * 60 * 1000,
      deadline: (() => {
        if (urgency.value === 'NONE') {
          return new Date(new Date().setFullYear(new Date().getFullYear() + 1));
        }
        if (urgency.value === 'FIXED' || urgency.value === 'CUSTOM') {
          const date = new Date(customDate.value.getTime());
          date.setHours(fixedHour.value, fixedMinute.value, 0, 0);
          return date;
        }
        if (urgency.value === 'TODAY') {
          return new Date(new Date().setHours(23, 59, 59, 999));
        }
        if (urgency.value === 'TOMORROW') {
          const date = new Date(new Date().setDate(new Date().getDate() + 1));
          date.setHours(23, 59, 59, 999);
          return date;
        }
        if (urgency.value === 'THIS_WEEK') {
          const date = new Date(new Date().setDate(new Date().getDate() + (7 - new Date().getDay())));
          date.setHours(23, 59, 59, 999);
          return date;
        }
        if (urgency.value === 'NEXT_WEEK') {
          const date = new Date(new Date().setDate(new Date().getDate() + (7 - new Date().getDay()) + 7));
          date.setHours(23, 59, 59, 999);
          return date;
        }
        if (urgency.value === 'THIS_MONTH') {
          const date = new Date(new Date().setDate(new Date().getDate() + (30 - new Date().getDate())));
          date.setHours(23, 59, 59, 999);
          return date;
        }
      })(),
      scheduleType: scheduleType.value,
      urgency: urgency.value,
      canSplit: canSplit.value,
      userID: store.account.$id,
    };
    await databases.createDocument(adb['App'], adbc['Events'], ID.unique(), data);
    const response = await functions.createExecution('650d7f4fa106f174d42f');
    console.log({ response });

    notification.value = { show: true, text: 'Task saved', variant: 'success' };
    setTimeout(() => {
      emit('close');
    }, 1000);
  } catch (error) {
    console.log({ error });
    notification.value = { show: true, text: 'Error saving task', variant: 'error' };
  }
};
</script>