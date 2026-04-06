<template>
  <div class="p-3">
    <!-- 确认弹窗：提交询价 -->
    <ConfirmDialog ref="submitDialog" @confirm="doSubmitQuotation">
      <template #content>
        <div class="text-gray-800 mb-6">
          <p class="mb-2">确定提交询价吗？</p>
          <p class="text-sm text-gray-500">提交后将清空采购车，可到订单处查看详情。</p>
        </div>
      </template>
    </ConfirmDialog>
    
    <!-- 确认弹窗：删除商品 -->
    <ConfirmDialog 
      ref="deleteItemDialog" 
      message="确定要删除这个商品吗？" 
      @confirm="doDeleteItem"
    />
    
    <!-- 确认弹窗：清空采购车 -->
    <ConfirmDialog 
      ref="clearCartDialog" 
      message="确定要清空采购车吗？" 
      @confirm="doClearCart"
    />
    
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

    <div class="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
      <!-- 页面标题 -->
      <div class="bg-gray-50 px-4 py-3 border-b">
        <Breadcrumb 
          :breadcrumbs="[
            { label: '首页', to: '/' },
            { label: '采购车' }
          ]"
        />
      </div>

      <!-- 商品列表 -->
      <div v-if="purchaseStore.items.length > 0">
        <div 
          v-for="item in purchaseStore.items" 
          :key="item.id"
          class="flex items-center gap-3 p-3 border-b last:border-b-0"
        >
          <!-- 商品图片 -->
          <div class="w-16 h-16 bg-gray-100 rounded flex-shrink-0 overflow-hidden">
            <img 
              :src="getProductImage(item)" 
              :alt="item.name"
              class="w-full h-full object-cover"
              @error="handleImageError"
            />
          </div>

          <!-- 商品信息 -->
          <div class="flex-1 min-w-0">
            <h3 class="font-medium text-gray-800 text-sm line-clamp-1">{{ item.name }}</h3>
            <p v-if="item.model" class="text-xs text-slate-600 mt-0.5 font-medium line-clamp-1">{{ item.model }}</p>
            <p v-else class="text-xs text-gray-400 mt-0.5 line-clamp-1">&nbsp;</p>
            <div class="text-blue-600 font-bold text-sm mt-1">¥{{ Math.floor(Number(item.price)) }}</div>
          </div>

          <!-- 数量选择器 -->
          <div class="flex flex-col items-end gap-2">
            <div class="quantity-selector flex items-center border border-gray-200 rounded overflow-hidden">
              <button @click="decreaseQuantity(item.id)" class="w-6 h-6 bg-gray-50 flex items-center justify-center text-gray-600 hover:bg-gray-100 text-sm">−</button>
              <input 
                type="number" 
                :value="item.quantity"
                @change="updateQuantity(item.id, $event.target.value)"
                class="w-7 h-6 text-center text-xs border-none focus:ring-0"
                min="1"
              />
              <button @click="increaseQuantity(item.id)" class="w-6 h-6 bg-gray-50 flex items-center justify-center text-gray-600 hover:bg-gray-100 text-sm">+</button>
            </div>

            <!-- 删除按钮 -->
            <button 
              @click="removeItem(item.id)"
              class="text-xs text-red-500 hover:text-red-600"
            >
              删除
            </button>
          </div>
        </div>

        <!-- 底部操作栏 -->
        <div class="bg-gray-50 px-4 py-3">
          <div class="flex items-center justify-between mb-3">
            <span class="text-sm font-medium text-gray-600">预估总价：</span>
            <span class="text-xl font-bold text-blue-600">¥{{ Math.floor(Number(purchaseStore.totalPrice)) }}</span>
          </div>

          <div class="flex gap-2">
            <button 
              @click="clearCart"
              class="flex-1 bg-gray-200 text-gray-700 py-2.5 rounded-lg font-medium text-sm hover:bg-gray-300 transition-colors"
            >
              清空
            </button>
            <button 
              @click="generateQuotation"
              class="flex-1 bg-blue-600 text-white py-2.5 rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors"
            >
              马上询价
            </button>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else class="text-center py-16">
        <svg class="w-20 h-20 text-gray-300 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
        </svg>
        <p class="text-gray-500 mt-4 text-sm">采购车是空的</p>
        <button 
          @click="$router.push('/')"
          class="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors"
        >
          去选购商品
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePurchaseStore } from '../stores/purchase'
import { useAuthStore } from '../stores/auth'
import axios from 'axios'
import ConfirmDialog from '../components/ConfirmDialog.vue'
import Breadcrumb from '../components/Breadcrumb.vue'

