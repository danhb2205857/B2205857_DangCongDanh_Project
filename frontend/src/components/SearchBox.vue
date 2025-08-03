<template>
  <div class="search-box" :class="{ 'search-box-focused': focused }">
    <div class="input-group" :class="sizeClass">
      <span v-if="showIcon" class="input-group-text">
        <i class="bi bi-search"></i>
      </span>
      <input
        ref="inputRef"
        type="text"
        class="form-control"
        :class="inputClass"
        :placeholder="placeholder"
        :value="modelValue"
        :disabled="disabled"
        :readonly="readonly"
        @input="handleInput"
        @focus="handleFocus"
        @blur="handleBlur"
        @keydown.enter="handleEnter"
        @keydown.escape="handleEscape"
      >
      <button
        v-if="clearable && modelValue"
        type="button"
        class="btn btn-outline-secondary clear-btn"
        @click="handleClear"
        title="Xóa"
      >
        <i class="bi bi-x"></i>
      </button>
      <button
        v-if="showSearchButton"
        type="button"
        class="btn btn-primary search-btn"
        @click="handleSearch"
        :disabled="disabled"
        title="Tìm kiếm"
      >
        <i class="bi bi-search"></i>
        <span v-if="searchButtonText" class="ms-1">{{ searchButtonText }}</span>
      </button>
    </div>
    
    <!-- Suggestions dropdown -->
    <div
      v-if="showSuggestions && suggestions.length > 0"
      class="suggestions-dropdown"
      ref="suggestionsRef"
    >
      <div
        v-for="(suggestion, index) in suggestions"
        :key="getSuggestionKey(suggestion, index)"
        class="suggestion-item"
        :class="{ 'active': index === activeSuggestionIndex }"
        @click="selectSuggestion(suggestion)"
        @mouseenter="activeSuggestionIndex = index"
      >
        <slot name="suggestion" :suggestion="suggestion" :index="index">
          <div class="suggestion-content">
            <div class="suggestion-title">
              {{ getSuggestionTitle(suggestion) }}
            </div>
            <div v-if="getSuggestionSubtitle(suggestion)" class="suggestion-subtitle">
              {{ getSuggestionSubtitle(suggestion) }}
            </div>
          </div>
        </slot>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: 'Tìm kiếm...'
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value)
  },
  disabled: {
    type: Boolean,
    default: false
  },
  readonly: {
    type: Boolean,
    default: false
  },
  clearable: {
    type: Boolean,
    default: true
  },
  showIcon: {
    type: Boolean,
    default: true
  },
  showSearchButton: {
    type: Boolean,
    default: false
  },
  searchButtonText: {
    type: String,
    default: ''
  },
  debounce: {
    type: Number,
    default: 300
  },
  minLength: {
    type: Number,
    default: 0
  },
  maxLength: {
    type: Number,
    default: null
  },
  
  // Suggestions
  suggestions: {
    type: Array,
    default: () => []
  },
  suggestionKey: {
    type: [String, Function],
    default: 'id'
  },
  suggestionTitle: {
    type: [String, Function],
    default: 'title'
  },
  suggestionSubtitle: {
    type: [String, Function],
    default: 'subtitle'
  },
  showSuggestions: {
    type: Boolean,
    default: false
  },
  
  // Styling
  variant: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'outline', 'filled'].includes(value)
  }
})

const emit = defineEmits([
  'update:modelValue',
  'search',
  'focus',
  'blur',
  'clear',
  'suggestion-select',
  'input'
])

// Refs
const inputRef = ref(null)
const suggestionsRef = ref(null)

// Reactive data
const focused = ref(false)
const activeSuggestionIndex = ref(-1)
let debounceTimer = null

// Computed properties
const sizeClass = computed(() => {
  return props.size !== 'md' ? `input-group-${props.size}` : ''
})

const inputClass = computed(() => {
  const classes = []
  if (props.variant === 'outline') classes.push('form-control-outline')
  if (props.variant === 'filled') classes.push('form-control-filled')
  return classes.join(' ')
})

// Methods
const getSuggestionKey = (suggestion, index) => {
  if (typeof props.suggestionKey === 'function') {
    return props.suggestionKey(suggestion, index)
  }
  return suggestion[props.suggestionKey] || index
}

const getSuggestionTitle = (suggestion) => {
  if (typeof props.suggestionTitle === 'function') {
    return props.suggestionTitle(suggestion)
  }
  return suggestion[props.suggestionTitle] || suggestion
}

const getSuggestionSubtitle = (suggestion) => {
  if (typeof props.suggestionSubtitle === 'function') {
    return props.suggestionSubtitle(suggestion)
  }
  return suggestion[props.suggestionSubtitle] || ''
}

