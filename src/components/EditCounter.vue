<script setup>
// やりたいこと
// このモードに、削除モード、追加モードを統合する

import { defineProps, defineEmits, ref } from 'vue'

const props = defineProps({
  show: Boolean
})

const emit = defineEmits(['close', 'add', 'remove'])

const counterName = ref('')

</script>

<template>
  <div v-if="show" @click="emit('close')" class="modal-overlay">
    <div @click.stop class="modal-content">
      <!-- <p>AddCounter</p> -->
      <p>名前:
       <input v-model="counterName" type="text" placeholder="追加するカウンタの名前を入力" 
       size="20" style="height: 40px; font-size: 15px; transform: translate(0,-15%);"/>
      </p><br/>
      <div class="button-container">
        <button @click="emit('remove')" class="button-right" style="background-color: orange; border-radius: 5px;">削除モード</button>
        <button @click="emit('add', counterName)" class="button-left">追加</button>
      </div>
    </div>
    <!-- <button @click="emit('close')">閉じる</button> -->
  </div>
</template>

<style scoped>
/* .editMode {
  position: fixed;
  background-color:white;
  top: 60%;
  left: 50%;
  transform: translate(-50%, -50%);
  border: 2px solid black;
  border-radius: 10px;
  padding: 20px;
  z-index: 100;

  display: flex;
  justify-content: center;
  align-items: center;
} */
 .modal-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(0,0,0,0.5);  /* 半透明背景 */
}

.modal-content {
  width: 50%;
  height: 35%;
  border: 3px solid black;
  background: white;
  padding: 50px;
  font-size: 30px;
  border-radius: 10px;
  text-align: left;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  overflow: hidden;  /* はみ出た内容を隠す */
}

button {
  padding: 10px 10px;
  font-size: 15px;
  margin: 0px;
  width: fit-content;
  height: 40px;
}

.button-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}

.button-right {
  margin-left: 0;
  margin-right: auto;  /* 左に寄せる */
}

.button-left {
  margin-left: auto;  /* 右に寄せる */
  margin-right: 0;
}

</style>

