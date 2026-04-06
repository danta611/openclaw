<template>
  <div class="p-4">
    <div class="bg-white rounded-lg shadow-lg overflow-hidden">
      <div class="sticky top-0 bg-white border-b z-50 px-4 py-3">
        <Breadcrumb 
          :breadcrumbs="[
            { label: '首页', to: '/' },
            { label: '店铺管理', to: '/shop-manage' },
            { label: '目录管理' }
          ]"
        />
      </div>

      <div class="p-4">
        <button 
          @click="openAddDialog"
          class="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium mb-4"
        >
          + 新增目录
        </button>

        <div class="space-y-2">
          <div 
            v-for="cat in categories" 
            :key="cat.id"
            class="border border-gray-200 rounded-lg overflow-hidden"
          >
            <div 
              class="flex items-center justify-between p-3 bg-gray-50 cursor-pointer hover:bg-gray-100"
              @click="toggleCategory(cat.id)"
            >
              <div class="flex items-center gap-2">
                <svg 
                  class="w-5 h-5 text-gray-400 transition-transform"
                  :class="{ 'rotate-90': expandedCategories.includes(cat.id) }"
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                </svg>
                <div>
                  <div class="font-medium text-gray-800 flex items-center">{{ cat.name }} <span v-if="getProductCount(cat.id, true) > 0" class="text-xs text-blue-600 ml-1 align-middle">({{ getProductCount(cat.id, true) }})</span></div>
                  <div class="text-xs text-gray-500">{{ cat.abbreviation }} · {{ (cat.children || []).length }} 个子目录</div>
                </div>
              </div>
              <div class="flex items-center gap-1">
                <button 
                  @click.stop="moveCategory(cat, 'up')"
                  class="p-1 text-gray-500 hover:text-gray-700"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"/>
                  </svg>
                </button>
                <button 
                  @click.stop="moveCategory(cat, 'down')"
                  class="p-1 text-gray-500 hover:text-gray-700"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                  </svg>
                </button>
                <button 
                  @click.stop="openEditDialog(cat)"
                  class="p-1 text-blue-600 hover:text-blue-800"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                  </svg>
                </button>
                <button 
                  @click.stop="deleteCategory(cat)"
                  class="p-1 text-red-600 hover:text-red-800"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                  </svg>
                </button>
              </div>
            </div>
            
            <div v-if="expandedCategories.includes(cat.id) && cat.children && cat.children.length > 0" class="border-t border-gray-100">
              <div 
                v-for="child in cat.children" 
                :key="child.id"
                class="flex items-center justify-between p-3 pl-10 hover:bg-gray-50"
              >
                <div>
                  <div class="font-medium text-gray-800 flex items-center">{{ child.name }} <span v-if="getDirectProductCount(child.id) > 0" class="text-xs text-blue-600 ml-1 align-middle">({{ getDirectProductCount(child.id) }})</span></div>
                  <div class="text-xs text-gray-500">{{ child.abbreviation }}</div>
                </div>
                <div class="flex items-center gap-1">
                  <button 
                    @click="moveCategory(child, 'up')"
                    class="p-1 text-gray-500 hover:text-gray-700"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"/>
                    </svg>
                  </button>
                  <button 
                    @click="moveCategory(child, 'down')"
                    class="p-1 text-gray-500 hover:text-gray-700"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                    </svg>
                  </button>
                  <button 
                    @click="manageProducts(child)"
                    class="p-1 text-green-600 hover:text-green-800"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                    </svg>
                  </button>
                  <button 
                    @click="openEditDialog(child)"
                    class="p-1 text-blue-600 hover:text-blue-800"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                    </svg>
                  </button>
                  <button 
                    @click="deleteCategory(child)"
                    class="p-1 text-red-600 hover:text-red-800"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 新增/编辑目录弹窗 -->
    <div v-if="showDialog" class="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-lg max-w-sm w-full">
        <div class="p-4 border-b flex items-center justify-between">
          <h3 class="text-lg font-bold text-gray-800">{{ isEdit ? '编辑目录' : '新增目录' }}</h3>
          <button @click="closeDialog" class="text-gray-500 hover:text-gray-700">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <div class="p-4 space-y-4">
          <div>
            <label class="block text-sm text-gray-600 mb-1">目录名称</label>
            <input 
              v-model="formData.name" 
              type="text" 
              placeholder="请输入目录名称"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              @input="onNameInput"
            />
          </div>
          <div>
            <label class="block text-sm text-gray-600 mb-1">目录缩写</label>
            <input 
              v-model="formData.abbreviation" 
              type="text" 
              placeholder="请输入目录缩写"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              @input="checkAbbreviation"
            />
            <p v-if="abbreviationError" class="text-xs text-red-500 mt-1">{{ abbreviationError }}</p>
          </div>
          <div>
            <label class="block text-sm text-gray-600 mb-1">父目录</label>
            <select 
              v-model="formData.parent_id" 
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option :value="null">无（顶级目录）</option>
              <option 
                v-for="cat in topLevelCategories" 
                :key="cat.id" 
                :value="cat.id"
                :disabled="isEdit && editingCategory && cat.id === editingCategory.id"
              >
                {{ cat.name }}
              </option>
            </select>
          </div>
        </div>
        <div class="p-4 border-t flex gap-3">
          <button @click="closeDialog" class="flex-1 bg-gray-200 text-gray-700 py-2.5 rounded-lg hover:bg-gray-300 transition-colors font-medium">
            取消
          </button>
          <button @click="saveCategory" :disabled="loading" class="flex-1 bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50">
            {{ loading ? '保存中...' : '确认' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 商品管理弹窗 -->
    <div v-if="showProductDialog" class="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-lg max-w-lg w-full max-h-[80vh] overflow-hidden flex flex-col">
        <div class="p-4 border-b flex items-center flex-shrink-0">
          <button @click="showProductDialog = false" class="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
            返回
          </button>
          <h3 class="flex-1 text-center text-base font-bold text-gray-800">
            {{ currentCategory ? '管理 ' + currentCategory.name + ' 商品' : '商品管理' }}
          </h3>
        </div>
        <div class="p-4 overflow-y-auto flex-1">
          <!-- 标签栏 -->
          <div class="flex gap-2 mb-3">
            <button 
              @click="productViewMode = 'current'"
              :class="[
                'px-3 py-1.5 text-xs rounded-lg transition-colors flex-1',
                productViewMode === 'current' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              ]"
            >
              本目录 ({{ categoryProducts.length }})
            </button>
            <button 
              @click="productViewMode = 'unassigned'"
              :class="[
                'px-3 py-1.5 text-xs rounded-lg transition-colors flex-1',
                productViewMode === 'unassigned' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              ]"
            >
              未分配 ({{ unassignedProducts.length }})
            </button>
            <button 
              @click="productViewMode = 'all'"
              :class="[
                'px-3 py-1.5 text-xs rounded-lg transition-colors flex-1',
                productViewMode === 'all' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              ]"
            >
              全部 ({{ allProducts.length }})
            </button>
          </div>
          <!-- 搜索框 -->
          <div class="mb-3">
            <input 
              v-model="productSearch"
              type="text" 
              placeholder="搜索商品名称..."
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <!-- 商品列表 -->
          <div class="space-y-2 max-h-80 overflow-y-auto border rounded-lg p-2">
            <div 
              v-for="product in displayProducts" 
              :key="product.id"
              class="flex items-center justify-between p-2 hover:bg-gray-50 rounded"
            >
              <div class="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  :checked="selectedProductIds.includes(product.id)"
                  @change="toggleProductSelection(product.id)"
                  class="w-4 h-4"
                />
                <span class="text-sm">{{ product.name }}</span>
              </div>
              <span class="text-xs text-gray-500">
                {{ productViewMode === 'current' ? (product.product_no || '') : (product.category_name || '未分配') }}
              </span>
            </div>
            <div v-if="displayProducts.length === 0" class="text-center text-gray-500 text-sm py-8">
              暂无可分配商品
            </div>
          </div>
        </div>
        <div class="p-4 border-t flex gap-3">
          <button @click="showProductDialog = false" class="flex-1 bg-gray-200 text-gray-700 py-2.5 rounded-lg hover:bg-gray-300 transition-colors font-medium">
            取消
          </button>
          <button @click="saveCategoryProducts" class="flex-1 bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium">
            保存
          </button>
        </div>
      </div>
    </div>

    <!-- 删除确认弹窗 -->
    <div v-if="showDeleteConfirm" class="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-lg max-w-md w-full overflow-hidden">
        <div class="p-4 border-b">
          <h3 class="text-lg font-bold text-gray-800">确认删除</h3>
        </div>
        <div class="p-4">
          <div v-if="deletingCategory" class="mb-4">
            <p class="text-gray-700 mb-3">
              确定要删除目录「<strong>{{ deletingCategory.name }}</strong>」吗？
            </p>
            
            <div v-if="deletingCategoryInfo.subCategoryCount > 0 || deletingCategoryInfo.productCount > 0" class="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3">
              <p v-if="deletingCategoryInfo.subCategoryCount > 0" class="text-amber-800 text-sm mb-2">
                📁 包含 <strong>{{ deletingCategoryInfo.subCategoryCount }}</strong> 个子目录
              </p>
              <p v-if="deletingCategoryInfo.productCount > 0" class="text-amber-800 text-sm">
                📦 包含 <strong>{{ deletingCategoryInfo.productCount }}</strong> 个商品
              </p>
            </div>
            
            <p class="text-gray-600 text-sm">
              ⚠️ 删除后，该目录下的商品将变成未分配状态。
            </p>
          </div>
        </div>
        <div class="p-4 border-t flex gap-3">
          <button 
            @click="closeDeleteConfirm" 
            class="flex-1 bg-gray-200 text-gray-700 py-2.5 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            取消
          </button>
          <button 
            @click="confirmDelete" 
            :disabled="deleteLoading"
            class="flex-1 bg-red-600 text-white py-2.5 rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50"
          >
            {{ deleteLoading ? '删除中...' : '确认删除' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { pinyin } from 'pinyin-pro'
import Breadcrumb from '../components/Breadcrumb.vue'

const displayProducts = computed(() => {
  let products
  if (productViewMode.value === 'current') {
    products = categoryProducts.value
  } else if (productViewMode.value === 'all') {
    products = allProducts.value
  } else {
    products = unassignedProducts.value
  }
  
  if (!productSearch.value) return products
  
  const search = productSearch.value.toLowerCase()
  return products.filter(p => 
    p.name.toLowerCase().includes(search)
  )
})

const router = useRouter()

const categories = ref([])
const expandedCategories = ref([])
const showDialog = ref(false)
const isEdit = ref(false)
const editingCategory = ref(null)
const loading = ref(false)
const abbreviationError = ref('')
const showDeleteConfirm = ref(false)
const deletingCategory = ref(null)
const deleteLoading = ref(false)

const formData = ref({
  name: '',
  abbreviation: '',
  parent_id: null
})

const topLevelCategories = computed(() => {
  return categories.value.filter(cat => !cat.parent_id)
})

const deletingCategoryInfo = computed(() => {
  if (!deletingCategory.value) return { subCategoryCount: 0, productCount: 0 }
  
  const allCategories = categories.value.flatMap(cat => [cat, ...(cat.children || [])])
  const allProducts = products.value
  
  // 查找所有子目录
  const subCategories = []
  const findChildren = (parentId) => {
    const children = allCategories.filter(cat => cat.parent_id === parentId)
    children.forEach(child => {
      subCategories.push(child)
      findChildren(child.id)
    })
  }
  findChildren(deletingCategory.value.id)
  
  // 查找所有商品（当前目录和子目录下的）
  const categoryIds = [deletingCategory.value.id, ...subCategories.map(c => c.id)]
  const relatedProducts = allProducts.filter(p => categoryIds.includes(p.category_id))
  
  return {
    subCategoryCount: subCategories.length,
    productCount: relatedProducts.length
  }
})

function getProductCount(categoryId, includeChildren = false) {
  if (!includeChildren) {
    // 只计算当前目录下的商品
    return products.value.filter(p => p.category_id === categoryId).length
  }
  
  // 计算当前目录和所有子目录下的商品
  const allCategories = categories.value.flatMap(cat => [cat, ...(cat.children || [])])
  
  // 查找所有子目录
  const subCategories = []
  const findChildren = (parentId) => {
    const children = allCategories.filter(cat => cat.parent_id === parentId)
    children.forEach(child => {
      subCategories.push(child)
      findChildren(child.id)
    })
  }
  findChildren(categoryId)
  
  // 查找所有商品（当前目录和子目录下的）
  const categoryIds = [categoryId, ...subCategories.map(c => c.id)]
  return products.value.filter(p => categoryIds.includes(p.category_id)).length
}

function getDirectProductCount(categoryId) {
  return getProductCount(categoryId, false)
}

function getCategoryInfo(categoryId) {
  const allCategories = categories.value.flatMap(cat => [cat, ...(cat.children || [])])
  const allProducts = products.value
  
  // 查找所有子目录
  const subCategories = []
  const findChildren = (parentId) => {
    const children = allCategories.filter(cat => cat.parent_id === parentId)
    children.forEach(child => {
      subCategories.push(child)
      findChildren(child.id)
    })
  }
  findChildren(categoryId)
  
  // 查找所有商品（当前目录和子目录下的）
  const categoryIds = [categoryId, ...subCategories.map(c => c.id)]
  const relatedProducts = allProducts.filter(p => categoryIds.includes(p.category_id))
  
  return {
    subCategoryCount: subCategories.length,
    productCount: relatedProducts.length
  }
}

const pinyinMap = {
  '动': 'D', '力': 'L', '系': 'X', '统': 'T',
  '制': 'Z', '灯': 'D', '光': 'G',
  '照': 'Z', '明': 'M', '轮': 'L', '胎': 'T',
  '毂': 'G', '减': 'J', '震': 'Z', '仪': 'Y',
  '表': 'B', '盘': 'P', '操': 'C', '控': 'K',
  '实': 'S', '用': 'Y', '配': 'P', '件': 'J',
  '电': 'D', '机': 'J', '器': 'Q', '池': 'C',
  '充': 'C', '碟': 'D', '刹': 'S', '车': 'C',
  '片': 'P', '油': 'Y', '大': 'D', '转': 'Z',
  '向': 'X', '氛': 'F', '围': 'W', '前': 'Q',
  '叉': 'C', '后': 'H', '液': 'Y', '晶': 'J',
  '量': 'L', '门': 'M', '把': 'B', '手': 'S',
  '柄': 'B', '货': 'H', '架': 'J', '尾': 'W',
  '箱': 'X', '支': 'Z', '防': 'F', '盗': 'D',
  '屏': 'P', '价': 'J', '格': 'G', '金': 'J', '钱': 'Q'
}

function getPinyinInitial(char) {
  // 优先用映射表
  if (pinyinMap[char]) return pinyinMap[char];
  // 不在映射表的话，尝试用字符的 Unicode 范围判断
  // 这里先用简单方案：不在映射表的汉字暂时跳过，或者后续集成 pinyin-pro
  return '';
}

function generateAbbreviation(name) {
  let abbr = ''
  for (let i = 0; i < name.length && abbr.length < 8; i++) {
    const char = name[i]
    if (/[\u4e00-\u9fa5]/.test(char)) {
      // 使用 pinyin-pro 获取拼音首字母
      const py = pinyin(char, { toneType: 'none' })
      if (py && py.length > 0) {
        abbr += py[0].toUpperCase()
      }
    } else if (/[a-zA-Z0-9]/.test(char)) {
      abbr += char.toUpperCase()
    }
  }
  return abbr || 'CATE'
}

function onNameInput() {
  if (!isEdit.value) {
    formData.value.abbreviation = generateAbbreviation(formData.value.name)
    checkAbbreviation()
  }
}

function checkAbbreviation() {
  abbreviationError.value = ''
  if (!formData.value.abbreviation) return
  
  // 自动转成大写
  formData.value.abbreviation = formData.value.abbreviation.toUpperCase()
  
  const allCategories = categories.value.flatMap(cat => [cat, ...(cat.children || [])])
  const duplicate = allCategories.find(cat => 
    cat.abbreviation === formData.value.abbreviation && 
    (!editingCategory.value || cat.id !== editingCategory.value.id)
  )
  
  if (duplicate) {
    abbreviationError.value = '缩写已存在，请使用其他缩写'
  }
}

async function loadCategories() {
  try {
    const response = await axios.get('/api/categories')
    if (response.data.success) {
      categories.value = response.data.data
    }
  } catch (error) {
    console.error('加载目录失败:', error)
  }
}

function toggleCategory(id) {
  const index = expandedCategories.value.indexOf(id)
  if (index > -1) {
    expandedCategories.value.splice(index, 1)
  } else {
    expandedCategories.value.push(id)
  }
}

function openAddDialog() {
  isEdit.value = false
  editingCategory.value = null
  formData.value = {
    name: '',
    abbreviation: '',
    parent_id: null
  }
  abbreviationError.value = ''
  showDialog.value = true
}

function openEditDialog(cat) {
  console.log('打开编辑弹窗，cat:', cat)
  isEdit.value = true
  editingCategory.value = cat
  formData.value = {
    name: cat.name,
    abbreviation: cat.abbreviation || '',
    parent_id: cat.parent_id
  }
  console.log('设置后formData:', formData.value)
  abbreviationError.value = ''
  showDialog.value = true
}

function closeDialog() {
  showDialog.value = false
}

const products = ref([])
const showProductDialog = ref(false)
const currentCategory = ref(null)
const categoryProducts = ref([])
const allProducts = ref([])
const unassignedProducts = ref([])
const selectedProductIds = ref([])
const productViewMode = ref('current') // 'current' | 'unassigned' | 'all'
const productSearch = ref('')

async function manageProducts(cat) {
  currentCategory.value = cat
  selectedProductIds.value = []
  productViewMode.value = 'current' // 默认展示当前目录商品
  
  // 加载目录下的商品
  try {
    const res = await axios.get(`/api/categories/${cat.id}/products`)
    if (res.data.success) {
      categoryProducts.value = res.data.data
      selectedProductIds.value = categoryProducts.value.map(p => p.id)
    }
  } catch (e) {
    console.error('加载目录商品失败:', e)
  }
  
  // 加载全部商品
  try {
    const res = await axios.get('/api/products')
    if (res.data.success) {
      allProducts.value = res.data.data
    }
  } catch (e) {
    console.error('加载全部商品失败:', e)
  }
  
  // 加载未分配的商品
  try {
    const res = await axios.get('/api/unassigned-products')
    if (res.data.success) {
      unassignedProducts.value = res.data.data
    }
  } catch (e) {
    console.error('加载未分配商品失败:', e)
  }
  
  showProductDialog.value = true
}

function toggleProductSelection(productId) {
  const index = selectedProductIds.value.indexOf(productId)
  if (index > -1) {
    selectedProductIds.value.splice(index, 1)
  } else {
    selectedProductIds.value.push(productId)
  }
}

async function saveCategoryProducts() {
  if (!currentCategory.value) return
  
  try {
    // 先移除所有商品
    const allIds = [...categoryProducts.value.map(p => p.id)]
    if (allIds.length > 0) {
      await axios.delete(`/api/categories/${currentCategory.value.id}/products`, {
        data: { productIds: allIds }
      })
    }
    
    // 再添加选中的商品
    if (selectedProductIds.value.length > 0) {
      await axios.post(`/api/categories/${currentCategory.value.id}/products`, {
        productIds: selectedProductIds.value
      })
    }
    
    showProductDialog.value = false
    
    const toast = document.createElement('div')
    toast.className = 'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black bg-opacity-75 text-white px-6 py-3 rounded-lg z-50 text-sm'
    toast.textContent = '✓ 保存成功'
    document.body.appendChild(toast)
    setTimeout(() => toast.remove(), 1500)
  } catch (e) {
    console.error('保存目录商品失败:', e)
    const toast = document.createElement('div')
    toast.className = 'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-red-600 bg-opacity-90 text-white px-6 py-3 rounded-lg z-50 text-sm'
    toast.textContent = '✗ 保存失败'
    document.body.appendChild(toast)
    setTimeout(() => toast.remove(), 1500)
  }
}

async function openDeleteConfirm(cat) {
  // 先加载商品数据
  if (!products.value.length) {
    try {
      const res = await axios.get('/api/products')
      if (res.data.success) {
        products.value = res.data.data
      }
    } catch (e) {
      console.error('加载商品失败:', e)
    }
  }
  
  deletingCategory.value = cat
  showDeleteConfirm.value = true
}

async function confirmDelete() {
  if (!deletingCategory.value) return
  
  deleteLoading.value = true
  
  try {
    await axios.delete(`/api/categories/${deletingCategory.value.id}`)
    loadCategories()
    
    const toast = document.createElement('div')
    toast.className = 'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black bg-opacity-75 text-white px-6 py-3 rounded-lg z-50 text-sm'
    toast.textContent = '✓ 删除成功'
    document.body.appendChild(toast)
    setTimeout(() => toast.remove(), 1500)
    
    closeDeleteConfirm()
  } catch (error) {
    console.error('删除目录失败:', error)
    const toast = document.createElement('div')
    toast.className = 'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-red-600 bg-opacity-90 text-white px-6 py-3 rounded-lg z-50 text-sm'
    toast.textContent = '✗ 删除失败'
    document.body.appendChild(toast)
    setTimeout(() => toast.remove(), 1500)
  } finally {
    deleteLoading.value = false
  }
}

function closeDeleteConfirm() {
  showDeleteConfirm.value = false
  deletingCategory.value = null
}

async function deleteCategory(cat) {
  // 旧函数保留，但调用新的确认弹窗函数
  openDeleteConfirm(cat)
}

async function moveCategory(cat, direction) {
  try {
    await axios.put(`/api/categories/${cat.id}/move`, { direction })
    loadCategories()
  } catch (error) {
    console.error('移动目录失败:', error)
  }
}

async function saveCategory() {
  if (!formData.value.name || !formData.value.abbreviation) {
    return
  }
  
  if (abbreviationError.value) {
    return
  }
  
  loading.value = true
  
  try {
    if (isEdit.value && editingCategory.value) {
      await axios.put(`/api/categories/${editingCategory.value.id}`, formData.value)
    } else {
      await axios.post('/api/categories', formData.value)
    }
    
    closeDialog()
    loadCategories()
    
    const toast = document.createElement('div')
    toast.className = 'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black bg-opacity-75 text-white px-6 py-3 rounded-lg z-50 text-sm'
    toast.textContent = '✓ 保存成功'
    document.body.appendChild(toast)
    setTimeout(() => toast.remove(), 1500)
  } catch (error) {
    console.error('保存目录失败:', error)
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
  loadCategories()
  loadProducts()
})

async function loadProducts() {
  try {
    const res = await axios.get('/api/products')
    if (res.data.success) {
      products.value = res.data.data
    }
  } catch (e) {
    console.error('加载商品失败:', e)
  }
}
</script>
