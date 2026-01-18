<script setup>
//やりたいこと
// 複数のユーザーと同時編集、そのための招待機能
// タブを任意の数追加して、各タブで独立したメモを保存・編集できるようにする
// ラインやメールでメモを送信する機能に、宛先設定や未設定の場合の表示を追加する

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
  if (!memoData.value.memoText1.trim()) {
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
        memo_text: memoData.value.memoText1,
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

// LINE Messaging API 送信
const lineUserId = ref('')
const sendingLine = ref(false)

// LINE User IDをFirebaseから読み込む
const loadLineUserId = async () => {
  if (!user.value) return
  try {
    const path = `users/${user.value.uid}/lineProfile`
    const snapshot = await get(dbRef(db, path))
    if (snapshot.exists()) {
      const lineProfile = snapshot.val()
      lineUserId.value = lineProfile.userId
      console.log('LINE プロフィール情報を読み込みました:', lineProfile)
    }
  } catch (e) {
    console.error('LINE プロフィール読み込みエラー:', e)
  }
}

// ログイン時にLINE User IDを読み込む
watch(user, async (newUser) => {
  if (newUser) {
    await loadLineUserId()
  }
}, { immediate: true })

const sendToLine = async () => {
  console.log('送信開始: user =', user.value, ', lineUserId =', lineUserId.value, ', memoText1 =', memoData.value.memoText1)

  if (!user.value) {
    alert('ログインしてください')
    return
  }
  if (!memoData.value.memoText1?.trim()) {
    alert('メモが空です')
    console.log('メモ内容:', memoData.value.memoText1) // デバッグ用ログ
    return
  }
  if (!lineUserId.value || !lineUserId.value.trim()) {
    alert('LINE User ID を入力してください')
    return
  }

  sendingLine.value = true

  try {
    const response = await fetch('/api/send-memo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        uid: user.value.uid,
        memoText: memoData.value.memoText1,
        lineUserId: lineUserId.value
      })
    })

    console.log('レスポンスステータス:', response.status)
    const responseText = await response.text()
    console.log('レスポンスボディ:', responseText)
    let result = {}
    try {
      result = JSON.parse(responseText)
    } catch (parseError) {
      console.error('JSON パース失敗:', parseError)
      console.error('レスポンスボディ:', responseText)
      alert('LINE API からのレスポンスが無効です: ' + responseText)
      return
    }

    console.log('APIレスポンス:', result)

    if (!response.ok) {
      alert('LINE 送信失敗: ' + (result.error || 'エラー'))
      console.error('LINE送信エラー:', result)
      return
    }

    alert('メモを LINE で送信しました')
  } catch (e) {
    console.error('LINE 送信エラー:', e)
    alert('LINE 送信に失敗しました: ' + (e.message || e))
  } finally {
    sendingLine.value = false
  }
}

watch(memoData, () => {
  autoSave()
}, { deep: true })

</script>

<template>
  <div class="memo-container">
    <h1>メモ帳</h1>
    <textarea v-model="memoData.memoText1" placeholder="メモを書いてください" rows="10" cols="30"></textarea>
    <p>※メモ内容は自動保存されます</p>
    
    <button @click="sendMemoEmail" :disabled="sendingEmail" class="send-email-button">
      {{ sendingEmail ? '送信中...' : 'メモをメールで送信' }}
    </button>
    
    <div class="line-section">
       <!-- Messaging API  -->
      <!-- <h3>LINE で送信</h3> -->
      <!-- <p class="hint"> -->
        <!-- LINE 公式アカウントを友だち追加後、User ID を入力してください -->
        <!-- <br> -->
        <!-- <small>※User ID の取得方法は <a href="https://developers.line.biz/ja/docs/messaging-api/getting-user-ids/" target="_blank">こちら</a></small> -->
      <!-- </p> -->
      <!-- <input 
        v-model="lineUserId" 
        type="text" 
        placeholder="LINE User ID を入力（例: U1234567890abcdef...）"
        class="token-input"
      /> -->
      <!-- <small>下記QRコードから公式アカウントを友だち追加してください</small> -->
      <br>
      <a href="https://qr-official.line.me/gs/M_182rbcup_GW.png?oat_content=qr" target="_blank" rel="noreferrer noopener">
        公式アカウント追加用QRを開く
      </a>
      <a href="https://lin.ee/XJ4T6SlL"><img src="https://scdn.line-apps.com/n/line_add_friends/btn/ja.png" alt="友だち追加" height="36" border="0"></a>
      <br>
      <img src="/image/S_gainfriends_2dbarcodes_GW.png"/>
      <br>
      <button @click="sendToLine" :disabled="sendingLine || !user" class="send-line-button">
        {{ sendingLine ? '送信中...' : 'メモをLINEに送信' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.memo-container {
  padding: 0px;
  margin-left: 30px;
  margin-right: 30px;
}

textarea {
  margin-top: 0px;
  font-size: 16px;
  padding: 10px;
  width: 100%;
  max-width: 500px;
}

.send-email-button {
  margin-top: 10px;
  padding: 10px 15px;
  font-size: 15px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  min-width: 160px;
  height: 45px;
}

.send-email-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.line-section {
  margin-top: 30px;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 5px;
  background-color: #f9f9f9;
}

.hint {
  font-size: 12px;
  color: #666;
  margin: 10px 0;
}

.hint a {
  color: #06c755;
  text-decoration: none;
}

.hint a:hover {
  text-decoration: underline;
}

.token-input {
  width: 100%;
  padding: 8px;
  margin-bottom: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
}

.send-line-button {
  padding: 10px 15px;
  font-size: 14px;
  background-color: #06c755;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  width: 100%;
}

.send-line-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

</style>