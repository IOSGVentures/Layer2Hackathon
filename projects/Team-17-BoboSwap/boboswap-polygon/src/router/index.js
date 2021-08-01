import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    component:() => import('../views/index.vue') ,
    children: [
      {
        path: '',
        redirect: '/home'
      },
      {
        path: '/home',
        name: 'Transaction',
        component: () => import('../views/Transaction.vue')
      },
      {
        path: '/search',
        name: 'Search',
        component: () => import('../views/Search.vue')
      },
      {
        path: '/chart',
        name: 'Chart',
        component: () => import('../views/Chart.vue')
      }
     
    ]
  },
 
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
