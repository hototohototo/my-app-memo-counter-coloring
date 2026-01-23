 <script setup>
// 出来たこと
// アップロード時に初期化
// 塗り絵画像スマホに保存
// 画面拡大
// すでに塗られてるところの色を取得

//やりたいこと
// 過去の塗り絵データをページ内に保存して、一覧表示できるようにする
// 画像処理で画質改善or白黒処理
// 塗りつぶしの許容範囲を調整できるようにする
// ドラッグでピンを表示しながら丁寧に塗るモード
// windowの中だけを拡大して、ピクセル単位まで確認できる、そのためのクリック座標取得仕様の変更



import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useAuth } from '../composables/useAuth.js'
import { useFirebaseData } from '../composables/useFirebaseData'

const { user } = useAuth()

const { data: coloringData, loading, saveData, autoSave} = useFirebaseData('coloringData', {
  // 必要なら初期データをここに追加
  file: null,
  coloredData: null
})

watch(coloringData, () => autoSave(), { deep: true })

// Canvas 関連
const canvas = ref(null)
const ctx = ref(null)
const selectedColor = ref('#FF0000') // 赤

// Data URL から Canvas に画像を描画（共通処理）
const drawImageFromUrl = (dataUrl, onComplete) => {
  const img = new Image()
  img.onload = () => {
    canvas.value.width = img.width
    canvas.value.height = img.height
    ctx.value = canvas.value.getContext('2d')
    ctx.value.drawImage(img, 0, 0)
    onComplete?.()
  }
  img.src = dataUrl
}

// ページ読み込み時に保存された画像を復元
watch(() => coloringData.value.file, (dataUrl) => {
  if (!dataUrl || !canvas.value) return
  drawImageFromUrl(dataUrl, () => {
    if (coloringData.value.coloredData) {
      const img = new Image()
      img.onload = () => ctx.value.drawImage(img, 0, 0)
      img.src = coloringData.value.coloredData
    }
  })
})

// 画像をアップロード
const loadImage = (event) => {
  const file = event.target.files[0]
  if (!file) return
  
  const reader = new FileReader()
  reader.onload = (e) => {
    const dataUrl = e.target.result
    const img = new Image()
    img.onload = () => {
      // Canvas のサイズを画像に合わせる
      canvas.value.width = img.width
      canvas.value.height = img.height
      ctx.value = canvas.value.getContext('2d')
      ctx.value.drawImage(img, 0, 0)
      // Data URL を保存（Firebase に保存可能）
      coloringData.value.file = dataUrl
      coloringData.value.coloredData = null  // 古い塗りつぶしをクリア
      console.log('画像を読み込みました:', img.width, 'x', img.height)
    }
    img.src = dataUrl
  }
  reader.readAsDataURL(file)
}

// Canvas をクリックしたときの処理
const handleCanvasClick = (event) => {
  if (!coloringData.value.file) {
    alert('まず画像をアップロードしてください')
    return
  }
  
  const rect = canvas.value.getBoundingClientRect()
  
  // Canvas の実際のサイズと表示サイズの比率を計算
  const scaleX = canvas.value.width / rect.width
  const scaleY = canvas.value.height / rect.height
  
  // クリック位置をスケーリング
  const x = Math.floor((event.clientX - rect.left) * scaleX)
  const y = Math.floor((event.clientY - rect.top) * scaleY)
  
  console.log('クリック位置:', x, y, 'スケール:', scaleX.toFixed(2), scaleY.toFixed(2))
  
  // クリックした位置の色を取得
  const imageData = ctx.value.getImageData(x, y, 1, 1)
  const clickedColor = {
    r: imageData.data[0],
    g: imageData.data[1],
    b: imageData.data[2]
  }
  console.log('クリックした場所の色:', clickedColor)
  
  // 塗りつぶし前に現在の状態を保存
  saveToUndoStack()
  
  // 塗りつぶし実行
  const fillColor = hexToRgb(selectedColor.value)
  floodFill(x, y, fillColor)
}

