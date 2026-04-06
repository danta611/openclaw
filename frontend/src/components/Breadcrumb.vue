<template>
  <div class="flex items-center justify-between">
    <div class="flex items-center gap-1.5 text-xs text-gray-600">
      <template v-for="(item, index) in breadcrumbs" :key="index">
        <template v-if="index > 0">
          <svg class="w-3.5 h-3.5 flex-shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
          </svg>
        </template>
        <span 
          v-if="item.to"
          :class="[
            'hover:text-blue-600 cursor-pointer',
            index < breadcrumbs.length - 2 ? 'truncate max-w-16' : ''
          ]"
          @click="navigateTo(item.to)"
        >
          {{ item.label }}
        </span>
        <span 
          v-else
          class="text-gray-800 font-medium"
        >
          {{ item.label }}
        </span>
      </template>
    </div>
    <button v-if="showBack" @click="goBack" class="text-gray-500 hover:text-gray-700">
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
      </svg>
    </button>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const props = defineProps({
  breadcrumbs: {
    type: Array,
    required: true
  },
  showBack: {
    type: Boolean,
    default: true
  }
})

const router = useRouter()

function navigateTo(path) {
  router.push(path)
}

function goBack() {
  router.back()
}
</script>
