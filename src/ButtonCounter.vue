<script setup>
import { defineProps, defineEmits } from 'vue'
// import { watch } from 'vue'
// watch([counterBig, counterMid, memoText], () => { saveData() })

const { modelValue, label } = defineProps({
  modelValue: Number,
  label: String
})
const emit = defineEmits(['update:modelValue'])

const increase = () => emit('update:modelValue', modelValue + 1)
</script>

<template>
  <button @click="increase">
    {{ label }}: {{ modelValue }}
  </button>
</template>

<style scoped>
button {
  padding: 10px 20px;
  font-size: 18px;
  margin: 5px;
}
</style>
