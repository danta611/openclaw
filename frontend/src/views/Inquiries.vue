<template>
  <div class="p-3">
    <!-- 确认弹窗：删除询价单 -->
    <ConfirmDialog 
      ref="deleteOrderDialog" 
      message="确定要删除这个询价单吗？" 
      @confirm="doDeleteOrder"
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
      <div class="bg-gray-50 px-4 py-3 border-b">
        <Breadcrumb 
          :breadcrumbs="[
            { label: '首页', to: '/' },
            { label: '询价单' }
          ]"
        />
      </div>

      <div v-if="loading" class="text-center py-12">
        <div class="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
        <p class="text-gray-500 mt-4">加载中...</p>
      </div>

      <div v-else-if="quotations.length === 0" class="text-center py-16">
        <svg class="w-20 h-20 text-gray-300 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
        </svg>
        <p class="text-gray-500 mt-4 text-sm">暂无询价单</p>
        <button 
          @click="$router.push('/')"
          class="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors"
        >
          去选购商品
        </button>
      </div>

      <div v-else class="divide-y">
        <div 
          v-for="quote in quotations" 
          :key="quote.id"
          class="p-4 hover:bg-gray-50"
        >
          <div class="flex items-start justify-between">
            <!-- 左侧：订单信息 -->
            <div class="flex-1">
              <!-- 第一行：订单号 + 状态 -->
              <div class="mb-2 cursor-pointer flex items-center gap-2" @click="viewDetail(quote.id)">
                <span class="font-mono text-sm text-blue-600">{{ quote.quotation_no }}</span>
                <span 
                  :class="[
                    'px-1.5 py-0.5 rounded text-xs font-medium',
                    quote.inquiry_status === '已答复' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'bg-green-100 text-green-700'
                  ]"
                >
                  {{ quote.inquiry_status || '询价中' }}
                </span>
              </div>
              
              <!-- 第二行：商品数量 -->
              <div class="mb-2 cursor-pointer" @click="viewDetail(quote.id)">
                <span class="text-gray-600 text-sm">共 {{ getItemCount(quote) }} 件商品</span>
              </div>
              
              <!-- 第三行：查看详情 -->
              <button 
                @click="viewDetail(quote.id)"
                class="text-blue-600 text-sm hover:underline"
              >
                查看详情
              </button>
            </div>
            
            <!-- 右侧：订单信息 -->
            <div class="text-right ml-4">
              <!-- 第一行：日期 -->
              <div class="mb-2">
                <span class="text-sm text-gray-500">{{ formatDate(quote.created_at) }}</span>
              </div>
              
              <!-- 第二行：金额 -->
              <div class="mb-2">
                <template v-if="quote.inquiry_status === '已答复' && quote.discount_amount > 0">
                  <div class="text-sm text-gray-400 line-through">原总计 ¥{{ Math.floor(Number(quote.original_total || quote.total_amount)) }}</div>
                  <div class="text-sm text-red-600 font-medium">立减 ¥{{ Math.floor(Number(quote.discount_amount)) }}</div>
                  <div class="text-lg font-bold text-blue-600">¥{{ Math.floor(Number(quote.final_total || quote.total_amount)) }}</div>
                </template>
                <template v-else-if="quote.inquiry_status === '已答复'">
                  <div class="text-lg font-bold text-blue-600">¥{{ Math.floor(Number(quote.final_total || quote.total_amount)) }}</div>
                </template>
                <template v-else>
                  <div class="text-lg">
                    <span class="text-gray-600">预估：</span>
                    <span class="font-bold text-blue-600">¥{{ Math.floor(Number(quote.total_amount)) }}</span>
                  </div>
                </template>
              </div>
              
              <!-- 第三行：删除 -->
              <button 
                @click="deleteQuotation(quote.id)"
                class="text-red-500 text-sm hover:text-red-600"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import ConfirmDialog from '../components/ConfirmDialog.vue'
import Breadcrumb from '../components/Breadcrumb.vue'

const router = useRouter()
const quotations = ref([])
const loading = ref(true)

const deleteOrderDialog = ref(null)
const alertDialog = ref(null)
const alertMessage = ref('')
const pendingDeleteOrderId = ref(null)

function showAlert(message) {
  alertMessage.value = message
  alertDialog.value.open()
}

function doCloseAlert() {
}

async function loadQuotations() {
  try {
    const res = await axios.get('/api/quotations')
    quotations.value = res.data.data
  } catch (error) {
    console.error('加载询价单失败:', error)
  } finally {
    loading.value = false
  }
}

function formatDate(dateStr) {
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN')
}

function getStatusText(status) {
  const map = {
    draft: '草稿',
    pending: '待处理',
    accepted: '已接受',
    rejected: '已拒绝'
  }
  return map[status] || status
}

function viewDetail(id) {
  router.push(`/inquiry/${id}`)
}

// 获取询价单商品总数
function getItemCount(quote) {
  if (quote.items && quote.items.length > 0) {
    return quote.items.reduce((sum, item) => sum + item.quantity, 0)
  }
  return 0
}

// 删除询价单
async function deleteQuotation(id) {
  pendingDeleteOrderId.value = id
  deleteOrderDialog.value.open()
}

async function doDeleteOrder() {
  if (pendingDeleteOrderId.value) {
    try {
      await axios.delete(`/api/quotations/${pendingDeleteOrderId.value}`)
      // 重新加载询价单列表
      loadQuotations()
      pendingDeleteOrderId.value = null
    } catch (error) {
      console.error('删除询价单失败:', error)
      showAlert('删除询价单失败，请稍后重试')
    }
  }
}

onMounted(() => {
  loadQuotations()
})
</script>
