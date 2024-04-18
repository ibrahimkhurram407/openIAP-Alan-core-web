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
      path: '/Tasks',
      name: 'Tasks',
      component: TasksView,
    },
    {
      path: '/Workflows',
      name: 'Workflows',
      meta: { authName: idsrvAuth.authName },
      component: () => import(/* webpackChunkName: "about" */ '../views/Workflows.vue')
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
      path: '/Packages',
      name: 'Packages',
      meta: { authName: idsrvAuth.authName },
      component: () => import(/* webpackChunkName: "about" */ '../views/Agents.vue')
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
      path: '/Workitem/:id',
      name: 'WorkItemWithId',
      props: true,
      meta: { authName: idsrvAuth.authName },
      component: () => import(/* webpackChunkName: "about" */ '../views/Workitem.vue')
    },
    {
      path: '/Workitem',
      name: 'Workitem',
      props: true,
      meta: { authName: idsrvAuth.authName },
      component: () => import(/* webpackChunkName: "about" */ '../views/Workitem.vue')
    },

    {
      path: '/WorkitemQueues',
      name: 'WorkitemQueues',
      meta: { authName: idsrvAuth.authName },
      component: () => import(/* webpackChunkName: "about" */ '../views/Workflows.vue')
    },
    {
      path: '/WorkitemQueue/:id',
      name: 'WorkitemQueueWithId',
      props: true,
      meta: { authName: idsrvAuth.authName },
      component: () => import(/* webpackChunkName: "about" */ '../views/Workitem.vue')
    },
    {
      path: '/WorkitemQueue',
      name: 'WorkitemQueue',
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
    },


    {
      path: '/Users',
      name: 'Users',
      meta: { authName: idsrvAuth.authName },
      component: () => import(/* webpackChunkName: "about" */ '../views/Users.vue')
    },
    {
      path: '/User',
      name: 'User',
      meta: { authName: idsrvAuth.authName },
      component: () => import(/* webpackChunkName: "about" */ '../views/Agent.vue')
    },
    {
      path: '/Roles',
      name: 'Roles',
      meta: { authName: idsrvAuth.authName },
      component: () => import(/* webpackChunkName: "about" */ '../views/Roles.vue')
    },
    {
      path: '/Role',
      name: 'Role',
      meta: { authName: idsrvAuth.authName },
      component: () => import(/* webpackChunkName: "about" */ '../views/Agent.vue')
    },


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
