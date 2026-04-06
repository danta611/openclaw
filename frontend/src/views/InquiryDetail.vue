<template>
  <div class="p-3" v-if="quotation">
    <div class="max-w-lg mx-auto">
      <!-- 页面标题 -->
      <div class="bg-gray-50 px-4 py-3 border-b rounded-t-lg mb-4">
        <div class="flex items-center gap-2">
          <button @click="router.back()" class="text-gray-500 hover:text-gray-700">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
          </button>
          <span class="text-sm text-gray-600">询价单详情</span>
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

      <!-- 询价单内容 -->
      <div id="quotation-content" class="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <!-- 头部 -->
        <div class="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 text-center">
          <div class="text-base mb-1">SZ、ProMax车酷正品配件</div>
          <h2 class="text-2xl font-bold">报价单</h2>
        </div>

        <!-- 询价单信息 -->
        <div class="px-4 py-2 bg-gray-50 border-b">
          <div class="flex justify-between items-center text-xs mb-1">
            <div class="flex items-center gap-0">
              <span class="text-gray-500">日期：</span>
              <span class="text-gray-800">{{ formatDate(quotation.created_at) }}</span>
              <span 
                :class="[
                  'ml-1 px-1.5 py-0.5 rounded text-xs font-medium',
                  quotation.inquiry_status === '已答复' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-green-100 text-green-700'
                ]"
              >
                {{ quotation.inquiry_status || '询价中' }}
              </span>
            </div>
            <div class="flex items-center gap-0">
              <span class="text-gray-500">单号：</span>
              <span class="text-gray-800 font-mono text-xs">{{ quotation.quotation_no }}</span>
            </div>
          </div>
          <div v-if="quotation.customer_phone" class="text-xs">
            <span class="text-gray-500">客户：</span>
            <span class="text-gray-800">{{ quotation.customer_phone }}</span>
          </div>
        </div>

        <!-- 商品表格 -->
        <div class="p-4">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b-2 border-gray-200">
                <th class="text-left py-2 text-gray-600 font-medium">商品</th>
                <th class="text-center text-gray-600 font-medium">价格</th>
                <th class="text-center text-gray-600 font-medium">数量</th>
                <th class="text-right text-gray-600 font-medium">小计</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in quotation.items" :key="item.id" class="border-b border-gray-100">
                <td class="py-3">
                  <div class="font-medium text-gray-800 text-xs">{{ item.product_name }}</div>
                  <div v-if="item.product_specs" class="text-xs text-gray-500 mt-0.5">{{ item.product_specs }}</div>
                </td>
                <td class="text-center">
                  <template v-if="item.modified_price">
                    <div class="text-gray-400 line-through text-xs">¥{{ formatPrice(item.original_price || item.unit_price) }}</div>
                    <div class="text-red-600 font-medium text-xs">¥{{ formatPrice(item.modified_price) }}</div>
                  </template>
                  <template v-else>
                    <span class="text-gray-600 text-xs">¥{{ formatPrice(item.unit_price) }}</span>
                  </template>
                </td>
                <td class="text-center text-gray-600">{{ item.quantity }}</td>
                <td class="text-right">
                  <template v-if="item.modified_subtotal">
                    <div class="text-gray-400 line-through text-sm">¥{{ formatPrice(item.original_subtotal || item.subtotal) }}</div>
                    <div class="text-red-600 font-medium text-sm">¥{{ formatPrice(item.modified_subtotal) }}</div>
                  </template>
                  <template v-else>
                    <span class="font-medium text-blue-600">¥{{ formatPrice(item.subtotal) }}</span>
                  </template>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- 总计 -->
          <div class="mt-4 pt-4 border-t">
            <template v-if="quotation.inquiry_status === '已答复' && quotation.discount_amount > 0">
              <div class="flex items-center justify-between mb-1.5">
                <span class="text-gray-500 text-sm">原总计</span>
                <span class="text-gray-400 line-through text-sm">¥{{ formatPrice(quotation.original_total || quotation.total_amount) }}</span>
              </div>
              <div class="flex items-center justify-between mb-1.5">
                <span class="text-gray-500 text-sm">优惠</span>
                <span class="text-red-600 font-medium text-sm">立减 ¥{{ formatPrice(quotation.discount_amount) }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="font-semibold text-gray-700">最终价格</span>
                <span class="text-2xl font-bold text-blue-600">¥{{ formatPrice(quotation.final_total || quotation.total_amount) }}</span>
              </div>
            </template>
            <template v-else-if="quotation.inquiry_status === '已答复'">
              <div class="flex items-center justify-between">
                <span class="font-semibold text-gray-700">总计金额</span>
                <span class="text-2xl font-bold text-blue-600">¥{{ formatPrice(quotation.final_total || quotation.total_amount) }}</span>
              </div>
            </template>
            <template v-else>
              <div class="flex items-center justify-between">
                <span class="font-semibold text-gray-700">预估金额</span>
                <span class="text-2xl font-bold text-blue-600">¥{{ formatPrice(quotation.total_amount) }}</span>
              </div>
            </template>
          </div>

          <!-- 备注 -->
          <div class="mt-4 pt-4 border-t">
            <p class="text-xs text-gray-600">
              仅做报价使用，非收款收据。
            </p>
          </div>
        </div>
      </div>

      <!-- 底部操作按钮 -->
      <div class="flex gap-3 mt-4">
        <button 
          @click="shareAsImage"
          class="flex-1 bg-blue-50 text-blue-600 border border-blue-200 py-3 rounded-lg font-medium text-sm hover:bg-blue-100 transition-colors"
        >
          保存为图片
        </button>
        <button 
          @click="downloadPDF"
          class="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors"
        >
          下载 PDF
        </button>
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
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import ConfirmDialog from '../components/ConfirmDialog.vue'
import Breadcrumb from '../components/Breadcrumb.vue'

const route = useRoute()
const quotation = ref(null)

const alertDialog = ref(null)
const alertMessage = ref('')

function showAlert(message) {
  alertMessage.value = message
  alertDialog.value.open()
}

function doCloseAlert() {
}

async function loadQuotation() {
  try {
    const res = await axios.get(`/api/quotations/${route.params.id}`)
    quotation.value = res.data.data
  } catch (error) {
    console.error('加载询价单失败:', error)
    showAlert('询价单不存在')
  }
}

function formatDate(dateStr) {
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

function formatPrice(price) {
  return Math.floor(Number(price))
}

async function shareAsImage() {
  try {
    const element = document.getElementById('quotation-content')
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true
    })
    
    const imgData = canvas.toDataURL('image/png')
    const link = document.createElement('a')
    link.download = `报价单-${quotation.value.quotation_no}.png`
    link.href = imgData
    link.click()
    
    const toast = document.createElement('div')
    toast.className = 'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black bg-opacity-75 text-white px-6 py-3 rounded-lg z-50 text-sm'
    toast.textContent = '✓ 已保存为图片'
    document.body.appendChild(toast)
    setTimeout(() => toast.remove(), 1500)
  } catch (error) {
    console.error('生成图片失败:', error)
    showAlert('生成图片失败，请稍后重试')
  }
}

async function downloadPDF() {
  try {
    const element = document.getElementById('quotation-content')
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true
    })
    
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    })
    
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = pdf.internal.pageSize.getHeight()
    const imgWidth = canvas.width
    const imgHeight = canvas.height
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight)
    const imgX = (pdfWidth - imgWidth * ratio) / 2
    const imgY = 10
    
    pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio)
    pdf.save(`报价单-${quotation.value.quotation_no}.pdf`)
    
    const toast = document.createElement('div')
    toast.className = 'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black bg-opacity-75 text-white px-6 py-3 rounded-lg z-50 text-sm'
    toast.textContent = '✓ PDF 已下载'
    document.body.appendChild(toast)
    setTimeout(() => toast.remove(), 1500)
  } catch (error) {
    console.error('生成 PDF 失败:', error)
    showAlert('生成 PDF 失败，请稍后重试')
  }
}

onMounted(() => {
  loadQuotation()
})
</script>
