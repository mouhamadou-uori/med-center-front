<script setup lang="ts">
import { format } from 'date-fns'
import { VisXYContainer, VisLine, VisAxis, VisArea, VisCrosshair, VisTooltip } from '@unovis/vue'
import type { Period, Range } from '~/types'

const cardRef = useTemplateRef<HTMLElement | null>('cardRef')

const props = defineProps<{
  period: Period
  range: Range
}>()

type ApiDataRecord = {
  date: string
  patients: number
  consultations: number
}

type DataRecord = {
  date: Date
  amount: number
}

const { width } = useElementSize(cardRef)

const data = ref<DataRecord[]>([])
const loading = ref(false)

// Replace with your actual endpoint URL
const fetchData = async () => {
  loading.value = true
  try {
    // Format dates as YYYY-MM-DD for the API
    const startDate = props.range.start
    const endDate = props.range.end
    
    const response = await $fetch<ApiDataRecord[]>(`http://localhost:9000/api/medical/stats/period/${props.period}/${startDate}/${endDate}/3`, {
      method: 'GET'
    })
    
    data.value = response.map(item => ({
      date: new Date(item.date),
      amount: item.consultations // Using consultations as the main metric
    }))
  } catch (error) {
    console.error('Error fetching chart data:', error)
    data.value = []
  } finally {
    loading.value = false
  }
}

watch([() => props.period, () => props.range], fetchData, { immediate: true })

const x = (_: DataRecord, i: number) => i
const y = (d: DataRecord) => d.amount

const total = computed(() => data.value.reduce((acc: number, item: DataRecord) => acc + item.amount, 0))

const formatNumber = new Intl.NumberFormat('en', { maximumFractionDigits: 0 }).format

const formatDate = (date: Date): string => {
  const formatMap: Record<Period, string> = {
    today: 'd MMM',
    week: 'd MMM',
    month: 'MMM yyy',
    year: 'MMM yyy'
  }
  return format(date, formatMap[props.period])
}

const xTicks = (i: number) => {
  if (i === 0 || i === data.value.length - 1 || !data.value[i]) {
    return ''
  }
  return formatDate(data.value[i].date)
}

const template = (d: DataRecord) => `${formatDate(d.date)}: ${formatNumber(d.amount)}`
</script>

<template>
  <UCard ref="cardRef" :ui="{ body: '!px-0 !pt-0 !pb-3' }">
    <template #header>
      <div>
        <p class="text-xs text-muted uppercase mb-1.5">
          Consultations
        </p>
        <p class="text-3xl text-highlighted font-semibold">
          {{ formatNumber(total) }}
        </p>
      </div>
    </template>

    <div v-if="loading" class="h-96 flex items-center justify-center">
      <UIcon name="i-heroicons-arrow-path" class="animate-spin" />
    </div>

    <VisXYContainer
      v-else
      :data="data"
      :padding="{ top: 40 }"
      class="h-96"
      :width="width"
    >
      <VisLine
        :x="x"
        :y="y"
        color="var(--ui-primary)"
      />
      <VisArea
        :x="x"
        :y="y"
        color="var(--ui-primary)"
        :opacity="0.1"
      />

      <VisAxis
        type="x"
        :x="x"
        :tick-format="xTicks"
      />

      <VisCrosshair
        color="var(--ui-primary)"
        :template="template"
      />

      <VisTooltip />
    </VisXYContainer>
  </UCard>
</template>

<style scoped>
.unovis-xy-container {
  --vis-crosshair-line-stroke-color: var(--ui-primary);
  --vis-crosshair-circle-stroke-color: var(--ui-bg);

  --vis-axis-grid-color: var(--ui-border);
  --vis-axis-tick-color: var(--ui-border);
  --vis-axis-tick-label-color: var(--ui-text-dimmed);

  --vis-tooltip-background-color: var(--ui-bg);
  --vis-tooltip-border-color: var(--ui-border);
  --vis-tooltip-text-color: var(--ui-text-highlighted);
}
</style>