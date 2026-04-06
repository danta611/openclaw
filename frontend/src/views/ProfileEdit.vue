<template>
  <div class="p-4">
    <div class="bg-white rounded-lg shadow-lg overflow-hidden">
      <!-- 顶部导航栏 -->
      <div class="sticky top-0 bg-white border-b z-50 px-4 py-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div class="flex items-center gap-1.5 text-xs text-gray-600">
              <span 
                class="hover:text-blue-600 cursor-pointer truncate max-w-16"
                @click="$router.push('/')"
              >
                首页
              </span>
              <svg class="w-3.5 h-3.5 flex-shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
              <span 
                class="hover:text-blue-600 cursor-pointer"
                @click="$router.push('/settings')"
              >
                我的
              </span>
              <svg class="w-3.5 h-3.5 flex-shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
              <span class="text-gray-800 font-medium">
                个人信息
              </span>
            </div>
          </div>
          <button @click="$router.back()" class="text-gray-500">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
            </svg>
          </button>
        </div>
      </div>

      <div class="p-6">
        <!-- 头像管理 -->
        <div class="mb-6">
          <label class="block text-sm text-gray-600 mb-2">头像</label>
          <div class="flex items-center gap-4">
            <div 
              class="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-2xl font-bold overflow-hidden cursor-pointer hover:opacity-80"
              @click="triggerAvatarUpload"
            >
              <img 
                v-if="profile.avatar" 
                :src="profile.avatar" 
                class="w-full h-full object-cover"
                @error="profile.avatar = ''"
              />
              <span v-else>
                {{ profile.nickname ? profile.nickname.charAt(0) : '用' }}
              </span>
            </div>
            <div class="flex-1">
              <button 
                @click="triggerAvatarUpload"
                class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
              >
                选择图片
              </button>
              <p class="text-xs text-gray-500 mt-2">点击选择图片作为头像</p>
            </div>
            <input 
              ref="avatarInput"
              type="file" 
              accept="image/*"
              @change="handleAvatarChange"
              class="hidden"
            />
          </div>
        </div>

        <!-- 登录账号（仅显示） -->
        <div class="mb-6">
          <label class="block text-sm text-gray-600 mb-1">登录账号</label>
          <div class="relative">
            <input 
              :value="profile.phone" 
              disabled
              class="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-pointer hover:bg-gray-200"
              @click="$router.push('/settings')"
            />
            <div class="absolute inset-0 cursor-pointer" @click="$router.push('/settings')"></div>
          </div>
        </div>

        <!-- 用户等级（可点击跳转） -->
        <div class="mb-6">
          <label class="block text-sm text-gray-600 mb-2">用户等级</label>
          <div 
            @click="$router.push('/level-intro')"
            class="flex items-center gap-3 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200 cursor-pointer hover:bg-gradient-to-r from-gray-100 to-gray-200 transition-colors"
          >
            <div class="flex-shrink-0">
              <div :class="[
                'w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold bg-gradient-to-br flex-shrink-0',
                currentLevel.badge
              ]">
                {{ currentLevel.icon }}
              </div>
            </div>
            <div class="flex-1">
              <p class="font-semibold text-gray-800">{{ currentLevel.shortLabel }} {{ currentLevel.label }}</p>
              <p class="text-sm text-blue-600 mt-1 font-medium">{{ levelSlogans[profile.level] }}</p>
            </div>
            <svg class="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </div>
        </div>

        <!-- 称呼 -->
        <div class="mb-6">
          <label class="block text-sm text-gray-600 mb-1">称呼</label>
          <input 
            v-model="profile.nickname" 
            type="text" 
            placeholder="请输入称呼"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <!-- 身份 -->
        <div class="mb-6">
          <label class="block text-sm text-gray-600 mb-2">身份</label>
          <div class="flex gap-3">
            <label 
              v-for="role in identityOptions" 
              :key="role.value"
              class="flex-1 flex items-center justify-center gap-2 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
              :class="{ 'border-blue-500 bg-blue-50': profile.identity === role.value }"
            >
              <input 
                v-model="profile.identity" 
                type="radio" 
                :value="role.value"
                class="w-4 h-4 text-blue-600"
              />
              <span class="text-gray-800">{{ role.label }}</span>
            </label>
          </div>
        </div>

        <!-- 联系微信 -->
        <div class="mb-6">
          <label class="block text-sm text-gray-600 mb-1">联系微信</label>
          <input 
            v-model="profile.wechat" 
            type="text" 
            placeholder="请输入微信号"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <!-- 座驾 -->
        <div class="mb-6">
          <label class="block text-sm text-gray-600 mb-1">座驾</label>
          <input 
            v-model="profile.carModel" 
            type="text" 
            placeholder="请输入座驾"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <!-- 保存按钮 -->
        <button 
          @click="handleSave"
          class="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          保存
        </button>
      </div>
    </div>

    <!-- 图片剪裁弹窗 -->
    <div v-if="showCropper" class="fixed inset-0 bg-black bg-opacity-75 z-[9999] flex flex-col" style="touch-action: none;">
      <div class="bg-white w-full h-full flex flex-col">
        <div class="p-3.5 border-b flex items-center justify-between flex-shrink-0">
          <h3 class="text-base font-bold text-gray-800">裁剪头像</h3>
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
            <!-- 圆形选区框 -->
            <div class="absolute inset-0 pointer-events-none">
              <div class="absolute border-2 border-white rounded-full" :style="cropBoxStyle"></div>
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
import { useAuthStore } from '../stores/auth'
import axios from 'axios'
import { getUserLevel } from '../utils/userLevels'

