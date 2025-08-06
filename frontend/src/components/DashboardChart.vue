<template>
  <div class="dashboard-chart">
    <Bar v-if="type==='bar'" :data="chartData" :options="options" />
    <Line v-else :data="chartData" :options="options" />
  </div>
</template>

<script setup>
import { Bar, Line } from 'vue-chartjs'
import {
  Chart,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement
} from 'chart.js'

Chart.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, PointElement, LineElement)

const props = defineProps({
  chartData: { type: Object, required: true },
  options: { type: Object, default: () => ({}) },
  type: { type: String, default: 'bar' }
})
</script>

<style scoped>
.dashboard-chart {
  min-height: 320px;
}
</style>
