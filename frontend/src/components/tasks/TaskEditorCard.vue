<template>
  <v-card
    elevation="0"
    class="rounded-0 pa-3"
    style="border-bottom: 1px solid #ececec;"
  >
    <v-list-item class="pa-0">
      <template v-if="checkable" v-slot:prepend>
        <v-list-item-action start>
          <v-checkbox-btn v-model="isDone" color="primary"></v-checkbox-btn>
        </v-list-item-action>
      </template>
      <div class="d-flex justify-space-between align-center">
        <v-text-field
          label="Title of the task..."
          density="compact"
          variant="plain"
          class="mb-0"
          :style="{ 'margin-bottom': '5px !important', 'font-weight': '500' }"
          v-model="title"
          @update:focused="updateFocused"
          single-line
          hide-details
        ></v-text-field>
        <div v-if="canDelete" class="delete-btn">
          <small @click="emit('delete', value)"><v-icon icon="mdi-delete-outline"></v-icon></small>
        </div>
      </div>
      
      <div class="d-flex justify-space-between">
        <div>
          <chip-selector label="Finish by..." :customClass="{ 'mr-3': true }" v-model:value="urgency" :options="urgencyOptions" />
          <chip-selector label="Do it..." :customClass="{ 'mr-3': true }" v-model:value="scheduleType" :options="scheduleTypeOptions" />
          <chip-selector label="Priority" :customClass="{ 'mr-3': true }" v-model:value="priority" :options="priorityOptions" />
        </div>
        <div>
          <chip-folder-selector label="Folder" :customClass="{ 'rounded-e-0': true, 'pr-3': true }" v-model:value="folderID" :folders="folders" />
          <chip-selector label="Est." :customClass="{ 'rounded-e-0': true, 'pr-1': true }" v-model:value="hours" :options="hoursOptions" />
          <chip-selector label="Time" :customClass="{ 'rounded-s-0': true, 'pl-1': true, 'mr-2': canDelete }" v-model:value="minutes" :options="minutesOptions" />
        </div>
      </div>
    </v-list-item>
  </v-card>
</template>

<script setup>
import ChipSelector from '@/components/tasks/ChipSelector.vue';
import ChipFolderSelector from './ChipFolderSelector.vue';
import { ref, defineProps, defineEmits, watch, onBeforeMount } from 'vue';
import { store } from '@/store';

const props = defineProps([ 'value', 'canDelete', 'checkable', 'folders' ]);
const emit = defineEmits([ 'update:value', 'delete' ]);

const title = ref('');
const isDone = ref(false);

const urgency = ref('TODAY');
const urgencyOptions = [
  { title: 'by Today', value: 'TODAY' },
  { title: 'by Tomorrow', value: 'TOMORROW' },
  { title: 'by This week', value: 'THIS_WEEK' },
  { title: 'by Next week', value: 'NEXT_WEEK' },
  { title: 'No Deadline', value: 'NONE' },
];

const scheduleType = ref('WORK_HOURS');
const scheduleTypeOptions = [
  { title: '💼 During Work', value: 'WORK_HOURS' },
  { title: '🌅 Before Work', value: 'BEFORE_WORK_HOURS' },
  { title: '🌝 After Work', value: 'AFTER_WORK_HOURS' },
  { title: '🕰 Anytime', value: 'NONE' },
];

const priority = ref(2);
const priorityOptions = [
  { title: '🤩 High', value: 1 },
  { title: '😄 Medium', value: 2 },
  { title: '😌 Low', value: 3 },
];

const folderID = ref(null);

const hours = ref(1);
const hoursOptions = [0,1,2,3].map(num => ({ title: `${num}h`, value: num }));
const minutes = ref(0);
const minutesOptions = [0,5,10,15,20,25,30,35,40,45,50,55].map(num => ({ title: `${num}m`, value: num }));

onBeforeMount(() => {
  title.value = props.value?.title || '';
  isDone.value = props.value?.isDone || false;
  urgency.value = props.value?.urgency || 'TODAY';
  scheduleType.value = props.value?.scheduleType || 'WORK_HOURS';
  priority.value = props.value?.priority || 2;
  hours.value = Math.floor(props.value?.duration / 1000 / 60 / 60) ?? 1;
  minutes.value = Math.floor((props.value?.duration / 1000 / 60) % 60) ?? 0;
  folderID.value = props.value?.folderID || null;

  // @TODO IMPORTANT! Only update properties that are needed to be updated
  watch(urgency, () => input());
  watch(scheduleType, () => input());
  watch(priority, () => input());
  watch(hours, () => input());
  watch(minutes, () => input());
  watch(isDone, () => input());
  watch(folderID, () => input());
});

const updateFocused = (val) => {
  if (!val) {
    input();
  }
}

const input = () => {
  const data = {
    id: props.value?.id,
    isDone: isDone.value,
    title: title.value,
    priority: priority.value,
    duration: (hours.value * 60 + minutes.value) * 60 * 1000,
    deadline: (() => {
      if (urgency.value === 'NONE') {
        return new Date(new Date().setFullYear(new Date().getFullYear() + 1));
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
    canSplit: true,
    userID: store?.account?.$id,
    folderID: folderID.value,
  };
  emit('update:value', data);
}

</script>

<style lang="scss" scoped>
.delete-btn {
  width: 40px;
  text-align: right;
  cursor: pointer;
  color: #999;

  &:hover {
    color: #666;
  }

  &:active {
    position: relative;
    color: #333;
    top: 1px;
  }
}
</style>