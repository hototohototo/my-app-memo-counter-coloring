<script setup>
// 出来たこと
// コードの理解、色塗りページの追加　
// firebase認証、firestoreによるデータ保存
// ホーム画面を作成することで、各ページに遷移できるようにするかつ、リンクとして機能させる
// プロフィール設定画面を独立して作成する
// データベースに保存された情報を、認証されたユーザーのメールアドレスに送信する
// UIきれいにしたい
// プロフィール情報を増やす
// それぞれのページごとにファイルを独立させる
// 塗り絵を、任意の画像でできるようにする(canvas)
// LINEログイン
// googleログイン



// やりたいこと
// バックエンド（サーバ側）をさわる
// ログイン時メールアドレスの本人確認
// LINEとfirebaseのカスタム認証
// ログインせずに入力してからログインした場合、どっちの情報を引き継ぐか選択できるようににする


// できなかったこと
// ラインログインができなかったのは、リダイレクトで戻ってくる時に
// ドメインが変わってしまってデータを取ってこれなかったかららしい→修正済み（リダイレクトじゃなくポップアップに変更）


// デプロイ先URL
// https://my-app-memo-counter-coloring.vercel.app/

import { ref, onMounted } from 'vue'
// イントロ動画表示制御

const showIntro = ref(false)
const showIntroOverlay = ref(false)
const introVideo = ref(null)
const fadeOut = ref(false)


const closeIntro = () => {
  console.log('[Intro] closeIntro called')
  fadeOut.value = true
  localStorage.setItem('introWatched', '1')
  // 0.7秒後にオーバーレイ非表示
  setTimeout(() => {
    showIntroOverlay.value = false
    showIntro.value = false
    fadeOut.value = false
  }, 700)
}

onMounted(() => {
  const watched = localStorage.getItem('introWatched')
  console.log('[Intro] onMounted, introWatched:', watched)
  if (!watched) {
    showIntro.value = true
    showIntroOverlay.value = true
    console.log('[Intro] showIntro set to true')
  } else {
    console.log('[Intro] showIntro remains false')
  }
})
import emailjs from '@emailjs/browser'
import Coloring from './views/Coloring.vue'
import Counter from './views/Counter.vue'
import Memo from './views/Memo.vue'
import Profile from './views/Profile.vue'
import { useRouter, useRoute } from 'vue-router'

import { auth, db } from './firebase.js'
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth'
// import { doc, setDoc, getDoc } from 'firebase/firestore'
import { ref as dbRef, set, get } from 'firebase/database'

import { watch } from 'vue'

import { createUserWithEmailAndPassword } from 'firebase/auth'

import { OAuthProvider, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult } from 'firebase/auth'

import { useAuth } from './composables/useAuth'
const { user } = useAuth()

// ユーザーIDをFirebaseに保存
// 初回のみ実行（アカウント作成日時を保存）
const saveData = async () => {
  if (!user.value) return
  try {
    const path = `users/${user.value.uid}/InitializedDate`
    const snapshot = await get(dbRef(db, path))
    if (!snapshot.exists()) {
      // 初回のみアカウント作成日時を保存
      const createdAt = new Date().toISOString()
      await set(dbRef(db, path), { createdAt })
      console.log('ユーザーIDの箱を作成しました:', user.value.uid, '作成日時:', createdAt)
    }
  } catch (e) {
    console.error('saveData error:', e)
  }
}

// Googleでログイン
const loginWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider()
    await signInWithPopup(auth, provider)
    await saveData()
  } catch (e) {
    alert('Googleログイン失敗: ' + e.message)
  }
}

