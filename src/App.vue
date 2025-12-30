<script setup>
//やりたいこと
// コードの理解、色塗りページの追加　
// firebase認証、firestoreによるデータ保存
// ホーム画面を作成することで、各ページに遷移できるようにするかつ、リンクとして機能させる
// プロフィール設定画面を独立して作成する
// データベースに保存された情報を、認証されたユーザーのメールアドレスに送信する


// デプロイ先URL
// https://my-app-memo-counter-coloring.vercel.app/

// console.log('EMAILJS SERVICE_ID:', import.meta.env.VITE_EMAILJS_SERVICE_ID)
// console.log('EMAILJS TEMPLATE_ID:', import.meta.env.VITE_EMAILJS_TEMPLATE_ID)
// console.log('EMAILJS PUBLIC_KEY:', import.meta.env.VITE_EMAILJS_PUBLIC_KEY)

import { ref } from 'vue'
import emailjs from '@emailjs/browser'
import ButtonCounter from './components/ButtonCounter.vue'
import Profile from './views/Profile.vue'
// import SelectColor from './SelectColor.vue'
import { useRouter, useRoute } from 'vue-router'



import { auth, db } from './firebase.js'
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth'
// import { doc, setDoc, getDoc } from 'firebase/firestore'
import { ref as dbRef, set, get } from 'firebase/database'

import { watch } from 'vue'

import { createUserWithEmailAndPassword } from 'firebase/auth'

// ユーザー新規登録
const signup = async () => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email.value, password.value)
    console.log('signup success', userCredential.user.uid)
    // 必要なら初期データを作成
    await saveData()
  } catch (error) {
    alert('ユーザー作成失敗: ' + error.message)
  }
}


// 認証状態
const user = ref(null)
const email = ref('')
const password = ref('')
const userName = ref('')

// ログイン
const login = async () => {
  try {
    await signInWithEmailAndPassword(auth, email.value, password.value)
  } catch (error) {
    alert('ログイン失敗: ' + error.message)
  }
}

// ログアウト
const logout = () => {
  signOut(auth)
}

// 認証状態監視
onAuthStateChanged(auth, (currentUser) => {
  user.value = currentUser
  if (currentUser) {
    loadData()  // ログインしたらデータを読み込む
    loadUserName()
  }
})

// 保存
const saveData = async () => {
  if (!user.value) {
    console.log('saveData: no user')
    return
  }
  const path = `users/${user.value.uid}/appData`
  try {
    await set(dbRef(db, path), {
      counterBig: counterBig.value,
      counterMid: counterMid.value,
      memoText: memoText.value,
      counterBig2: counterBig2.value,
      counterMid2: counterMid2.value,
      window1Color: window1Color.value,
      window2Color: window2Color.value
    })
    console.log('saveData: saved', path)
  } catch (e) {
    console.error('saveData error:', e)
    alert('保存に失敗しました: ' + (e.message || e))
  }
}
// 読み込み
const loadData = async () => {
  if (!user.value) return
  const path = `users/${user.value.uid}/appData`
  const snapshot = await get(dbRef(db, path))
  if (snapshot.exists()) {
    const data = snapshot.val()
    counterBig.value = data.counterBig || 0
    counterMid.value = data.counterMid || 0
    counterBig2.value = data.counterBig2 || 0
    counterMid2.value = data.counterMid2 || 0
    memoText.value = data.memoText || ''
    window1Color.value = data.window1Color || 'white'
    window2Color.value = data.window2Color || 'white'
    console.log('loadData: loaded', data)
  }
}

// ユーザー名読み込み
// ログイン時または必要なタイミングで Profile データを読み込む
const loadUserName = async () => {
  if (!user.value) return
  const path = `users/${user.value.uid}/profile`
  const snapshot = await get(dbRef(db, path))
  if (snapshot.exists()) {
    userName.value = snapshot.val().userName || ''
  }
}

// 状態は親で管理
const counterBig = ref(0)
const counterMid = ref(0)

const counterBig2 = ref(0)
const counterMid2 = ref(0)

const memoText = ref('')
const sendingEmail = ref(false)

const selectedColor = ref(0)
const window1Color = ref('white')
const window2Color = ref('white')

const resetAll = () => {
  counterBig.value = 0
  counterMid.value = 0
  counterBig2.value = 0
  counterMid2.value = 0
  // memoText.value = ''
  alert('カウンターをリセットしました')
}


const paintWindow1 = () => {
  if (selectedColor.value === 1) window1Color.value = 'red'//'#d32f2f'
  else if (selectedColor.value === 2) window1Color.value = 'blue'//'#3515d7'
  // saveData()
}

const paintWindow2 = () => {
  if (selectedColor.value === 1) window2Color.value = 'red'//'#d32f2f'
  else if (selectedColor.value === 2) window2Color.value = 'blue'//'#3515d7'
  // saveData()
}

const resetWindows = () => {
  window1Color.value = 'white'
  window2Color.value = 'white'
  alert('ウィンドウをリセットしました')
}

// メモをログイン中のユーザー宛にメール送信
const emailServiceId = import.meta.env.VITE_EMAILJS_SERVICE_ID
const emailTemplateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID
const emailPublicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY

