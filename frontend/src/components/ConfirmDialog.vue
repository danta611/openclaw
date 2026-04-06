<template>
  <div v-if="visible" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click.self="handleCancel">
    <div class="bg-white rounded-lg mx-4 p-6 max-w-sm w-full" @click.stop>
      <slot name="content">
        <p class="text-gray-800 mb-6">{{ message }}</p>
      </slot>
      <div class="flex gap-3">
        <button 
          v-if="showCancel"
          @click="handleCancel"
          class="flex-1 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
        >
          {{ cancelText }}
        </button>
        <button 
          @click="handleConfirm"
          :class="[
            'flex-1 py-2.5 rounded-lg text-white font-medium transition-colors',
            confirmClass || 'bg-blue-600 hover:bg-blue-700'
          ]"
        >
          {{ confirmText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  message: {
    type: String,
    default: ''
  },
  showCancel: {
    type: Boolean,
    default: true
  },
  cancelText: {
    type: String,
    default: '取消'
  },
  confirmText: {
    type: String,
    default: '确认'
  },
  confirmClass: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['confirm', 'cancel'])

const visible = ref(false)

function open() {
  visible.value = true
}

function close() {
  visible.value = false
}

function handleConfirm() {
  emit('confirm')
  close()
}

function handleCancel() {
  emit('cancel')
  close()
}

defineExpose({
  open,
  close
})
</script>