// 等级描述文案
const levelSlogans = {
  0: '欢迎加入骑友行列',
  1: '自在骑行，一路同行',
  2: '乘风而行，热爱不止',
  3: '凌云之志，驰骋城市',
  4: '万里征途，尊享礼遇',
  5: '苍穹之上，圣骑荣耀'
}

const router = useRouter()
const { userPhone: storeUserPhone } = useAuthStore()

const identityOptions = [
  { label: '车友', value: '车友' },
  { label: '分销商', value: '分销商' }
]

const avatarInput = ref(null)
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

const profile = ref({
  phone: '',
  avatar: '',
  nickname: '',
  identity: '车友',
  level: 0,
  wechat: '',
  carModel: ''
})

const currentLevel = computed(() => getUserLevel(profile.value.level))

// 剪裁框样式
const cropBoxStyle = computed(() => {
  const boxSize = 150
  const offset = (250 - boxSize) / 2
  return {
    width: `${boxSize}px`,
    height: `${boxSize}px`,
    left: `calc(50% - ${boxSize/2}px)`,
    top: `${offset}px`,
    boxShadow: '0 0 0 9999px rgba(0,0,0,0.5)'
  }
})

// 从后端加载个人信息
async function loadProfile() {
  const phone = localStorage.getItem('user_phone')
  
  if (phone) {
    profile.value.phone = phone
    try {
      const response = await axios.get(`/api/users/${phone}`)
      if (response.data.success) {
        const user = response.data.data
        profile.value = {
          phone: phone,
          avatar: user.avatar || '',
          nickname: user.nickname || '',
          identity: user.identity || '车友',
          level: user.level !== undefined ? Number(user.level) : 0,
          wechat: user.wechat || '',
          carModel: user.car_model || ''
        }
      }
    } catch (error) {
      console.error('从后端加载用户信息失败:', error)
    }
  }
}

// 触发头像上传
function triggerAvatarUpload() {
  avatarInput.value.click()
}

// 处理头像选择
function handleAvatarChange(e) {
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
  
  const x = e.clientX
  const y = e.clientY
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

// 确认剪裁
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
  
  // 计算剪裁区域
  const boxSize = 200
  const offsetX = (containerWidth - boxSize) / 2
  const offsetY = (containerHeight - boxSize) / 2
  
  // 绘制圆形剪裁
  outputCtx.beginPath()
  outputCtx.arc(outputSize/2, outputSize/2, outputSize/2, 0, Math.PI * 2)
  outputCtx.closePath()
  outputCtx.clip()
  
  // 从原canvas复制剪裁区域
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
  profile.value.avatar = outputCanvas.toDataURL('image/jpeg', 0.9)
  showCropper.value = false
}

// 取消剪裁
function cancelCropper() {
  showCropper.value = false
}

// 保存个人信息
async function handleSave() {
  const phone = localStorage.getItem('user_phone')
  if (!phone) {
    router.push('/settings')
    return
  }
  
  try {
    // 保存到后端
    await axios.put(`/api/users/${phone}`, {
      avatar: profile.value.avatar,
      nickname: profile.value.nickname,
      identity: profile.value.identity,
      wechat: profile.value.wechat,
      car_model: profile.value.carModel
    })
  } catch (error) {
    console.error('保存到后端失败:', error)
  }
  
  // 显示成功提示
  const toast = document.createElement('div')
  toast.className = 'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black bg-opacity-75 text-white px-6 py-3 rounded-lg z-50 text-sm'
  toast.textContent = '✓ 保存成功'
  document.body.appendChild(toast)
  setTimeout(() => toast.remove(), 1500)
  
  // 返回上一页
  setTimeout(() => {
    router.back()
  }, 1500)
}

onMounted(() => {
  loadProfile()
})
</script>
