<template>
  <div class="p-3">
    <div class="bg-white rounded-lg shadow-lg overflow-hidden">
      <!-- 顶部导航栏 -->
      <div class="bg-white border-b px-4 py-2.5">
        <Breadcrumb 
          :breadcrumbs="[
            { label: '首页', to: '/' },
            { label: '店铺管理', to: '/shop-manage' },
            { label: '商品管理' }
          ]"
        />
      </div>

      <div class="p-3">
        <!-- 搜索和筛选 -->
        <div class="flex flex-col gap-2 mb-3">
          <div class="flex gap-2">
            <input 
              v-model="searchKeyword" 
              type="text" 
              placeholder="搜索..."
              class="flex-1 flex-shrink min-w-0 px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
            <button 
              @click="openAddDialog"
              class="flex-shrink-0 px-2.5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center text-sm whitespace-nowrap"
            >
              添加商品
            </button>
          </div>
          <div class="grid grid-cols-2 gap-2">
            <select 
              v-model="selectedCategory" 
              class="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs"
            >
              <option value="">全部分类</option>
              <option v-for="cat in flatCategories" :key="cat.id" :value="cat.id">
                {{ cat.parentName ? cat.parentName + ' > ' : '' }}{{ cat.name }}
              </option>
            </select>
            <select 
              v-model="selectedStockStatus" 
              class="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs"
            >
              <option value="">全部状态</option>
              <option value="有货">有货</option>
              <option value="预定">预定</option>
              <option value="缺货">缺货</option>
              <option value="上新">上新</option>
            </select>
          </div>
        </div>

        <!-- 商品列表 -->
        <div class="space-y-2">
          <div 
            v-for="product in filteredProducts" 
            :key="product.id"
            class="flex items-start gap-2.5 p-2.5 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
            @click="openEditDialog(product)"
          >
            <img 
              :src="getProductImage(product)" 
              :alt="product.name"
              class="w-12 h-12 rounded-lg object-cover bg-white border flex-shrink-0"
              @error="(e) => { e.target.src = placeholderImage }"
              @click.stop="openEditDialog(product)"
            />
            <div class="flex-1 min-w-0">
              <!-- 第一行：商品名 + 价格 -->
              <div class="flex items-center justify-between gap-2">
                <p class="font-medium text-gray-800 text-sm truncate flex-1 min-w-0">{{ product.name }}</p>
                <span class="text-sm text-gray-600 flex-shrink-0 whitespace-nowrap">¥{{ Math.round(Number(product.price)) }}</span>
              </div>
              <!-- 第二行：型号 + 库存标签 -->
              <div class="flex items-center justify-between gap-2 mt-0.5">
                <span v-if="product.model" class="text-xs text-gray-500 truncate flex-1 min-w-0">{{ product.model }}</span>
                <span v-else class="text-xs text-gray-400 truncate flex-1 min-w-0">&nbsp;</span>
                <span :class="stockStatusClass(product.stock_status)" class="text-xs flex-shrink-0 whitespace-nowrap">
                  {{ product.stock_status || '有货' }}
                </span>
              </div>
              <!-- 第三行：分类路径 + 操作按钮 -->
              <div class="flex items-center justify-between gap-2 mt-0.5">
                <span class="text-xs text-gray-500 truncate flex-1 min-w-0">{{ getCategoryPath(product.category_id) }}</span>
                <div class="flex items-center gap-1.5 flex-shrink-0" @click.stop>
                  <button @click="confirmDelete(product)" class="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div v-if="filteredProducts.length === 0" class="text-center text-gray-500 py-6 text-sm">
            暂无商品
          </div>
        </div>
      </div>
    </div>

    <!-- 新增/编辑商品弹窗 -->
    <div v-if="showDialog" class="fixed inset-0 bg-black bg-opacity-75 z-50 flex flex-col">
      <div class="bg-white w-full h-full flex flex-col">
        <!-- 顶部导航栏 -->
        <div class="bg-gray-50 px-4 py-3 border-b flex items-center flex-shrink-0">
          <div class="flex-1">
            <Breadcrumb 
              :breadcrumbs="[
                { label: '首页', to: '/' },
                { label: '店铺管理', to: '/shop-manage' },
                { label: '商品管理' },
                { label: isEdit ? '编辑商品' : '新增商品' }
              ]"
            />
          </div>
          <button @click="closeDialog" class="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium ml-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </button>
        </div>
        
        <div class="p-3.5 overflow-y-auto flex-1">
          <!-- 商品名称 -->
          <div class="mb-2.5">
            <label class="block text-xs font-medium text-gray-700 mb-0.5">商品名称 <span class="text-red-500">*</span></label>
            <input 
              v-model="form.name" 
              type="text" 
              class="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              placeholder="请输入商品名称"
            />
          </div>
          
          <!-- 价格和型号 -->
          <div class="grid grid-cols-2 gap-2.5 mb-2.5">
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-0.5">价格 (元) <span class="text-red-500">*</span></label>
              <input 
                v-model.number="form.price" 
                type="number" 
                step="0.01"
                min="0"
                class="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                placeholder="0.00"
              />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-0.5">型号</label>
              <input 
                v-model="form.model" 
                type="text" 
                class="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                placeholder="请输入型号"
              />
            </div>
          </div>
          
          <!-- 分类和库存状态 -->
          <div class="grid grid-cols-2 gap-2.5 mb-2.5">
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-0.5">所属分类 <span class="text-red-500">*</span></label>
              <select 
                v-model="form.category_id" 
                class="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option :value="null">未分配</option>
                <option v-for="cat in flatCategories" :key="cat.id" :value="cat.id">
                  {{ cat.parentName ? cat.parentName + ' > ' : '' }}{{ cat.name }}
                </option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-0.5">库存状态 <span class="text-red-500">*</span></label>
              <select 
                v-model="form.stock_status" 
                class="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="有货">有货</option>
                <option value="预定">预定</option>
                <option value="缺货">缺货</option>
                <option value="上新">上新</option>
              </select>
            </div>
          </div>
          
          <!-- 商品图片（多图） -->
          <div class="mb-3">
            <label class="block text-xs font-medium text-gray-700 mb-1">商品图片（第一张为列表展示图，最多5张）</label>
            <div class="flex flex-wrap gap-3">
              <div 
                v-for="(img, idx) in form.images" 
                :key="idx"
                class="relative w-24 h-24 rounded-xl overflow-hidden border-2 cursor-pointer shadow-sm hover:shadow-md transition-shadow"
                :class="idx === 0 ? 'border-blue-500' : 'border-gray-200'"
                @click="showImageMenu(idx)"
              >
                <img :src="getImageUrl(img)" class="w-full h-full object-cover" @error="(e) => { e.target.src = placeholderImage }" />
                <div v-if="idx === 0" class="absolute bottom-0 left-0 right-0 bg-blue-500 text-white text-xs text-center py-1 font-medium">展示图</div>
              </div>
              <button 
                v-if="form.images.length < 5"
                @click="triggerImageUpload"
                class="w-24 h-24 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50 transition-colors"
              >
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                </svg>
                <span class="text-xs mt-1">{{ form.images.length }}/5</span>
              </button>
            </div>
            <input ref="imageInput" type="file" accept="image/*" class="hidden" @change="onImageSelected" />
          </div>
          
          <!-- 图片操作菜单 -->
          <div v-if="imageMenuVisible" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center" @click.self="closeImageMenu">
            <div class="bg-white rounded-xl w-64 overflow-hidden shadow-xl">
              <div class="p-4 border-b border-gray-100">
                <p class="text-center font-medium text-gray-800">图片操作</p>
              </div>
              <div class="p-2">
                <button 
                  @click="setMainImage"
                  class="w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg flex items-center gap-3"
                  :class="{ 'opacity-50 cursor-not-allowed': imageMenuIndex === 0 }"
                  :disabled="imageMenuIndex === 0"
                >
                  <svg class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
                  <span>设为展示图</span>
                </button>
                <button 
                  @click="deleteImage"
                  class="w-full px-4 py-3 text-left text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-3"
                  :class="{ 'opacity-50 cursor-not-allowed': form.images.length <= 1 }"
                  :disabled="form.images.length <= 1"
                >
                  <svg class="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                  </svg>
                  <span>删除图片</span>
                </button>
              </div>
              <div class="p-2 border-t border-gray-100">
                <button 
                  @click="closeImageMenu"
                  class="w-full px-4 py-3 text-center text-gray-600 hover:bg-gray-50 rounded-lg"
                >
                  取消
                </button>
              </div>
            </div>
          </div>
          
          <!-- 商品描述 -->
          <div class="mb-2.5">
            <label class="block text-xs font-medium text-gray-700 mb-0.5">商品描述</label>
            <textarea 
              v-model="form.description" 
              rows="4"
              class="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              placeholder="请输入商品描述"
            ></textarea>
          </div>
          
          <!-- 商品详情（支持Markdown） -->
          <div class="mb-2.5">
            <label class="block text-xs font-medium text-gray-700 mb-0.5">商品详情（支持Markdown）</label>
            <!-- Markdown快捷工具 -->
            <div class="flex flex-wrap gap-1.5 mb-1.5">
              <button @click="insertMarkdown('h1')" type="button" class="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs font-medium">H1</button>
              <button @click="insertMarkdown('h2')" type="button" class="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs font-medium">H2</button>
              <button @click="insertMarkdown('h3')" type="button" class="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs font-medium">H3</button>
              <button @click="insertMarkdown('bold')" type="button" class="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs font-medium">粗体</button>
              <button @click="insertMarkdown('italic')" type="button" class="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs font-medium">斜体</button>
              <button @click="insertMarkdown('ul')" type="button" class="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs font-medium">无序列表</button>
              <button @click="insertMarkdown('ol')" type="button" class="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs font-medium">有序列表</button>
              <button @click="insertMarkdown('link')" type="button" class="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs font-medium">链接</button>
              <button @click="insertMarkdown('quote')" type="button" class="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs font-medium">引用</button>
              <button @click="insertMarkdown('table')" type="button" class="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs font-medium">表格</button>
              <button @click="triggerDetailImageUpload" type="button" class="px-2 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded text-xs font-medium">图片</button>
            </div>
            <!-- 文本样式工具 -->
            <div class="flex flex-wrap gap-1.5 mb-1.5">
              <span class="text-xs text-gray-500 mr-1 self-center">文本颜色:</span>
              <button @click="insertMarkdown('color-red')" type="button" class="px-2 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded text-xs font-medium">红</button>
              <button @click="insertMarkdown('color-blue')" type="button" class="px-2 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded text-xs font-medium">蓝</button>
              <button @click="insertMarkdown('color-green')" type="button" class="px-2 py-1 bg-green-100 hover:bg-green-200 text-green-700 rounded text-xs font-medium">绿</button>
              <button @click="insertMarkdown('color-yellow')" type="button" class="px-2 py-1 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 rounded text-xs font-medium">黄</button>
              <button @click="insertMarkdown('color-purple')" type="button" class="px-2 py-1 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded text-xs font-medium">紫</button>
            </div>
            <div class="flex flex-wrap gap-1.5 mb-1.5">
              <span class="text-xs text-gray-500 mr-1 self-center">文本底色:</span>
              <button @click="insertMarkdown('bg-red')" type="button" class="px-2 py-1 bg-red-100 hover:bg-red-200 rounded text-xs font-medium">红底</button>
              <button @click="insertMarkdown('bg-blue')" type="button" class="px-2 py-1 bg-blue-100 hover:bg-blue-200 rounded text-xs font-medium">蓝底</button>
              <button @click="insertMarkdown('bg-green')" type="button" class="px-2 py-1 bg-green-100 hover:bg-green-200 rounded text-xs font-medium">绿底</button>
              <button @click="insertMarkdown('bg-yellow')" type="button" class="px-2 py-1 bg-yellow-100 hover:bg-yellow-200 rounded text-xs font-medium">黄底</button>
              <button @click="insertMarkdown('bg-gray')" type="button" class="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs font-medium">灰底</button>
            </div>
            <textarea 
              ref="detailTextarea"
              v-model="form.detail_html" 
              rows="10"
              class="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-mono"
              placeholder="支持Markdown格式，例如：&#10;### 标题&#10;这是一段内容&#10;- 列表项1&#10;- 列表项2&#10;![图片](图片URL)"
              @focus="scrollToDetailSection"
            ></textarea>
            <input ref="detailImageInput" type="file" accept="image/*" class="hidden" @change="onDetailImageSelected" />
          </div>
        </div>
        
        <div class="p-3.5 border-t flex gap-2.5">
          <button @click="closeDialog" class="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition-colors font-medium text-sm">
            取消
          </button>
          <button @click="saveProduct" :disabled="loading" class="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 text-sm">
            {{ loading ? '保存中...' : '保存' }}
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
            确定要删除商品「<strong>{{ deletingProduct?.name }}</strong>」吗？
          </p>
        </div>
        <div class="p-3.5 border-t flex gap-2.5">
          <button 
            @click="showDeleteConfirm = false; deletingProduct = null" 
            class="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition-colors font-medium text-sm"
          >
            取消
          </button>
          <button 
            @click="deleteProduct" 
            :disabled="deleteLoading"
            class="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 text-sm"
          >
            {{ deleteLoading ? '删除中...' : '确认删除' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 裁剪弹窗 -->
    <div v-if="showCropper" class="fixed inset-0 bg-gray-900/60 z-[9999] flex flex-col" style="touch-action: none;">
      <div class="bg-white px-4 py-4 flex items-center justify-between flex-shrink-0 z-10 shadow-md">
        <h3 class="text-lg font-bold text-gray-800">裁剪图片</h3>
        <button @click="cancelCropper" class="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
      <div class="flex-1 flex items-center justify-center p-4" @touchstart="onCropTouchStart" @touchmove="onCropTouchMove" @touchend="onCropTouchEnd">
        <canvas 
          ref="cropContainer" 
          class="w-full h-full object-contain rounded-lg shadow-2xl"
          style="touch-action: none;"
        ></canvas>
      </div>
      <div class="p-5 border-t flex gap-3 flex-shrink-0 bg-white z-10 shadow-lg">
        <button @click="cancelCropper" class="flex-1 bg-gray-100 text-gray-700 py-3.5 rounded-xl hover:bg-gray-200 transition-colors font-medium text-base">
          取消
        </button>
        <button @click="confirmCropper" class="flex-1 bg-blue-600 text-white py-3.5 rounded-xl hover:bg-blue-700 transition-colors font-medium text-base">
          确认裁剪
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import axios from 'axios'
import Breadcrumb from '../components/Breadcrumb.vue'

const searchKeyword = ref('')
const selectedCategory = ref('')
const selectedStockStatus = ref('')

const categories = ref([])
const products = ref([])

const showDialog = ref(false)
const isEdit = ref(false)
const editingProductId = ref(null)
const loading = ref(false)
const showDeleteConfirm = ref(false)
const deletingProduct = ref(null)
const deleteLoading = ref(false)
const detailTextarea = ref(null)

// 图片操作菜单
const imageMenuVisible = ref(false)
const imageMenuIndex = ref(-1)

function showImageMenu(idx) {
  imageMenuIndex.value = idx
  imageMenuVisible.value = true
}

function closeImageMenu() {
  imageMenuVisible.value = false
  imageMenuIndex.value = -1
}

function setMainImage() {
  if (imageMenuIndex.value === 0) {
    closeImageMenu()
    return
  }
  const idx = imageMenuIndex.value
  const image = form.value.images[idx]
  form.value.images.splice(idx, 1)
  form.value.images.unshift(image)
  closeImageMenu()
}

function deleteImage() {
  if (form.value.images.length <= 1) {
    closeImageMenu()
    return
  }
  const idx = imageMenuIndex.value
  form.value.images.splice(idx, 1)
  closeImageMenu()
}

// 默认占位图
const placeholderImage = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9IiM5Y2EzYWYiPjxwYXRoIGQ9Ik0yMSAxOVY1YzAtMS4xLS45LTItMi0ySDVjLTEuMSAwLTIgLjktMiAydjE0YzAgMS4xLjkgMiAyIDJoMTRjMS4xIDAgMi0uOSAyLTJ6TTguNSAxMy41bDIuNSAzLjAxTDE0LjUgMTJsNC41IDZINWwzLjUtNC41eiIvPjwvc3ZnPg=='

// 获取完整图片URL
function getImageUrl(path) {
  if (!path) return placeholderImage
  if (path.startsWith('http') || path.startsWith('data:')) return path
  return 'http://62.234.29.89' + path
}

// 获取商品列表图片（用于商品管理列表）
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
    return placeholderImage
  }
  if (product.image_url.startsWith('/')) {
    return 'http://62.234.29.89' + product.image_url
  }
  return product.image_url
}