const handleInput = (event) => {
  const value = event.target.value
  
  // Check max length
  if (props.maxLength && value.length > props.maxLength) {
    return
  }
  
  emit('update:modelValue', value)
  emit('input', value)
  
  // Debounced search
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }
  
  debounceTimer = setTimeout(() => {
    if (value.length >= props.minLength) {
      emit('search', value)
    }
  }, props.debounce)
  
  // Reset suggestion index
  activeSuggestionIndex.value = -1
}

const handleFocus = (event) => {
  focused.value = true
  emit('focus', event)
}

const handleBlur = (event) => {
  // Delay blur to allow suggestion click
  setTimeout(() => {
    focused.value = false
    activeSuggestionIndex.value = -1
    emit('blur', event)
  }, 150)
}

const handleEnter = (event) => {
  if (props.showSuggestions && activeSuggestionIndex.value >= 0) {
    selectSuggestion(props.suggestions[activeSuggestionIndex.value])
  } else {
    emit('search', props.modelValue)
  }
}

const handleEscape = () => {
  if (props.showSuggestions && activeSuggestionIndex.value >= 0) {
    activeSuggestionIndex.value = -1
  } else {
    inputRef.value?.blur()
  }
}

const handleClear = () => {
  emit('update:modelValue', '')
  emit('clear')
  emit('search', '')
  inputRef.value?.focus()
}

const handleSearch = () => {
  emit('search', props.modelValue)
}

const selectSuggestion = (suggestion) => {
  const title = getSuggestionTitle(suggestion)
  emit('update:modelValue', title)
  emit('suggestion-select', suggestion)
  emit('search', title)
  activeSuggestionIndex.value = -1
  inputRef.value?.focus()
}

const focus = () => {
  inputRef.value?.focus()
}

const blur = () => {
  inputRef.value?.blur()
}

// Handle keyboard navigation for suggestions
const handleKeyNavigation = (event) => {
  if (!props.showSuggestions || props.suggestions.length === 0) return
  
  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      activeSuggestionIndex.value = Math.min(
        activeSuggestionIndex.value + 1,
        props.suggestions.length - 1
      )
      break
    case 'ArrowUp':
      event.preventDefault()
      activeSuggestionIndex.value = Math.max(
        activeSuggestionIndex.value - 1,
        -1
      )
      break
  }
}

// Lifecycle
onMounted(() => {
  if (inputRef.value) {
    inputRef.value.addEventListener('keydown', handleKeyNavigation)
  }
})

onUnmounted(() => {
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }
  if (inputRef.value) {
    inputRef.value.removeEventListener('keydown', handleKeyNavigation)
  }
})

// Watch for suggestions changes
watch(() => props.suggestions, () => {
  activeSuggestionIndex.value = -1
})

// Expose methods
defineExpose({
  focus,
  blur
})
</script>

<style scoped>
.search-box {
  position: relative;
}

.search-box-focused .form-control {
  border-color: #4e73df;
  box-shadow: 0 0 0 0.2rem rgba(78, 115, 223, 0.25);
}

.input-group-text {
  background-color: #f8f9fc;
  border-color: #d1d3e2;
  color: #6c757d;
}

.form-control {
  border-color: #d1d3e2;
}

.form-control:focus {
  border-color: #4e73df;
  box-shadow: 0 0 0 0.2rem rgba(78, 115, 223, 0.25);
}

.form-control-outline {
  background-color: transparent;
  border: 2px solid #d1d3e2;
}

.form-control-filled {
  background-color: #f8f9fc;
  border: 1px solid transparent;
}

.clear-btn {
  border-left: none;
  padding: 0.375rem 0.5rem;
}

.search-btn {
  border-left: none;
}

.suggestions-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 1000;
  background: white;
  border: 1px solid #d1d3e2;
  border-top: none;
  border-radius: 0 0 0.375rem 0.375rem;
  box-shadow: 0 0.15rem 1.75rem 0 rgba(58, 59, 69, 0.15);
  max-height: 300px;
  overflow-y: auto;
}

.suggestion-item {
  padding: 0.75rem 1rem;
  cursor: pointer;
  border-bottom: 1px solid #f8f9fc;
  transition: background-color 0.15s ease;
}

.suggestion-item:hover,
.suggestion-item.active {
  background-color: #f8f9fc;
}

.suggestion-item:last-child {
  border-bottom: none;
}

.suggestion-content {
  display: flex;
  flex-direction: column;
}

.suggestion-title {
  font-weight: 500;
  color: #5a5c69;
}

.suggestion-subtitle {
  font-size: 0.875rem;
  color: #858796;
  margin-top: 0.25rem;
}

/* Size variants */
.input-group-sm .form-control,
.input-group-sm .input-group-text,
.input-group-sm .btn {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
}

.input-group-lg .form-control,
.input-group-lg .input-group-text,
.input-group-lg .btn {
  padding: 0.5rem 1rem;
  font-size: 1.25rem;
}

/* Responsive */
@media (max-width: 576px) {
  .search-btn .ms-1 {
    display: none;
  }
}
</style>