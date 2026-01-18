<script setup>
import { defineProps, defineEmits, ref } from 'vue'
// import { watch } from 'vue'
// watch([counterBig, counterMid, memoText], () => { saveData() })

const { modelValue, label } = defineProps({
  modelValue: Number,
  label: String
})
const emit = defineEmits(['update:modelValue'])

const isHolding = ref(false)
let holdTimer = null
let holdStartTime = null

const increase = () => emit('update:modelValue', modelValue + 1)

// マウスダウン時
const handleMouseDown = () => {
  isHolding.value = true
  holdStartTime = Date.now()
  
  holdTimer = setTimeout(() => {
    // 1秒以上長押し → 継続加算開始
    const increaseInterval = setInterval(() => {
      if (!isHolding.value) {
        clearInterval(increaseInterval)
        return
      }
      emit('update:modelValue', modelValue + 1)
      // サウンド再生
      playSound('counter')
    }, 100) // 100ms ごとに +1
    
    // マウスアップ時にインターバルをクリアするため、タイマーIDを保存
    holdTimer = increaseInterval
  }, 1000) // 1秒待つ
}

// マウスアップ時
const handleMouseUp = () => {
  isHolding.value = false
  
  if (holdTimer) {
    clearTimeout(holdTimer)
    clearInterval(holdTimer)
  }
  
  // 1秒未満のクリック → 通常の +1
  const pressTime = Date.now() - holdStartTime
  if (pressTime < 1000) {
    increase()
    // サウンド再生
    playSound('counter')
  }
  
  holdTimer = null
}

const handleMouseLeave = () => {
  handleMouseUp()
}

// 初期化
const sounds = ref({
  counter: new Audio('/sound-effect/mario-coin-sound-effect.mp3'),
  // reset: new Audio('/sound-effect/10-mario-died.mp3'),
})

const playSound = (type) => {
  sounds.value[type].currentTime = 0
  sounds.value[type].play()
}

</script>

<template>
  <button 
    @mousedown="handleMouseDown"
    @mouseup="handleMouseUp"
    @mouseleave="handleMouseLeave"
    @touchstart="handleMouseDown"
    @touchend="handleMouseUp"
  >
    {{ label }}: {{ modelValue }}
  </button>
</template>

<style scoped>
button {
  padding: 20px 80px;
  font-size: 18px;
  margin: 30px;
  touch-action: manipulation;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  min-width: 120px;
}

button:active {
  opacity: 0.8;
  transform: translateY(2px);  /* 下に2px動く、他の要素には影響なし */
}

/* スマホ */
@media (max-width: 600px) {
  button {
    padding: 15px 60px;
    font-size: 16px;
    margin: 20px;
  }
}

/* タブレット */
@media (min-width: 601px) and (max-width: 1024px) {
  button {
    padding: 18px 70px;
    font-size: 17px;
  }
}

/* PC */
@media (min-width: 1025px) {
  button {
    padding: 20px 80px;
    font-size: 18px;
  }
}
</style>
