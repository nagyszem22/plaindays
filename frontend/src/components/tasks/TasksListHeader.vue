<template>
  <div class="pl-6 pr-6 pt-6 pb-2">
    <h2 class="pb-3 mb-3 d-flex justify-space-between" style="border-bottom: 1px solid #eff2f9">
      <div>
        <v-icon
          v-if="folder.id !== 'ALL_TASKS'"
          class="icon-button big mr-2"
          icon="mdi-chevron-left"
          @click="$router.push({ name: 'TasksView', params: { folderID: folder.parentID ?? undefined } })"
        />
        <span>{{ folder.name }}</span> 
      </div>
      <div v-if="folder.id !== 'ALL_TASKS'">
        <v-icon class="icon-button mr-3" icon="mdi-pencil-outline" @click="updateFolderDialog = true" />
        <v-icon class="icon-button" icon="mdi-delete-outline" @click="deleteFolderDialog = true" />
      </div>
    </h2>
    <div class="pb-3" style="border-bottom: 1px solid #eff2f9">
      <span class="mr-3" style="color: #555658"><b>Folders:</b></span>
      <template v-if="Array.isArray(folder.folders) && folder.folders.length > 0">
        <v-chip
          v-for="item in folder.folders"
          :key="item.id"
          class="mr-2"
          @click="$router.push({ name: 'TasksView', params: { folderID: item.id } })"
        ><v-icon icon="mdi-folder-outline" color="secondary" class="mr-2" /> {{ item.name }}</v-chip>
      </template>
      <v-chip color="primary" class="mr-2" @click="createFolderDialog = true"><v-icon icon="mdi-plus" /></v-chip>
    </div>

    <!-- Create Folder -->
    <v-dialog width="340px" v-model="createFolderDialog">
      <v-card>
        <v-card-text>
          <v-text-field
            class="pt-2"
            density="compact"
            label="Folder Name"
            v-model="newFolderName"
            :style="{ 'margin-bottom': '5px !important', 'font-weight': '500' }"
            hide-details
            single-line
          />
        </v-card-text>
        <v-card-actions class="d-flex justify-space-between pl-4 pr-6 pt-0 pb-4">
          <v-btn color="primary" size="small" @click="createFolderDialog = false">Cancel</v-btn>
          <v-btn color="primary" variant="flat" size="small" :disabled="!newFolderName.length" @click="createFolder">Create Folder</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Update Folder -->
    <v-dialog width="340px" v-model="updateFolderDialog">
      <v-card>
        <v-card-text>
          <v-text-field
            class="pt-2"
            density="compact"
            label="Folder Name"
            v-model="updateFolderName"
            :style="{ 'margin-bottom': '5px !important', 'font-weight': '500' }"
            hide-details
            single-line
          />
        </v-card-text>
        <v-card-actions class="d-flex justify-space-between pl-4 pr-6 pt-0 pb-4">
          <v-btn color="primary" size="small" @click="updateFolderDialog = false">Cancel</v-btn>
          <v-btn color="primary" variant="flat" size="small" :disabled="!updateFolderName.length" @click="updateFolder">Update Folder</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Folder -->
    <v-dialog width="340px" v-model="deleteFolderDialog">
      <v-card>
        <v-card-text>
          <p class="pb-2">Are you sure you want to delete this folder? This can not be undone.</p>
          <p class="pb-2">All the subfolders will be moved up to the parent folder.</p>
          <p>All the tasks belonging to this folder and its subfolders will be moved to the <b>All Tasks</b> folder.</p>
        </v-card-text>
        <v-card-actions class="d-flex justify-space-between pl-4 pr-6 pt-0 pb-4">
          <v-btn color="primary" size="small" @click="deleteFolderDialog = false">Cancel</v-btn>
          <v-btn color="primary" variant="flat" size="small" @click="deleteFolder">Delete Folder</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits, onBeforeMount, watch } from 'vue';
import { v4 as uuidv4 } from 'uuid';

const props = defineProps([ 'folder' ]);
const emit = defineEmits([ 'create:folder', 'update:folder', 'delete:folder' ]);

const createFolderDialog = ref(false);
const updateFolderDialog = ref(false);
const deleteFolderDialog = ref(false);

const newFolderName = ref('');
const updateFolderName = ref('');

onBeforeMount(() => {
  newFolderName.value = '';
  updateFolderName.value = props.folder.name;
});

watch(() => props.folder, () => {
  newFolderName.value = '';
  updateFolderName.value = props.folder.name;
});

const createFolder = () => {
  const parentID = props.folder.id === 'ALL_TASKS' ? undefined : props.folder.id;
  emit('create:folder', { name: newFolderName.value, id: uuidv4(), parentID });
  createFolderDialog.value = false;
}

const updateFolder = () => {
  if (updateFolderName.value === props.folder.name || props.folder.id === 'ALL_TASKS') {
    updateFolderDialog.value = false;
    return;
  }
  emit('update:folder', { name: updateFolderName.value, id: props.folder.id });
  updateFolderDialog.value = false;
}

const deleteFolder = () => {
  emit('delete:folder', props.folder);
  deleteFolderDialog.value = false;
}
</script>

<style lang="scss" scoped>
.icon-button {
  font-size: 22px;
  cursor: pointer;
  color: #999;

  &.big {
    font-size: 28px;
    position: relative;
    bottom: 2px;
  }

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