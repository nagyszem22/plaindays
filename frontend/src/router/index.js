// Composables
import { createRouter, createWebHistory } from 'vue-router';
import { Account } from 'appwrite';
import { client } from './../config';

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
        path: '/app/onboarding',
        name: 'OnboardingView',
        component: () => import(/* webpackChunkName: "onboarding" */ '@/views/OnboardingView.vue'),
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
    const user = await account.get();
    if (to?.meta?.auth === true && !user) {
      return { name: 'HomeView' };
    }
    if (to?.meta?.auth === false && user) {
      return { name: 'DashboardView' };
    }
  } catch (error) {
    if (to?.meta?.auth === true) {
      return { name: 'HomeView' };
    }
  }
  return true;
});

export default router;
