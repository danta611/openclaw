<template>
  <div class="bg-white min-h-screen pb-20" v-if="product">
    <!-- 顶部导航栏 -->
    <div class="sticky top-0 bg-white border-b z-50 px-4 py-3">
      <div class="flex items-center justify-between">
        <!-- 分类路径和商品ID -->
        <div class="flex-1 min-w-0 mr-4 flex items-center gap-2">
          <span class="text-sm text-gray-600 truncate">{{ categoryPath }}</span>
          <span v-if="product" class="text-sm text-gray-400">/</span>
          <span v-if="product" class="text-sm text-blue-600 font-mono">{{ displayProductId }}</span>
        </div>

        <!-- 返回箭头 -->
        <button @click="$router.back()" class="text-gray-500 flex-shrink-0">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- 提示弹窗：错误提示 -->
    <ConfirmDialog 
      ref="alertDialog" 
      :showCancel="false" 
      confirmText="确定"
      @confirm="doCloseAlert"
    >
      <template #content>
        <p class="text-gray-800 mb-6">{{ alertMessage }}</p>
      </template>
    </ConfirmDialog>

    <!-- 商品图片轮播 -->
    <div class="aspect-square bg-gray-50 relative overflow-hidden" @touchstart="onTouchStart" @touchmove="onTouchMove" @touchend="onTouchEnd">
      <div class="flex h-full" :style="{ transform: `translateX(-${currentImageIndex * 100}%)`, transition: isDragging ? 'none' : 'transform 0.3s ease' }">
        <div v-for="(img, idx) in productImages" :key="idx" class="w-full h-full flex-shrink-0">
          <img 
            :src="getImageUrl(img)" 
            :alt="product.name"
            class="w-full h-full object-contain p-4"
            @error="(e) => { e.target.src = placeholderImage }"
          />
        </div>
      </div>
      <!-- 指示器 -->
      <div v-if="productImages.length > 1" class="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-1.5">
        <div 
          v-for="(img, idx) in productImages" 
          :key="idx"
          :class="['w-2 h-2 rounded-full transition-all', currentImageIndex === idx ? 'bg-blue-600 w-4' : 'bg-gray-400']"
        ></div>
      </div>
    </div>

    <!-- 商品信息 -->
    <div class="p-4">
      <div class="mb-4">
        <div class="flex items-start justify-between">
          <h1 class="text-lg font-bold text-gray-800 leading-snug flex-1 mr-3">{{ product.name }}</h1>
          <span 
            :class="['px-2 py-1 rounded text-xs font-medium flex-shrink-0', {
              'bg-emerald-100 text-emerald-700': product.stock_status === '有货' || product.stock_status === '现货',
              'bg-blue-100 text-blue-700': product.stock_status === '预定',
              'bg-rose-100 text-rose-700': product.stock_status === '缺货',
              'bg-amber-100 text-amber-700': product.stock_status === '上新'
            }]"
          >
            {{ product.stock_status }}
          </span>
        </div>
        <p v-if="product.model" class="text-base text-slate-700 mt-1 font-medium">{{ product.model }}</p>
        <p class="text-sm text-gray-500 mt-2 leading-relaxed">{{ product.description }}</p>
      </div>

      <div class="mb-4 flex items-center justify-between">
        <div class="text-2xl font-bold text-slate-800">¥{{ Math.floor(Number(product.price)) }}</div>
        <!-- 正常位置的加入采购车按钮 -->
        <button 
          ref="normalButton"
          @click="addToCart"
          :class="[
            'px-6 py-3 rounded-full font-medium text-sm shadow-lg transition-all',
            getAddedCount(product.id) > 0 
              ? 'bg-green-500 text-white' 
              : 'bg-blue-600 text-white hover:bg-blue-700'
          ]"
        >
          {{ getAddedCount(product.id) > 0 ? `已加入（${getAddedCount(product.id)}）` : '加入采购车' }}
        </button>
      </div>
      
      <!-- 悬浮的加入采购车按钮 -->
      <transition name="fade">
        <button 
          v-if="showFloatingButton && !isButtonVisible"
          @click="addToCart"
          :class="[
            'fixed bottom-[72px] right-4 px-5 py-2.5 rounded-full font-medium text-sm shadow-lg transition-all z-40',
            getAddedCount(product.id) > 0 
              ? 'bg-green-500 text-white' 
              : 'bg-blue-600 text-white hover:bg-blue-700'
          ]"
        >
          {{ getAddedCount(product.id) > 0 ? `已加入（${getAddedCount(product.id)}）` : '加入采购车' }}
        </button>
      </transition>

      <!-- 商品详情 -->
      <div class="border-t pt-4 mb-4">
        <h2 class="text-sm font-semibold text-gray-800 mb-3 text-center">商品详情</h2>
        <!-- Markdown详情展示 -->
        <div v-if="productDetailHtml" class="markdown-content max-w-none">
          <div v-html="productDetailHtml"></div>
        </div>
        <!-- 旧的详情图片（兼容） -->
        <div v-else class="space-y-3">
          <img 
            v-for="(img, index) in detailImages" 
            :key="index"
            :src="img"
            class="w-full rounded-lg"
            alt="商品详情"
          />
        </div>
      </div>
    </div>
  </div>

  <div v-else class="flex items-center justify-center min-h-screen">
    <div class="text-center">
      <div class="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
      <p class="text-gray-500 mt-4 text-sm">加载中...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import { marked } from 'marked'
