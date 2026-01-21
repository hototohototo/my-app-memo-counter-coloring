// src/composables/useFirebaseData.js
import { ref, watch, onUnmounted } from 'vue'
import { db } from '../firebase'
import { ref as dbRef, set, get, onValue, off } from 'firebase/database'
import { useAuth } from './useAuth'

export function useFirebaseData(dataPath, initialData) {
  const { user } = useAuth()
  const data = ref({ ...initialData })
  const loading = ref(false)
  let unsubscribe = null
  let isLocalUpdate = false // ローカルからの更新かどうかのフラグ
  
  // データ読み込み
  const loadData = async () => {
    if (!user.value) return
    loading.value = true
    try {
      const path = `users/${user.value.uid}/${dataPath}`
      const snapshot = await get(dbRef(db, path))
      if (snapshot.exists()) {
        data.value = { ...initialData, ...snapshot.val() }
      }
    } catch (e) {
      console.error('loadData error:', e)
    } finally {
      loading.value = false
    }
  }
  
  // リアルタイムリスナーをセットアップ
  const setupRealtimeListener = () => {
    if (!user.value || unsubscribe) return
    
    const path = `users/${user.value.uid}/${dataPath}`
    const dataRef = dbRef(db, path)
    
    unsubscribe = onValue(dataRef, (snapshot) => {
      if (snapshot.exists() && !isLocalUpdate) {
        // 他のデバイスからの更新の場合のみ反映
        data.value = { ...initialData, ...snapshot.val() }
        console.log('リアルタイム更新を受信:', path)
      }
      isLocalUpdate = false // フラグをリセット
    })
  }
  
  // リスナーを停止
  const stopRealtimeListener = () => {
    if (unsubscribe) {
      const path = `users/${user.value.uid}/${dataPath}`
      off(dbRef(db, path))
      unsubscribe = null
    }
  }
  
  // データ保存
  const saveData = async () => {
    if (!user.value) return
    try {
      isLocalUpdate = true // ローカル更新フラグを立てる
      const path = `users/${user.value.uid}/${dataPath}`
      await set(dbRef(db, path), data.value)
      console.log('saveData: saved', path)
    } catch (e) {
      console.error('saveData error:', e)
      isLocalUpdate = false
    }
  }
  
  // 自動保存（デバウンス）
  let timer = null
  const autoSave = () => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => saveData(), 100) // 100ms で即座に反映
  }
  
  // ユーザーログイン時に自動読み込み & リアルタイムリスナー開始
  watch(user, (newUser) => {
    if (newUser) {
      loadData()
      setupRealtimeListener()
    } else {
      stopRealtimeListener()
    }
  }, { immediate: true })
  
  // コンポーネントがアンマウントされたらリスナー停止
  onUnmounted(() => {
    stopRealtimeListener()
  })
  
  return { data, loading, saveData, autoSave }
}