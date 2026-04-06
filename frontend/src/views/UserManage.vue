<template>
  <div class="p-3">
    <div class="bg-white rounded-lg shadow-lg overflow-hidden">
      <!-- 顶部导航栏 -->
      <div class="bg-gray-50 px-4 py-3 border-b">
        <Breadcrumb 
          :breadcrumbs="[
            { label: '首页', to: '/' },
            { label: '店铺管理', to: '/shop-manage' },
            { label: '用户管理' }
          ]"
        />
      </div>

      <!-- 搜索筛选 -->
      <div class="p-3 border-b bg-gray-50">
        <div class="flex flex-col gap-2">
          <input 
            v-model="searchKeyword" 
            type="text" 
            placeholder="搜索用户昵称/手机号/微信..."
            class="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
          <div class="flex gap-2">
            <select 
              v-model="selectedLevel" 
              class="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="">全部等级</option>
              <option value="0">L0 路人骑友</option>
              <option value="1">L1 追风骑友</option>
              <option value="2">L2 御风骑手</option>
              <option value="3">L3 凌云骑士</option>
              <option value="4">L4 万里尊骑</option>
              <option value="5">L5 苍穹圣骑</option>
            </select>
            <select 
              v-model="selectedIdentity" 
              class="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="">全部身份</option>
              <option value="车友">车友</option>
              <option value="分销商">分销商</option>
            </select>
          </div>
        </div>
      </div>

      <div v-if="loading" class="text-center py-12">
        <div class="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
        <p class="text-gray-500 mt-4 text-sm">加载中...</p>
      </div>

      <div v-else-if="filteredUsers.length === 0" class="text-center py-16">
        <svg class="w-20 h-20 text-gray-300 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
        </svg>
        <p class="text-gray-500 mt-4 text-sm">暂无用户</p>
      </div>

      <div v-else class="divide-y">
        <div 
          v-for="user in filteredUsers" 
          :key="user.id"
          class="p-3.5 hover:bg-gray-50"
        >
          <div class="flex items-start gap-3">
            <div 
              :class="[
                'w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0',
                getLevelBadge(user.level)
              ]"
            >
              {{ getLevelIcon(user.level) }}
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <p class="font-medium text-gray-800 truncate">{{ user.nickname || user.phone }}</p>
                <span 
                  :class="['px-1.5 py-0.5 rounded text-xs font-medium', 
                    user.is_admin ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                  ]"
                >
                  {{ user.is_admin ? '管理员' : user.identity }}
                </span>
                <span class="px-1.5 py-0.5 bg-gray-200 text-gray-700 rounded text-xs font-medium">
                  {{ getLevelShortLabel(user.level) }}
                </span>
              </div>
              <p class="text-sm text-gray-500 mt-1">
                {{ maskPhone(user.phone) }}
                <span v-if="user.wechat" class="ml-2">
                  微信：{{ user.wechat }}
                </span>
              </p>
              <p v-if="user.car_model" class="text-xs text-gray-400 mt-0.5">
                座驾：{{ user.car_model }}
              </p>
              <p class="text-xs text-gray-400 mt-0.5">
                注册：{{ formatDate(user.created_at) }}
              </p>
            </div>
            <div class="flex items-center gap-1 flex-shrink-0">
              <button 
                @click="viewUserQuotations(user)"
                class="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg relative"
                title="查看询价单"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                </svg>
                <span 
                  v-if="userQuotationCounts[user.id] > 0"
                  class="absolute -top-1 -right-1 bg-blue-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center"
                >
                  {{ userQuotationCounts[user.id] }}
                </span>
              </button>
              <button 
                @click="openEditDialog(user)"
                class="p-1.5 text-green-600 hover:bg-green-50 rounded-lg"
                title="编辑用户"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732a2.5 2.5 0 013.536 0z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 编辑用户弹窗 -->
    <div v-if="showEditDialog" class="fixed inset-0 bg-black bg-opacity-75 z-50 flex flex-col">
      <div class="bg-white w-full h-full flex flex-col">
        <!-- 顶部导航栏 -->
        <div class="bg-gray-50 px-4 py-3 border-b flex items-center flex-shrink-0">
          <div class="flex-1">
            <Breadcrumb 
              :breadcrumbs="[
                { label: '首页', to: '/' },
                { label: '店铺管理', to: '/shop-manage' },
                { label: '用户管理' },
                { label: '编辑用户' }
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
          <div v-if="editingUser" class="space-y-3.5">
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-0.5">手机号</label>
              <input 
                :value="editingUser.phone" 
                type="text" 
                disabled
                class="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-400 text-sm"
              />
            </div>
            
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-0.5">昵称</label>
              <input 
                v-model="editingUser.nickname" 
                type="text" 
                placeholder="请输入昵称"
                class="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
            
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-0.5">身份</label>
              <select 
                v-model="editingUser.identity" 
                class="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="车友">车友</option>
                <option value="分销商">分销商</option>
              </select>
            </div>
            
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-0.5">等级</label>
              <select 
                v-model.number="editingUser.level" 
                class="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option :value="0">L0 路人骑友</option>
                <option :value="1">L1 追风骑友</option>
                <option :value="2">L2 御风骑手</option>
                <option :value="3">L3 凌云骑士</option>
                <option :value="4">L4 万里尊骑</option>
                <option :value="5">L5 苍穹圣骑</option>
              </select>
            </div>
            
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-0.5">微信号</label>
              <input 
                v-model="editingUser.wechat" 
                type="text" 
                placeholder="请输入微信号"
                class="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
            
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-0.5">座驾</label>
              <input 
                v-model="editingUser.car_model" 
                type="text" 
                placeholder="请输入座驾型号"
                class="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
            
            <div>
              <label class="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  v-model="editingUser.is_admin"
                  class="w-4 h-4 text-blue-600 rounded border-gray-300"
                />
                <span class="text-xs text-gray-700">设为管理员</span>
              </label>
            </div>
            
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-0.5">重置密码（留空则不修改）</label>
              <input 
                v-model="newPassword" 
                type="text" 
                placeholder="请输入新密码"
                class="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
          </div>
        </div>
        
        <div class="p-3.5 border-t flex gap-2.5 pb-20">
          <button @click="closeEditDialog" class="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition-colors font-medium text-sm">
            取消
          </button>
          <button @click="saveUser" :disabled="saving" class="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 text-sm">
            {{ saving ? '保存中...' : '保存' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 用户询价单弹窗 -->
    <div v-if="showQuotationsDialog" class="fixed inset-0 bg-black bg-opacity-75 z-50 flex flex-col">
      <div class="bg-white w-full h-full flex flex-col">
        <!-- 顶部导航栏 -->
        <div class="bg-gray-50 px-4 py-3 border-b flex items-center flex-shrink-0">
          <div class="flex-1">
            <Breadcrumb 
              :breadcrumbs="[
                { label: '首页', to: '/' },
                { label: '店铺管理', to: '/shop-manage' },
                { label: '用户管理' },
                { label: currentUser?.nickname || currentUser?.phone + '的询价单' }
              ]"
            />
          </div>
          <button @click="closeQuotationsDialog" class="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium ml-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </button>
        </div>
        
        <div class="p-3.5 overflow-y-auto flex-1">
          <div v-if="loadingQuotations" class="text-center py-12">
            <div class="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
            <p class="text-gray-500 mt-4 text-sm">加载中...</p>
          </div>
          
          <div v-else-if="userQuotations.length === 0" class="text-center py-16">
            <svg class="w-20 h-20 text-gray-300 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
            </svg>
            <p class="text-gray-500 mt-4 text-sm">暂无询价单</p>
          </div>
          
          <div v-else class="space-y-3">
            <div 
              v-for="quote in userQuotations" 
              :key="quote.id"
              class="p-3.5 bg-gray-50 rounded-lg"
              @click="viewQuotationDetail(quote.id)"
            >
              <div class="flex items-start justify-between mb-2">
                <div>
                  <span class="font-mono text-sm text-blue-600">{{ quote.quotation_no }}</span>
                  <span 
                    :class="[
                      'ml-2 px-1.5 py-0.5 rounded text-xs font-medium',
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
              <div class="text-sm text-gray-600 mb-1">共 {{ getQuotationItemCount(quote) }} 件商品</div>
              <div>
                <template v-if="quote.inquiry_status === '已答复' && quote.discount_amount > 0">
                  <span class="text-lg font-bold text-blue-600">¥{{ Math.floor(Number(quote.final_total || quote.total_amount)) }}</span>
                </template>
                <template v-else-if="quote.inquiry_status === '已答复'">
                  <span class="text-lg font-bold text-blue-600">¥{{ Math.floor(Number(quote.final_total || quote.total_amount)) }}</span>
                </template>
                <template v-else>
                  <span class="text-gray-600">预估：</span>
                  <span class="text-lg font-bold text-blue-600">¥{{ Math.floor(Number(quote.total_amount)) }}</span>
                </template>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 提示弹窗 -->
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import ConfirmDialog from '../components/ConfirmDialog.vue'
import Breadcrumb from '../components/Breadcrumb.vue'

const router = useRouter()

const users = ref([])
const loading = ref(true)
const searchKeyword = ref('')
const selectedLevel = ref('')
const selectedIdentity = ref('')

const showEditDialog = ref(false)
const editingUser = ref(null)
const saving = ref(false)
const newPassword = ref('')

const showQuotationsDialog = ref(false)
const currentUser = ref(null)
const userQuotations = ref([])
const loadingQuotations = ref(false)

const alertDialog = ref(null)
const alertMessage = ref('')

const userQuotationCounts = ref({}) // 存储每个用户的询价单数量

const filteredUsers = computed(() => {
  let result = users.value
  
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(u => 
      (u.nickname && u.nickname.toLowerCase().includes(keyword)) ||
      u.phone.includes(keyword) ||
      (u.wechat && u.wechat.toLowerCase().includes(keyword))
    )
  }
  
  if (selectedLevel.value !== '') {
    result = result.filter(u => u.level == selectedLevel.value)
  }
  
  if (selectedIdentity.value) {
    result = result.filter(u => u.identity === selectedIdentity.value)
  }
  
  return result
})

