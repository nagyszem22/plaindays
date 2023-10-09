<template>
  <div v-for="folder in folders" :key="folder.id">
    <v-list-group v-if="Array.isArray(folder.folders) && folder.folders.length > 0" :value="folder.name">
      <template v-slot:activator="{ props }">
        <v-list-item class="list-item" v-bind="props" @click="onClick(folder)">
          <v-icon class="mr-2" color="secondary" :icon="`mdi-folder${isOpened[folder.id] ? '-open' : ''}-outline`" /> {{ folder.name }}
        </v-list-item>
      </template>
      <select-folder-item :folders="folder.folders" @select="(item) => onClick(item)" />
    </v-list-group>
    <v-list-item class="list-item" @click="onClick(folder)" v-else>
      <v-icon class="mr-2 folder-icon" color="secondary" icon="mdi-folder-outline" /> {{ folder.name }}
    </v-list-item>
  </div>
</template>

<script setup>
import { defineProps, ref, defineEmits } from 'vue';
import SelectFolderItem from '@/components/tasks/SelectFolderItem.vue';

defineProps([ 'folders' ]);
const emit = defineEmits([ 'select' ]);

const isOpened = ref({});

const onClick = (folder) => {
  emit('select', folder);
  isOpened.value[folder.id] = !isOpened.value[folder.id];
  return;
}

</script>

<style lang="scss" scoped>
.folder-icon {
  position: relative;
  bottom: 2px;
}
.list-item {
  font-size: 14px;
  font-weight: 500;
}
</style>