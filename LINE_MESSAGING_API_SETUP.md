# LINE Messaging API 統合 - セットアップガイド

> **注意**: LINE Notify は 2025年3月31日にサービス終了しました。  
> このガイドは後継の **Messaging API** を使用します。

---

## ステップ1: LINE Developers でチャネル作成

### 1.1 Provider 作成（初回のみ）
1. [LINE Developers Console](https://developers.line.biz/console/) にアクセス
2. LINE でログイン
3. 「Create」→「Create a new provider」
4. Provider 名を入力（例: `メモカウンタ`）

### 1.2 Messaging API チャネル作成
1. 作成した Provider を選択
2. 「Create a new channel」→ **Messaging API** を選択
3. 必須情報を入力：
   - **Channel name**: `メモカウンタBot`
   - **Channel description**: `メモをLINEに送信するBot`
   - **Category**: `個人`
   - **Subcategory**: `その他`
4. 利用規約に同意して「Create」

### 1.3 Channel Access Token を発行
1. 作成したチャネルの「Messaging API」タブを開く
2. **Channel access token (long-lived)** セクションで「Issue」をクリック
3. トークンをコピー（後で使用）

### 1.4 Webhook 設定（オプション）
今回は**プッシュメッセージ**のみ使用するため、Webhook は不要です。

---

## ステップ2: Vercel に環境変数を設定

### 2.1 `.env.local` に追加（ローカル開発用）
```bash
LINE_CHANNEL_ACCESS_TOKEN=your_channel_access_token_here
```

### 2.2 Vercel Dashboard で設定（本番環境用）
1. [Vercel Dashboard](https://vercel.com/) にログイン
2. プロジェクトを選択
3. 「Settings」→「Environment Variables」
4. 以下を追加：
   - **Name**: `LINE_CHANNEL_ACCESS_TOKEN`
   - **Value**: `（コピーした Channel Access Token）`
   - **Environment**: `Production`, `Preview`, `Development` すべて選択
5. 「Save」

---

## ステップ3: ユーザーの User ID を取得

### 方法1: LINE Official Account Manager で確認
1. [LINE Official Account Manager](https://manager.line.biz/) にログイン
2. 作成したアカウントを選択
3. 「設定」→「Messaging API」→「Bot settings」
4. QR コードを表示 → **スマホで友だち追加**
5. チャットで何かメッセージを送信
6. Developers Console に戻る → 「Messaging API」タブ → 下部の「Webhook URL」近くに **User ID** が表示される

### 方法2: Webhook で自動取得（推奨・今後実装）
Webhook を設定すると、ユーザーが友だち追加した時やメッセージを送った時に `userId` が取得できます。

**今回は簡易的に手動入力**します。

---

## ステップ4: アプリでテスト

### 4.1 開発サーバー起動
```bash
npm run dev
```

### 4.2 メモページで送信
1. ログイン
2. メモを入力
3. **LINE User ID** を入力（例: `U1234567890abcdef...`）
4. 「メモをLINEに送信」をクリック

### 4.3 LINE でメッセージが届く！

---

## ステップ5: 本番環境にデプロイ

```bash
git add .
git commit -m "LINE Messaging API に移行"
git push origin main
```

Vercel が自動デプロイします。

---

## User ID の自動取得（今後の改善案）

現在は手動で User ID を入力していますが、以下の方法で自動化できます：

### パターン1: LINE ログインと連携
- LINE ログインで認証すると、プロフィール情報に `userId` が含まれる
- Firebase Realtime Database に `users/{firebase_uid}/lineUserId` として保存
- 送信時に自動で取得

### パターン2: Webhook で自動保存
1. Vercel Serverless Function で `/api/line-webhook` を作成
2. ユーザーが友だち追加 or メッセージ送信 → Webhook が発火
3. `userId` を取得して Database に保存
4. 次回から入力不要

---

## 料金について

| プラン | 月間メッセージ数 | 料金 |
|--------|----------------|------|
| フリープラン | 200通まで | 無料 |
| ライトプラン | 5,000通まで | ¥5,000/月 |
| スタンダードプラン | 30,000通まで | ¥15,000/月 |

詳細: [Messaging API の料金](https://www.linebiz.com/jp/service/line-official-account/plan/)

---

## トラブルシューティング

### Q: 「LINE_CHANNEL_ACCESS_TOKEN が設定されていません」
**A:** Vercel の環境変数を設定し、再デプロイしてください。

### Q: 「Invalid user ID」
**A:** User ID が間違っています。LINE Official Account Manager で確認してください。

### Q: 画像を送信したい
**A:** Messaging API で画像を送信するには、画像を外部（Firebase Storage, Vercel Blob など）にホスティングし、その URL を指定する必要があります。今後実装予定です。

---

## 参考リンク

- [Messaging API ドキュメント](https://developers.line.biz/ja/docs/messaging-api/)
- [プッシュメッセージを送る](https://developers.line.biz/ja/docs/messaging-api/sending-messages/#push-messages)
- [User ID を取得する](https://developers.line.biz/ja/docs/messaging-api/getting-user-ids/)
