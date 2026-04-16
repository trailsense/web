<template>
  <div
    class="relative h-screen w-full overflow-hidden [--layout-gap:1rem] [--sidebar-width:min(22rem,calc(100%-1.5rem))] [--bottom-card-height:8rem]"
  >
    <div class="h-full w-full">
      <slot :view-mode="viewMode" />
    </div>

    <aside
      :class="isSidebarCollapsed ? 'w-[var(--sidebar-width)] flex-col' : 'bottom-4 h-auto w-[var(--sidebar-width)] flex-col'"
      class="absolute left-4 top-4 z-40 flex overflow-hidden rounded-3xl border border-default bg-default shadow-sm backdrop-blur transition-all duration-300 ease-in-out"
      data-map-overlay="sidebar"
    >
      <div class="flex w-full items-center justify-between gap-2 px-4 py-4">
        <AppLogo
          :icon-only="false"
          class="h-8 w-auto shrink-0"
        />
        <UButton
          :class="[
            'text-muted transition-transform duration-200 hover:text-highlighted',
            isSidebarCollapsed ? '-rotate-90' : 'rotate-90'
          ]"
          color="neutral"
          icon="i-lucide-panel-right-open"
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
              list: 'bg-muted',
              indicator: 'bg-elevated shadow-sm',
              trigger: 'font-body-normal text-muted data-[state=active]:text-highlighted'
            }"
            color="primary"
            size="xs"
            variant="pill"
          />
        </div>

        <div class="min-h-0 flex-1 overflow-y-auto py-2">
          <slot
            :view-mode="viewMode"
            name="sidebar"
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

    <div
      class="pointer-events-none absolute left-[var(--layout-gap)] right-[var(--layout-gap)] z-[46]"
      :class="!isSidebarCollapsed ? 'lg:left-[calc(var(--layout-gap)+var(--sidebar-width)+var(--layout-gap))]' : ''"
      style="bottom: calc(var(--layout-gap) + var(--bottom-card-height) + 0.5rem);"
    >
      <div class="pointer-events-auto">
        <slot name="bottom-card-controls" />
      </div>
    </div>

    <FloatingBottomCard :sidebar-collapsed="isSidebarCollapsed">
      <slot
        :view-mode="viewMode"
        name="bottom-card"
      >
        <div class="w-full">
          <p class="font-h3 text-highlighted">
            Bottom Card
          </p>
          <p class="mt-1 font-body-small text-muted">
            This floating card is ready. Provide the bottom-card slot to customize its content.
          </p>
        </div>
      </slot>
    </FloatingBottomCard>
  </div>
</template>

<script lang="ts" setup>
const isSidebarCollapsed = ref(false)

const viewMode = useState<'nodes' | 'trails'>('dashboard:viewMode', () => 'nodes')

const viewItems = [
  { label: 'Nodes', value: 'nodes' },
  { label: 'Trails', value: 'trails' }
]
</script>
