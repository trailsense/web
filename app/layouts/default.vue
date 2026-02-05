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

      <div class="py-2">
        <slot name="sidebar" />
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

      <slot />
    </div>
  </UDashboardGroup>
</template>
