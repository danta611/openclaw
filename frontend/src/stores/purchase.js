import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const usePurchaseStore = defineStore('purchase', () => {
  const items = ref([])

  const totalPrice = computed(() => {
    return items.value.reduce((sum, item) => sum + (Number(item.price) * Number(item.quantity)), 0)
  })

  const itemCount = computed(() => {
    return items.value.reduce((sum, item) => sum + item.quantity, 0)
  })

  function addItem(product) {
    const existingItem = items.value.find(item => item.id === product.id)
    if (existingItem) {
      existingItem.quantity++
    } else {
      items.value.push({
        id: product.id,
        name: product.name,
        model: product.model,
        description: product.description,
        price: product.price,
        image_url: product.image_url,
        images: product.images || [],
        quantity: 1
      })
    }
  }

  function removeItem(productId) {
    const index = items.value.findIndex(item => item.id === productId)
    if (index > -1) {
      items.value.splice(index, 1)
    }
  }

  function updateQuantity(productId, quantity) {
    const item = items.value.find(item => item.id === productId)
    if (item) {
      item.quantity = Math.max(1, quantity)
    }
  }

  function clearCart() {
    items.value = []
  }

  function loadCart() {
    try {
      const saved = localStorage.getItem('purchase-cart')
      if (saved) {
        const parsed = JSON.parse(saved)
        // 确保数据格式正确
        if (Array.isArray(parsed)) {
          items.value = parsed.filter(item => item && item.id)
        } else {
          items.value = []
        }
      }
    } catch (error) {
      console.error('加载购物车失败:', error)
      items.value = []
      localStorage.removeItem('purchase-cart')
    }
  }

  function saveCart() {
    localStorage.setItem('purchase-cart', JSON.stringify(items.value))
  }

  return {
    items,
    totalPrice,
    itemCount,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    loadCart,
    saveCart
  }
})