// Flood Fill アルゴリズム（領域塗りつぶし）
const floodFill = (x, y, fillColor) => {
  const imageData = ctx.value.getImageData(0, 0, canvas.value.width, canvas.value.height)
  const pixels = imageData.data
  const targetColor = getPixelColor(pixels, x, y, canvas.value.width)
  
  console.log('塗りつぶし開始 - 対象の色:', targetColor, '塗る色:', fillColor)
  
  // 同じ色なら何もしない
  if (colorsMatch(targetColor, fillColor)) {
    console.log('既に同じ色です')
    return
  }
  
  // 黒線なら何もしない
  // if (isBlackLine(targetColor)) {
  //   console.log('黒線をクリックしました')
  //   return
  // }
  
  const stack = [[x, y]]
  let paintedPixels = 0
  
  while (stack.length > 0) {
    const [px, py] = stack.pop()
    
    // 範囲外チェック
    if (px < 0 || px >= canvas.value.width || py < 0 || py >= canvas.value.height) continue
    
    const currentColor = getPixelColor(pixels, px, py, canvas.value.width)
    
    // 対象の色( & 黒線でない場合)のみ塗る
    if (colorsMatch(currentColor, targetColor)){// && !isBlackLine(currentColor)) {
      const index = (py * canvas.value.width + px) * 4
      pixels[index] = fillColor.r
      pixels[index + 1] = fillColor.g
      pixels[index + 2] = fillColor.b
      pixels[index + 3] = 255
      
      paintedPixels++
      
      // 4方向に拡散
      stack.push([px + 1, py])
      stack.push([px - 1, py])
      stack.push([px, py + 1])
      stack.push([px, py - 1])
    }
  }
  
  console.log('塗りつぶし完了:', paintedPixels, 'ピクセル')
  ctx.value.putImageData(imageData, 0, 0)

  // Canvas を Data URL として保存
  coloringData.value.coloredData = canvas.value.toDataURL('image/png')
}

// 指定位置の色を取得
const getPixelColor = (pixels, x, y, width) => {
  const index = (y * width + x) * 4
  return {
    r: pixels[index],
    g: pixels[index + 1],
    b: pixels[index + 2],
    a: pixels[index + 3]
  }
}

// 2つの色が一致するかチェック
const colorsMatch = (color1, color2) => {
  const threshold = 50  // 許容範囲
  return Math.abs(color1.r - color2.r) < threshold &&
         Math.abs(color1.g - color2.g) < threshold &&
         Math.abs(color1.b - color2.b) < threshold
}

// 黒線かどうかチェック
// const isBlackLine = (color) => {
//   const threshold = 100  // この値以下なら黒線とみなす
//   return color.r < threshold && color.g < threshold && color.b < threshold
// }

// 16進数カラーをRGBに変換
const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 }
}

// リセット
const resetCanvas = () => {
  if (!coloringData.value.file) return
  const img = new Image()
  img.onload = () => ctx.value.drawImage(img, 0, 0)
  img.src = coloringData.value.file
}

// 元に戻す（Undo）機能の簡易実装
const undoStack = []
const MAX_UNDO = 10  // 最大履歴数

const saveToUndoStack = () => {
  const imageData = ctx.value.getImageData(0, 0, canvas.value.width, canvas.value.height)
  undoStack.push(imageData)
  // 履歴が上限を超えたら古いものを削除
  if (undoStack.length > MAX_UNDO) {
    undoStack.shift()
  }
  console.log('履歴を保存しました (', undoStack.length, '/', MAX_UNDO, ')')
}

const undo = () => {
  if (undoStack.length === 0) {
    alert('これ以上戻れません')
    return
  }
  const imageData = undoStack.pop()
  ctx.value.putImageData(imageData, 0, 0)
  console.log('一つ戻りました (残り', undoStack.length, ')')
}

// Ctrl+Z / Cmd+Z でUndo
const handleKeydown = (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key === 'z') {
    event.preventDefault()  // ブラウザのデフォルト動作を防止
    undo()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})


