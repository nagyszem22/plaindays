<template>
  <v-menu>
    <template v-slot:activator="{ props: active }">
      <div class="d-inline-flex flex-column">
        <small class="mb-1" style="color: #444; font-weight: 500;">{{ label }}</small>
        <v-chip :class="customClass || null" v-bind="active" label>{{ title }}</v-chip>
      </div>
    </template>

    <v-list>
      <v-list-item
        v-for="option in options"
        color="primary"
        :key="option.value"
        style="cursor: pointer;
        min-height: 20px;"
        class="pt-2 pb-2 pl-3 pr-3"
        density="compact"
        nav
      >
        <v-list-item-title @click="selectOption(option)">{{ option.title }}</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script setup>
import { ref, defineProps, computed, defineEmits, onBeforeMount } from 'vue';

const emit = defineEmits([ 'update:value' ]);
const props = defineProps([ 'value', 'options', 'customClass', 'label' ]);
const selected = ref(null);

onBeforeMount(() => {
  selected.value = props.value;
});

const title = computed(() => {
  const item = props.options.find((option) => option.value === selected.value);
  return item ? item.title : ' - ';
});

const selectOption = (option) => {
  selected.value = option.value;
  emit('update:value', option.value);
}
</script>