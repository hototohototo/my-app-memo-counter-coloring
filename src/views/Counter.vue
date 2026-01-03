 <script setup>
//やりたいこと

import { watch } from 'vue'
import ButtonCounter from '../components/ButtonCounter.vue'
import { useAuth } from '../composables/useAuth.js'
import { useFirebaseData } from '../composables/useFirebaseData'
// import { createUserWithEmailAndPassword } from 'firebase/auth'

// import { Plus, Trash2Icon } from "lucide-vue-next";　


// // どのコンポーネントでも
const { user } = useAuth()

// カウンターデータを独立管理
const { data: counterData, loading, saveData, autoSave} = useFirebaseData('counterData', {
  counterBig: 0,
  counterMid: 0
})

// リセット機能
const resetAll = () => {
  counterData.counterBig = 0
  counterData.counterMid = 0
  alert('カウンターをリセットしました')
}

watch(counterData, () => autoSave(), { deep: true })

</script>

<template>

    <!-- カウンターページ -->
      <h1>カウンター</h1>
      <!-- <ButtonCounter v-model="counterData.counterBig" label="大" @update:modelValue="autoSave()" />
      <ButtonCounter v-model="counterData.counterMid" label="中" @update:modelValue="autoSave()" /> -->
      <ButtonCounter v-model="counterData.counterBig" label="大" />
      <ButtonCounter v-model="counterData.counterMid" label="中" />
      <p>大 = {{ counterData.counterBig }}, 中 = {{ counterData.counterMid }}</p>
      <button @click="resetAll" class="counter-reset">カウンターリセット</button>
      <!-- <button @click="saveData">データセーブ</button> -->
     

</template>


<style scoped>
.counter-reset {
  background-color: #3515d7; /* 赤色 */
  color: white;               /* 文字色を白に */
  border: none;
  border-radius: 5px;
}

.counter-reset:hover {
  background-color: #d32f2f; /* ホバー時に少し濃く */
}
</style>



<!-- src/views/Counter.vue -->
<!-- <script setup>
import { watch } from 'vue'
import ButtonCounter from '../components/ButtonCounter.vue'
import { useFirebaseData } from '../composables/useFirebaseData'

// カウンターデータを独立管理
const { data: counterData, loading, autoSave } = useFirebaseData('counterData', {
  counterBig: 0,
  counterMid: 0
})

// 自動保存
watch(counterData, () => autoSave(), { deep: true })

const resetAll = () => {
  counterData.value.counterBig = 0
  counterData.value.counterMid = 0
  alert('カウンターをリセットしました')
}
</script>

<template>
  <div v-if="loading">読み込み中...</div>
  <div v-else>
    <h1>カウンター</h1>
    <ButtonCounter v-model="counterData.counterBig" label="大" />
    <ButtonCounter v-model="counterData.counterMid" label="中" />
    <p>大 = {{ counterData.counterBig }}, 中 = {{ counterData.counterMid }}</p>
    <button @click="resetAll" class="counter-reset">カウンターリセット</button>
  </div>
</template>

<style scoped>
.counter-reset {
  background-color: #3515d7;
  color: white;
  border: none;
  border-radius: 5px;
  padding: 10px 20px;
}
.counter-reset:hover {
  background-color: #d32f2f;
}
</style> -->