const form = ref({
  name: '',
  description: '',
  price: 0,
  category_id: null,
  stock_status: '有货',
  model: '',
  images: [],
  detail_html: ''
})

// 多图管理相关
const showCropper = ref(false)
const cropperImage = ref('')
const cropContainer = ref(null)
const pendingImageType = ref('product') // 'product' 或 'detail'

function insertMarkdown(type) {
  const textarea = detailTextarea.value
  if (!textarea) return
  
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const selectedText = form.value.detail_html.substring(start, end)
  
  let newText = ''
  switch(type) {
    case 'h1':
      newText = `# ${selectedText || '标题'}`
      break
    case 'h2':
      newText = `## ${selectedText || '标题'}`
      break
    case 'h3':
      newText = `### ${selectedText || '标题'}`
      break
    case 'bold':
      newText = `**${selectedText || '粗体文本'}**`
      break
    case 'italic':
      newText = `*${selectedText || '斜体文本'}*`
      break
    case 'ul':
      newText = `\n- ${selectedText || '列表项'}\n`
      break
    case 'ol':
      newText = `\n1. ${selectedText || '列表项'}\n`
      break
    case 'link':
      newText = `[${selectedText || '链接文字'}](链接URL)`
      break
    case 'quote':
      newText = `\n> ${selectedText || '引用文本'}\n`
      break
    case 'table':
      newText = `\n| 标题1 | 标题2 | 标题3 |\n| --- | --- | --- |\n| 内容1 | 内容2 | 内容3 |\n`
      break
    case 'color-red':
      newText = `<span style="color: #dc2626;">${selectedText || '红色文本'}</span>`
      break
    case 'color-blue':
      newText = `<span style="color: #2563eb;">${selectedText || '蓝色文本'}</span>`
      break
    case 'color-green':
      newText = `<span style="color: #16a34a;">${selectedText || '绿色文本'}</span>`
      break
    case 'color-yellow':
      newText = `<span style="color: #ca8a04;">${selectedText || '黄色文本'}</span>`
      break
    case 'color-purple':
      newText = `<span style="color: #9333ea;">${selectedText || '紫色文本'}</span>`
      break
    case 'bg-red':
      newText = `<span style="background-color: #fef2f2; padding: 2px 4px; border-radius: 2px;">${selectedText || '红底文本'}</span>`
      break
    case 'bg-blue':
      newText = `<span style="background-color: #eff6ff; padding: 2px 4px; border-radius: 2px;">${selectedText || '蓝底文本'}</span>`
      break
    case 'bg-green':
      newText = `<span style="background-color: #f0fdf4; padding: 2px 4px; border-radius: 2px;">${selectedText || '绿底文本'}</span>`
      break
    case 'bg-yellow':
      newText = `<span style="background-color: #fefce8; padding: 2px 4px; border-radius: 2px;">${selectedText || '黄底文本'}</span>`
      break
    case 'bg-gray':
      newText = `<span style="background-color: #f3f4f6; padding: 2px 4px; border-radius: 2px;">${selectedText || '灰底文本'}</span>`
      break
  }
  
  form.value.detail_html = 
    form.value.detail_html.substring(0, start) + 
    newText + 
    form.value.detail_html.substring(end)
  
  // 设置光标位置
  nextTick(() => {
    textarea.focus()
    textarea.setSelectionRange(start + newText.length, start + newText.length)
  })
}