import { usePurchaseStore } from '../stores/purchase'
import ConfirmDialog from '../components/ConfirmDialog.vue'
import { formatProductId, CATEGORY_CODES } from '../utils/productId'

const route = useRoute()
const router = useRouter()
const purchaseStore = usePurchaseStore()

const product = ref(null)
const categories = ref([])
const loading = ref(true)

// 占位图片
const placeholderImage = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9IiM5Y2EzYWYiPjxwYXRoIGQ9Ik0yMSAxOVY1YzAtMS4xLS45LTItMi0ySDVjLTEuMSAwLTIgLjktMiAydjE0YzAgMS4xLjkgMiAyIDJoMTRjMS4xIDAgMi0uOSAyLTJ6TTguNSAxMy41bDIuNSAzLjAxTDE0LjUgMTJsNC41IDZINWwzLjUtNC41eiIvPjwvc3ZnPg=='

// 获取完整图片URL
function getImageUrl(path) {
  if (!path) return placeholderImage
  if (path.startsWith('http') || path.startsWith('data:')) return path
  return 'http://62.234.29.89' + path
}

// 轮播图相关
const currentImageIndex = ref(0)
const touchStartX = ref(0)
const touchEndX = ref(0)
const isDragging = ref(false)

// 轮播图touch事件
function onTouchStart(e) {
  touchStartX.value = e.touches[0].clientX
  isDragging.value = true
}

function onTouchMove(e) {
  touchEndX.value = e.touches[0].clientX
}

function onTouchEnd() {
  if (!isDragging.value) return
  const diff = touchStartX.value - touchEndX.value
  const threshold = 50 // 滑动阈值
  if (diff > threshold && currentImageIndex.value < productImages.value.length - 1) {
    currentImageIndex.value++
  } else if (diff < -threshold && currentImageIndex.value > 0) {
    currentImageIndex.value--
  }
  isDragging.value = false
}

// 解析商品图片数组
const productImages = computed(() => {
  if (!product.value) return []
  if (product.value.images && Array.isArray(product.value.images)) {
    return product.value.images
  }
  if (product.value.image_url) {
    try {
      const parsed = JSON.parse(product.value.image_url)
      return Array.isArray(parsed) ? parsed : [parsed]
    } catch (e) {
      return [product.value.image_url]
    }
  }
  return []
})

// Markdown 转 HTML
const productDetailHtml = computed(() => {
  if (!product.value?.detail_html) return ''
  try {
    return marked(product.value.detail_html)
  } catch (e) {
    return product.value.detail_html
  }
})

// 商品详情图片（示例）
const detailImages = [
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1542362567-b07e54358753?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1539185441755-769473a23570?w=800&h=600&fit=crop'
]
const alertDialog = ref(null)
const alertMessage = ref('')
const showFloatingButton = ref(true)
const normalButton = ref(null)
const isButtonVisible = ref(true)
let inactivityTimer = null
let scrollTimer = null

// 计算已加入的商品数量
const getAddedCount = computed(() => {
  return (productId) => {
    const item = purchaseStore.items.find(i => i.id === productId)
    return item ? item.quantity : 0
  }
})

// 重置不活动计时器
function resetInactivityTimer() {
  showFloatingButton.value = true
  
  if (inactivityTimer) {
    clearTimeout(inactivityTimer)
  }
  
  inactivityTimer = setTimeout(() => {
    showFloatingButton.value = false
  }, 3000)
}

// 检测按钮是否在可见区域
function checkButtonVisibility() {
  if (normalButton.value) {
    const rect = normalButton.value.getBoundingClientRect()
    isButtonVisible.value = (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    )
  }
}

// 处理用户活动事件
function handleUserActivity() {
  resetInactivityTimer()
  checkButtonVisibility()
}

// 滚动时频繁检查按钮可见性
function handleScroll() {
  checkButtonVisibility()
  resetInactivityTimer()
}

// 计算分类路径
const categoryPath = computed(() => {
  if (!product.value || !product.value.category_id) return ''
  const category = categories.value.find(c => c.id === product.value.category_id)
  if (!category) return ''
  
  // 如果是子分类，找父分类
  if (category.parent_id) {
    const parentCategory = categories.value.find(c => c.id === category.parent_id)
    if (parentCategory) {
      return `${parentCategory.name} / ${category.name}`
    }
  }
  return category.name
})

// 商品显示ID
const displayProductId = computed(() => {
  if (!product.value) return ''
  return formatProductId(product.value)
})

