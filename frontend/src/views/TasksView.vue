<template>
  <v-navigation-drawer
    v-model="drawer"
    :rail="rail"
    permanent
    @click="rail = false"
  >
    <v-list>
      <v-list-item
        :prepend-icon="!rail ? null : 'mdi-chevron-right'"
        :append-icon="!rail ? 'mdi-chevron-left' : null"
        @click.stop="rail = !rail"
        title="Folders"
        subtitle="Arrange your tasks in folders"
      ></v-list-item>
    </v-list>
    <template v-if="!rail">
      <v-divider></v-divider>
      <v-list dense density="compact" nav>
        <v-list-item class="list-item" @click="$router.push({ name: 'TasksView' })" :active="!$route.params.folderID">
          <v-icon class="mr-2 folder-icon" color="secondary" icon="mdi-folder-outline" /> All Tasks
        </v-list-item>
      </v-list>
      <v-divider></v-divider>
      <v-list dense density="compact" nav>
        <folder-item :folders="folders" />
      </v-list>
    </template>
  </v-navigation-drawer>
  <v-row v-if="folder">
    <v-col cols="12" md="10" offset-md="1">
      <tasks-list-header
        :folder="folder"
        @create:folder="item => addFolder(item)"
        @update:folder="item => updateFolder(item)"
        @delete:folder="item => deleteFolder(item)"
      />
      <div class="pt-7 pl-6 pr-6 d-flex justify-space-between">
        <v-btn size="small" variant="outlined" color="primary" @click="addTask">Add Task</v-btn>
        <div>
          <v-switch
            color="primary"
            style="font-size: 14px !important"
            v-model="displayFinishedTasks"
            label="Show finished tasks"
            density="compact"
            :hide-details="true"
            class="pa-0"
          ></v-switch>
        </div>
      </div>
      <div v-if="tasks.length" class="pb-3 pl-3 pr-3">
        <task-editor-card
          v-for="(task, index) in tasks.filter(task => displayFinishedTasks || !task.isDone)"
          :key="task.id"
          :value="task" 
          :checkable="true"
          @update:value="val => updateTask(index, val)"
          :canDelete="true"
          @delete="val => deleteTask(index, val)"
          :folders="folders"
        />
      </div>
      <div v-else class="pa-9 w-100" style="text-align: center">No tasks added yet.</div>
    </v-col>
  </v-row>
  <v-row v-else>
    <v-col cols="12" md="10" offset-md="1">
      <div class="pa-9 w-100" style="text-align: center">Folder not found.</div>
    </v-col>
  </v-row>

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
import { ref, defineProps, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { Databases } from 'appwrite';
import { v4 as uuidv4 } from 'uuid';
import { client, adb, adbc } from '@/config';
import { store } from '@/store';
import { onMounted } from 'vue';
import FolderItem from '@/components/tasks/FolderItem.vue';
import TasksListHeader from '@/components/tasks/TasksListHeader.vue';

// @TODO refactor it slightly
// assign task to folder
// make left navigation work
// diplsay folder on tasks
// edit folder on tasks
// move all logic into composables

const props = defineProps([ 'folderID' ]);
const router = useRouter();

const drawer = ref(true);
const rail = ref(true);
const displayFinishedTasks = ref(true);

const folder = computed(() => {
  const defaultFolder = { id: 'ALL_TASKS', name: 'All Tasks', folders: folders.value };
  if (!props.folderID) return defaultFolder;
  console.log({ folderID: props.folderID, folderList: folderList.value });
  const hit = folderList.value.find(({ id }) => id === props.folderID);
  if (!hit) return null;
  const children = folderList.value.filter(({ parentID }) => parentID === hit.id);
  return { ...hit, folders: children };
});

// @TODO: this is not gonna work for nested folders
const foldersTree = (items, parentID) => {
  return items.reduce((acc, item) => {
    if (item.parentID === parentID) {
      acc.push({ ...item, folders: foldersTree(items, item.id) });
    }
    return acc;
  }, []);
}
const folders = computed(() => {
  return foldersTree(folderList.value, null);
});

const folderList = ref([]);

const databases = new Databases(client);
const enableTaskScheduler = ref(false);

const notification = ref({ show: false, text: '', variant: 'success' });
const loading = ref(false);

const tasks = ref([]);

onMounted(async () => {
  await getFolders();
  await getTasks();

  watch(props, async () => {
    await getTasks();
  });
});

const addTask = async () => {
  const account = store.account;
  const { $id: userID } = account || {};
  const id = uuidv4();
  
  const task = {
    title: null,
    isDone: false,
    urgency: 'TODAY',
    scheduleType: 'WORK_HOURS',
    priority: 2,
    duration: 1 * 60 * 60 * 1000,
    userID,
    folder: props.folderID ?? null,
  };

  tasks.value = [
    { ...task, id, folderID: task.folder, folder: undefined },
    ...tasks.value,
  ];

  try {
    await databases.createDocument(adb['App'], adbc['Events'], id, task);
  } catch (error) {
    notification.value = { show: true, text: 'Error saving task', variant: 'error' };
  }
  enableTaskScheduler.value = true;
}

const addFolder = async data => {
  const account = store.account;
  const { $id: userID } = account || {};
  const { id, ...rest } = data;

  folderList.value = [
    { ...rest, userID, id },
    ...folderList.value,
  ];

  try {
    await databases.createDocument(adb['App'], adbc['Folders'], id, { ...rest, userID });
  } catch (error) {
    console.log({ error });
    notification.value = { show: true, text: 'Error saving folder', variant: 'error' };
  }
}

const updateTask = async (index, val) => {
  tasks.value[index] = val;
  const { id, folderID, ...task } = val;
  const data = {
    ...task,
    folder: folderID ?? null,
  };
  try {
    await databases.updateDocument(adb['App'], adbc['Events'], id, data);
  } catch (error) {
    console.log({ error });
    notification.value = { show: true, text: 'Error updating task', variant: 'error' };
  }
  enableTaskScheduler.value = true;
}

const updateFolder = async data => {
  const { id, ...rest } = data;

  folderList.value = folderList.value.map(item => {
    if (item.id === id) {
      return { ...item, ...rest };
    }
    return item;
  })

  try {
    await databases.updateDocument(adb['App'], adbc['Folders'], id, { ...rest });
  } catch (error) {
    console.log({ error });
    notification.value = { show: true, text: 'Error updating folder', variant: 'error' };
  }
}

const deleteTask = async (index, val) => {
  tasks.value.splice(index, 1);
  const { id } = val;
  try {
    await databases.deleteDocument(adb['App'], adbc['Events'], id);
  } catch (error) {
    console.log({ error });
    notification.value = { show: true, text: 'Error deleting task', variant: 'error' };
  }
  enableTaskScheduler.value = true;
}

const deleteFolder = async data => {
  const { id } = data;

  const updateIDs = [];
  folderList.value = folderList.value.filter(item => item.id !== id);
  folderList.value = folderList.value.map(item => {
    if (item.parentID === id) {
      updateIDs.push(item.id);
      return { ...item, parentID: data.parentID ?? undefined };
    }
    return item;
  });

  tasks.value = tasks.value.map(item => {
    if (item.folderID === id) {
      return { ...item, folderID: null };
    }
    return item;
  });

  loading.value = true;
  try {
    if (updateIDs.length) {
      await Promise.all(
        updateIDs.map(id => databases.updateDocument(adb['App'], adbc['Folders'], id, { parentID: data.parentID ?? null }))
      );
    }
    await databases.deleteDocument(adb['App'], adbc['Folders'], id);
  } catch (error) {
    console.log({ error });
    notification.value = { show: true, text: 'Error deleting folder', variant: 'error' };
  }

  loading.value = false;
  router.push({ name: 'TasksView', params: { folderID: data.parentID ?? undefined } });
}

const getTasks = async () => {
  try {
    let documents = null;
    if (props.folderID) {
      const folderData = await databases.getDocument(adb['App'], adbc['Folders'], props.folderID);
      documents = folderData?.events;
    } else {
      const data = await databases.listDocuments(adb['App'], adbc['Events']);
      documents = data.documents;
    }
    if (Array.isArray(documents) && documents.length) {
      tasks.value = documents.map((event) => {
        // eslint-disable-next-line no-unused-vars
        const { start, end, $id, $createdAt, $updatedAt, $permissions, $collectionId, $databaseId, folder,  ...rest } = event;
        return {
          ...rest,
          id: $id,
          start: start ? new Date(start) : null,
          end: end ? new Date(end) : null,
          content: undefined,
          folderID: folder?.$id ?? props.folderID ?? null
        };
      });
    } else {
      tasks.value = [];
    }
  } catch (error) {
    console.log({ error });
    notification.value = { show: true, text: 'Error getting tasks', variant: 'error' };
  }
};

const getFolders = async () => {
  try {
    const data = await databases.listDocuments(adb['App'], adbc['Folders']);
    if (data?.documents && data.documents.length) {
      folderList.value = data?.documents?.map(item => {
        // eslint-disable-next-line no-unused-vars
        const { $id, $createdAt, $updatedAt, $permissions, $collectionId, $databaseId,  ...rest } = item;
        return {
          ...rest,
          id: $id
        };
      });
    }
  } catch (error) {
    console.log({ error });
    notification.value = { show: true, text: 'Error getting folders', variant: 'error' };
  }
};
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