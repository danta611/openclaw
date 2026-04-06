<template>
  <div class="p-4">
    <div class="bg-white rounded-lg shadow-lg overflow-hidden">
      <!-- 顶部导航栏 -->
      <div class="sticky top-0 bg-white border-b z-50 px-4 py-3">
        <Breadcrumb 
          :breadcrumbs="[
            { label: '首页', to: '/' },
            { label: '我的', to: '/profile' },
            { label: '个人信息', to: '/profile-edit' },
            { label: '等级说明' }
          ]"
        />
      </div>

      <div class="p-6">
        <!-- 当前用户等级卡片 -->
        <div v-if="userLevel" class="mb-8">
          <div class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
            <div class="flex items-center gap-3">
              <div :class="[
                'w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold bg-gradient-to-br flex-shrink-0 -ml-1',
                userLevel.badge
              ]">
                {{ userLevel.icon }}
              </div>
              <div class="flex-1 min-w-0 relative">
                <h2 class="text-lg font-bold whitespace-nowrap bg-gradient-to-r from-yellow-600 via-amber-500 to-yellow-600 bg-clip-text text-transparent relative z-10">
                  {{ userLevel.shortLabel }} {{ userLevel.label }}
                </h2>
                <div class="absolute inset-0 -z-10">
                  <h2 class="text-lg font-bold whitespace-nowrap text-yellow-400 opacity-50 blur-[2px]">
                    {{ userLevel.shortLabel }} {{ userLevel.label }}
                  </h2>
                </div>
                <p v-if="userLevel.desc" class="text-sm text-gray-600 mt-1">{{ userLevel.desc }}</p>
                <p class="text-sm mt-1 font-medium whitespace-nowrap bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent">{{ levelSlogans[userLevel.level] }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 等级体系介绍 -->
        <div class="mb-8">
          <div 
            @click="showLevelList = !showLevelList"
            class="flex items-center justify-between cursor-pointer mb-4"
          >
            <h3 class="text-lg font-bold text-gray-800 flex items-center gap-2">
              <svg class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              等级体系
            </h3>
            <svg 
              :class="['w-5 h-5 text-gray-500 transition-transform', showLevelList ? 'rotate-180' : '']" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
            </svg>
          </div>
          <div v-if="showLevelList" class="space-y-3">
            <div v-for="level in userLevels" :key="level.level" class="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <div class="flex-shrink-0">
                <div :class="[
                  'w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold bg-gradient-to-br flex-shrink-0',
                  level.badge
                ]">
                  {{ level.icon }}
                </div>
              </div>
              <div class="flex-1">
                <div class="flex items-center gap-2">
                  <span class="font-bold text-gray-800">{{ level.shortLabel }}</span>
                  <span class="text-gray-600">{{ level.label }}</span>
                </div>
                <p v-if="level.desc" class="text-xs text-gray-500 mt-0.5">{{ level.desc }}</p>
                <p class="text-sm text-blue-600 mt-1 font-medium">{{ levelSlogans[level.level] }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 会员权益 -->
        <div class="mb-6">
          <h3 class="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
            <svg class="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/>
            </svg>
            会员权益
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div :class="['p-3 rounded-lg border', userLevelValue >= 1 ? 'bg-green-50 border-green-100' : 'bg-gray-50 border-gray-200']">
              <div class="flex items-center justify-between mb-1">
                <div class="flex items-center gap-2">
                  <span :class="userLevelValue >= 1 ? 'text-green-600' : 'text-gray-400'">✓</span>
                  <span class="font-medium text-gray-800">专属会员价</span>
                </div>
                <div class="flex items-center">
                  <span v-if="userLevelValue >= 1" class="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">已解锁</span>
                  <span v-else class="px-2 py-0.5 bg-gray-200 text-gray-600 text-xs rounded-full">L1</span>
                </div>
              </div>
              <p class="text-xs text-gray-600">L1及以上会员享受商品专属折扣价</p>
            </div>
            <div :class="['p-3 rounded-lg border', userLevelValue >= 2 ? 'bg-blue-50 border-blue-100' : 'bg-gray-50 border-gray-200']">
              <div class="flex items-center justify-between mb-1">
                <div class="flex items-center gap-2">
                  <span :class="userLevelValue >= 2 ? 'text-blue-600' : 'text-gray-400'">✓</span>
                  <span class="font-medium text-gray-800">优先发货</span>
                </div>
                <div class="flex items-center">
                  <span v-if="userLevelValue >= 2" class="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">已解锁</span>
                  <span v-else class="px-2 py-0.5 bg-gray-200 text-gray-600 text-xs rounded-full">L2</span>
                </div>
              </div>
              <p class="text-xs text-gray-600">L2及以上会员享受订单优先处理</p>
            </div>
            <div :class="['p-3 rounded-lg border', userLevelValue >= 3 ? 'bg-purple-50 border-purple-100' : 'bg-gray-50 border-gray-200']">
              <div class="flex items-center justify-between mb-1">
                <div class="flex items-center gap-2">
                  <span :class="userLevelValue >= 3 ? 'text-purple-600' : 'text-gray-400'">✓</span>
                  <span class="font-medium text-gray-800">专属客服</span>
                </div>
                <div class="flex items-center">
                  <span v-if="userLevelValue >= 3" class="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">已解锁</span>
                  <span v-else class="px-2 py-0.5 bg-gray-200 text-gray-600 text-xs rounded-full">L3</span>
                </div>
              </div>
              <p class="text-xs text-gray-600">L3及以上会员享受1对1专属客服服务</p>
            </div>
            <div :class="['p-3 rounded-lg border', userLevelValue >= 4 ? 'bg-amber-50 border-amber-100' : 'bg-gray-50 border-gray-200']">
              <div class="flex items-center justify-between mb-1">
                <div class="flex items-center gap-2">
                  <span :class="userLevelValue >= 4 ? 'text-amber-600' : 'text-gray-400'">✓</span>
                  <span class="font-medium text-gray-800">生日福利</span>
                </div>
                <div class="flex items-center">
                  <span v-if="userLevelValue >= 4" class="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full">已解锁</span>
                  <span v-else class="px-2 py-0.5 bg-gray-200 text-gray-600 text-xs rounded-full">L4</span>
                </div>
              </div>
              <p class="text-xs text-gray-600">L4及以上会员生日当月享受专属福利</p>
            </div>
            <div :class="['p-3 rounded-lg border md:col-span-2', userLevelValue >= 5 ? 'bg-rose-50 border-rose-100' : 'bg-gray-50 border-gray-200']">
              <div class="flex items-center justify-between mb-1">
                <div class="flex items-center gap-2">
                  <span :class="userLevelValue >= 5 ? 'text-rose-600' : 'text-gray-400'">✓</span>
                  <span class="font-medium text-gray-800">至尊特权</span>
                </div>
                <div class="flex items-center">
                  <span v-if="userLevelValue >= 5" class="px-2 py-0.5 bg-rose-100 text-rose-700 text-xs rounded-full">已解锁</span>
                  <span v-else class="px-2 py-0.5 bg-gray-200 text-gray-600 text-xs rounded-full">L5</span>
                </div>
              </div>
              <p class="text-xs text-gray-600">L5苍穹圣骑享受全站商品VIP价、新品优先体验、专属限量版商品购买权</p>
            </div>
          </div>
        </div>

        <!-- 升级规则 -->
        <div class="mb-8">
          <h3 class="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <svg class="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
            </svg>
            升级规则
          </h3>
          <div class="bg-gray-50 rounded-lg p-4">
            <ul class="space-y-2 text-sm text-gray-700">
              <li class="flex items-start gap-2">
                <span class="text-gray-400 mt-1">•</span>
                <span><strong>L0 → L1：</strong>注册账号即可自动升级为L1追风骑友</span>
              </li>
              <li class="flex items-start gap-2">
                <span class="text-gray-400 mt-1">•</span>
                <span><strong>L1 → L2：</strong>累计消费满3000元或联系管理员升级</span>
              </li>
              <li class="flex items-start gap-2">
                <span class="text-gray-400 mt-1">•</span>
                <span><strong>L2 → L3：</strong>累计消费满10000元或联系管理员升级</span>
              </li>
              <li class="flex items-start gap-2">
                <span class="text-gray-400 mt-1">•</span>
                <span><strong>L3 → L4：</strong>累计消费满30000元或联系管理员升级</span>
              </li>
              <li class="flex items-start gap-2">
                <span class="text-gray-400 mt-1">•</span>
                <span><strong>L4 → L5：</strong>累计消费满100000元或联系管理员升级</span>
              </li>
            </ul>
          </div>
        </div>

        <!-- 会员声明 -->
        <div class="mb-8">
          <h3 class="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
            会员声明
          </h3>
          <div class="bg-gray-50 rounded-lg p-4">
            <ul class="space-y-2 text-xs text-gray-600">
              <li>1. 会员等级及权益可能会根据运营情况进行调整，我们会提前通知</li>
              <li>2. 累计消费金额以实际支付金额为准，不含优惠券、折扣等优惠部分</li>
              <li>3. 会员等级有效期为12个月，到期后需重新达到对应等级标准</li>
              <li>4. 如有任何疑问，请联系客服或管理员咨询</li>
              <li>5. SZ、ProMax车酷正品配件保留对会员等级规则的最终解释权</li>
            </ul>
          </div>
        </div>

        <!-- 返回按钮 -->
        <button 
          @click="$router.back()"
          class="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          返回
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { USER_LEVELS, getUserLevel } from '../utils/userLevels'
import Breadcrumb from '../components/Breadcrumb.vue'

// 等级描述文案
const levelSlogans = {
  0: '欢迎加入骑友行列',
  1: '自在骑行，一路同行',
  2: '乘风而行，热爱不止',
  3: '凌云之志，驰骋城市',
  4: '万里征途，尊享礼遇',
  5: '苍穹之上，圣骑荣耀'
}

const userLevels = USER_LEVELS

// 从localStorage读取userPhone并获取用户等级
const userPhone = ref(localStorage.getItem('user_phone') || '')
const userLevelValue = ref(0)
const userLevel = computed(() => getUserLevel(userLevelValue.value))
const showLevelList = ref(false)

async function loadUserLevel() {
  if (userPhone.value) {
    try {
      const axios = (await import('axios')).default
      const response = await axios.get(`/api/users/${userPhone.value}`)
      if (response.data.success) {
        userLevelValue.value = response.data.data.level !== undefined ? Number(response.data.data.level) : 0
      }
    } catch (error) {
      console.error('获取用户等级失败:', error)
    }
  }
}

onMounted(() => {
  loadUserLevel()
})
</script>
