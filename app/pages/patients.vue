<script setup lang="ts">
import { useAuth } from '~/services/auth'
import { ref, onMounted } from 'vue'
import type { TableColumn } from '@nuxt/ui'
import { upperFirst } from 'scule'
import { getPaginationRowModel, type Row } from '@tanstack/table-core'

definePageMeta({
  requiresAuth: true
})

interface Patient {
  id: number
  lastName: string
  firstName: string
  patientname: string
  email: string
  tel: string
  numeroSecu: string
  adresse: string
  contactUrgence: string
  dateCreation: string
  actif: boolean
  dossierMedicalId: number | null
  nombreConsultations: number
}

const UButton = resolveComponent('UButton')
const UBadge = resolveComponent('UBadge')
const UDropdownMenu = resolveComponent('UDropdownMenu')
const UCheckbox = resolveComponent('UCheckbox')

const toast = useToast()
const table = useTemplateRef('table')

const columnFilters = ref([{
  id: 'email',
  value: ''
}])
const columnVisibility = ref()
const rowSelection = ref({ 1: true })

const { data, status } = await useFetch<Patient[]>('http://localhost:9000/api/medical/patients', {
  lazy: true
})

const nombrePatientsDistincts = ref<number | null>(null)
const nombreConsultations = ref<number | null>(null)

const { getCurrentUser } = useAuth()
const currentUser = getCurrentUser()

onMounted(async () => {
  if (currentUser && currentUser.id) {
    // Nombre de patients distincts
    const { data: patientsDistincts } = await useFetch<number>(`http://localhost:9000/api/medical/consultations/professionnel/${currentUser.id}/patients-distincts`)
    nombrePatientsDistincts.value = patientsDistincts.value ?? null
    // Nombre total de consultations
    const { data: totalConsults } = await useFetch<number>(`http://localhost:9000/api/medical/consultations/professionnel/${currentUser.id}/total`)
    nombreConsultations.value = totalConsults.value ?? null
  }
})

function getRowItems(row: Row<Patient>) {
  return [
    {
      type: 'label',
      label: 'Actions'
    },
    {
      label: 'Copier ID patient',
      icon: 'i-lucide-copy',
      onSelect() {
        navigator.clipboard.writeText(row.original.id.toString())
        toast.add({
          title: 'Copié',
          description: 'ID patient copié dans le presse-papier'
        })
      }
    },
    {
      type: 'separator'
    },
    {
      label: 'Voir dossier médical',
      icon: 'i-lucide-file-text'
    },
    {
      label: 'Voir examens',
      icon: 'i-lucide-stethoscope'
    },
    {
      type: 'separator'
    },
    {
      label: 'Supprimer patient',
      icon: 'i-lucide-trash',
      color: 'error',
      onSelect() {
        toast.add({
          title: 'Patient supprimé',
          description: 'Le patient a été supprimé.'
        })
      }
    }
  ]
}

const columns: TableColumn<Patient>[] = [
  {
    id: 'select',
    header: ({ table }) =>
      h(UCheckbox, {
        'modelValue': table.getIsSomePageRowsSelected()
          ? 'indeterminate'
          : table.getIsAllPageRowsSelected(),
        'onUpdate:modelValue': (value: boolean | 'indeterminate') =>
          table.toggleAllPageRowsSelected(!!value),
        'ariaLabel': 'Select all'
      }),
    cell: ({ row }) =>
      h(UCheckbox, {
        'modelValue': row.getIsSelected(),
        'onUpdate:modelValue': (value: boolean | 'indeterminate') => row.toggleSelected(!!value),
        'ariaLabel': 'Select row'
      })
  },
  {
    accessorKey: 'id',
    header: 'ID'
  },
  {
    accessorKey: 'lastName',
    header: 'Nom',
    cell: ({ row }) => {
      return h('div', { class: 'flex items-center gap-3' }, [
        h('div', undefined, [
          h('p', { class: 'font-medium text-highlighted' }, `${row.original.lastName} ${row.original.firstName}`),
          h('p', { class: '' }, row.original.patientname)
        ])
      ])
    }
  },
  {
    accessorKey: 'email',
    header: ({ column }) => {
      const isSorted = column.getIsSorted()

      return h(UButton, {
        color: 'neutral',
        variant: 'ghost',
        label: 'Email',
        icon: isSorted
          ? isSorted === 'asc'
            ? 'i-lucide-arrow-up-narrow-wide'
            : 'i-lucide-arrow-down-wide-narrow'
          : 'i-lucide-arrow-up-down',
        class: '-mx-2.5',
        onClick: () => column.toggleSorting(column.getIsSorted() === 'asc')
      })
    }
  },
  {
    accessorKey: 'tel',
    header: 'Téléphone',
    cell: ({ row }) => row.original.tel
  },
  {
    accessorKey: 'actif',
    header: 'Statut',
    filterFn: 'equals',
    cell: ({ row }) => {
      const status = row.original.actif ? 'actif' : 'inactif'
      const color = {
        actif: 'success' as const,
        inactif: 'error' as const
      }[status]

      return h(UBadge, { class: 'capitalize', variant: 'subtle', color }, () =>
        status
      )
    }
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      return h(
        'div',
        { class: 'text-right' },
        h(
          UDropdownMenu,
          {
            content: {
              align: 'end'
            },
            items: getRowItems(row)
          },
          () =>
            h(UButton, {
              icon: 'i-lucide-ellipsis-vertical',
              color: 'neutral',
              variant: 'ghost',
              class: 'ml-auto'
            })
        )
      )
    }
  }
]

