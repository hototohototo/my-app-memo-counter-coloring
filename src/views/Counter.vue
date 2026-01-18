 <script setup>
//やりたいこと
// カウント対象を追加するボタンを作成して、任意の数のカウンターを追加できるようにする


import { watch, ref } from 'vue'
import ButtonCounter from '../components/ButtonCounter.vue'
import { useAuth } from '../composables/useAuth.js'
import { useFirebaseData } from '../composables/useFirebaseData'
// import { createUserWithEmailAndPassword } from 'firebase/auth'

import { Plus, Trash2Icon } from "lucide-vue-next"


// // どのコンポーネントでも
const { user } = useAuth()

// カウンターデータを独立管理
const { data: counterData, loading, saveData, autoSave} = useFirebaseData('counterData', {
  counterBig: 0,
  counterMid: 0
})

// リセット機能
const resetAll = () => {
  counterData.value.counterBig = 0
  counterData.value.counterMid = 0
  playSound('reset')
  alert('カウンターをリセットしました')
}

// カウンター追加機能
const addCounter = () => {
  // 今は大と中の2つだけなので、追加はできない
  // alert('現在はカウンターの追加はできません')
  playSound('add')
}

const removeCounter = () => {
  // 今は大と中の2つだけなので、削除はできない
  // alert('現在はカウンターの削除はできません')
  playSound('remove')
}

// 初期化
const sounds = ref({
  // counter: new Audio('/sound-effect/mario-coin-sound-effect.mp3'),
  reset: new Audio('/public/sound-effect/10-mario-died.mp3'),
  add: new Audio('/public/sound-effect/1up-sound-Trimmed by FlexClip.mp3'),
  remove: new Audio('/public/sound-effect/10-mario-died.mp3'),
})

const playSound = (type) => {
  sounds.value[type].currentTime = 0
  sounds.value[type].play()
}

watch(counterData, () => autoSave(), { deep: true })

</script>

<template>

    <!-- カウンターページ -->
      <h1>カウンター</h1>
      <ButtonCounter v-model="counterData.counterBig" label="大" />
      <ButtonCounter v-model="counterData.counterMid" label="中" />
      <p>大 = {{ counterData.counterBig }}, 中 = {{ counterData.counterMid }}</p>
      <button @click="resetAll" class="counter-reset">カウンターリセット</button>

      <button @click="removeCounter" class="remove-btn">
        🚮
        <!-- 追加 -->
      </button>

      <button @click="addCounter" class="add-btn">
        <Plus size="40" />
        <!-- 追加 -->
      </button>

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
  /* margin-top: 1%; */
}

.counter-reset:active {
  transform: translateY(2px);  /* 下に2px動く、他の要素には影響なし */ 
}

.add-btn {
  /* margin-right: 60px; */
  margin-left: auto;   /* 右端に寄せる */
  background-color: blue; /* 青色 */
  color: white;               /* 文字色を白に */
  border-color: black;
  padding: 8px 8px;
  /* font-size: 50px; */
  display: flex;
  align-items: center;
  gap: 5px;
  border-radius: 50%;
  position: fixed;
  bottom: 180px;   /* 下から180px（ナビバーを避ける） */
  right: 40px;
  z-index: 50;
  
}

.add-btn:active {
  transform: translateY(2px);  /* 下に2px動く、他の要素には影響なし */ 
}

.remove-btn {
  /* margin-right: 60px; */
  margin-right: auto;   /* 左端に寄せる */
  background-color: gray; /* 灰色 */
  /* color: white;               文字色を白に */
  border-color: black;
  padding: 8px 8px;
  /* font-size: 50px; */
  display: flex;
  align-items: center;
  gap: 5px;
  border-radius: 50%;
  position: fixed;
  bottom: 180px;   /* 下から180px（ナビバーを避ける） */
  left: 40px;
  z-index: 50;
  font-size: 30px;
  
}
</style>