<template>
  <v-container class="fill-height pa-0" fluid>
    <v-sheet class="d-flex flex-wrap fill-height w-100">
      <v-sheet class="flex-1-1-100 ma-2 pa-2">
        <v-stepper
          class="fill-height fill-width"
          :items="['Profile Preferences', 'How does PlainDays work?', 'Have Fun!']"
          v-model="step"
          alt-lables
          :hide-actions="step === 3"
        >
          <template v-slot:[`item.1`]>
            <v-row style="border-bottom: 1px solid #e9edfc;">
              <v-col cols="12">
                <v-card title="Tell us a little more about your days" flat>
                  <v-row class="pa-4">
                    <v-col cols="12" md="6">
                      <v-row>
                        <v-col cols="12">What time do you start your day?</v-col>
                        <v-col cols="6">
                          <v-select
                            :items="[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23]"
                            label="Hours"
                            density="compact"
                            v-model="form.dayStartHours"
                          />
                        </v-col>
                        <v-col cols="6">
                          <v-select
                            :items="[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]"
                            label="Minutes"
                            density="compact"
                            v-model="form.dayStartMinutes"
                          />
                        </v-col>
                      </v-row>
                      <v-row>
                        <v-col cols="12">What time do you start working?</v-col>
                        <v-col cols="6">
                          <v-select
                            :items="[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23]"
                            label="Hours"
                            density="compact"
                            v-model="form.workStartHours"
                          />
                        </v-col>
                        <v-col cols="6">
                          <v-select
                            :items="[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]"
                            label="Minutes"
                            density="compact"
                            v-model="form.workStartMinutes"
                          />
                        </v-col>
                      </v-row>
                      <v-row>
                        <v-col cols="12">What is your time zone?</v-col>
                        <v-col cols="12">
                          <v-autocomplete
                            :items="timeZones"
                            label="Time Zone"
                            variant="outlined"
                            density="compact"
                            v-model="form.timeZone"
                          />
                        </v-col>
                      </v-row>
                    </v-col>
                    <v-col cols="12" md="6">
                      <v-row>
                        <v-col cols="12">What time do you finish your day?</v-col>
                        <v-col cols="6">
                          <v-select
                            :items="[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23]"
                            label="Hours"
                            density="compact"
                            v-model="form.dayEndHours"
                          />
                        </v-col>
                        <v-col cols="6">
                          <v-select
                            :items="[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]"
                            label="Minutes"
                            density="compact"
                            v-model="form.dayEndMinutes"
                          />
                        </v-col>
                      </v-row>
                      <v-row>
                        <v-col cols="12">What time do you finish working?</v-col>
                        <v-col cols="6">
                          <v-select
                            :items="[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23]"
                            label="Hours"
                            density="compact"
                            v-model="form.workEndHours"
                          />
                        </v-col>
                        <v-col cols="6">
                          <v-select
                            :items="[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]"
                            label="Minutes"
                            density="compact"
                            v-model="form.workEndMinutes"
                          />
                        </v-col>
                      </v-row>
                    </v-col>
                  </v-row>
                </v-card>
              </v-col>
            </v-row>
          </template>

          <template v-slot:[`item.2`]>
            <v-card flat>
              <v-row class="pa-4">
                <v-col class="pa-2" cols="12" md="7">
                  <h2 class="pb-6">👋 Welcome to PlainDays!</h2>
                  <p class="pb-3">This app is a simple automated task scheduling tool for busy individuals.</p>
                  <p class="pb-3">The main goal of this platform to reduce the time you spend on figuring out what you need to do.</p>
                  <p>Please note that there are many new features that are planned to be released soon e.g.:</p>
                  <ul class="pa-3">
                    <li>Support for events (e.g.: meeting)</li>
                    <li>Support for work days and rest days (e.g.: weekends)</li>
                    <li>Support for projects and project related tasks</li>
                    <li>And many more...</li>
                  </ul>
                  <p>If you have any questions or have found a bug do not hesitate to raise an issue in the official git
                    repository <a href="https://github.com/nagyszem22/plaindays">https://github.com/nagyszem22/plaindays</a></p>
                </v-col>
                <v-col class="pa-2" cols="12" md="5">
                  <v-img style="border: 8px solid #e9edfc; border-radius: 5px;" :src="plainDaysEditorImageURL" />
                  <ol class="pa-4">
                    <li style="border-bottom: 1px solid #e9edfc" class="pt-2 pb-2">Name your task</li>
                    <li style="border-bottom: 1px solid #e9edfc" class="pt-2 pb-2">Select a deadline (Today / Tomorrow / Next week etc.)</li>
                    <li style="border-bottom: 1px solid #e9edfc" class="pt-2 pb-2">Select the priority of your task</li>
                    <li style="border-bottom: 1px solid #e9edfc" class="pt-2 pb-2">Select the estimated time it will take to finish your task</li>
                    <li class="pt-2"><b>Let PlainDays to find the best time to work on the task and schedule it in your calendar</b></li>
                  </ol>
                </v-col>
              </v-row>
            </v-card>
          </template>

          <template v-slot:[`item.3`]>
            <v-card class="fill-height align-center" flat>
              <div class="d-flex flex-column justify-center align-center">
                <h1 class="pt-8 pb-4 text-center">Hoorraay 🎉</h1>
                <h4 class="pb-4 text-center">You are all set now. Click the button below to go to your calendar.</h4>
                <div style="width: 300;">
                <v-btn class="mt-4" width="300" color="primary" @click="$router.push({ name: 'DashboardView' })">Go to Calendar</v-btn>
                </div>
              </div>
            </v-card>
          </template>
        </v-stepper>
      </v-sheet>
    </v-sheet>

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
import { onMounted, ref, watch, computed } from 'vue';
import { Account } from 'appwrite';
import { client } from './../config';
import plainDaysEditorImageURL from '@/assets/plaindays-editor.png';

