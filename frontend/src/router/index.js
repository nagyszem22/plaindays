// Composables
import { createRouter, createWebHistory } from 'vue-router';
import { Account } from 'appwrite';
import { client } from './../config';
import { store } from '@/store';

const routes = [
  {
    path: '/',
    component: () => import('@/layouts/default/DefaultLayout.vue'),
    meta: { auth: false },
    children: [
      {
        path: '',
        name: 'HomeView',
        component: () => import(/* webpackChunkName: "home" */ '@/views/HomeView.vue'),
      },
      {
        path: '/login',
        name: 'LoginView',
        component: () => import(/* webpackChunkName: "login" */ '@/views/LoginView.vue'),
      },
      {
        path: '/signup',
        name: 'SignupView',
        component: () => import(/* webpackChunkName: "login" */ '@/views/SignupView.vue'),
      },
    ],
  },
  {
    path: '/app',
    component: () => import('@/layouts/app/AppLayout.vue'),
    meta: { auth: true },
    children: [
      {
        path: '/app/calendar',
        name: 'DashboardView',
        component: () => import(/* webpackChunkName: "dashboard" */ '@/views/DashboardView.vue'),
      },
      {
        path: '/app/notes',
        name: 'NotesView',
        component: () => import(/* webpackChunkName: "notes" */ '@/views/NotesView.vue'),
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

router.beforeEach(async (to) => {
  const account = new Account(client);
  try {
    const user = store.account || (await account.get());
    if (to?.meta?.auth === true && !user) {
      return { name: 'LoginView' };
    }
    if (to?.meta?.auth === false && user) {
      return { name: 'DashboardView' };
    }
  } catch (error) {
    console.log('error', error);
    if (to?.meta?.auth === true) {
      return { name: 'LoginView' };
    }
  }
  return true;
});

export default router;
