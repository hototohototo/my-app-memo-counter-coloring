 <script setup lang="ts">
//やりたいこと
// カウント対象を追加するボタンを作成して、任意の数のカウンターを追加できるようにする


import { watch, ref, computed } from 'vue'
import ButtonCounter from '../components/ButtonCounter.vue'
import AddCounter from '../components/EditCounter.vue'
import DeleteCounterMode from '../components/DeleteCounterMode.vue'
// import { useAuth } from '../composables/useAuth.js'
import { useFirebaseData } from '../composables/useFirebaseData'
// import { createUserWithEmailAndPassword } from 'firebase/auth'

// import { Plus, Trash2Icon } from "lucide-vue-next"


// // どのコンポーネントでも
// const { user } = useAuth()

// カウンターデータを独立管理
const { data: counterData, loading, saveData, autoSave} = useFirebaseData('counterData', {
  // counterBig: 0,
  // counterMid: 0,
  counterArray: [
    { name: 'サンプル_1', count: 0 },
    { name: 'サンプル_2', count: 0 }
  ]
})

type Counter = {
  name: string;
  count: number;
}

// useFirebaseData の counterArray を使用
const counterArray = computed(() => counterData.value.counterArray as Counter[])

// AddCounterモーダルの表示状態
const showAddCounter = ref(false)
const showDeleteMode = ref(false)

// モーダルを開く
const editMode = () => {
  showAddCounter.value = true
}

// 削除モードを開く
const openDeleteMode = () => {
  // playSound('remove')
  showDeleteMode.value = true
}

// リセット機能
const resetAll = () => {
  playSound('reset')
  counterData.value.counterBig = 0
  counterData.value.counterMid = 0
  counterData.value.counterArray.forEach((counter: Counter) => counter.count = 0)
  alert('カウンターをリセットしました')
}

// カウンター追加機能
const addCounterWithName = (name: string) => {
  if (name.trim()) {
    playSound('add')
    counterData.value.counterArray.push({ name: name.trim(), count: 0 })
    showAddCounter.value = false
  }
}

// 指定インデックスのカウンターを削除
const deleteCounterAt = (index: number) => {
  playSound('remove')
  counterData.value.counterArray.splice(index, 1)
}

// 初期化
const sounds = ref({
  // counter: new Audio('/sound-effect/mario-coin-sound-effect.mp3'),
  reset: new Audio('/sound-effect/10-mario-died.mp3'),
  add: new Audio('/sound-effect/1up-sound-Trimmed by FlexClip.mp3'),
  remove: new Audio('/sound-effect/10-mario-died.mp3'),
})

const playSound = (type: 'reset' | 'add' | 'remove') => {
  sounds.value[type].currentTime = 0
  sounds.value[type].play()
}

watch(counterData, () => autoSave(), { deep: true })

</script>

<template>

    <!-- カウンターページ -->
      <h1>カウンター</h1>
      <!-- <ButtonCounter v-model="counterData.counterBig" label="大" />
      <ButtonCounter v-model="counterData.counterMid" label="中" /> -->
      <ButtonCounter 
        v-for="(counter, index) in counterArray" 
        :key="index"
        v-model="counter.count" 
        :label="counter.name"  
      />
      <br/>
      <!-- <p>大 = {{ counterData.counterBig }}, 中 = {{ counterData.counterMid }} -->
        <span v-for="(counter, index) in counterArray" :key="index">
          {{ counter.name }} = {{ counter.count }}<span v-if="index < counterArray.length - 1">, </span>
        </span>
      <!-- </p> -->
       <br/>
      <button @click="resetAll" class="counter-reset">カウンターリセット</button>

      <!-- <button @click="removeCounter" class="remove-btn">
         🚮
      </button> -->
      

      <button @click="editMode" class="add-btn" style="font-size: 30px;">
        <!-- <Plus :size="40" /> -->
        🖊
      </button>

      <AddCounter :show="showAddCounter" @close="showAddCounter = false" 
      @add="addCounterWithName" @remove="openDeleteMode"/>

      <DeleteCounterMode :show="showDeleteMode" :counterArray="counterArray" 
      @close="showDeleteMode = false" @delete="deleteCounterAt" />

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
  background-color: rgb(230, 0, 255); /* 青色 */
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
.remove-btn:active {
  transform: translateY(2px);  /* 下に2px動く、他の要素には影響なし */ 
}

</style>