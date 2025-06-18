<script setup lang="ts">
import { h, resolveComponent } from 'vue'
import type { TableColumn } from '@nuxt/ui'

interface Patient {
  id: number
  lastName: string
  firstName: string
  username: string
  email: string
  tel: string
  numeroSecu: string
  adresse: string
  contactUrgence: string
  dateCreation: string
  actif: boolean
  dossierMedicalId: number
  nombreConsultations: number
}

const UBadge = resolveComponent('UBadge')

const { data: patients, pending, error } = useFetch<Patient[]>(`http://localhost:9000/api/medical/professionnels/3/patients`, {
  method: 'GET',
  server: false // Force client-side only to avoid hydration mismatch
})
const columns: TableColumn<Patient>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
    cell: ({ row }) => `#${row.getValue('id')}`
  },
  {
    accessorKey: 'dateCreation',
    header: 'Date création',
    cell: ({ row }) => {
      return new Date(row.getValue('dateCreation')).toLocaleString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      })
    }
  },
  {
    accessorKey: 'actif',
    header: 'Statut',
    cell: ({ row }) => {
      const isActive = row.getValue('actif')
      const color = isActive ? 'success' : 'error'
      const label = isActive ? 'Actif' : 'Inactif'

      return h(UBadge, { class: 'capitalize', variant: 'subtle', color }, () => label)
    }
  },
  {
    accessorKey: 'firstName',
    header: 'Patient',
    cell: ({ row }) => {
      return `${row.getValue('firstName')} ${row.original.lastName}`
    }
  },
  {
    accessorKey: 'nombreConsultations',
    header: () => h('div', { class: 'text-right' }, 'Consultations'),
    cell: ({ row }) => {
      const consultations = Number.parseInt(row.getValue('nombreConsultations'))
      return h('div', { class: 'text-right font-medium' }, `${consultations}`)
    }
  }
]
</script>

<template>
  <ClientOnly>
    <div v-if="pending" class="flex items-center justify-center h-32">
      <UIcon name="i-heroicons-arrow-path" class="animate-spin" />
    </div>
    
    <div v-else-if="error" class="flex items-center justify-center h-32">
      <p class="text-red-500">Erreur lors du chargement des patients</p>
    </div>
    
    <UTable
      v-else
      :data="patients || []"
      :columns="columns"
      class="shrink-0"
      :ui="{
        base: 'table-fixed border-separate border-spacing-0',
        thead: '[&>tr]:bg-elevated/50 [&>tr]:after:content-none',
        tbody: '[&>tr]:last:[&>td]:border-b-0',
        th: 'first:rounded-l-lg last:rounded-r-lg border-y border-default first:border-l last:border-r',
        td: 'border-b border-default'
      }"
    />
    
    <template #fallback>
      <div class="flex items-center justify-center h-32">
        <UIcon name="i-heroicons-arrow-path" class="animate-spin" />
      </div>
    </template>
  </ClientOnly>
</template>