function scrollToDetailSection() {
  // 找到商品详情标签的位置并滚动到屏幕第三行
  nextTick(() => {
    const labels = document.querySelectorAll('label')
    for (const label of labels) {
      if (label.textContent.includes('商品详情')) {
        // 计算屏幕第三行的位置（大约屏幕高度的20%）
        const targetOffset = label.getBoundingClientRect().top + window.scrollY - (window.innerHeight * 0.2)
        window.scrollTo({ top: targetOffset, behavior: 'smooth' })
        break
      }
    }
  })
}

// 扁平化分类列表（包含父分类名称）
const flatCategories = computed(() => {
  const result = []
  categories.value.forEach(cat => {
    result.push({ id: cat.id, name: cat.name, parentName: null })
    if (cat.children && cat.children.length > 0) {
      cat.children.forEach(child => {
        result.push({ id: child.id, name: child.name, parentName: cat.name })
      })
    }
  })
  return result
})

const filteredProducts = computed(() => {
  let result = products.value
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(p => 
      p.name.toLowerCase().includes(keyword) || 
      (p.model && p.model.toLowerCase().includes(keyword))
    )
  }
  if (selectedCategory.value) {
    result = result.filter(p => p.category_id == selectedCategory.value)
  }
  if (selectedStockStatus.value) {
    result = result.filter(p => (p.stock_status || '有货') === selectedStockStatus.value)
  }
  return result
})