const notification = ref({ show: false, text: '', variant: 'success' });
const loading = ref(false);

const step = ref(1);

const form = ref({
  dayStartHours: 8,
  dayStartMinutes: 0,
  dayEndHours: 22,
  dayEndMinutes: 0,
  workStartHours: 9,
  workStartMinutes: 0,
  workEndHours: 18,
  workEndMinutes: 0,
  timeZone: null,
});

onMounted(async () => {
  const account = new Account(client);
  const preferences = await account.getPrefs();
  const { dayStart, dayEnd, workStart, workEnd, timeZone } = preferences || {};

  if (dayStart) {
    form.value.dayStartHours = Math.floor(dayStart);
    form.value.dayStartMinutes = Math.round((dayStart - form.value.dayStartHours) * 60);
  }

  if (dayEnd) {
    form.value.dayEndHours = Math.floor(dayEnd);
    form.value.dayEndMinutes = Math.round((dayEnd - form.value.dayEndHours) * 60);
  }

  if (workStart) {
    form.value.workStartHours = Math.floor(workStart);
    form.value.workStartMinutes = Math.round((workStart - form.value.workStartHours) * 60);
  }

  if (workEnd) {
    form.value.workEndHours = Math.floor(workEnd);
    form.value.workEndMinutes = Math.round((workEnd - form.value.workEndHours) * 60);
  }

  form.value.timeZone = timeZone || Intl?.DateTimeFormat().resolvedOptions().timeZone;
});

watch(step, async (prevStep, newStep) => {
  if (prevStep === 1 && newStep === 2) {
    await submit();
  }
});

const timeZones = computed(() => {
  return Intl?.supportedValuesOf('timeZone') || [];
});

const submit = async () => {
  try {
    loading.value = true;
    const account = new Account(client);
    const prefs = {
      dayStart: form.value.dayStartHours + form.value.dayStartMinutes / 60,
      dayEnd: form.value.dayEndHours + form.value.dayEndMinutes / 60,
      workStart: form.value.workStartHours + form.value.workStartMinutes / 60,
      workEnd: form.value.workEndHours + form.value.workEndMinutes / 60,
      timeZone: form.value.timeZone,
    }
    await account.updatePrefs(prefs);
    notification.value = { show: true, text: 'Preferences have successfully updated', variant: 'success' };
  } catch (error) {
    console.log(error);
    notification.value = { show: true, text: error.message, variant: 'error' };
  }
  loading.value = false;
};

</script>

