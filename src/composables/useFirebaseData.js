// src/composables/useFirebaseData.js
import { ref, watch } from 'vue'
import { db } from '../firebase'
import { ref as dbRef, set, get } from 'firebase/database'
import { useAuth } from './useAuth'

export function useFirebaseData(dataPath, initialData) {
  const { user } = useAuth()
  const data = ref({ ...initialData })
  const loading = ref(false)
  
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
  
  // データ保存
  const saveData = async () => {
    if (!user.value) return
    try {
      const path = `users/${user.value.uid}/${dataPath}`
      await set(dbRef(db, path), data.value)
      console.log('saveData: saved', path)
    } catch (e) {
      console.error('saveData error:', e)
    }
  }
  
  // 自動保存（デバウンス）
  let timer = null
  const autoSave = () => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => saveData(), 500)
  }
  
  // ユーザーログイン時に自動読み込み
  watch(user, (newUser) => {
    if (newUser) loadData()
  }, { immediate: true })
  
  return { data, loading, saveData, autoSave }
}