function stockStatusClass(status) {
  const s = status || '有货'
  if (s === '有货') return 'text-green-600'
  if (s === '预定') return 'text-yellow-600'
  if (s === '缺货') return 'text-red-600'
  if (s === '上新') return 'text-amber-600'
  return 'text-gray-600'
}

function getCategoryPath(categoryId) {
  if (!categoryId) return '未分配'
  for (const cat of categories.value) {
    if (cat.id === categoryId) return cat.name
    if (cat.children) {
      for (const child of cat.children) {
        if (child.id === categoryId) return `${cat.name} > ${child.name}`
      }
    }
  }
  return '未分配'
}

async function loadCategories() {
  try {
    const response = await axios.get('/api/categories')
    if (response.data.success) categories.value = response.data.data
  } catch (error) {
    console.error('加载分类失败:', error)
  }
}

async function loadProducts() {
  try {
    const response = await axios.get('/api/products')
    if (response.data.success) products.value = response.data.data
  } catch (error) {
    console.error('加载商品列表失败:', error)
  }
}

function openAddDialog() {
  isEdit.value = false
  editingProductId.value = null
  form.value = { name: '', description: '', price: 0, category_id: null, stock_status: '有货', model: '', images: [], detail_html: '' }
  showDialog.value = true
}

function openEditDialog(product) {
  isEdit.value = true
  editingProductId.value = product.id
  // 解析多图 - 深拷贝避免修改影响原数据
  let images = []
  if (product.images && Array.isArray(product.images)) {
    images = [...product.images]
  } else if (product.image_url) {
    try {
      const parsed = JSON.parse(product.image_url)
      images = Array.isArray(parsed) ? [...parsed] : [parsed]
    } catch (e) {
      images = product.image_url ? [product.image_url] : []
    }
  }
  form.value = {
    name: product.name,
    description: product.description || '',
    price: Number(product.price) || 0,
    category_id: product.category_id,
    stock_status: product.stock_status || '有货',
    model: product.model || '',
    images: images,
    detail_html: product.detail_html || ''
  }
  showDialog.value = true
}