// LINEでログイン
const loginWithLine = async () => {
  console.log('=== LINEログイン開始 ===')
  try {
    const provider = new OAuthProvider('oidc.line')
    provider.addScope('openid')
    provider.addScope('profile')
    provider.addScope('email') // 取得できない場合もあるのでUIはemail必須にしないこと
    console.log('LINEプロバイダー設定完了:', provider)
    
    console.log('ポップアップ開始...')
    const result = await signInWithPopup(auth, provider)
    console.log('LINEログイン成功:', result.user.uid)
    
    // LINE プロフィール情報をFirebaseに保存
    const credential = OAuthProvider.credentialFromResult(result)
    const accessToken = credential?.accessToken
    if (accessToken) {
      try {
        const profileResponse = await fetch('https://api.line.me/v2/profile', {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        })
        const profile = await profileResponse.json()
        if (profile.userId) {
          // LINEプロフィール情報をFirebaseに保存
          const path = `users/${result.user.uid}/lineProfile`
          await set(dbRef(db, path), {
            userId: profile.userId,
            displayName: profile.displayName || '',
            pictureUrl: profile.pictureUrl || '',
            statusMessage: profile.statusMessage || '',
          })
          // 表示用にプロフィール名を保持
          lineProfileName.value = profile.displayName || ''
          console.log('LINEプロフィール情報を保存:', profile)
          // 表示用にプロフィール画像URLを保持
          lineProfileImageUrl.value = profile.pictureUrl || ''
          console.log('LINEプロフィール画像URLを保持:', lineProfileImageUrl.value)
        }
      } catch (e) {
        console.error('LINE プロフィール取得エラー:', e)
      }
    }
    
    await saveData()
    
    // await signInWithRedirect(auth, provider) // モバイル向けはRedirectが安定
    // console.log('リダイレクト完了（このログは通常表示されない）')
    // デスクトップ中心なら:
    // await signInWithPopup(auth, provider)
  } catch (e) {
    console.error('LINEログインエラー詳細:', {
      message: e.message,
      code: e.code,
      stack: e.stack,
      fullError: e
    })
    alert('LINEログイン失敗: ' + e.message)
  }
}

const lineRedirectProcessing = ref(false)
const lineRedirectError = ref('')

// リダイレクト結果の処理（マウント時に1回実行）
const handleLineRedirect = async () => {
  console.log('=== リダイレクト結果チェック開始 ===')
  console.log('現在のURL:', window.location.href)
  console.log('URLパラメータ:', window.location.search)
  lineRedirectProcessing.value = true
  lineRedirectError.value = ''
  try {
    console.log('getRedirectResult呼び出し...')
    const result = await getRedirectResult(auth)
    console.log('LINE redirect result:', result)
    
    if (result) {
      console.log('リダイレクト結果あり:', {
        userUID: result.user?.uid,
        email: result.user?.email,
        providerId: result.providerId,
        operationType: result.operationType
      })
      if (result.user) {
        console.log('LINE user:', result.user.uid)
        console.log('ユーザー詳細:', {
          displayName: result.user.displayName,
          photoURL: result.user.photoURL,
          email: result.user.email
        })
        await saveData()
      }
    } else {
      console.log('リダイレクト結果なし（通常アクセスまたはリダイレクト未完了）')
    }
  } catch (e) {
    console.error('LINE redirect結果エラー詳細:', {
      message: e.message,
      code: e.code,
      stack: e.stack,
      fullError: e
    })
    lineRedirectError.value = e.message || String(e)
  } finally {
    lineRedirectProcessing.value = false
    console.log('=== リダイレクト結果チェック完了 ===')
  }
}

onMounted(() => {
  handleLineRedirect()
})

// ユーザー新規登録
const signup = async () => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email.value, password.value)
    console.log('signup success', userCredential.user.uid)
    // ユーザーIDの箱を作成
    await saveData()
  } catch (error) {
    alert('ユーザー作成失敗: ' + error.message)
  }
}

// 認証状態
// const user = ref(null)
const email = ref('')
const password = ref('')
const userName = ref('')
const lineProfileName = ref('')
const lineProfileImageUrl = ref('')

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

