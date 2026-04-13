<template>
  <UDashboardGroup>
    <UDashboardSidebar
      :max-size="32"
      :min-size="24"
      resizable
    >
      <template #header="{ collapsed }">
        <AppLogo
          :icon-only="collapsed"
          class="h-8 w-auto shrink-0"
        />
      </template>

      <div class="px-3 pt-3">
        <UTabs
          v-model="viewMode"
          :content="false"
          :items="viewItems"
          size="xs"
          variant="pill"
          color="primary"
        />
      </div>

      <div class="py-2">
        <slot
          name="sidebar"
          :view-mode="viewMode"
        />
      </div>

      <template #footer="{ collapsed }">
        <div class="w-full">
          <SignedIn>
            <div
              :class="{ 'gap-x-2 justify-between': !collapsed, 'justify-center': collapsed }"
              class="flex items-center"
            >
              <div
                v-if="!collapsed"
                class="min-w-0 flex-1"
              >
                <OrganizationSwitcher />
              </div>
              <UserButton />
            </div>
          </SignedIn>
          <SignedOut>
            <RedirectToSignIn />
          </SignedOut>
        </div>
      </template>
    </UDashboardSidebar>

    <div class="flex-1">
      <UDashboardNavbar
        :toggle="false"
        class="w-full"
        title="Dashboard"
      >
        <template #leading>
          <UDashboardSidebarToggle
            color="neutral"
            variant="ghost"
          />
          <UDashboardSidebarCollapse
            color="neutral"
            variant="ghost"
          />
        </template>
      </UDashboardNavbar>

      <slot :view-mode="viewMode" />
    </div>
  </UDashboardGroup>
</template>

<script setup lang="ts">
const viewMode = useState<'nodes' | 'trails'>('dashboard:viewMode', () => 'nodes')

const viewItems = [
  { label: 'Nodes', value: 'nodes' },
  { label: 'Trails', value: 'trails' }
]
</script>
