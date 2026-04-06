<template>
  <div class="p-4">
    <div class="bg-white rounded-lg shadow-lg overflow-hidden">
      <!-- 顶部导航栏 -->
      <div class="sticky top-0 bg-white border-b z-50 px-4 py-3">
        <Breadcrumb 
          :breadcrumbs="[
            { label: '首页', to: '/' },
            { label: '店铺管理', to: '/shop-manage' },
            { label: '店铺信息' }
          ]"
        />
      </div>

      <div class="p-6">
        <!-- 店铺logo -->
        <div class="mb-6">
          <label class="block text-sm text-gray-600 mb-2">店铺Logo</label>
          <div class="flex items-center gap-4">
            <div 
              class="w-20 h-20 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-2xl font-bold overflow-hidden cursor-pointer hover:opacity-80"
              @click="triggerLogoUpload"
            >
              <img 
                v-if="shopInfo.logo" 
                :src="shopInfo.logo" 
                class="w-full h-full object-cover"
                @error="shopInfo.logo = ''"
              />
              <span v-else>
                店
              </span>
            </div>
            <div class="flex-1">
              <button 
                @click="triggerLogoUpload"
                class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
              >
                选择图片
              </button>
              <p class="text-xs text-gray-500 mt-2">点击选择图片作为店铺Logo（正方形）</p>
            </div>
            <input 
              ref="logoInput"
              type="file" 
              accept="image/*"
              @change="handleLogoChange"
              class="hidden"
            />
          </div>
        </div>

        <!-- 店铺信息表单 -->
        <div class="space-y-4">
          <div>
            <label class="block text-sm text-gray-600 mb-1">店铺名称</label>
            <input 
              v-model="shopInfo.name" 
              type="text" 
              placeholder="请输入店铺名称"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label class="block text-sm text-gray-600 mb-1">店铺简介</label>
            <textarea 
              v-model="shopInfo.description" 
              placeholder="请输入店铺简介"
              rows="3"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label class="block text-sm text-gray-600 mb-1">联系电话</label>
            <input 
              v-model="shopInfo.phone" 
              type="tel" 
              placeholder="请输入联系电话"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label class="block text-sm text-gray-600 mb-1">营业时间</label>
            <input 
              v-model="shopInfo.hours" 
              type="text" 
              placeholder="请输入营业时间"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label class="block text-sm text-gray-600 mb-1">联系微信</label>
            <input 
              v-model="shopInfo.wechat" 
              type="text" 
              placeholder="请输入联系微信"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <button 
            @click="handleSave"
            :disabled="loading"
            class="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
          >
            {{ loading ? '保存中...' : '保存' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 图片剪裁弹窗 -->
    <div v-if="showCropper" class="fixed inset-0 bg-black bg-opacity-75 z-[9999] flex flex-col" style="touch-action: none;">
      <div class="bg-white w-full h-full flex flex-col">
        <div class="p-3.5 border-b flex items-center justify-between flex-shrink-0">
          <h3 class="text-base font-bold text-gray-800">裁剪Logo</h3>
          <button @click="cancelCropper" class="text-gray-500 hover:text-gray-700">
            <svg class="w-5.5 h-5.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
            </svg>
          </button>
        </div>
        <div class="p-3.5 overflow-y-auto flex-1 flex flex-col items-center justify-center">
          <div 
            ref="cropContainer"
            class="relative bg-gray-100 rounded-lg" 
            style="height: 250px; width: 250px; overflow: hidden; touch-action: none;"
          >
            <canvas 
              ref="canvas"
              @mousedown="startDrag"
              @mousemove="onDrag"
              @mouseup="stopDrag"
              @mouseleave="stopDrag"
              @touchstart="startTouch"
              @touchmove="onTouch"
              @touchend="stopDrag"
              class="w-full h-full cursor-move"
            />
            <!-- 正方形选区框 -->
            <div class="absolute inset-0 pointer-events-none">
              <div class="absolute border-2 border-white rounded-lg" :style="cropBoxStyle"></div>
            </div>
          </div>
          
          <!-- 缩放控制 -->
          <div class="mt-4 w-full max-w-xs">
            <div class="flex items-center gap-4">
              <span class="text-sm text-gray-600 w-16">缩放</span>
              <input 
                type="range" 
                v-model="scale" 
                min="0.1" 
                max="3" 
                step="0.01"
                class="flex-1"
                @input="updateCanvas"
              />
              <span class="text-sm text-gray-600 w-12 text-right">{{ Math.round(scale * 100) }}%</span>
            </div>
          </div>
          <div class="mt-2 text-xs text-gray-500 text-center">
            拖动图片调整位置，滑动滑块调整大小
          </div>
        </div>
        <div class="p-3.5 border-t flex gap-3 flex-shrink-0">
          <button @click="cancelCropper" class="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition-colors font-medium">
            取消
          </button>
          <button @click="confirmCropper" class="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium">
            确认
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import Breadcrumb from '../components/Breadcrumb.vue'

const router = useRouter()

const shopInfo = ref({
  name: '',
  description: '',
  phone: '',
  hours: '',
  wechat: '',
  logo: ''
})

const loading = ref(false)

// logo剪裁相关
const logoInput = ref(null)
const canvas = ref(null)
const cropContainer = ref(null)

const showCropper = ref(false)
const img = new Image()
const scale = ref(1)
const translateX = ref(0)
const translateY = ref(0)
const isDragging = ref(false)
const lastX = ref(0)
const lastY = ref(0)
const initialDistance = ref(0)
const initialScale = ref(1)
const isPinching = ref(false)

// 剪裁框样式（正方形）
const cropBoxStyle = computed(() => {
  const containerSize = 250
  const boxSize = 150
  const offset = (containerSize - boxSize) / 2
  return {
    width: `${boxSize}px`,
    height: `${boxSize}px`,
    left: `${offset}px`,
    top: `${offset}px`,
    boxShadow: '0 0 0 9999px rgba(0,0,0,0.5)'
  }
})

async function loadShopInfo() {
  try {
    const response = await axios.get('/api/shop-info')
    if (response.data.success && response.data.data) {
      shopInfo.value = {
        name: response.data.data.name || '',
        description: response.data.data.description || '',
        phone: response.data.data.phone || '',
        hours: response.data.data.hours || '',
        wechat: response.data.data.wechat || '',
        logo: response.data.data.logo || ''
      }
    }
  } catch (error) {
    console.error('加载店铺信息失败:', error)
  }
}

// 触发logo上传
function triggerLogoUpload() {
  logoInput.value.click()
}

// 处理logo选择
function handleLogoChange(e) {
  const file = e.target.files[0]
  if (!file) return
  
  // 限制文件大小（最大 5MB）
  if (file.size > 5 * 1024 * 1024) {
    const toast = document.createElement('div')
    toast.className = 'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black bg-opacity-75 text-white px-6 py-3 rounded-lg z-50 text-sm'
    toast.textContent = '图片大小不能超过 5MB'
    document.body.appendChild(toast)
    setTimeout(() => toast.remove(), 1500)
    return
  }
  
  // 转换为图片
  const reader = new FileReader()
  reader.onload = (event) => {
    img.onload = () => {
      // 重置状态
      scale.value = 1
      translateX.value = 0
      translateY.value = 0
      showCropper.value = true
      nextTick(() => {
        updateCanvas()
      })
    }
    img.src = event.target.result
  }
  reader.readAsDataURL(file)
}

// 更新canvas
function updateCanvas() {
  if (!canvas.value || !img.width) return
  
  const ctx = canvas.value.getContext('2d')
  const containerWidth = canvas.value.offsetWidth
  const containerHeight = canvas.value.offsetHeight
  
  // 设置canvas尺寸
  canvas.value.width = containerWidth
  canvas.value.height = containerHeight
  
  // 清空画布
  ctx.fillStyle = '#fff'
  ctx.fillRect(0, 0, containerWidth, containerHeight)
  
  // 计算图片绘制位置
  const imgWidth = img.width * scale.value
  const imgHeight = img.height * scale.value
  const x = (containerWidth - imgWidth) / 2 + translateX.value
  const y = (containerHeight - imgHeight) / 2 + translateY.value
  
  // 绘制图片
  ctx.drawImage(img, x, y, imgWidth, imgHeight)
}

// 开始拖拽
function startDrag(e) {
  isDragging.value = true
  lastX.value = e.clientX || (e.touches && e.touches[0].clientX)
  lastY.value = e.clientY || (e.touches && e.touches[0].clientY)
}

// 计算两点距离
function getDistance(touches) {
  const dx = touches[0].clientX - touches[1].clientX
  const dy = touches[0].clientY - touches[1].clientY
  return Math.sqrt(dx * dx + dy * dy)
}

// 触摸开始
function startTouch(e) {
  e.preventDefault()
  
  if (e.touches.length === 2) {
    // 双指缩放
    isPinching.value = true
    isDragging.value = false
    initialDistance.value = getDistance(e.touches)
    initialScale.value = scale.value
  } else if (e.touches.length === 1) {
    // 单指拖拽
    isPinching.value = false
    startDrag(e)
  }
}

// 拖拽中
function onDrag(e) {
  if (!isDragging.value) return
  e.preventDefault()
  
  const x = e.clientX || (e.touches && e.touches[0].clientX)
  const y = e.clientY || (e.touches && e.touches[0].clientY)
  const deltaX = x - lastX.value
  const deltaY = y - lastY.value
  translateX.value += deltaX
  translateY.value += deltaY
  lastX.value = x
  lastY.value = y
  updateCanvas()
}

// 触摸移动
function onTouch(e) {
  e.preventDefault()
  
  if (e.touches.length === 2 && isPinching.value) {
    // 双指缩放
    const currentDistance = getDistance(e.touches)
    const scaleFactor = currentDistance / initialDistance.value
    let newScale = initialScale.value * scaleFactor
    
    // 限制缩放范围
    if (newScale < 0.1) newScale = 0.1
    if (newScale > 3) newScale = 3
    
    scale.value = newScale
    updateCanvas()
  } else if (e.touches.length === 1 && isDragging.value) {
    // 单指拖拽
    const x = e.touches[0].clientX
    const y = e.touches[0].clientY
    const deltaX = x - lastX.value
    const deltaY = y - lastY.value
    translateX.value += deltaX
    translateY.value += deltaY
    lastX.value = x
    lastY.value = y
    updateCanvas()
  }
}

// 停止拖拽
function stopDrag() {
  isDragging.value = false
}

// 确认剪裁（正方形）
function confirmCropper() {
  if (!canvas.value) return
  
  const ctx = canvas.value.getContext('2d')
  const containerWidth = canvas.value.offsetWidth
  const containerHeight = canvas.value.offsetHeight
  
  // 创建新的canvas用于输出
  const outputCanvas = document.createElement('canvas')
  const outputSize = 400
  outputCanvas.width = outputSize
  outputCanvas.height = outputSize
  const outputCtx = outputCanvas.getContext('2d')
  
  // 计算剪裁区域（正方形）
  const boxSize = 200
  const offsetX = (containerWidth - boxSize) / 2
  const offsetY = (containerHeight - boxSize) / 2
  
  // 从原canvas复制剪裁区域（正方形，无需圆形剪裁）
  outputCtx.drawImage(
    canvas.value,
    offsetX,
    offsetY,
    boxSize,
    boxSize,
    0,
    0,
    outputSize,
    outputSize
  )
  
  // 获取剪裁后的图片
  shopInfo.value.logo = outputCanvas.toDataURL('image/jpeg', 0.9)
  showCropper.value = false
}

// 取消剪裁
function cancelCropper() {
  showCropper.value = false
}

async function handleSave() {
  loading.value = true
  try {
    await axios.put('/api/shop-info', shopInfo.value)
    
    // 显示成功提示
    const toast = document.createElement('div')
    toast.className = 'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black bg-opacity-75 text-white px-6 py-3 rounded-lg z-50 text-sm'
    toast.textContent = '✓ 保存成功'
    document.body.appendChild(toast)
    setTimeout(() => toast.remove(), 1500)
  } catch (error) {
    console.error('保存店铺信息失败:', error)
    // 显示错误提示
    const toast = document.createElement('div')
    toast.className = 'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-red-600 bg-opacity-90 text-white px-6 py-3 rounded-lg z-50 text-sm'
    toast.textContent = '✗ 保存失败'
    document.body.appendChild(toast)
    setTimeout(() => toast.remove(), 1500)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadShopInfo()
})
</script>