// メディアンフィルタを適用
const applyMedianFilter = () => {
  if (!coloringData.value.file) {
    alert('まず画像をアップロードしてください')
    return
  }
  
  const imageData = ctx.value.getImageData(0, 0, canvas.value.width, canvas.value.height)
  const pixels = imageData.data
  const width = canvas.value.width
  const height = canvas.value.height
  
  // フィルタ後のピクセルデータ
  const filteredPixels = new Uint8ClampedArray(pixels)
  
  // 3x3 メディアンフィルタを適用
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      // RGBA それぞれに対してメディアンフィルタを適用
      for (let channel = 0; channel < 4; channel++) {
        const values = []
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const idx = ((y + dy) * width + (x + dx)) * 4 + channel
            values.push(pixels[idx])
          }
        }
        // 中央値を計算
        values.sort((a, b) => a - b)
        const medianIdx = (x + y * width) * 4 + channel
        filteredPixels[medianIdx] = values[4] // 9個の値の中央値
      }
    }
  }
  
  imageData.data.set(filteredPixels)
  ctx.value.putImageData(imageData, 0, 0)
  console.log('メディアンフィルタを適用しました')
}


// 画像をデバイスに保存
const saveToDevice = () => {
  if (!canvas.value) return
  const link = document.createElement('a')
  link.download = 'coloring_image.png'
  link.href = canvas.value.toDataURL('image/png')
  link.click()
}

</script>

<template>
  <div class="coloring-container">
    <h1 style="margin: 0px; padding: 20px">塗り絵</h1>
    
    <!-- 画像アップロード -->
    <div class="upload-section">
      <input type="file" @change="loadImage" accept="image/*" class="file-input">
      <p v-if="!coloringData.file">画像をアップロードしてください</p>
    </div>
    
    <!-- 色選択 -->
    <div class="color-picker">
      <button @click="selectedColor = '#FF0000'" style="background: red" :class="{ active: selectedColor === '#FF0000' }">赤</button>
      <button @click="selectedColor = '#0000FF'" style="background: blue" :class="{ active: selectedColor === '#0000FF' }">青</button>
      <button @click="selectedColor = '#FFFF00'" style="background: yellow; color: black" :class="{ active: selectedColor === '#FFFF00' }">黄</button>
      <button @click="selectedColor = '#00FF00'" style="background: green" :class="{ active: selectedColor === '#00FF00' }">緑</button>
      <input type="color" v-model="selectedColor" class="color-input" title="カスタムカラー">
    </div>
    
    <p class="instruction">領域をクリックして塗りつぶしてください</p>
    
    <!-- Canvas -->
    <canvas 
      ref="canvas" 
      @click="handleCanvasClick" 
      class="coloring-canvas"
      :class="{ 'has-image': coloringData.file }"
    ></canvas>
    
    <!-- アクション -->
    <div class="actions" v-if="coloringData.file">
      <button @click="resetCanvas">リセット</button>
      <button @click="undo">一つ戻る</button>
      <button @click="applyMedianFilter" style="background-color: #2196F3">フィルタ適用</button>
    </div>
    <button @click="saveToDevice">保存</button>
  </div>
</template>


<style scoped>
.coloring-container {
  text-align: center;
  padding-top: 100px;
  
}

.upload-section {
  margin: 20px 0;
}

.file-input {
  padding: 10px;
  font-size: 14px;
}

.color-picker {
  margin: 20px 0;
  display: flex;
  gap: 10px;
  justify-content: center;
  flex-wrap: wrap;
}

.color-picker button {
  width: 60px;
  height: 60px;
  border: 3px solid #000;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  transition: transform 0.2s;
}

.color-picker button:hover {
  transform: scale(1.1);
}

.color-picker button.active {
  border: 5px solid #000;
  transform: scale(1.15);
}

.color-input {
  width: 60px;
  height: 60px;
  border: 3px solid #000;
  border-radius: 8px;
  cursor: pointer;
}
.color-input:hover {
  /* transform: scale(1.1); */
  cursor: text;
}

.instruction {
  font-size: 16px;
  color: #666;
  margin: 10px 0;
}

.coloring-canvas {
  max-width: 100%;
  max-height: 500px;
  border: 3px solid #ccc;
  margin: 20px 0;
  display: block;
  margin-left: auto;
  margin-right: auto;
}

.coloring-canvas.has-image {
  border-color: #000;
  cursor: crosshair;
}

.actions {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin: 20px 0;
}

.actions button {
  padding: 12px 24px;
  font-size: 16px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.actions button:hover {
  background-color: #45a049;
}
</style>


