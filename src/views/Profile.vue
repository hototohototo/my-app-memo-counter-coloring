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

const gender = ref('')
const height = ref('')
const age = ref('')
const comment = ref('')


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
    gender.value = data.gender || ''
    height.value = data.height || ''
    age.value = data.age || ''
    comment.value = data.comment || ''
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
      userName: userName.value,
      gender: gender.value,
      height: height.value,
      age: age.value,
      comment: comment.value,
    })
    alert('プロフィールを保存しました')
    console.log('プロフィール保存成功:', userName.value)
  } catch (e) {
    console.error('プロフィール保存エラー:', e)
    alert('保存に失敗しました: ' + (e.message || e))
  }
}



/** @typedef {{ label: string, name: string }} Label */
/** @type {import('vue').Ref<Label[]>} */
const genderCategory = ref([
  { label: 'men', name: '男性' },
  { label: 'women', name: '女性' },
  { label: 'other', name: 'その他' },
]);


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

      <div class="profile-item">
        <label>性別</label>
        <div class="radio-group">
          <label
            v-for="item in genderCategory"
            :key="item.label"
            class="flex items-center gap-2 cursor-pointer"
          >
          <span>{{ item.name }}
            <input
              v-model="gender"
              class="h-5 w-5"
              type="radio"
              name="gender"
              :value="item.label"
            />
            </span>
            <!-- <span>{{ item.name }}</span> -->
          </label>
        </div>

        <!-- <div class="profile-item"> -->
        <div class="profile-item">
          <label>身長</label>
            <div class = "height-input">
              <!-- <label> 身長 </label> -->
              <input v-model="height" type="number" min="0" max="300" 
              placeholder="身長を入力(cm)"/> 
              <span> cm</span>
            </div>
        </div>

        <div class="profile-item">
          <label>年齢</label>
            <div class = "height-input">
              <!-- <label> 身長 </label> -->
              <input v-model="age" type="number" min="0" max="150" 
              placeholder="年齢を入力"/> 
              <span> 歳</span>
            </div>
        </div>

        <div class="profile-item">
          <label>ひとこと</label>
            <div>
              <!-- <label> 身長 </label> -->
              <input v-model="comment" type="text" 
              placeholder="ひとこと入力"/>
            </div>
        </div>


        <!-- <input v-model="gender" type="radio" name="gender" value="male"> 男性
        <input v-model="gender" type="radio" name="gender" value="female"> 女性
        <input v-model="gender" type="radio" name="gender" value="other"> その他 -->
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
  margin-bottom: 400px;
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
  /* margin-top: 20px; */
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


.radio-group {
  display: flex;
  gap: 15px; /* ボタン間の間隔 */
  text-align: center;
}


.radio-group label {
  display: inline-block;
  margin-right: 15px;
}


.height-input {
  display: flex;
  width: 200px;
  padding: 8px;
  font-size: 20px;
  /* border: 1px solid #000000; */
  /* border-radius: 100px; */
}
</style>