function closeDialog() {
  showDialog.value = false
}

// 多图管理相关函数
const imageInput = ref(null)

function triggerImageUpload() {
  imageInput.value?.click()
}

async function onImageSelected(e) {
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
  
  // 读取图片并开始裁剪
  const reader = new FileReader()
  reader.onload = (event) => {
    cropperImage.value = event.target.result
    pendingImageType.value = 'product'
    scale.value = 1
    translateX.value = 0
    translateY.value = 0
    showCropper.value = true
    nextTick(() => updateCropCanvas())
  }
  reader.readAsDataURL(file)
  e.target.value = ''
}

function removeImage(idx) {
  form.value.images.splice(idx, 1)
}

// 裁剪功能 - 使用canvas实现
const scale = ref(1)
const translateX = ref(0)
const translateY = ref(0)
const isDragging = ref(false)
const isPinching = ref(false)
const lastX = ref(0)
const lastY = ref(0)
const initialDistance = ref(0)
const initialScale = ref(1)
const cropImg = ref(null)
const cropSize = ref(0)
const cropCenterX = ref(0)
const cropCenterY = ref(0)

function updateCropCanvas() {
  if (!cropContainer.value || !cropperImage.value) return
  
  const container = cropContainer.value
  const w = container.offsetWidth
  const h = container.offsetHeight
  
  // 设置canvas分辨率为容器像素尺寸
  container.width = w
  container.height = h
  
  // 重置裁剪状态
  scale.value = 1
  translateX.value = 0
  translateY.value = 0
  
  cropImg.value = new Image()
  cropImg.value.onload = () => {
    // 初始化裁剪框大小（根据容器和图片尺寸，比例为100%）
    const containerSize = Math.min(w, h)
    cropSize.value = containerSize
    cropCenterX.value = w / 2
    cropCenterY.value = h / 2
    drawCropCanvas()
  }
  cropImg.value.src = cropperImage.value
}

