<template>
  <div class="relative h-screen w-full overflow-hidden">
    <div class="h-full w-full">
      <slot :view-mode="viewMode" />
    </div>

    <aside
      class="absolute left-4 top-4 z-40 flex overflow-hidden rounded-3xl border border-default bg-(--sidebar-bg) shadow-sm backdrop-blur transition-all duration-300 ease-in-out"
      :class="isSidebarCollapsed ? 'w-[min(22rem,calc(100%-1.5rem))] flex-col' : 'bottom-4 h-auto w-[min(22rem,calc(100%-1.5rem))] flex-col'"
    >
      <div class="flex w-full items-center justify-between gap-2 px-4 py-4">
        <AppLogo
          :icon-only="false"
          class="h-8 w-auto shrink-0"
        />
        <UButton
          color="neutral"
          icon="i-lucide-panel-right-open"
          :class="[
            'text-(--color-muted) transition-transform duration-200 hover:text-(--color-dark)',
            isSidebarCollapsed ? '-rotate-90' : 'rotate-90'
          ]"
          variant="ghost"
          @click="isSidebarCollapsed = !isSidebarCollapsed"
        />
      </div>

      <div
        v-if="!isSidebarCollapsed"
        class="flex min-h-0 flex-1 flex-col"
      >
        <div class="px-4 pb-4 pt-2">
          <UTabs
            v-model="viewMode"
            :content="false"
            :items="viewItems"
            :ui="{
              list: 'bg-[var(--color-lightgrey)]',
              indicator: 'bg-[var(--color-white)] shadow-sm',
              trigger: 'font-body-normal data-[state=active]:text-default'
            }"
            size="xs"
            variant="pill"
            color="primary"
          />
        </div>

        <div class="min-h-0 flex-1 overflow-y-auto py-2">
          <slot
            name="sidebar"
            :view-mode="viewMode"
          />
        </div>

        <div class="w-full px-4 pb-3 pt-1">
          <SignedIn>
            <div class="flex items-center justify-between gap-x-2">
              <div class="min-w-0 flex-1">
                <OrganizationSwitcher />
              </div>
              <UserButton />
            </div>
          </SignedIn>
          <SignedOut>
            <RedirectToSignIn />
          </SignedOut>
        </div>
      </div>
    </aside>
  </div>
</template>

<script setup lang="ts">
const isSidebarCollapsed = ref(false)

const viewMode = useState<'nodes' | 'trails'>('dashboard:viewMode', () => 'nodes')

const viewItems = [
  { label: 'Nodes', value: 'nodes' },
  { label: 'Trails', value: 'trails' }
]
</script>