// 等级配置
const LEVEL_CONFIG = {
  0: { icon: 'L0', shortLabel: 'L0', badge: 'bg-gray-400 text-white' },
  1: { icon: 'L1', shortLabel: 'L1', badge: 'bg-blue-500 text-white' },
  2: { icon: 'L2', shortLabel: 'L2', badge: 'bg-green-500 text-white' },
  3: { icon: 'L3', shortLabel: 'L3', badge: 'bg-purple-500 text-white' },
  4: { icon: 'L4', shortLabel: 'L4', badge: 'bg-yellow-500 text-white' },
  5: { icon: 'L5', shortLabel: 'L5', badge: 'bg-red-500 text-white' }
}

function getLevelIcon(level) {
  return LEVEL_CONFIG[level]?.icon || 'L0'
}

function getLevelShortLabel(level) {
  return LEVEL_CONFIG[level]?.shortLabel || 'L0'
}

function getLevelBadge(level) {
  return LEVEL_CONFIG[level]?.badge || 'bg-gray-400 text-white'
}

function maskPhone(phone) {
  if (!phone || phone.length !== 11) return phone
  return phone.substring(0, 3) + '****' + phone.substring(7)
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN')
}

function showAlert(message) {
  alertMessage.value = message
  alertDialog.value.open()
}

