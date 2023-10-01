<template>
  <div class="pa-3">
    <task-editor-card
      v-for="(task, index) in tasks"
      :key="task.id"
      :value="task" 
      @update:value="val => tasks[index] = val"
      :canDelete="tasks.length > 1"
      @delete="tasks = tasks.filter(t => t.id !== task.id)"
    />
  </div>
  <div class="pa-3 d-flex justify-space-between">
    <v-btn size="small" variant="outlined" color="primary" @click="addTask">Add Task</v-btn>
    <v-btn size="small" variant="flat" color="primary" @click="saveTasks">Schedule Tasks</v-btn>
  </div>

  <!-- Notification -->
  <v-snackbar v-model="notification.show" :color="notification.variant" close-delay="2000">
    {{ notification.text }}
    <template v-slot:actions>
      <v-btn variant="text" color="white" @click="notification.show = false">Close</v-btn>
    </template>
  </v-snackbar>

  <!-- Full page loader -->
  <v-overlay
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
</template>

<script setup>
import TaskEditorCard from '@/components/tasks/TaskEditorCard.vue';
import { ref, defineEmits } from 'vue';
import { v4 as uuidv4 } from 'uuid';
import { client, adb, adbc, af } from '@/config';
import { Databases, Functions } from 'appwrite';
import { store } from '@/store';

const notification = ref({ show: false, text: '', variant: 'success' });
const loading = ref(false);
const emit = defineEmits([ 'close' ]);

const tasks = ref([{
  id: uuidv4(),
  title: '',
  urgency: 'TODAY',
  scheduleType: 'WORK_HOURS',
  priority: 2,
  duration: 1 * 60 * 60 * 1000,
}]);

const addTask = () => {
  tasks.value.push({
    id: uuidv4(),
    title: '',
    urgency: 'TODAY',
    scheduleType: 'WORK_HOURS',
    priority: 2,
    duration: 1 * 60 * 60 * 1000,
  });
}

const saveTasks = async () => {
  try {
    loading.value = true;
    const databases = new Databases(client);
    const functions = new Functions(client);
    const creates  =tasks.value.filter(({ title }) => title).map(async ({ id, ...data }) => {
      databases.createDocument(adb['App'], adbc['Events'], id, data);
    });
    await Promise.all(creates);
    await functions.createExecution(af['schedule-tasks']);

    tasks.value = [{
      id: uuidv4(),
      title: '',
      urgency: 'TODAY',
      scheduleType: 'WORK_HOURS',
      priority: 2,
      duration: 1 * 60 * 60 * 1000,
    }];

    store.refreshTasks = true;

    loading.value = false;
    emit('close');
  } catch (error) {
    console.log({ error });
    notification.value = { show: true, text: 'Error saving task', variant: 'error' };
  }
  loading.value = false;
}
</script>