function drawCropCanvas() {
  if (!cropContainer.value || !cropImg.value) return
  
  const container = cropContainer.value
  const ctx = container.getContext('2d')
  const w = container.offsetWidth
  const h = container.offsetHeight
  
  // 清空画布
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, w, h)
  
  // 裁剪框参数
  const cs = cropSize.value
  const cx = cropCenterX.value
  const cy = cropCenterY.value
  
  // 计算图片绘制（适应容器）
  const imgW = cropImg.value.width * scale.value
  const imgH = cropImg.value.height * scale.value
  const imgX = (w - imgW) / 2 + translateX.value
  const imgY = (h - imgH) / 2 + translateY.value
  
  // 先绘制整个暗色遮罩
  ctx.fillStyle = 'rgba(0,0,0,0.5)'
  ctx.fillRect(0, 0, w, h)
  
  // 使用destination-out在裁剪区域打洞，显示底部图片
  ctx.globalCompositeOperation = 'destination-out'
  ctx.fillStyle = 'rgba(0,0,0,1)'
  ctx.fillRect(cx - cs/2, cy - cs/2, cs, cs)
  ctx.globalCompositeOperation = 'source-over'
  
  // 清除裁剪区域的遮罩
  ctx.clearRect(cx - cs/2, cy - cs/2, cs, cs)
  
  // 在裁剪区域内绘制图片
  ctx.save()
  ctx.beginPath()
  ctx.rect(cx - cs/2, cy - cs/2, cs, cs)
  ctx.clip()
  ctx.drawImage(cropImg.value, imgX, imgY, imgW, imgH)
  ctx.restore()
  
  // 绘制裁剪框边框
  ctx.strokeStyle = 'white'
  ctx.lineWidth = 2
  ctx.strokeRect(cx - cs/2, cy - cs/2, cs, cs)
}