function doCloseAlert() {
}

async function loadUserQuotationCounts() {
  for (const user of users.value) {
    try {
      const response = await axios.get(`/api/users/manage/${user.id}/quotations`)
      if (response.data.success) {
        userQuotationCounts.value[user.id] = response.data.data.length
      }
    } catch (error) {
      console.error(`加载用户 ${user.id} 询价单数量失败:`, error)
      userQuotationCounts.value[user.id] = 0
    }
  }
}

async function loadUsers() {
  try {
    const response = await axios.get('/api/users/manage')
    if (response.data.success) {
      users.value = response.data.data
      // 加载用户询价单数量
      loadUserQuotationCounts()
    }
  } catch (error) {
    console.error('加载用户列表失败:', error)
    showAlert('加载用户列表失败')
  } finally {
    loading.value = false
  }
}

function openEditDialog(user) {
  editingUser.value = JSON.parse(JSON.stringify(user))
  newPassword.value = ''
  showEditDialog.value = true
}

function closeEditDialog() {
  showEditDialog.value = false
  editingUser.value = null
  newPassword.value = ''
}

async function saveUser() {
  if (!editingUser.value) return
  
  saving.value = true
  try {
    const updateData = {
      nickname: editingUser.value.nickname,
      identity: editingUser.value.identity,
      level: editingUser.value.level,
      wechat: editingUser.value.wechat,
      car_model: editingUser.value.car_model,
      is_admin: editingUser.value.is_admin
    }
    
    if (newPassword.value) {
      updateData.password = newPassword.value
    }
    
    await axios.put(`/api/users/manage/${editingUser.value.id}`, updateData)
    
    closeEditDialog()
    loadUsers()
    
    const toast = document.createElement('div')
    toast.className = 'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black bg-opacity-75 text-white px-6 py-3 rounded-lg z-50 text-sm'
    toast.textContent = '✓ 保存成功'
    document.body.appendChild(toast)
    setTimeout(() => toast.remove(), 1500)
  } catch (error) {
    console.error('保存用户失败:', error)
    showAlert('保存失败：' + (error.response?.data?.error || error.message))
  } finally {
    saving.value = false
  }
}

async function viewUserQuotations(user) {
  currentUser.value = user
  showQuotationsDialog.value = true
  loadingQuotations.value = true
  userQuotations.value = []
  
  try {
    const response = await axios.get(`/api/users/manage/${user.id}/quotations`)
    if (response.data.success) {
      userQuotations.value = response.data.data
    }
  } catch (error) {
    console.error('加载用户询价单失败:', error)
    showAlert('加载询价单失败')
  } finally {
    loadingQuotations.value = false
  }
}

function closeQuotationsDialog() {
  showQuotationsDialog.value = false
  currentUser.value = null
  userQuotations.value = []
}

function getQuotationItemCount(quote) {
  if (quote.items && quote.items.length > 0) {
    return quote.items.reduce((sum, item) => sum + item.quantity, 0)
  }
  // 如果items不存在，从后端返回的结构中推断
  return quote.item_count || '若干'
}

function viewQuotationDetail(id) {
  closeQuotationsDialog()
  router.push(`/inquiry/${id}`)
}

onMounted(() => {
  loadUsers()
})
</script>
