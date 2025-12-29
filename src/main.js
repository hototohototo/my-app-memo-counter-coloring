import { createApp } from 'vue'
import App from './App.vue'
import { createRouter, createWebHistory } from 'vue-router'

// カウンターページ
const CounterPage = { template: '<App :page="\'counter\'" />' }
// カウンター2ページ
const CounterPage2 = { template: '<App :page="\'counter2\'" />' }
// メモページ
const MemoPage = { template: '<App :page="\'memo\'" />' }
// 色塗りページ
const ColoringPage = { template: '<App :page="\'coloring\'" />' }

const routes = [
  { path: '/', redirect: '/counter' },
  { path: '/counter', component: CounterPage },
  { path: '/counter2', component: CounterPage2 },
  { path: '/memo', component: MemoPage },
  { path: '/coloring', component: ColoringPage }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

createApp(App).use(router).mount('#app')
