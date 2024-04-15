import { createRouter, createWebHashHistory, createWebHistory } from 'vue-router'
import TasksView from '../views/Tasks.vue'

// create async configureRouter
export async function configureRouter(idsrvAuth) {
  const routes = [
    {
      path: '/',
      name: 'task',
      component: TasksView,
    },
    {
      path: '/lookup/:id',
      name: 'taskwithid',
      props: true,
      component: TasksView,
    },
    {
      path: '/Entities',
      name: 'Entities',
      meta: { authName: idsrvAuth.authName },
      component: () => import(/* webpackChunkName: "about" */ '../views/Entities.vue')
    },
    {
      path: '/Entities/:propcollectionname',
      name: 'EntitiesCollection',
      meta: { authName: idsrvAuth.authName },
      props: true,
      component: () => import(/* webpackChunkName: "about" */ '../views/Entities.vue')
    },
    {
      path: '/Entity/:collectionname',
      name: 'EntityView',
      meta: { authName: idsrvAuth.authName },
      props: true,
      component: () => import(/* webpackChunkName: "about" */ '../views/Entity.vue')
    },
    {
      path: '/Entity/:collectionname/:id',
      name: 'EntityViewWithId',
      meta: { authName: idsrvAuth.authName },
      props: true,
      component: () => import(/* webpackChunkName: "about" */ '../views/Entity.vue')
    },
    {
      path: '/Agents',
      name: 'Agents',
      meta: { authName: idsrvAuth.authName },
      component: () => import(/* webpackChunkName: "about" */ '../views/Agents.vue')
    },
    {
      path: '/Agent',
      name: 'Agent',
      meta: { authName: idsrvAuth.authName },
      component: () => import(/* webpackChunkName: "about" */ '../views/Agent.vue')
    },
    {
      path: '/Agent/:id',
      name: 'AgentWithId',
      props: true,
      meta: { authName: idsrvAuth.authName },
      component: () => import(/* webpackChunkName: "about" */ '../views/Agent.vue')
    },
    {
      path: '/Workitems',
      name: 'WorkItemsView',
      meta: { authName: idsrvAuth.authName },
      component: () => import(/* webpackChunkName: "about" */ '../views/Workitems.vue')
    },
    {
      path: '/Workitems/:propwiqid',
      name: 'WorkItemsViewwiqid',
      props: true,
      meta: { authName: idsrvAuth.authName },
      component: () => import(/* webpackChunkName: "about" */ '../views/Workitems.vue')
    },
    {
      path: '/Workitem/edit/:id',
      name: 'WorkItemViewWithId',
      props: true,
      meta: { authName: idsrvAuth.authName },
      component: () => import(/* webpackChunkName: "about" */ '../views/Workitem.vue')
    },
    {
      path: '/Workitem/new/:wiqid',
      name: 'NewWorkItemViewWithwiqid',
      props: true,
      meta: { authName: idsrvAuth.authName },
      component: () => import(/* webpackChunkName: "about" */ '../views/Workitem.vue')
    },
    {
      path: '/Form/:workflow/:id',
      name: 'FormView',
      meta: { authName: idsrvAuth.authName },
      props: true,
      component: () => import(/* webpackChunkName: "about" */ '../views/Form.vue')
    }

  ]

  // history: createWebHistory(process.env.BASE_URL),
  // history: createWebHashHistory("/ui/"),
  const router = createRouter({
    history: createWebHistory(process.env.NODE_ENV === 'production' ? '/ui/' : '/'),
    routes
  })
  return router;
}
export default configureRouter
