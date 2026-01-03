<script setup>
//やりたいこと
// コードの理解、色塗りページの追加　
// firebase認証、firestoreによるデータ保存
// ホーム画面を作成することで、各ページに遷移できるようにするかつ、リンクとして機能させる
// プロフィール設定画面を独立して作成する
// データベースに保存された情報を、認証されたユーザーのメールアドレスに送信する
// UIきれいにしたい
// プロフィール情報を増やす
// それぞれのページごとにファイルを独立させる


// 塗り絵を、任意の画像でできるようにする(canvas)
// バックエンド（サーバ側）をさわる
// ログイン時メールアドレスの本人確認
// LINEログイン認証


// デプロイ先URL
// https://my-app-memo-counter-coloring.vercel.app/

import { ref } from 'vue'
import emailjs from '@emailjs/browser'
// import ButtonCounter from './components/ButtonCounter.vue'
import Coloring from './views/Coloring.vue'
import Counter from './views/Counter.vue'
import Memo from './views/Memo.vue'
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



// ページ切替
const router = useRouter()
const route = useRoute()



const goHome = () => router.push('/')
const goCounter = () => router.push('/counter')
const goMemo = () => router.push('/memo')
const goColoring = () => router.push('/coloring')
const goProfile = () => router.push('/profile')


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

  <!-- ナビゲーション -->
  <div class="page">
    <!-- ホーム画面のページ -->
    <div v-if="route.path === '/home' || route.path === '/'">
      <h1>カウンタ・メモ・色塗りができます</h1>
    </div>


    <!-- カウンターページ -->
    <div v-else-if="route.path === '/counter'">
      <Counter />
      <div class="underline"></div>
    </div>

    <!-- メモページ -->
    <div v-else-if="route.path === '/memo'">
      <Memo />
      <div class="underline"></div>
    </div>


    <!-- 色塗りページ -->
    <div v-else-if="route.path === '/coloring'">
     
      <Coloring />
      <div class="underline"></div>
    </div>

    <!-- プロフィールページ -->
    <div v-else-if="route.path === '/profile'">
      <Profile />
      <div class="underline"></div>
    </div>

    <div class="nav">
      <button @click="goHome" title="ホーム"><img src="/image/icon_home.png" class="nav-icon"/></button>
      <button @click="goCounter" title="カウンタ"><img src="/image/icon_counter.JPG" class="nav-icon"/></button>
      <button @click="goMemo" title="メモ帳">📝</button>
      <button @click="goColoring" title="色塗り">🎨</button>
      <button @click="goProfile" title="プロフィール">👤</button>
    </div>



  </div>
</template>

<style>
.nav {
  display: flex;
  position: fixed;
  bottom: 0px;
  left: 0;
  right: 0;
  width: 97%;
  background-color: #fff;
  border-top: 1px solid #ddd;
  padding: 8px 1.5%;
  z-index: 100;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.15);
  justify-content: space-around;
  align-items: center;
}
.nav button {
  flex: 1 1 0;
  min-width: 0;
  margin: 0;
  padding: 8px 0;
  font-size: 12vw;
  background: none;
  border: none;
  cursor: pointer;
  touch-action: manipulation;
}
.nav button:hover {
  background: #f0f0f0;
  color: #000;
}

/* タブレット以上 */
@media (min-width: 768px) {
  .nav button {
    font-size: 32px;
    padding: 12px 0;
  }
}

/* PC以上 */
@media (min-width: 1024px) {
  .nav button {
    font-size: 36px;
    padding: 15px 0;
  }
}

.nav-icon {
  width: 78px;
  height: 79px;
  display: block;
}

/* スマホ用に相対サイズ */
/* @media (max-width: 767px) {
  .nav-icon {
    width: 8vw;
    height: 8vw;
  }
} */


.page {
  text-align: center;
  margin-top: 50px;
} 

.underline {
  margin-top: 400px; /* ナビゲーションバー分の余白を確保 */}
</style>