function getDistance(touches) {
  const dx = touches[0].clientX - touches[1].clientX
  const dy = touches[0].clientY - touches[1].clientY
  return Math.sqrt(dx * dx + dy * dy)
}

function onCropTouchStart(e) {
  e.preventDefault()
  
  if (e.touches.length === 2) {
    isPinching.value = true
    isDragging.value = false
    initialDistance.value = getDistance(e.touches)
    initialScale.value = scale.value
  } else if (e.touches.length === 1) {
    isPinching.value = false
    isDragging.value = true
    lastX.value = e.touches[0].clientX
    lastY.value = e.touches[0].clientY
  }
}

function onCropTouchMove(e) {
  e.preventDefault()
  
  if (e.touches.length === 2 && isPinching.value) {
    const currentDistance = getDistance(e.touches)
    const scaleFactor = currentDistance / initialDistance.value
    let newScale = initialScale.value * scaleFactor
    if (newScale < 0.1) newScale = 0.1
    if (newScale > 3) newScale = 3
    scale.value = newScale
    drawCropCanvas()
  } else if (e.touches.length === 1 && isDragging.value) {
    const deltaX = e.touches[0].clientX - lastX.value
    const deltaY = e.touches[0].clientY - lastY.value
    translateX.value += deltaX
    translateY.value += deltaY
    lastX.value = e.touches[0].clientX
    lastY.value = e.touches[0].clientY
    drawCropCanvas()
  }
}

function onCropTouchEnd(e) {
  isDragging.value = false
  isPinching.value = false
}

function confirmCropper() {
  if (!cropContainer.value || !cropperImage.value) return
  
  const container = cropContainer.value
  const w = container.offsetWidth
  const h = container.offsetHeight
  
  // 创建输出canvas
  const outputCanvas = document.createElement('canvas')
  const outputSize = 400
  outputCanvas.width = outputSize
  outputCanvas.height = outputSize
  const outputCtx = outputCanvas.getContext('2d')
  
  // 计算图片在容器中的位置
  const imgW = cropImg.value.width * scale.value
  const imgH = cropImg.value.height * scale.value
  const imgX = (w - imgW) / 2 + translateX.value
  const imgY = (h - imgH) / 2 + translateY.value
  
  // 使用动态计算的裁剪区域
  const cs = cropSize.value
  const cx = cropCenterX.value
  const cy = cropCenterY.value
  
  // 计算相对于原图的比例
  const ratioX = cropImg.value.width / imgW
  const ratioY = cropImg.value.height / imgH
  
  const srcX = (cx - cs/2 - imgX) * ratioX
  const srcY = (cy - cs/2 - imgY) * ratioY
  const srcW = cs * ratioX
  const srcH = cs * ratioY
  
  // 绘制裁剪结果
  outputCtx.drawImage(cropImg.value, srcX, srcY, srcW, srcH, 0, 0, outputSize, outputSize)
  
  const dataUrl = outputCanvas.toDataURL('image/jpeg', 0.85)
  
  if (pendingImageType.value === 'product') {
    uploadCroppedImage(dataUrl)
  } else if (pendingImageType.value === 'detail') {
    uploadDetailImage(dataUrl)
  }
  
  showCropper.value = false
}

