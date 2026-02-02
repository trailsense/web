<template>
  <UDashboardGroup>
    <UDashboardSidebar
      collapsible
      resizable
    >
      <template #header="{ collapsed }">
        <AppLogo
          :icon-only="collapsed"
          class="h-8  w-auto shrink-0"
        />
      </template>
    </UDashboardSidebar>
    <div class="flex-1">
      <UDashboardNavbar
        class="w-full"
        title="Dashboard"
      />
      <slot />
    </div>
  </UDashboardGroup>
</template>
