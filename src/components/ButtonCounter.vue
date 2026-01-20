<script setup>
import { defineProps, defineEmits, ref, onMounted } from 'vue'
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
let isProcessing = false  // 重複処理を防ぐ

const increase = () => emit('update:modelValue', modelValue + 1)

// ポインターダウン時
const handlePointerDown = () => {
  if (isProcessing) return  // 処理中なら無視
  
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
      playSound('counter')
    }, 100)
    
    holdTimer = increaseInterval
  }, 1000)
}

// ポインターアップ時
const handlePointerUp = () => {
  if (!isHolding.value) return  // まだダウンしていなければ無視
  
  isHolding.value = false
  
  if (holdTimer) {
    clearTimeout(holdTimer)
    clearInterval(holdTimer)
  }
  
  // 1秒未満 → 通常の +1（1回のみ）
  const pressTime = Date.now() - holdStartTime
  if (pressTime < 1000) {
    isProcessing = true
    increase()
    playSound('counter')
    setTimeout(() => { isProcessing = false }, 50)  // 50ms後に再度有効化
  }
  
  holdTimer = null
}

// 初期化
const sounds = ref({
  counter: new Audio('/sound-effect/mario-coin-sound-effect-Trimmed by FlexClip.mp3'),
  // reset: new Audio('/sound-effect/10-mario-died.mp3'),
})

const playSound = (type) => {
  sounds.value[type].currentTime = 0
  sounds.value[type].play()
}

</script>

<template>
  <button 
    @pointerdown="handlePointerDown"
    @pointerup="handlePointerUp"
    @pointerleave="handlePointerUp"
  >
    {{ label }}: {{ modelValue }}
  </button>
</template>

<style scoped>
button {
  padding: 20px 80px;
  font-size: 18px;
  /* font-size: auto; */
  margin: 30px;
  touch-action: manipulation;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  min-width: 120px;
  user-select: none;  /* 長押し時のテキスト選択を無効化 */
  -webkit-user-select: none;  /* iOS Safari対応 */
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
