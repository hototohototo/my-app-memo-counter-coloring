// シングルトンパターン
import { ref } from 'vue'
import { auth } from '../firebase'
import { onAuthStateChanged } from 'firebase/auth'

const user = ref(null)  // ファイルスコープで1つだけ作成
let initialized = false

export function useAuth() {
  if (!initialized) {
    onAuthStateChanged(auth, (currentUser) => {
      user.value = currentUser
    })
    initialized = true  // 1回だけ実行
  }
  
  return { user }
}