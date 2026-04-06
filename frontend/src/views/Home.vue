<template>
  <div class="flex h-[calc(100vh-120px)] overflow-hidden">
    <!-- 左侧分类树 -->
    <aside class="w-28 flex-shrink-0 bg-white border-r" style="height: 100%;">
      <div class="p-2 h-full overflow-y-auto scrollbar-hide">
        <button 
          @click="selectCategory(null)"
          :class="['w-full text-left px-2 py-2.5 rounded-lg text-sm mb-1 transition-all', selectedCategory === null ? 'bg-slate-700 text-white' : 'text-gray-700 hover:bg-gray-100']"
        >
          全部
        </button>
        <div v-for="category in categories" :key="category.id">
          <button 
            @click="handleCategoryClick(category.id)"
            :class="['w-full text-left px-2 py-2.5 rounded-lg text-sm mb-1 transition-all flex items-center justify-between', selectedCategory === category.id ? 'bg-slate-700 text-white' : 'text-gray-700 hover:bg-gray-100']"
          >
            <span>{{ category.name }}</span>
            <svg 
              v-if="category.children && category.children.length > 0"
              :class="['w-3 h-3 transition-transform flex-shrink-0', expandedCategories.includes(category.id) ? 'rotate-90' : '']" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </button>
          <div v-if="expandedCategories.includes(category.id)" class="ml-2 mt-0.5 space-y-0.5">
            <button 
              v-for="subCat in category.children" 
              :key="subCat.id"
              @click="selectCategory(subCat.id)"
              :class="['w-full text-left px-2 py-1.5 rounded text-xs transition-all', selectedCategory === subCat.id ? 'bg-slate-100 text-slate-700' : 'text-gray-500 hover:bg-gray-50']"
            >
              {{ subCat.name }}
            </button>
          </div>
        </div>
      </div>
    </aside>

    <!-- 右侧商品列表 -->
    <main class="flex-1 overflow-y-auto" style="height: 100%;">
      <!-- 搜索栏 -->
      <div class="sticky top-0 z-10 bg-gray-50 px-3 py-2 border-b">
        <div class="relative flex items-center gap-2">
          <div class="relative flex-1">
            <input 
              v-model="searchQuery"
              type="text" 
              placeholder="搜索商品..."
              class="w-full pl-8 pr-16 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
            />
            <svg class="w-4 h-4 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <!-- 清空按钮 -->
            <button 
              v-if="searchQuery"
              @click="clearSearch"
              class="absolute right-10 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            >
              <svg class="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
          <!-- 视图切换按钮 -->
          <button 
            @click="toggleViewMode"
            class="w-9 h-9 flex items-center justify-center bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex-shrink-0"
            :title="viewMode === 'grid' ? '切换为列表视图' : '切换为网格视图'"
          >
            <svg v-if="viewMode === 'grid'" class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/>
            </svg>
            <svg v-else class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- 商品列表 -->
      <div v-if="loading" class="text-center py-12">
        <div class="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
        <p class="text-gray-500 mt-4 text-sm">加载中...</p>
      </div>

      <div v-else class="p-2">
        <!-- 网格视图（两列） -->
        <div v-if="viewMode === 'grid'" class="grid grid-cols-2 gap-1.5">
          <div 
            v-for="product in filteredProducts" 
            :key="product.id"
            class="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100 cursor-pointer"
            @click="goToProduct(product.id)"
          >
            <div class="relative pt-[100%] bg-gray-50">
              <img 
                :src="getProductImage(product)" 
                :alt="product.name"
                class="absolute inset-0 w-full h-full object-contain p-2"
                @error="handleImageError"
              />
              <span 
                :class="['absolute top-1 right-1 px-1 py-0.5 rounded text-[9px] font-medium', {
                  'bg-emerald-100 text-emerald-700': product.stock_status === '现货',
                  'bg-blue-100 text-blue-700': product.stock_status === '预定',
                  'bg-rose-100 text-rose-700': product.stock_status === '缺货',
                  'bg-amber-100 text-amber-700': product.stock_status === '上新'
                }]"
              >
                {{ product.stock_status }}
              </span>
            </div>
            <div class="p-2 flex flex-col min-h-[150px]">
              <h3 class="font-semibold text-slate-800 text-[12px] leading-tight line-clamp-1 tracking-tight">{{ product.name }}</h3>
              <p v-if="product.model" class="text-[10px] text-slate-600 mt-0.5 font-medium line-clamp-1">{{ product.model }}</p>
              <div class="mt-1 min-h-[32px]">
                <p class="text-[10px] text-gray-500 line-clamp-2">{{ product.description }}</p>
              </div>
              <div class="mt-auto pt-2">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-bold text-orange-600 tracking-tight">¥{{ Math.round(product.price) }}</span>
                </div>
                <button 
                  @click.stop="addToCart(product)"
                  :class="[
                    'mt-1.5 w-full rounded py-1 text-[10px] font-medium transition-colors',
                    getAddedCount(product.id) > 0 
                      ? 'bg-green-500 text-white border-green-500' 
                      : 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700'
                  ]"
                >
                  {{ getAddedCount(product.id) > 0 ? `已加入（${getAddedCount(product.id)}）` : '加入采购车' }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 列表视图（单列）- 图上信息下 -->
        <div v-else class="space-y-3">
          <div 
            v-for="product in filteredProducts" 
            :key="product.id"
            class="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100 cursor-pointer"
            @click="goToProduct(product.id)"
          >
            <div class="relative pt-[65%] bg-gray-100">
              <img 
                :src="getProductImage(product)" 
                :alt="product.name"
                class="absolute inset-0 w-full h-full object-cover"
                @error="handleImageError"
              />
              <span 
                :class="['absolute top-2 right-2 px-2 py-1 rounded text-xs font-medium', {
                  'bg-emerald-100 text-emerald-700': product.stock_status === '现货',
                  'bg-blue-100 text-blue-700': product.stock_status === '预定',
                  'bg-rose-100 text-rose-700': product.stock_status === '缺货',
                  'bg-amber-100 text-amber-700': product.stock_status === '上新'
                }]"
              >
                {{ product.stock_status }}
              </span>
            </div>
            <div class="p-4">
              <h3 class="font-semibold text-slate-800 text-base">{{ product.name }}</h3>
              <p v-if="product.model" class="text-sm text-slate-600 mt-1 font-medium">{{ product.model }}</p>
              <p class="text-sm text-gray-500 mt-2 line-clamp-2" style="min-height: 1.2em;">{{ product.description }}</p>
              <div class="flex items-center justify-between mt-4">
                <span class="text-lg font-bold text-orange-600 tracking-tight">¥{{ Math.round(product.price) }}</span>
                <button 
                  @click.stop="addToCart(product)"
                  :class="[
                    'rounded-lg px-4 py-2 text-xs font-medium transition-colors whitespace-nowrap',
                    getAddedCount(product.id) > 0 
                      ? 'bg-green-500 text-white border-green-500' 
                      : 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700'
                  ]"
                >
                  {{ getAddedCount(product.id) > 0 ? `已加入（${getAddedCount(product.id)}）` : '加入采购车' }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div v-if="!loading && filteredProducts.length === 0" class="text-center py-12">
          <svg class="w-12 h-12 text-gray-300 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
          </svg>
          <p class="text-gray-500 mt-4 text-sm">暂无商品</p>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { usePurchaseStore } from '../stores/purchase'

const router = useRouter()
const purchaseStore = usePurchaseStore()

const categories = ref([])
const products = ref([])
const loading = ref(true)
const searchQuery = ref('')
const selectedCategory = ref(null)
const expandedCategories = ref([])
const viewMode = ref('grid') // 'grid' 或 'list'

// 占位图片（默认图标）- 使用纯色SVG，避免网络请求
const PLACEHOLDER_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSI0MDAiIGZpbGw9IiNGMUY1RjkiLz48cGF0aCBkPSJNMjAwIDE1MEMyMjcuNjE0IDE1MCAyNTAgMTI3LjYxNCAyNTAgMTAwQzI1MCA3Mi4zODYzIDIyNy42MTQgNTAgMjAwIDUwQzE3Mi4zODYgNTAgMTUwIDcyLjM4NjMgMTUwIDEwMEMxNTAgMTI3LjYxNCAxNzIuMzg2IDE1MCAyMDAgMTUwWiIgZmlsbD0iIzk0QTNCQiIvPjxwYXRoIGQ9Ik0xMDAgMjI1QzEwMCAyMTMuOTU0IDEwOC45NTQgMjA1IDEyMCAyMDVIMjgwQzI5MS4wNDYgMjA1IDMwMCAyMTMuOTU0IDMwMCAyMjVWMzUwQzMwMCAzNjEuMDQ2IDI5MS4wNDYgMzcwIDI4MCAzNzBIMTIwQzEwOC45NTQgMzcwIDEwMCAzNjEuMDQ2IDEwMCAzNTBWMjI1WiIgZmlsbD0iIzk0QTNCQiIvPjwvc3ZnPg=='

// 加载分类
async function loadCategories() {
  try {
    const res = await axios.get('/api/categories')
    categories.value = res.data.data
    // 默认不展开分类
    expandedCategories.value = []
  } catch (error) {
    console.error('加载分类失败:', error)
  }
}

// 加载商品
async function loadProducts() {
  try {
    loading.value = true
    const params = {}
    if (selectedCategory.value) {
      params.category_id = selectedCategory.value
    }
    if (searchQuery.value) {
      params.search = searchQuery.value
    }
    const res = await axios.get('/api/products', { params })
    products.value = res.data.data
  } catch (error) {
    console.error('加载商品失败:', error)
  } finally {
    loading.value = false
  }
}

const filteredProducts = computed(() => {
  let result = products.value
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(p => 
      p.name.toLowerCase().includes(query) || 
      p.description.toLowerCase().includes(query)
    )
  }
  
  return result
})