async function uploadCroppedImage(dataUrl) {
  try {
    const response = await fetch(dataUrl)
    const blob = await response.blob()
    const file = new File([blob], 'cropped-image.jpg', { type: 'image/jpeg' })
    
    const formData = new FormData()
    formData.append('image', file)
    
    const uploadRes = await axios.post('/api/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    
    if (uploadRes.data.success) {
      form.value.images.push(uploadRes.data.data.url)
    }
  } catch (error) {
    console.error('上传裁剪图片失败:', error)
    alert('上传失败: ' + error.message)
  }
}

function cancelCropper() {
  showCropper.value = false
  cropperImage.value = ''
  cropImg.value = null
  scale.value = 1
  translateX.value = 0
  translateY.value = 0
  cropSize.value = 0
}

// 详情图片上传
const detailImageInput = ref(null)

function triggerDetailImageUpload() {
  detailImageInput.value?.click()
}

async function onDetailImageSelected(e) {
  const file = e.target.files[0]
  if (!file) return
  
  // 限制文件大小
  if (file.size > 5 * 1024 * 1024) {
    const toast = document.createElement('div')
    toast.className = 'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black bg-opacity-75 text-white px-6 py-3 rounded-lg z-50 text-sm'
    toast.textContent = '图片大小不能超过 5MB'
    document.body.appendChild(toast)
    setTimeout(() => toast.remove(), 1500)
    return
  }
  
  const reader = new FileReader()
  reader.onload = (event) => {
    cropperImage.value = event.target.result
    pendingImageType.value = 'detail'
    scale.value = 1
    translateX.value = 0
    translateY.value = 0
    showCropper.value = true
    nextTick(() => {
      cropImg.value = null
      updateCropCanvas()
    })
  }
  reader.readAsDataURL(file)
  e.target.value = ''
}

async function uploadDetailImage(dataUrl) {
  try {
    const response = await fetch(dataUrl)
    const blob = await response.blob()
    const file = new File([blob], 'detail-image.jpg', { type: 'image/jpeg' })
    
    const formData = new FormData()
    formData.append('image', file)
    
    const uploadRes = await axios.post('/api/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    
    if (uploadRes.data.success) {
      const imageUrl = 'http://62.234.29.89' + uploadRes.data.data.url
      const markdownImage = `![image](${imageUrl})`
      const textarea = detailTextarea.value
      if (textarea) {
        const start = textarea.selectionStart
        const end = textarea.selectionEnd
        form.value.detail_html = 
          form.value.detail_html.substring(0, start) + 
          '\n' + markdownImage + '\n' + 
          form.value.detail_html.substring(end)
        nextTick(() => {
          textarea.focus()
          const newPos = start + markdownImage.length + 2
          textarea.setSelectionRange(newPos, newPos)
        })
      } else {
        form.value.detail_html += '\n' + markdownImage
      }
    }
  } catch (error) {
    console.error('上传详情图片失败:', error)
    alert('上传失败: ' + error.message)
  }
}

async function saveProduct() {
  if (!form.value.name || !form.value.price) {
    alert('请填写必填项')
    return
  }
  
  loading.value = true
  try {
    const submitData = {}
    if (form.value.name) submitData.name = form.value.name
    if (form.value.description !== undefined) submitData.description = form.value.description || null
    submitData.price = form.value.price
    if (form.value.category_id !== undefined) submitData.category_id = form.value.category_id || null
    submitData.stock_status = form.value.stock_status || '有货'
    if (form.value.model !== undefined) submitData.model = form.value.model || null
    if (form.value.images !== undefined) submitData.images = JSON.stringify(form.value.images)
    if (form.value.detail_html !== undefined) submitData.detail_html = form.value.detail_html || null
    
    let response
    if (isEdit.value && editingProductId.value) {
      response = await axios.put(`/api/products/${editingProductId.value}`, submitData)
    } else {
      response = await axios.post('/api/products', submitData)
    }
    
    if (response.data.success) {
      closeDialog()
      loadProducts()
      const toast = document.createElement('div')
      toast.className = 'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black bg-opacity-75 text-white px-6 py-3 rounded-lg z-50 text-sm'
      toast.textContent = '✓ 保存成功'
      document.body.appendChild(toast)
      setTimeout(() => toast.remove(), 1500)
    }
  } catch (error) {
    console.error('保存商品失败:', error)
    alert('保存失败，请重试: ' + (error.response?.data?.error || error.message))
  } finally {
    loading.value = false
  }
}

function confirmDelete(product) {
  deletingProduct.value = product
  showDeleteConfirm.value = true
}

async function deleteProduct() {
  if (!deletingProduct.value) return
  deleteLoading.value = true
  try {
    await axios.delete(`/api/products/${deletingProduct.value.id}`)
    showDeleteConfirm.value = false
    deletingProduct.value = null
    loadProducts()
    const toast = document.createElement('div')
    toast.className = 'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black bg-opacity-75 text-white px-6 py-3 rounded-lg z-50 text-sm'
    toast.textContent = '✓ 删除成功'
    document.body.appendChild(toast)
    setTimeout(() => toast.remove(), 1500)
  } catch (error) {
    console.error('删除商品失败:', error)
    alert('删除失败，请重试')
  } finally {
    deleteLoading.value = false
  }
}

onMounted(() => {
  loadCategories()
  loadProducts()
})
</script>
