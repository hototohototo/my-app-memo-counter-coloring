<!-- <script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
//   modelValue: Number,
  label: String,
  value: Number  // 追加: クリック時にセットする値
})
const emit = defineEmits(['update:modelValue'])

const select = () => emit('update:modelValue', props.value)
</script>

<template>
  <button @click="select">
    {{ label }}
  </button>
</template>

<style scoped>
button {
  padding: 10px 20px;
  font-size: 18px;
  margin: 5px;
}
</style> -->