// 处理分类点击 - 同时切换展开/收起和加载商品
function handleCategoryClick(categoryId) {
  // 切换展开/收起状态
  const index = expandedCategories.value.indexOf(categoryId)
  if (index > -1) {
    expandedCategories.value.splice(index, 1)
  } else {
    expandedCategories.value.push(categoryId)
  }
  // 同时加载该分类下的商品
  selectCategory(categoryId)
}

// 切换分类展开/收起（不加载商品）
function toggleCategory(categoryId) {
  const index = expandedCategories.value.indexOf(categoryId)
  if (index > -1) {
    expandedCategories.value.splice(index, 1)
  } else {
    expandedCategories.value.push(categoryId)
  }
}

// 选择分类
function selectCategory(categoryId) {
  selectedCategory.value = categoryId
  loadProducts()
}

// 切换视图模式
function toggleViewMode() {
  viewMode.value = viewMode.value === 'grid' ? 'list' : 'grid'
}

// 清空搜索
function clearSearch() {
  searchQuery.value = ''
  loadProducts()
}

// 获取商品图片（处理空图片）
function getProductImage(product) {
  // 优先使用 images 数组的第一张图
  if (product.images && Array.isArray(product.images) && product.images.length > 0) {
    const firstImage = product.images[0]
    if (firstImage && firstImage.startsWith('/')) {
      return 'http://62.234.29.89' + firstImage
    }
    return firstImage
  }
  // 兼容旧的 image_url 字段
  if (!product.image_url || product.image_url === '/uploads/default-product.png') {
    return PLACEHOLDER_IMAGE
  }
  // 如果是相对路径，拼接完整 URL
  if (product.image_url.startsWith('/')) {
    return 'http://62.234.29.89' + product.image_url
  }
  return product.image_url
}

// 图片加载失败处理
function handleImageError(e) {
  e.target.src = PLACEHOLDER_IMAGE
}

function goToProduct(productId) {
  router.push(`/product/${productId}`)
}

// 计算已加入的商品数量
const getAddedCount = computed(() => {
  return (productId) => {
    const item = purchaseStore.items.find(i => i.id === productId)
    return item ? item.quantity : 0
  }
})

function addToCart(product) {
  purchaseStore.addItem(product)
  purchaseStore.saveCart()
  
  const toast = document.createElement('div')
  toast.className = 'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black bg-opacity-75 text-white px-6 py-3 rounded-lg z-50 text-sm toast'
  toast.textContent = `✓ 已加入采购车`
  document.body.appendChild(toast)
  setTimeout(() => toast.remove(), 1500)
}

onMounted(() => {
  loadCategories()
  loadProducts()
})
</script>

<style scoped>
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>
