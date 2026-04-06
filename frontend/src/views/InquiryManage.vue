<template>
  <div class="p-3">
    <div class="bg-white rounded-lg shadow-lg overflow-hidden">
      <!-- 顶部导航栏 -->
      <div class="bg-gray-50 px-4 py-3 border-b">
        <Breadcrumb 
          :breadcrumbs="[
            { label: '首页', to: '/' },
            { label: '店铺管理', to: '/shop-manage' },
            { label: '询价单管理' }
          ]"
        />
      </div>

      <!-- 搜索筛选 -->
      <div class="p-3 border-b bg-gray-50">
        <div class="flex flex-col gap-2">
          <input 
            v-model="searchKeyword" 
            type="text" 
            placeholder="搜索客户名称/手机号..."
            class="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
          <div class="flex gap-2">
            <select 
              v-model="filterStatus" 
              class="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="">全部状态</option>
              <option value="询价中">询价中</option>
              <option value="已答复">已答复</option>
            </select>
            <input 
              v-model="filterDate" 
              type="date" 
              class="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>
        </div>
      </div>

      <div v-if="loading" class="text-center py-12">
        <div class="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
        <p class="text-gray-500 mt-4 text-sm">加载中...</p>
      </div>

      <div v-else-if="filteredQuotations.length === 0" class="text-center py-16">
        <svg class="w-20 h-20 text-gray-300 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
        </svg>
        <p class="text-gray-500 mt-4 text-sm">暂无询单</p>
      </div>

      <div v-else class="divide-y">
        <div 
          v-for="quote in filteredQuotations" 
          :key="quote.id"
          class="p-3.5"
        >
          <!-- 询单头部 -->
          <div class="flex items-start justify-between mb-2.5">
            <div class="flex items-center gap-2">
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
            <span class="text-xs text-gray-500">{{ formatDate(quote.created_at) }}</span>
          </div>

          <!-- 客户信息 -->
          <div class="mb-2.5 text-sm">
            <div class="text-gray-700">客户：{{ quote.customer_name || '未填写' }}</div>
            <div class="text-gray-500 text-xs">电话：{{ quote.customer_phone || '未填写' }}</div>
          </div>

          <!-- 商品预览 -->
          <div class="mb-2.5 bg-gray-50 rounded-lg p-2.5">
            <div class="text-xs text-gray-500 mb-1.5">共 {{ getItemCount(quote) }} 件商品</div>
            <div v-for="item in quote.items.slice(0, 2)" :key="item.id" class="text-xs text-gray-600 mb-1">
              {{ item.product_name }} x {{ item.quantity }}
            </div>
            <div v-if="quote.items.length > 2" class="text-xs text-gray-400">...还有 {{ quote.items.length - 2 }} 件</div>
          </div>

          <!-- 金额显示 -->
          <div class="mb-2.5">
            <template v-if="quote.inquiry_status === '已答复' && quote.discount_amount > 0">
              <div class="text-sm text-gray-400 line-through">原总计 ¥{{ Math.floor(Number(quote.original_total || quote.total_amount)) }}</div>
              <div class="text-sm text-red-600 font-medium">立减 ¥{{ Math.floor(Number(quote.discount_amount)) }}</div>
              <div class="text-lg font-bold text-blue-600">¥{{ Math.floor(Number(quote.final_total || quote.total_amount)) }}</div>
            </template>
            <template v-else-if="quote.inquiry_status === '已答复'">
              <div class="text-lg font-bold text-blue-600">¥{{ Math.floor(Number(quote.final_total || quote.total_amount)) }}</div>
            </template>
            <template v-else>
              <div class="text-sm text-gray-500 mb-0.5">预估金额</div>
              <div class="text-lg font-bold text-blue-600">¥{{ Math.floor(Number(quote.total_amount)) }}</div>
            </template>
          </div>

          <!-- 操作按钮 -->
          <div class="flex gap-2">
            <button 
              @click="viewDetail(quote.id)"
              class="flex-1 bg-gray-100 text-gray-700 py-1.5 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm"
            >
              查看
            </button>
            <button 
              @click="openEditDialog(quote)"
              class="flex-1 bg-blue-600 text-white py-1.5 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
            >
              修改报价
            </button>
            <button 
              @click="confirmDelete(quote)"
              class="flex-1 bg-red-600 text-white py-1.5 rounded-lg hover:bg-red-700 transition-colors font-medium text-sm"
            >
              删除
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 修改报价弹窗 -->
    <div v-if="showEditDialog" class="fixed inset-0 bg-black bg-opacity-75 z-50 flex flex-col">
      <div class="bg-white w-full h-full flex flex-col">
        <!-- 顶部导航栏 -->
        <div class="bg-gray-50 px-4 py-3 border-b flex items-center flex-shrink-0">
          <div class="flex-1">
            <Breadcrumb 
              :breadcrumbs="[
                { label: '首页', to: '/' },
                { label: '店铺管理', to: '/shop-manage' },
                { label: '询价单管理' },
                { label: '修改报价' }
              ]"
            />
          </div>
          <button @click="closeEditDialog" class="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium ml-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </button>
        </div>
        
        <div class="p-3.5 overflow-y-auto flex-1">
          <div v-for="item in editingQuotation?.items" :key="item.id" class="mb-3.5 pb-3.5 border-b">
            <div class="font-medium text-gray-800 mb-1.5">{{ item.product_name }}</div>
            <div class="text-sm text-gray-500 mb-1.5">数量：{{ item.quantity }}</div>
            
            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="block text-xs font-medium text-gray-700 mb-0.5">原单价</label>
                <input 
                  :value="Math.floor(Number(item.modified_price || item.unit_price))" 
                  type="text" 
                  disabled
                  class="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-400 text-sm"
                />
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-700 mb-0.5">新单价</label>
                <input 
                  v-model.number="item.tempModifiedPrice" 
                  type="number" 
                  step="0.01"
                  min="0"
                  placeholder="请输入新单价"
                  class="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  @input="calculateItemSubtotal(item)"
                />
              </div>
            </div>

            <div class="mt-2 grid grid-cols-2 gap-2">
              <div>
                <label class="block text-xs font-medium text-gray-700 mb-0.5">原小计</label>
                <div class="text-gray-400 line-through text-sm">
                  ¥{{ Math.floor(Number(item.modified_subtotal || item.subtotal)) }}
                </div>
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-700 mb-0.5">新小计</label>
                <div class="text-red-600 font-medium text-sm">
                  ¥{{ Math.floor(Number(item.tempModifiedSubtotal || 0)) }}
                </div>
              </div>
            </div>
          </div>

          <!-- 总计预览 -->
          <div class="bg-gray-50 rounded-lg p-3.5 mt-3.5">
            <div class="mb-1.5">
              <span class="text-sm text-gray-500">原总计：</span>
              <span class="text-gray-400 line-through text-sm">¥{{ Math.floor(Number(editingQuotation?.original_total || editingQuotation?.total_amount)) }}</span>
            </div>
            <div class="mb-1.5" v-if="calculatedDiscount > 0">
              <span class="text-sm text-gray-500">优惠：</span>
              <span class="text-red-600 font-medium text-sm">立减 ¥{{ Math.floor(Number(calculatedDiscount)) }}</span>
            </div>
            <div>
              <span class="text-sm text-gray-500">最终价格：</span>
              <span class="text-blue-600 font-bold text-lg">¥{{ Math.floor(Number(calculatedFinal)) }}</span>
            </div>
          </div>
        </div>
        
        <div class="p-3.5 border-t flex gap-2.5 pb-20">
          <button @click="closeEditDialog" class="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition-colors font-medium text-sm">
            取消
          </button>
          <button @click="saveModifiedQuotation" :disabled="saving" class="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 text-sm">
            {{ saving ? '保存中...' : '保存' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 删除确认弹窗 -->
    <div v-if="showDeleteConfirm" class="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-3">
      <div class="bg-white rounded-lg max-w-sm w-full">
        <div class="p-3.5 border-b">
          <h3 class="text-base font-bold text-gray-800">确认删除</h3>
        </div>
        <div class="p-3.5">
          <p class="text-gray-700 text-sm">
            确定要删除询单「<strong>{{ deletingQuotation?.quotation_no }}</strong>」吗？
          </p>
          <p class="text-gray-500 text-xs mt-1.5">删除后用户端也将不再显示此询单</p>
        </div>
        <div class="p-3.5 border-t flex gap-2.5">
          <button 
            @click="showDeleteConfirm = false; deletingQuotation = null" 
            class="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition-colors font-medium text-sm"
          >
            取消
          </button>
          <button 
            @click="deleteQuotation" 
            :disabled="deleteLoading"
            class="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 text-sm"
          >
            {{ deleteLoading ? '删除中...' : '确认删除' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import Breadcrumb from '../components/Breadcrumb.vue'

const router = useRouter()

const quotations = ref([])
const loading = ref(true)
const searchKeyword = ref('')
const filterStatus = ref('')
const filterDate = ref('')

const showEditDialog = ref(false)
const editingQuotation = ref(null)
const saving = ref(false)

const showDeleteConfirm = ref(false)
const deletingQuotation = ref(null)
const deleteLoading = ref(false)

const filteredQuotations = computed(() => {
  let result = quotations.value
  
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(q => 
      (q.customer_name && q.customer_name.toLowerCase().includes(keyword)) ||
      (q.customer_phone && q.customer_phone.includes(keyword)) ||
      (q.quotation_no && q.quotation_no.toLowerCase().includes(keyword))
    )
  }
  
  if (filterStatus.value) {
    result = result.filter(q => (q.inquiry_status || '询价中') === filterStatus.value)
  }
  
  if (filterDate.value) {
    result = result.filter(q => {
      const quoteDate = new Date(q.created_at).toISOString().split('T')[0]
      return quoteDate === filterDate.value
    })
  }
  
  return result
})

const calculatedDiscount = computed(() => {
  if (!editingQuotation.value) return 0
  const originalTotal = Number(editingQuotation.value.original_total || editingQuotation.value.total_amount)
  const finalTotal = calculatedFinal.value
  return Math.max(0, originalTotal - finalTotal)
})

const calculatedFinal = computed(() => {
  if (!editingQuotation.value) return 0
  return editingQuotation.value.items.reduce((sum, item) => {
    return sum + Number(item.tempModifiedSubtotal || item.modified_subtotal || item.subtotal)
  }, 0)
})

async function loadQuotations() {
  try {
    const res = await axios.get('/api/quotations')
    quotations.value = res.data.data
  } catch (error) {
    console.error('加载询单失败:', error)
  } finally {
    loading.value = false
  }
}

function formatDate(dateStr) {
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN') + ' ' + date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

function getItemCount(quote) {
  if (quote.items && quote.items.length > 0) {
    return quote.items.reduce((sum, item) => sum + item.quantity, 0)
  }
  return 0
}

function viewDetail(id) {
  router.push(`/inquiry/${id}`)
}

function openEditDialog(quote) {
  editingQuotation.value = JSON.parse(JSON.stringify(quote))
  editingQuotation.value.items.forEach(item => {
    item.tempModifiedPrice = item.modified_price || item.unit_price
    item.tempModifiedSubtotal = item.modified_subtotal || item.subtotal
  })
  showEditDialog.value = true
}

function closeEditDialog() {
  showEditDialog.value = false
  editingQuotation.value = null
}

function calculateItemSubtotal(item) {
  if (item.tempModifiedPrice && item.quantity) {
    item.tempModifiedSubtotal = item.tempModifiedPrice * item.quantity
  } else {
    item.tempModifiedSubtotal = 0
  }
}

async function saveModifiedQuotation() {
  if (!editingQuotation.value) return
  
  saving.value = true
  try {
    const originalTotal = Number(editingQuotation.value.original_total || editingQuotation.value.total_amount)
    const finalTotal = calculatedFinal.value
    const discount = Math.max(0, originalTotal - finalTotal)
    
    // 更新报价单
    await axios.put(`/api/quotations/${editingQuotation.value.id}`, {
      inquiry_status: '已答复',
      original_total: originalTotal,
      discount_amount: discount,
      final_total: finalTotal
    })
    
    // 更新每个商品项
    for (const item of editingQuotation.value.items) {
      if (item.tempModifiedPrice !== item.unit_price) {
        await axios.put(`/api/quotation-items/${item.id}`, {
          original_price: item.unit_price,
          modified_price: item.tempModifiedPrice,
          original_subtotal: item.subtotal,
          modified_subtotal: item.tempModifiedSubtotal
        })
      }
    }
    
    closeEditDialog()
    loadQuotations()
    
    const toast = document.createElement('div')
    toast.className = 'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black bg-opacity-75 text-white px-6 py-3 rounded-lg z-50 text-sm'
    toast.textContent = '✓ 保存成功'
    document.body.appendChild(toast)
    setTimeout(() => toast.remove(), 1500)
  } catch (error) {
    console.error('保存报价失败:', error)
    alert('保存失败，请重试: ' + (error.response?.data?.error || error.message))
  } finally {
    saving.value = false
  }
}

function confirmDelete(quote) {
  deletingQuotation.value = quote
  showDeleteConfirm.value = true
}

async function deleteQuotation() {
  if (!deletingQuotation.value) return
  
  deleteLoading.value = true
  try {
    await axios.delete(`/api/quotations/${deletingQuotation.value.id}`)
    showDeleteConfirm.value = false
    deletingQuotation.value = null
    loadQuotations()
    
    const toast = document.createElement('div')
    toast.className = 'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black bg-opacity-75 text-white px-6 py-3 rounded-lg z-50 text-sm'
    toast.textContent = '✓ 删除成功'
    document.body.appendChild(toast)
    setTimeout(() => toast.remove(), 1500)
  } catch (error) {
    console.error('删除询单失败:', error)
    alert('删除失败，请重试')
  } finally {
    deleteLoading.value = false
  }
}

onMounted(() => {
  loadQuotations()
})
</script>
