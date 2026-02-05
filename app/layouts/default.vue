<script lang="ts" setup>
import { mockNodes } from '~/data/mockNodes'
</script>

<template>
  <UDashboardGroup>
    <UDashboardSidebar
      :min-size="14"
      collapsible
      resizable
    >
      <template #header="{ collapsed }">
        <AppLogo
          :icon-only="collapsed"
          class="h-8 w-auto shrink-0"
        />
      </template>

      <NodeSidebarList :nodes="mockNodes" />

      <template #footer="{ collapsed }">
        <div class="w-full">
          <SignedIn>
            <div
              :class="{ 'gap-x-2 justify-between': !collapsed, 'justify-center': collapsed }"
              class="flex items-center"
            >
              <OrganizationSwitcher
                v-if="!collapsed"
                class="min-w-0 flex-1"
              />
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
        class="w-full"
        title="Dashboard"
        :toggle="false"
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
      <slot />
    </div>
  </UDashboardGroup>
</template>
