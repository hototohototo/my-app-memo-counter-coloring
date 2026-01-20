<script setup lang="ts">
import { Trash2 } from 'lucide-vue-next'

interface Counter {
  name: string
  count: number
}

const props = defineProps<{
  show: boolean
  counterArray: Counter[]
}>()

const emit = defineEmits<{
  close: []
  delete: [index: number]
}>()

</script>

<template>
  <div v-if="show" @click="emit('close')" class="modal-overlay">
    <div @click.stop class="modal-content">
        <div style="margin-top: 50px;"></div>
      <h2>削除モード</h2>
      <div class="counter-list">
        <div v-for="(counter, index) in counterArray" :key="index" class="counter-item">
          <span>{{ counter.name }} ({{ counter.count }})</span>
          <button @click="emit('delete', index)" class="delete-btn">
            <Trash2 :size="20" />
          </button>
        </div>
      </div>
      <div class="button-container">
        <button @click="emit('close')" class="close-btn">終了</button>
      </div>
      <div style="margin-top: 200px;"></div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(0, 0, 0, 0.5);
}

.modal-content {
  width: 70%;
  max-height: 80%;
  border: 3px solid black;
  background: white;
  padding: 30px;
  font-size: 18px;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  overflow-y: auto;
}

h2 {
  margin: 0;
  text-align: center;
}

.counter-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.counter-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  background: #f9f9f9;
}

.delete-btn {
  background-color: #ff6b6b;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 5px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
}

.delete-btn:hover {
  background-color: #ff5252;
}

.delete-btn:active {
  transform: translateY(2px);
}

.button-container {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 10px;
}

.close-btn {
  background-color: #4CAF50;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
}

.close-btn:hover {
  background-color: #45a049;
}

.close-btn:active {
  transform: translateY(2px);
}

</style>
