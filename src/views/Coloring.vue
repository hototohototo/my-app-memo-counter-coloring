 <script setup>
//やりたいこと
import { ref } from 'vue'
import { watch } from 'vue'
import { useAuth } from '../composables/useAuth.js'
import { useFirebaseData } from '../composables/useFirebaseData'

// import { Plus, Trash2Icon } from "lucide-vue-next";　


// // どのコンポーネントでも
const { user } = useAuth()

// カウンターデータを独立管理
const { data: coloringData, loading, saveData, autoSave} = useFirebaseData('coloringData', {
    window1Color: 'white',
    window2Color: 'white'
})

// リセット機能
const resetAll = () => {
  coloringData.value.window1Color = 'white'
  coloringData.value.window2Color = 'white'
  alert('カウンターをリセットしました')
}

const selectedColor = ref(0)
// const window1Color = ref('white')
// const window2Color = ref('white')
const red = () => selectedColor.value = 1
const blue = () => selectedColor.value = 2



const paintWindow1 = () => {
  if (selectedColor.value === 1) coloringData.value.window1Color = 'red'//'#d32f2f'
  else if (selectedColor.value === 2) coloringData.value.window1Color = 'blue'//'#3515d7'
  // saveData()
}

const paintWindow2 = () => {
  if (selectedColor.value === 1) coloringData.value.window2Color = 'red'//'#d32f2f'
  else if (selectedColor.value === 2) coloringData.value.window2Color = 'blue'//'#3515d7'
  // saveData()
}

const resetWindows = () => {
  coloringData.value.window1Color = 'white'
  coloringData.value.window2Color = 'white'
  alert('ウィンドウをリセットしました')
}


watch(coloringData, () => autoSave(), { deep: true })

</script>

<template>

    <!-- 色塗りページ -->
      <h1>色塗り</h1>
      <button @click="red" label="赤" class="coloring-select-red">赤</button>
      <button @click="blue" label="青" class="coloring-select-blue">青</button>
      <p>選択中の色: {{ selectedColor === 1 ? '赤' : selectedColor === 2 ? '青' : 'なし' }}</p>
      <button @click="resetWindows">ウィンドウリセット</button>
    
      <div class="windows">
        <div class="color-window" :style="{ backgroundColor: coloringData.window1Color }" @click="paintWindow1">
            ウィンドウ1 (クリックして塗る)
        </div>
        <div class="color-window" :style="{ backgroundColor: coloringData.window2Color }" @click="paintWindow2">
            ウィンドウ2 (クリックして塗る)
        </div>  
      </div>
     

</template>


<style scoped>

.coloring-select-red {
  background-color: red; /* 赤色 */
  color: white;               /* 文字色を白に */
  border: none;
  border-radius: 5px;
  margin: 4px;
  padding: 20px 30px;
}
.coloring-select-red:hover {
  color: black; /* ホバー時に文字色を黒に */
}

.coloring-select-blue {
  background-color: blue; /* 青色 */
  color: white;               /* 文字色を白に */
  border: none;
  border-radius: 5px;
  margin: 4px;
  padding: 20px 30px;
}
.coloring-select-blue:hover {
  color: black; /* ホバー時に文字色を黒に */
}


.windows {
  display: flex;
  /* margin-bottom: 400px; */
  justify-content: center;
  gap: 20px;
}
.color-window {
  width: 200px;
  height: 200px;
  border: 2px solid #000;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  cursor: pointer;
  color: black;
}
</style>


