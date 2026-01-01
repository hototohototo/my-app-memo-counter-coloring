# Copilot Instructions for my-app (メモカウンタ)

## Project Overview
**my-app** は Vue 3 + Vite で構築されたカウンター・メモアプリです。Firebase Authentication（認証）と Realtime Database（データ保存）を使用し、複数ページ（ホーム、カウンター、メモ、色塗り、プロフィール）をサポートしています。EmailJS で認証メールを送信できます。

**デプロイ先**: https://my-app-memo-counter-coloring.vercel.app/

## Architecture

### Core Structure
- **src/App.vue**: メインコンポーネント。ルーター統合、Firebase 認証（ログイン/登録）、データの読み込み・保存を管理
- **src/main.js**: ルーター定義（6 ページ: home, counter, counter2, memo, coloring, profile）
- **src/firebase.js**: Firebase Realtime Database と Authentication の初期化

### Key Data Flow
1. **認証フロー**: `onAuthStateChanged` で認証状態を監視 → ログイン時に `loadData()` を実行
2. **データパス**: `users/{uid}/appData` に格納（counterBig, counterMid, memoText, counterBig2, counterMid2, window1Color, window2Color）
3. **プロフィール**: `users/{uid}/profile` に userName, gender などを保存（Profile.vue で管理）

### Component Hierarchy
- **ButtonCounter.vue**: `v-model` で双方向バインド。クリック時に値を +1（`update:modelValue` emit）
- **SelectColor.vue**: コメントアウト済み（未使用）
- **Profile.vue**: プロフィール編集・保存。独立した認証監視を実装

## Development Workflows

### Run Commands
```bash
npm install       # 初期セットアップ
npm run dev      # 開発サーバー起動 (Vite + Hot Module Replacement)
npm run build    # 本番ビルド
npm run preview  # ビルド結果プレビュー
```

### Environment Setup
Node.js: ^20.19.0 or >=22.12.0 が必須  
Vite の `@` エイリアスが `./src` をポイント（jsconfig.json で設定）

### Firebase Setup
- Firebase コンフィグは [src/firebase.js](src/firebase.js) に直書き（**本番環境では .env に移行推奨**）
- Database URL が Asia Southeast 1（シンガポール）指定
- EmailJS は App.vue で import されるが、環境変数は使用準備中（コメント参照）

## Project-Specific Patterns

### 認証 & データ保存パターン
```javascript
// App.vue の例：ユーザー作成 → データ保存
const signup = async () => {
  const userCredential = await createUserWithEmailAndPassword(auth, email.value, password.value)
  await saveData()  // 初期データセット
}

// onAuthStateChanged で自動読み込み
onAuthStateChanged(auth, (currentUser) => {
  user.value = currentUser
  if (currentUser) {
    loadData()  // Realtime Database から読み込み
  }
})
```

### データ保存・読み込み
- **保存**: `set(dbRef(db, path), object)` で Realtime Database に書き込み
- **読み込み**: `get(dbRef(db, path))` で fetch（`snapshot.val()` でデータ取得）
- **パス**: `users/{uid}/appData` 形式（uid は Firebase の currentUser.uid）

## Code Conventions & Gotchas

### Vue 3 Composition API
- すべてのコンポーネントは `<script setup>` 使用
- `ref()` でリアクティブ状態管理
- Props は `defineProps()`、emit は `defineEmits()`

### Router Pages
[src/main.js](src/main.js) で 6 ページ定義：各ルートは `<App :page="'pageName'" />` を template として使用（ページング機能あり）

### Note: 構想中の機能
App.vue と Profile.vue には英語コメントで以下の TODO が記録：
- コード理解度向上（特に色塗りページ）
- Firebase Firestore への移行検討
- ホーム画面からのナビゲーション改善
- メール本人確認、LINE ログイン認証
- UI 改善、プロフィール項目追加

## Key Files to Understand First

1. [src/App.vue](src/App.vue) (424 lines): 認証・データフロー・ページ管理の中核
2. [src/firebase.js](src/firebase.js): Firebase 設定（Realtime Database + Auth）
3. [src/main.js](src/main.js): ルーター定義、ページ構成
4. [src/views/Profile.vue](src/views/Profile.vue): プロフィール管理パターンの参考
5. [src/components/ButtonCounter.vue](src/components/ButtonCounter.vue): 双方向バインド（v-model）の実装例

## Critical Implementation Notes

- **Realtime Database 使用**: Firestore ではなく Firebase Realtime Database （JSON 形式）
- **認証分散**: App.vue と Profile.vue が別々に `onAuthStateChanged` を監視（冗長性あり）
- **環境変数未配置**: Firebase コンフィグとメールJS 設定がソースに直書き → 本番環境では .env に移行必須
- **色塗り機能**: 構想段階（SelectColor.vue はコメントアウト）

## Dependencies
- **vue@3.5.25**: UI フレームワーク
- **firebase@12.7.0**: 認証 + Realtime Database
- **@emailjs/browser@4.4.1**: メール送信（初期化待ち）
- **vue-router@4.6.3**: ページ遷移管理
- **vite@7.2.4**: ビルドツール
