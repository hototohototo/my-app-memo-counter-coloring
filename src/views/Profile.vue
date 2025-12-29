<script setup>

// やりたいこと
// ここのコードの理解


import { ref } from 'vue'
import { auth, db } from '../firebase.js'
import { onAuthStateChanged } from 'firebase/auth'
import { ref as dbRef, set, get } from 'firebase/database'

// 認証状態
const user = ref(null)

// プロフィール編集用の状態
const userName = ref('')

// ユーザー情報を監視 & データ読み込み
onAuthStateChanged(auth, async (currentUser) => {
  user.value = currentUser
  if (currentUser) {
    await loadProfile()
  }
})

// プロフィールデータを読み込む
const loadProfile = async () => {
  if (!user.value) return
  const path = `users/${user.value.uid}/profile`
  const snapshot = await get(dbRef(db, path))
  if (snapshot.exists()) {
    const data = snapshot.val()
    userName.value = data.userName || ''
  }
}

// プロフィールデータを保存
const saveProfile = async () => {
  if (!user.value) {
    alert('ログインしてください')
    return
  }
  const path = `users/${user.value.uid}/profile`
  try {
    await set(dbRef(db, path), {
      userName: userName.value
    })
    alert('プロフィールを保存しました')
    console.log('プロフィール保存成功:', userName.value)
  } catch (e) {
    console.error('プロフィール保存エラー:', e)
    alert('保存に失敗しました: ' + (e.message || e))
  }
}
</script>

<!-- /////////////////////////////////////////////////////////////////////////////////////// -->

<template>
  <div class="profile-page">
    <h1>プロフィール設定</h1>
    
    <div v-if="user" class="profile-content">
      <div class="profile-item">
        <label>メールアドレス</label>
        <p>{{ user.email }}</p>
      </div>

      <div class="profile-item">
        <label>ユーザー名</label>
        <input v-model="userName" type="text" placeholder="名前を入力" />
      </div>

      <button @click="saveProfile" class="save-button">保存</button>
    </div>

    <div v-else>
      <p>ログインしてください</p>
    </div>
  </div>
</template>

<style scoped>
.profile-page {
  text-align: center;
  padding: 20px;
}

.profile-content {
  max-width: 400px;
  margin: 0 auto;
}

.profile-item {
  margin: 20px 0;
  text-align: left;
}

.profile-item label {
  display: block;
  font-weight: bold;
  margin-bottom: 5px;
}

.profile-item input {
  width: 100%;
  padding: 8px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.save-button {
  margin-top: 20px;
  padding: 10px 30px;
  font-size: 16px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.save-button:hover {
  background-color: #45a049;
}
</style>
