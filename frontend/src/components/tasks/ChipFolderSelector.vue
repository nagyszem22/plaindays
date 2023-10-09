<template>
  <div :class="{ 'd-inline-flex': true, 'flex-column': true, ...(customClass|| {}) }" @click="displayFolderSelector = true">
    <small class="label">{{ title }}</small>
  </div>

  <v-dialog width="340px" v-model="displayFolderSelector">
    <v-card>
      <v-card-text>
        <v-list dense density="compact" nav>
          <select-folder-item :folders="folders" @select="choseFolder" />
        </v-list>
        <v-divider />
        <p class="pa-3" style="font-size: 14px">Selected folder: <b>{{ chosen?.name || ' - ' }}</b></p>
        <v-divider />
      </v-card-text>
      <v-card-actions class="d-flex justify-space-between pl-4 pr-6 pt-0 pb-4">
        <v-btn color="primary" size="small" @click="displayFolderSelector = false">Cancel</v-btn>
        <div>
          <v-btn color="primary" class="mr-3" variant="outlined" size="small" @click="removeSelectedFolder">Remove Folder</v-btn>
          <v-btn color="primary" variant="flat" size="small" :disabled="!chosen || chosen?.id === value" @click="selectFolder">Update</v-btn>
        </div>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, defineProps, computed, defineEmits, onBeforeMount } from 'vue';
import SelectFolderItem from '@/components/tasks/SelectFolderItem.vue';

const emit = defineEmits([ 'update:value' ]);
const props = defineProps([ 'value', 'folders', 'customClass', 'label' ]);
const selected = ref(null);
const chosen = ref(null);
const displayFolderSelector = ref(false);

// find in folder tree
const findFolder = (folders, id) => {
  for (const folder of folders) {
    if (folder.id === id) {
      return folder;
    }
    if (Array.isArray(folder.folders)) {
      const found = findFolder(folder.folders, id);
      if (found) {
        return found;
      }
    }
  }
  return null;
}
onBeforeMount(() => {
  selected.value = Array.isArray(props.folders) ? findFolder(props.folders, props.value) : null;
  chosen.value = selected.value;
});
const title = computed(() => selected.value?.name || 'No Folder');

const choseFolder = (folder) => {
  chosen.value = folder;
}

const selectFolder = () => {
  emit('update:value', chosen.value.id);
  selected.value = chosen.value;
  displayFolderSelector.value = false;
}

const removeSelectedFolder = () => {
  emit('update:value', null);
  chosen.value = null;
  selected.value = null;
  displayFolderSelector.value = false;
}
</script>

<style lang="scss" scoped>
.label {
  font-weight: 500;
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