const sendMemoEmail = async () => {
  if (!user.value) {
    alert('ログインしてください')
    return
  }
  if (!memoText.value.trim()) {
    alert('メモが空です')
    return
  }
  if (!emailServiceId || !emailTemplateId || !emailPublicKey) {
    alert('メール送信の設定が不足しています。VITE_EMAILJS_SERVICE_ID / VITE_EMAILJS_TEMPLATE_ID / VITE_EMAILJS_PUBLIC_KEY を設定してください。')
    return
  }

  sendingEmail.value = true

  try {
    await loadUserName()
    const sendTime = new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' }) // 送信時刻（日本時間）
    await emailjs.send(
      emailServiceId,
      emailTemplateId,
      {
        userName: userName.value || 'ユーザー',
        to_email: user.value.email,
        memo_text: memoText.value,
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

// ページ切替
const router = useRouter()
const route = useRoute()



const goHome = () => router.push('/')
const goCounter = () => router.push('/counter')
const goCounter2 = () => router.push('/counter2')
const goMemo = () => router.push('/memo')
const goColoring = () => router.push('/coloring')
const goProfile = () => router.push('/profile')
const red = () => selectedColor.value = 1
const blue = () => selectedColor.value = 2

let timer
watch([counterBig, counterMid, memoText, counterBig2, counterMid2, window1Color, window2Color], () => {
  clearTimeout(timer)
  timer = setTimeout(() => saveData(), 500)
})

</script>

<!-- /////////////////////////////////////////////////////////////////////////// -->

<template>

  <!-- ログインフォーム -->
  <div v-if="!user" class="login-form">
    <h2>ログイン</h2>
    <input v-model="email" type="email" placeholder="メールアドレス" />
    <input v-model="password" type="password" placeholder="パスワード" />
    <button @click="login">ログイン</button>
    <button @click="signup">新規登録</button>
  </div>
  <!-- メインアプリ -->
  <div v-else>
    <p>ようこそ、{{ user.email }} さん！ <button @click="logout">ログアウト</button></p>
  </div>  


  <div class="nav">
    <button @click="goHome">ホーム</button>
    <button @click="goCounter">カウンター</button>
    <button @click="goCounter2">カウンター2</button>
    <button @click="goMemo">メモ帳</button>
    <button @click="goColoring">色塗り</button>
    <button @click="goProfile">プロフィール</button>
    <button @click="resetAll" class="counter-reset">カウンターリセット</button>
  </div>

  <div class="page">
    <!-- ホーム画面のページ -->
    <div v-if="route.path === '/home' || route.path === '/'">
      <h1>カウンタ・メモ・色塗りができます</h1>
    </div>

    <!-- カウンターページ -->
    <div v-if="route.path === '/counter'">
      <h1>カウンター</h1>
      <ButtonCounter v-model="counterBig" label="大" />
      <ButtonCounter v-model="counterMid" label="中" />
      <p>大 = {{ counterBig }}, 中 = {{ counterMid }}</p>
    </div>

    <!-- カウンター2ページ -->
    <div v-else-if="route.path === '/counter2'">
      <h1>カウンター2</h1>
      <ButtonCounter v-model="counterBig2" label="大" />
      <ButtonCounter v-model="counterMid2" label="中" />
      <p>大2 = {{ counterBig2 }}, 中2 = {{ counterMid2 }}</p>
    </div>

    <!-- メモページ -->
    <div v-else-if="route.path === '/memo'">
      <h1>メモ帳</h1>
      <textarea v-model="memoText" @input="saveData" placeholder="メモを書いてください" rows="10" cols="30"></textarea>
      <p>メモ内容: {{ memoText }}</p>
      <button @click="sendMemoEmail" :disabled="sendingEmail" class="send-email-button">
        {{ sendingEmail ? '送信中...' : 'メモをメールで送信' }}
      </button>
    </div>


    <!-- 色塗りページ -->
    <div v-else-if="route.path === '/coloring'">
      <h1>色塗り</h1>
      <button @click="red" label="赤" class="coloring-select-red">赤</button>
      <button @click="blue" label="青" class="coloring-select-blue">青</button>
      <p>選択中の色: {{ selectedColor === 1 ? '赤' : selectedColor === 2 ? '青' : 'なし' }}</p>
      <button @click="resetWindows">ウィンドウリセット</button>
    
      <div class="windows">
      <div class="color-window" :style="{ backgroundColor: window1Color }" @click="paintWindow1">
        ウィンドウ1 (クリックして塗る)
      </div>
      <div class="color-window" :style="{ backgroundColor: window2Color }" @click="paintWindow2">
        ウィンドウ2 (クリックして塗る)
      </div>
    </div>
    </div>

    <!-- プロフィールページ -->
    <div v-else-if="route.path === '/profile'">
      <Profile />
    </div>
  </div>
</template>

<style>
.nav {
  text-align: center;
  margin-top: 30px;
}
.nav button {
  margin: 5px;
  padding: 10px 15px;
  font-size: 16px;
  cursor: pointer;
}

.page {
  text-align: center;
  margin-top: 50px;
}
textarea {
  font-size: 16px;
  padding: 5px;
}

.counter-reset {
  background-color: #3515d7; /* 赤色 */
  color: white;               /* 文字色を白に */
  border: none;
  border-radius: 5px;
}

.counter-reset:hover {
  background-color: #d32f2f; /* ホバー時に少し濃く */
}


.coloring-select-red {
  background-color: #d32f2f; /* 赤色 */
  color: white;               /* 文字色を白に */
  border: none;
  border-radius: 5px;
  margin: 5px;
  padding: 10px 15px;
}
.coloring-select-red:hover {
  color: black; /* ホバー時に文字色を黒に */
}

.coloring-select-blue {
  background-color: #3515d7; /* 赤色 */
  color: white;               /* 文字色を白に */
  border: none;
  border-radius: 5px;
  margin: 5px;
  padding: 10px 15px;
}
.coloring-select-blue:hover {
  color: black; /* ホバー時に文字色を黒に */
}


.windows {
  display: flex;
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

.send-email-button {
  margin-top: 15px;
  padding: 10px 16px;
  font-size: 15px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 5px;
}

.send-email-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

</style>
