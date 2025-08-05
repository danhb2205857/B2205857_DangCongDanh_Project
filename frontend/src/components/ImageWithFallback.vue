<template>
  <div class="image-container" :class="containerClass">
    <img
      v-if="!imageError && !showFallback"
      :src="src"
      :alt="alt"
      :class="imageClass"
      @load="onImageLoad"
      @error="onImageError"
      v-bind="$attrs"
    />
    
    <!-- Fallback content -->
    <div
      v-else
      class="image-fallback d-flex align-items-center justify-content-center"
      :class="[imageClass, fallbackClass]"
      :style="fallbackStyle"
    >
      <div class="text-center">
        <i :class="fallbackIcon" class="mb-2"></i>
        <div v-if="fallbackText" class="fallback-text">{{ fallbackText }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'

export default {
  name: 'ImageWithFallback',
  inheritAttrs: false,
  props: {
    src: {
      type: String,
      required: true
    },
    alt: {
      type: String,
      default: ''
    },
    imageClass: {
      type: String,
      default: ''
    },
    containerClass: {
      type: String,
      default: ''
    },
    fallbackClass: {
      type: String,
      default: 'bg-light text-muted'
    },
    fallbackIcon: {
      type: String,
      default: 'fas fa-image fa-2x'
    },
    fallbackText: {
      type: String,
      default: ''
    },
    fallbackBg: {
      type: String,
      default: '#f8f9fa'
    }
  },
  emits: ['load', 'error'],
  setup(props, { emit }) {
    const imageError = ref(false)
    const showFallback = ref(false)

    const fallbackStyle = computed(() => ({
      backgroundColor: props.fallbackBg,
      minHeight: '100px'
    }))

    const onImageLoad = (event) => {
      imageError.value = false
      showFallback.value = false
      emit('load', event)
    }

    const onImageError = (event) => {
      imageError.value = true
      showFallback.value = true
      emit('error', event)
    }

    return {
      imageError,
      showFallback,
      fallbackStyle,
      onImageLoad,
      onImageError
    }
  }
}
</script>

<style scoped>
.image-container {
  position: relative;
}

.image-fallback {
  border: 2px dashed #dee2e6;
  border-radius: 0.375rem;
}

.fallback-text {
  font-size: 0.875rem;
  font-weight: 500;
}
</style>