function showAlert(message) {
  alertMessage.value = message
  alertDialog.value.open()
}

function doCloseAlert() {
  router.push('/')
}

const specs = computed(() => {
  if (!product.value?.specs) return {}
  try {
    return JSON.parse(product.value.specs)
  } catch {
    return {}
  }
})

// 加载分类
async function loadCategories() {
  try {
    const res = await axios.get('/api/categories')
    // 扁平化分类列表
    const flatCategories = []
    res.data.data.forEach(cat => {
      flatCategories.push(cat)
      if (cat.children) {
        cat.children.forEach(subCat => {
          flatCategories.push(subCat)
        })
      }
    })
    categories.value = flatCategories
  } catch (error) {
    console.error('加载分类失败:', error)
  }
}

async function loadProduct() {
  try {
    const res = await axios.get(`/api/products/${route.params.id}`)
    product.value = res.data.data
  } catch (error) {
    console.error('加载商品失败:', error)
    showAlert('商品不存在')
  } finally {
    loading.value = false
  }
}

function addToCart() {
  purchaseStore.addItem(product.value)
  purchaseStore.saveCart()
  
  const toast = document.createElement('div')
  toast.className = 'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black bg-opacity-75 text-white px-6 py-3 rounded-lg z-50 text-sm'
  toast.textContent = `✓ 已加入采购车`
  document.body.appendChild(toast)
  setTimeout(() => toast.remove(), 1500)
}



onMounted(() => {
  loadCategories()
  loadProduct()
  
  // 监听用户活动事件
  window.addEventListener('scroll', handleScroll)
  window.addEventListener('mousemove', handleUserActivity)
  window.addEventListener('touchmove', handleUserActivity)
  window.addEventListener('click', handleUserActivity)
  window.addEventListener('keydown', handleUserActivity)
  
  // 初始化计时器
  resetInactivityTimer()
  
  // 等页面加载后检查按钮可见性
  setTimeout(() => {
    checkButtonVisibility()
  }, 100)
})

onUnmounted(() => {
  // 清理事件监听
  window.removeEventListener('scroll', handleScroll)
  window.removeEventListener('mousemove', handleUserActivity)
  window.removeEventListener('touchmove', handleUserActivity)
  window.removeEventListener('click', handleUserActivity)
  window.removeEventListener('keydown', handleUserActivity)
  
  if (inactivityTimer) {
    clearTimeout(inactivityTimer)
  }
  if (scrollTimer) {
    clearTimeout(scrollTimer)
  }
})
</script>

<style scoped>
/* Markdown样式 */
.markdown-content :deep(h1) {
  font-size: 1.5rem;
  font-weight: bold;
  margin-top: 1rem;
  margin-bottom: 0.5rem;
  color: #1f2937;
}

.markdown-content :deep(h2) {
  font-size: 1.25rem;
  font-weight: bold;
  margin-top: 1rem;
  margin-bottom: 0.5rem;
  color: #1f2937;
}

.markdown-content :deep(h3) {
  font-size: 1.1rem;
  font-weight: bold;
  margin-top: 0.75rem;
  margin-bottom: 0.5rem;
  color: #1f2937;
}

.markdown-content :deep(p) {
  margin-bottom: 0.75rem;
  line-height: 1.75;
  color: #4b5563;
}

.markdown-content :deep(ul),
.markdown-content :deep(ol) {
  margin-bottom: 0.75rem;
  padding-left: 1.5rem;
}

.markdown-content :deep(li) {
  margin-bottom: 0.25rem;
  line-height: 1.75;
  color: #4b5563;
}

.markdown-content :deep(blockquote) {
  border-left: 4px solid #3b82f6;
  padding-left: 1rem;
  margin: 0.75rem 0;
  color: #6b7280;
  font-style: italic;
  background-color: #f9fafb;
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
  padding-right: 0.5rem;
  border-radius: 0 0.375rem 0.375rem 0;
}

.markdown-content :deep(code) {
  background-color: #f3f4f6;
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  font-family: ui-monospace, monospace;
  font-size: 0.875rem;
  color: #dc2626;
}

.markdown-content :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 0.75rem 0;
}

.markdown-content :deep(th),
.markdown-content :deep(td) {
  border: 1px solid #e5e7eb;
  padding: 0.5rem 0.75rem;
  text-align: left;
}

.markdown-content :deep(th) {
  background-color: #f9fafb;
  font-weight: 600;
  color: #374151;
}

.markdown-content :deep(img) {
  max-width: 100%;
  border-radius: 0.5rem;
  margin: 0.75rem 0;
}

.markdown-content :deep(a) {
  color: #3b82f6;
  text-decoration: underline;
}

.markdown-content :deep(a:hover) {
  color: #1d4ed8;
}

.markdown-content :deep(strong) {
  font-weight: 600;
  color: #1f2937;
}

.markdown-content :deep(em) {
  font-style: italic;
}

.markdown-content :deep(span) {
  /* 保留内联样式 */
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style>