const router = useRouter()
const purchaseStore = usePurchaseStore()
const { isLoggedIn } = useAuthStore()

// 安全加载购物车
onMounted(() => {
  try {
    purchaseStore.loadCart()
  } catch (error) {
    console.error('加载购物车失败:', error)
  }
})

const submitDialog = ref(null)
const deleteItemDialog = ref(null)
const clearCartDialog = ref(null)
const alertDialog = ref(null)
const alertMessage = ref('')

const pendingDeleteItemId = ref(null)

function showAlert(message) {
  alertMessage.value = message
  alertDialog.value.open()
}

function doCloseAlert() {
}

// 占位图片（默认图标）
const PLACEHOLDER_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSI0MDAiIGZpbGw9IiNGMUY1RjkiLz48cGF0aCBkPSJNMjAwIDE1MEMyMjcuNjE0IDE1MCAyNTAgMTI3LjYxNCAyNTAgMTAwQzI1MCA3Mi4zODYzIDIyNy42MTQgNTAgMjAwIDUwQzE3Mi4zODYgNTAgMTUwIDcyLjM4NjMgMTUwIDEwMEMxNTAgMTI3LjYxNCAxNzIuMzg2IDE1MCAyMDAgMTUwWiIgZmlsbD0iIzk0QTNCQiIvPjxwYXRoIGQ9Ik0xMDAgMjI1QzEwMCAyMTMuOTU0IDEwOC45NTQgMjA1IDEyMCAyMDVIMjgwQzI5MS4wNDYgMjA1IDMwMCAyMTMuOTU0IDMwMCAyMjVWMzUwQzMwMCAzNjEuMDQ2IDI5MS4wNDYgMzcwIDI4MCAzNzBIMTIwQzEwOC45NTQgMzcwIDEwMCAzNjEuMDQ2IDEwMCAzNTBWMjI1WiIgZmlsbD0iIzk0QTNCQiIvPjwvc3ZnPg=='

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

function increaseQuantity(productId) {
  const item = purchaseStore.items.find(i => i.id === productId)
  if (item) {
    purchaseStore.updateQuantity(productId, item.quantity + 1)
    purchaseStore.saveCart()
  }
}

function decreaseQuantity(productId) {
  const item = purchaseStore.items.find(i => i.id === productId)
  if (item && item.quantity > 1) {
    purchaseStore.updateQuantity(productId, item.quantity - 1)
    purchaseStore.saveCart()
  }
}

function updateQuantity(productId, value) {
  const quantity = parseInt(value) || 1
  purchaseStore.updateQuantity(productId, Math.max(1, quantity))
  purchaseStore.saveCart()
}

function removeItem(productId) {
  pendingDeleteItemId.value = productId
  deleteItemDialog.value.open()
}

function doDeleteItem() {
  if (pendingDeleteItemId.value) {
    purchaseStore.removeItem(pendingDeleteItemId.value)
    purchaseStore.saveCart()
    pendingDeleteItemId.value = null
  }
}

function clearCart() {
  clearCartDialog.value.open()
}

function doClearCart() {
  purchaseStore.clearCart()
  purchaseStore.saveCart()
}

function generateQuotation() {
  console.log('generateQuotation called, isLoggedIn:', isLoggedIn.value)
  if (!isLoggedIn.value) {
    console.log('Not logged in, redirecting to settings')
    router.push('/settings')
    return
  }
  console.log('Logged in, opening submit dialog')
  submitDialog.value.open()
}

async function doSubmitQuotation() {
  try {
    const customerPhone = localStorage.getItem('user_phone')
    const response = await axios.post('/api/quotations', {
      customer_phone: customerPhone,
      items: purchaseStore.items.map(item => ({
        product_id: item.id,
        quantity: item.quantity,
        unit_price: item.price
      }))
    })

    if (response.data.success) {
      purchaseStore.clearCart()
      purchaseStore.saveCart()
      router.push('/inquiries')
    }
  } catch (error) {
    console.error('生成采购车失败:', error)
    showAlert('生成采购车失败，请稍后重试')
  }
}
</script>