const statusFilter = ref('all')

watch(() => statusFilter.value, (newVal) => {
  if (!table?.value?.tableApi) return

  const statusColumn = table.value.tableApi.getColumn('status')
  if (!statusColumn) return

  if (newVal === 'all') {
    statusColumn.setFilterValue(undefined)
  } else {
    statusColumn.setFilterValue(newVal)
  }
})

const pagination = ref({
  pageIndex: 0,
  pageSize: 10
})
</script>

<template>
  <UDashboardPanel id="patients">
    <template #header>
      <UDashboardNavbar title="Patients">
  <template #subtitle>
    <div class="flex gap-4">
      <span v-if="nombrePatientsDistincts !== null">Nombre de patients : <b>{{ nombrePatientsDistincts }}</b></span>
      <span v-if="nombreConsultations !== null">Nombre de consultations : <b>{{ nombreConsultations }}</b></span>
    </div>
  </template>
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <PatientsAddModal />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="flex flex-wrap items-center justify-between gap-1.5">
        <UInput
          :model-value="(table?.tableApi?.getColumn('email')?.getFilterValue() as string)"
          class="max-w-sm"
          icon="i-lucide-search"
          placeholder="Rechercher un patient..."
          @update:model-value="table?.tableApi?.getColumn('email')?.setFilterValue($event)"
        />

        <div class="flex flex-wrap items-center gap-1.5">
          <PatientsDeleteModal :count="table?.tableApi?.getFilteredSelectedRowModel().rows.length">
            <UButton
              v-if="table?.tableApi?.getFilteredSelectedRowModel().rows.length"
              label="Supprimer"
              color="error"
              variant="subtle"
              icon="i-lucide-trash"
            >
              <template #trailing>
                <UKbd>
                  {{ table?.tableApi?.getFilteredSelectedRowModel().rows.length }}
                </UKbd>
              </template>
            </UButton>
          </PatientsDeleteModal>

          <USelect
            v-model="statusFilter"
            :items="[
              { label: 'Tous', value: 'all' },
              { label: 'Actif', value: 'actif' },
              { label: 'Inactif', value: 'inactif' },
              { label: 'Actif', value: true },
              { label: 'Inactif', value: false }
            ]"
            :ui="{ trailingIcon: 'group-data-[state=open]:rotate-180 transition-transform duration-200' }"
            placeholder="Statut"
            class="min-w-28"
          />
          <UDropdownMenu
            :items="
              table?.tableApi
                ?.getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => ({
                  label: upperFirst(column.id),
                  type: 'checkbox' as const,
                  checked: column.getIsVisible(),
                  onUpdateChecked(checked: boolean) {
                    table?.tableApi?.getColumn(column.id)?.toggleVisibility(!!checked)
                  },
                  onSelect(e?: Event) {
                    e?.preventDefault()
                  }
                }))
            "
            :content="{ align: 'end' }"
          >
            <UButton
              label="Affichage"
              color="neutral"
              variant="outline"
              trailing-icon="i-lucide-settings-2"
            />
          </UDropdownMenu>
        </div>
      </div>

      <UTable
        ref="table"
        v-model:column-filters="columnFilters"
        v-model:column-visibility="columnVisibility"
        v-model:row-selection="rowSelection"
        v-model:pagination="pagination"
        :pagination-options="{
          getPaginationRowModel: getPaginationRowModel()
        }"
        class="shrink-0"
        :data="data"
        :columns="columns"
        :loading="status === 'pending'"
        :ui="{
          base: 'table-fixed border-separate border-spacing-0',
          thead: '[&>tr]:bg-elevated/50 [&>tr]:after:content-none',
          tbody: '[&>tr]:last:[&>td]:border-b-0',
          th: 'py-2 first:rounded-l-lg last:rounded-r-lg border-y border-default first:border-l last:border-r',
          td: 'border-b border-default'
        }"
      />

      <div class="flex items-center justify-between gap-3 border-t border-default pt-4 mt-auto">
        <div class="text-sm text-muted">
          {{ table?.tableApi?.getFilteredSelectedRowModel().rows.length || 0 }} of
          {{ table?.tableApi?.getFilteredRowModel().rows.length || 0 }} row(s) selected.
        </div>

        <div class="flex items-center gap-1.5">
          <UPagination
            :default-page="(table?.tableApi?.getState().pagination.pageIndex || 0) + 1"
            :items-per-page="table?.tableApi?.getState().pagination.pageSize"
            :total="table?.tableApi?.getFilteredRowModel().rows.length"
            @update:page="(p: number) => table?.tableApi?.setPageIndex(p - 1)"
          />
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>
