<script setup>
//やりたいこと

// console.log('🔴🔴🔴 Memo.vue が読み込まれました 🔴🔴🔴')

import { ref, watch } from 'vue'
import { useAuth } from '../composables/useAuth.js'
import { useFirebaseData } from '../composables/useFirebaseData'
import emailjs from '@emailjs/browser'
import { db } from '../firebase.js'
import { ref as dbRef, get } from 'firebase/database'

// どのコンポーネントでも
const { user } = useAuth()

const { data: memoData, loading, saveData, autoSave} = useFirebaseData('memoData', {
  memoText1: ''
})

// console.log('🟢🟢🟢 Memo.vue: memoData initialized', memoData.value, '🟢🟢🟢')

const sendingEmail = ref(false)
const userName = ref('')

// メール設定
const emailServiceId = import.meta.env.VITE_EMAILJS_SERVICE_ID
const emailTemplateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID
const emailPublicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY

// ユーザー名読み込み
const loadUserName = async () => {
  if (!user.value) return
  const path = `users/${user.value.uid}/profile`
  const snapshot = await get(dbRef(db, path))
  if (snapshot.exists()) {
    userName.value = snapshot.val().userName || ''
  }
}



const sendMemoEmail = async () => {
  if (!user.value) {
    alert('ログインしてください')
    return
  }
  if (!memoData.memoText1.trim()) {
    alert('メモが空です')
    return
  }
  if (!emailServiceId || !emailTemplateId || !emailPublicKey) {
    alert('メール送信の設定が不足しています。VITE_EMAILJS_SERVICE_ID / VITE_EMAILJS_TEMPLATE_ID / VITE_EMAILJS_PUBLIC_KEY を設定してください。')
    return
  }

  sendingEmail.value = true

  try {
    await loadUserName() // 最新データを読み込む
    const sendTime = new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' }) // 送信時刻（日本時間）
    await emailjs.send(
      emailServiceId,
      emailTemplateId,
      {
        userName: userName.value || 'ユーザー',
        to_email: user.value.email,
        memo_text: memoData.memoText1,
        from_email: user.value.email,
        send_time: sendTime
      },
      { publicKey: emailPublicKey }
    )
    
    alert('メモをメールで送信しました')
  } catch (e) {
    console.error('メール送信エラー:', e)
    alert('メール送信に失敗しました: ' + (e.text || e.message || e))
  } finally {
    sendingEmail.value = false
  }
}


watch(memoData, () => {
  // console.log('🔵🔵🔵 Memo.vue: watch triggered, memoText1 =', memoData.value.memoText1, '🔵🔵🔵')
  // console.log('🔵🔵🔵 Memo.vue: calling autoSave() 🔵🔵🔵')
  autoSave()
}, { deep: true })


</script>



<template>

    <!-- メモページ -->
      <h1>メモ帳</h1>
      <textarea v-model="memoData.memoText1" placeholder="メモを書いてください" rows="10" cols="30"></textarea>
      <!-- <p>メモ内容: {{ memoText }}</p> -->
      <p>※メモ内容は自動保存されます</p>
      
      <button @click="sendMemoEmail" :disabled="sendingEmail" class="send-email-button">
        {{ sendingEmail ? '送信中...' : 'メモをメールで送信' }}
      </button>

</template>

<style scoped>

textarea {
  margin-top: 10px;
  font-size: 16px;
  padding: 10px;
}

.send-email-button {
  margin-top: 0px;
  padding: 10px 8px;
  font-size: 15px;
  background-color: #4CAF50;
  color: white;
  /* border: none; */
  border-radius: 10px;
  width: 160px;           /* ← 幅を指定 */
  height: 45px;           /* ← 高さを指定 */
  font-size: 15px;      /* ← フォントサイズを指定 */
  cursor: pointer;
}

.send-email-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

</style>