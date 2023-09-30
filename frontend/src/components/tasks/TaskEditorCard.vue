<template>
  <v-card
    elevation="0"
    class="rounded-0 pa-3"
    style="border-bottom: 1px solid #ececec;"
  >
    <v-text-field
      label="Title of the task..."
      density="compact"
      variant="plain"
      class=" mb-0"
      v-model="title"
      single-line
      hide-details
    ></v-text-field>
    <div class="d-flex justify-space-between">
      <div>
        <chip-selector :customClass="{ 'mr-2': true }" v-model:value="urgency" :options="urgencyOptions" />
        <chip-selector :customClass="{ 'mr-2': true }" v-model:value="scheduleType" :options="scheduleTypeOptions" />
        <chip-selector :customClass="{ 'mr-2': true }" v-model:value="priority" :options="priorityOptions" />
      </div>
      <div>
        <chip-selector :customClass="{ 'rounded-e-0': true, 'pr-1': true }" v-model:value="hours" :options="hoursOptions" />
        <chip-selector :customClass="{ 'rounded-s-0': true, 'pl-1': true, 'mr-2': canDelete }" v-model:value="minutes" :options="minutesOptions" />
        <v-chip v-if="canDelete" color="primary" @click="emit('delete')"><v-icon icon="mdi-close"></v-icon></v-chip>
      </div>
    </div>
  </v-card>
</template>

<script setup>
import ChipSelector from '@/components/tasks/ChipSelector.vue';
import { ref, defineProps, defineEmits, watch, onBeforeMount } from 'vue';
import { store } from '@/store';

const props = defineProps([ 'value', 'canDelete' ]);
const emit = defineEmits([ 'update:value', 'delete' ]);

const title = ref('');

const urgency = ref('TODAY');
const urgencyOptions = [
  { title: 'Today', value: 'TODAY' },
  { title: 'Tomorrow', value: 'TOMORROW' },
  { title: 'This week', value: 'THIS_WEEK' },
  { title: 'Next week', value: 'NEXT_WEEK' },
  { title: 'At some point', value: 'NONE' },
];

const scheduleType = ref('WORK_HOURS');
const scheduleTypeOptions = [
  { title: '💼 Work', value: 'WORK_HOURS' },
  { title: '🌅 Before Work', value: 'BEFORE_WORK_HOURS' },
  { title: '🌝 After Work', value: 'BEFORE_WORK_HOURS' },
  { title: '🕰 Anytime', value: 'NONE' },
];

const priority = ref(2);
const priorityOptions = [
  { title: '🤩 High', value: 1 },
  { title: '😄 Medium', value: 2 },
  { title: '😌 Low', value: 3 },
];

const hours = ref(1);
const hoursOptions = [0,1,2,3,4,5,6,7,8,9,10].map(num => ({ title: `${num}h`, value: num }));
const minutes = ref(0);
const minutesOptions = [0,5,10,15,20,25,30,35,40,45,50,55].map(num => ({ title: `${num}m`, value: num }));

onBeforeMount(() => {
  title.value = props.value?.title || '';
  urgency.value = props.value?.urgency || 'TODAY';
  scheduleType.value = props.value?.scheduleType || 'WORK_HOURS';
  priority.value = props.value?.priority || 2;
  hours.value = Math.floor(props.value?.duration / 1000 / 60 / 60) || 1;
  minutes.value = Math.floor((props.value?.duration / 1000 / 60) % 60) || 0;
});

watch(title, () => input());
watch(urgency, () => input());
watch(scheduleType, () => input());
watch(priority, () => input());
watch(hours, () => input());
watch(minutes, () => input());

const input = () => {
  const data = {
    id: props.value?.id,
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
  };
  emit('update:value', data);
}

</script>