/**
 * Vercel Serverless Function: 塗り絵を LINE Messaging API で送信
 * 
 * 使用方法:
 * POST /api/send-coloring
 * Body: { uid, imageData, lineUserId }
 * 
 * 必要な環境変数:
 * - LINE_CHANNEL_ACCESS_TOKEN
 * 
 * 注意: Messaging API で画像を送信するには、画像を外部にホスティングし、
 * その URL を指定する必要があります（imageUrl 方式）
 */

export default async function handler(req, res) {
  // CORS設定
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { uid, imageData, lineUserId } = req.body

    if (!uid || !imageData) {
      return res.status(400).json({ error: 'uid と imageData は必須です' })
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

    // TODO: 画像を Vercel Blob Storage や Firebase Storage にアップロード
    // const imageUrl = await uploadImageToStorage(imageData)
    
    // 現在は簡易的にテキストメッセージのみ送信
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
            text: '🎨 塗り絵を保存しました\n※画像送信機能は今後実装予定です'
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
      message: '塗り絵を LINE で送信しました（テキストのみ）',
      note: '画像送信には画像ホスティングが必要です'
    })

  } catch (error) {
    console.error('エラー:', error)
    return res.status(500).json({ 
      error: 'サーバーエラー',
      message: error.message 
    })
  }
}
