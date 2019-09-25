import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  // mode: 'history', // require service support
  routes: [
    {
      path: '/',
      component: () => import('@/view/login'),
      redirect: '/login'
    },
    {
      path: '/login',
      component: () => import('@/view/login')
    },
    {
      path: '/audio/:kind?/:name?',
      name: 'AudioView',
      component: () => import('@/view/audio')
    }
  ]
})