// プロフィール・LINEプロフィール一括読み込み（1回のDB取得で反映）
const loadUserData = async () => {
  if (!user.value) return
  const path = `users/${user.value.uid}`
  const snapshot = await get(dbRef(db, path))
  if (!snapshot.exists()) return
  const data = snapshot.val() || {}
  // プロフィール名
  if (data.profile && typeof data.profile.userName === 'string') {
    userName.value = data.profile.userName || ''
  }
  // LINEプロフィール
  if (data.lineProfile) {
    lineProfileName.value = data.lineProfile.displayName || lineProfileName.value || ''
    lineProfileImageUrl.value = data.lineProfile.pictureUrl || ''
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

// loadUserName は残す
watch(user, (newUser) => {
  if (newUser) {
    loadUserData()
  }
}, { immediate: true })
</script>

<!-- /////////////////////////////////////////////////////////////////////////// -->

<template>
  <!-- イントロ動画（初回のみ） -->
  <div v-if="showIntroOverlay" :class="['intro-video-overlay', fadeOut ? 'fade-out' : '']" @click="closeIntro">
    <video
      ref="introVideo"
      class="intro-video"
      src="/video/StarAnimated.mp4"
      autoplay
      muted
      playsinline
      @ended="closeIntro"
    ></video>
  </div>

  <!-- ログインフォーム -->
  <div v-if="!user" class="login-form">
    <h2 style="margin: 0px; padding: 4px">ログイン</h2>
    <input v-model="email" type="email" placeholder="メールアドレス" />
    <input v-model="password" type="password" placeholder="パスワード" />
    <button @click="login">ログイン</button>
    <button @click="signup">新規登録</button>
    <button @click="loginWithGoogle" style="background: #4285f4; color: white;">Googleでログイン</button>
    <button @click="loginWithLine">LINEでログイン</button>
    <p v-if="lineRedirectProcessing" style="color:#555;">LINEログイン処理中...</p>
    <p v-if="lineRedirectError" style="color:red;">LINEログインエラー: {{ lineRedirectError }}</p>
  </div>
  <!-- メインアプリ -->
  <div v-else>
    <div class="user-info">
      <div class="user-left">
        <button @click="goHome" class="icon-btn">
        <img src="/image/ツールボックスアイコン.png"
          alt="アプリアイコン画像"
          class="header-icon"
        />
        </button>
        <small>ツールボックス</small>
        <div class="user-text">
          <small class="user-name">　　{{ lineProfileName || user.email || userName || "Unknown" }}</small>
        </div>
      </div>
      <div class="user-right">
        <button @click="goProfile" class="icon-btn">
        <img
          v-if="lineProfileImageUrl || user.photoURL"
          :src="lineProfileImageUrl || user.photoURL"
          alt="プロフィール画像"
          class="avatar"
        />
        </button>
        <button class="logout-btn" @click="logout">ログアウト</button>
      </div>
    </div>

  </div>  

  <!-- ナビゲーション -->
  <div class="page">
    <!-- ホーム画面のページ -->
    <div v-if="route.path === '/home' || route.path === '/'" 
    class="page-home">
      <h1>カウンタ・メモ・色塗りができますよ</h1>
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

.intro-video-overlay {
  position: fixed;
  z-index: 9999;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: #000c;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}
.fade-out {
  animation: fadeOutOverlay 0.7s forwards;
}

@keyframes fadeOutOverlay {
  0% {
    opacity: 1;
    pointer-events: auto;
  }
  100% {
    opacity: 0;
    pointer-events: none;
  }
}
.intro-video {
  width: 100vw;
  height: 100vh;
  object-fit: cover;
  border-radius: 0;
  box-shadow: none;
}

/* スマホ用に相対サイズ */
/* @media (max-width: 767px) {
  .nav-icon {
    width: 8vw;
    height: 8vw;
  }
} */

.login-form {
  /* max-width: 320px; */
  /* margin: 100px auto; */
  /* padding-top: 16px; */
  border: 1px solid #ddd;
  border-radius: 8px;
  background: #f9f9f9;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.page {
  text-align: center;
  /* padding-top: 50px; */
} 

.page-home {
  background-image: url('image/backgroundImage.webp');
  background-repeat: repeat;
  background-attachment: fixed;
  background-size: 100% auto;
  min-height: 100vh;
  padding-top: 100px;
}

.underline {
  padding-bottom: 400px; /* ナビゲーションバー分の余白を確保 */}


.header-icon {
  width: 56px;
  height: 56px;
  border-radius: 30%;
  margin-right: 0px;
}

.user-info {
  display: flex;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 2px 1.5%;
  background-color: #fff;
  border-bottom: 1px solid #ddd;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 100;
}

.user-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-right {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
}

.user-text {
  /* margin-left: auto;   右端に寄せる */
  display: flex;
  flex-direction: column;
  line-height: 1.4;
}

.user-name {
  margin: 0;
  font-weight: 600;
  font-size: 12px;
}

/* .user-sub {
  margin: 0;
  font-size: 10px;
  color: #666;
} */

.icon-btn {
  outline: none;
  border: none;
  background: none;
  cursor: pointer;
  padding: 0;
}

.icon-btn:active {
  opacity: 0.9;         /* わずかに透明に（または何もしない） */
}

.logout-btn {
  padding: 3px 10px;
  font-size: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: #f9f9f9;
  cursor: pointer;
  white-space: nowrap;
}

.logout-btn:hover {
  background: #e8e8e8;
}
</style>
