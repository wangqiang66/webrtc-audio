import Vue from 'vue'
import router from './router'
import './styles/main.scss'
import '@/styles/index.scss' // global css

Vue.config.productionTip = false

new Vue({
  el: '#app',
  router,
  render() {
    return (
      <router-view></router-view>
    )
  }
})
