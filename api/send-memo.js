/**
 * Vercel Serverless Function: メモを LINE Messaging API で送信
 * 
 * 使用方法:
 * POST /api/send-memo
 * Body: { uid, memoText, lineUserId }
 * 
 * 必要な環境変数:
 * - LINE_CHANNEL_ACCESS_TOKEN
 */

export default async function handler(req, res) {
  // CORS設定
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  // Debug: check env presence without exposing secrets
  if (req.method === 'GET') {
    return res.status(200).json({ ok: true, hasToken: Boolean(process.env.LINE_CHANNEL_ACCESS_TOKEN) })
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { uid, memoText, lineUserId } = req.body

    if (!uid || !memoText) {
      return res.status(400).json({ error: 'uid と memoText は必須です' })
    }

    if (!lineUserId) {
      return res.status(400).json({ 
        error: 'LINE User ID が必要です',
        hint: 'ユーザーが LINE 公式アカウントを友だち追加する必要があります'
      })
    }

    // 環境変数から Channel Access Token を取得
    const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN
    if (!channelAccessToken) {
      return res.status(500).json({ 
        error: 'LINE_CHANNEL_ACCESS_TOKEN が設定されていません' 
      })
    }

    // Messaging API でプッシュメッセージを送信
    const message = `📝 メモ送信\n\n${memoText}`
    
    const response = await fetch('https://api.line.me/v2/bot/message/push', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${channelAccessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        to: lineUserId,
        messages: [
          {
            type: 'text',
            text: message
          }
        ]
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      return res.status(response.status).json({ 
        error: 'LINE Messaging API 送信失敗',
        details: errorData 
      })
    }

    return res.status(200).json({ 
      success: true,
      message: 'メモを LINE で送信しました' 
    })

  } catch (error) {
    console.error('エラー:', error)
    return res.status(500).json({ 
      error: 'サーバーエラー',
      message: error.message 
    })
  }
}
