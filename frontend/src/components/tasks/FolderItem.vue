<template>
  <draggable :list="folders" :group="{ name: 'g1' }">
    <div v-for="folder in folders" :key="folder.id">
      <v-list-group v-if="Array.isArray(folder.folders) && folder.folders.length > 0" :value="folder.name">
        <template v-slot:activator="{ props }">
          <v-list-item class="list-item" v-bind="props" @click="onClick(folder)" :active="$route.params.folderID === folder.id">
            <v-icon class="mr-2" color="secondary" :icon="`mdi-folder${isOpened[folder.id] ? '-open' : ''}-outline`" /> {{ folder.name }}
          </v-list-item>
        </template>
        <folder-item :folders="folder.folders" />
      </v-list-group>
      <v-list-item class="list-item" @click="onClick(folder)" :active="$route.params.folderID === folder.id" v-else>
        <v-icon class="mr-2 folder-icon" color="secondary" icon="mdi-folder-outline" /> {{ folder.name }}
      </v-list-item>
    </div>
  </draggable>
</template>

<script setup>
import { defineProps, ref } from 'vue';
import { useRouter } from 'vue-router';
import FolderItem from '@/components/tasks/FolderItem.vue';
import { VueDraggableNext } from 'vue-draggable-next'

const draggable = VueDraggableNext;

defineProps([ 'folders' ]);

const isOpened = ref({});

const router = useRouter();

const onClick = (folder) => {
  if (folder.id === 'ALL_TASKS') {
    router.push({ name: 'TasksView' });
  } else {
    router.push({ name: 'TasksView', params: { folderID: folder.id } });
  }
  isOpened.value[folder.id] = !isOpened.value[folder.id];
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