<template>
  <div
    class="relative h-screen w-full overflow-hidden [--layout-gap:1rem] [--sidebar-width:min(22rem,calc(100%-1.5rem))]"
  >
    <div class="h-full w-full">
      <slot :view-mode="viewMode" />
    </div>

    <aside
      :class="[
        isSidebarCollapsed
          ? 'top-4 w-[calc(100%-var(--layout-gap)*2)] sm:w-(--sidebar-width) flex-col'
          : 'top-4 h-(--mobile-sidebar-height) w-[calc(100%-var(--layout-gap)*2)] sm:w-(--sidebar-width) flex-col lg:bottom-(--layout-gap) lg:h-auto'
      ]"
      :style="sidebarStyle"
      class="absolute left-(--layout-gap) right-(--layout-gap) sm:left-4 sm:right-auto z-40 flex overflow-hidden rounded-3xl border border-default bg-default shadow-sm backdrop-blur"
      data-map-overlay="sidebar"
    >
      <div class="flex w-full items-center justify-between gap-2 px-3 py-2 lg:px-4 lg:py-4">
        <AppLogo
          :icon-only="false"
          class="h-7 w-auto shrink-0 lg:h-8"
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
        <div class="px-3 pt-1 lg:px-4 lg:pt-2">
          <UButton
            v-if="isLegalPage"
            block
            color="neutral"
            icon="i-lucide-arrow-left"
            variant="soft"
            to="/"
          >
            Back to map
          </UButton>
          <UTabs
            v-else
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

        <div class="min-h-0 flex-1 overflow-y-auto py-1 lg:py-2">
          <slot
            :view-mode="viewMode"
            name="sidebar"
          />
        </div>

        <div class="hidden w-full px-4 pb-3 pt-1 lg:block">
          <SignedIn>
            <div class="flex items-center justify-between gap-x-2">
              <div class="min-w-0 flex-1">
                <OrganizationSwitcher />
              </div>
              <UserButton>
                <UserButton.MenuItems>
                  <UserButton.Link
                    href="/imprint"
                    label="Imprint"
                  >
                    <template #labelIcon>
                      <UIcon name="i-lucide-file-text" />
                    </template>
                  </UserButton.Link>
                  <UserButton.Link
                    href="/privacy-policy"
                    label="Privacy Policy"
                  >
                    <template #labelIcon>
                      <UIcon name="i-lucide-shield-check" />
                    </template>
                  </UserButton.Link>
                </UserButton.MenuItems>
              </UserButton>
            </div>
          </SignedIn>
          <SignedOut>
            <RedirectToSignIn />
          </SignedOut>
        </div>

        <div
          v-if="isMobileSidebarFullscreen"
          class="w-full px-3 pb-2 pt-1 lg:hidden"
        >
          <SignedIn>
            <div class="flex items-center justify-between gap-x-2">
              <div class="min-w-0 flex-1">
                <OrganizationSwitcher />
              </div>
              <UserButton>
                <UserButton.MenuItems>
                  <UserButton.Link
                    href="/imprint"
                    label="Imprint"
                  >
                    <template #labelIcon>
                      <UIcon name="i-lucide-file-text" />
                    </template>
                  </UserButton.Link>
                  <UserButton.Link
                    href="/privacy-policy"
                    label="Privacy Policy"
                  >
                    <template #labelIcon>
                      <UIcon name="i-lucide-shield-check" />
                    </template>
                  </UserButton.Link>
                </UserButton.MenuItems>
              </UserButton>
            </div>
          </SignedIn>
          <SignedOut>
            <RedirectToSignIn />
          </SignedOut>
        </div>

        <button
          v-if="!isSidebarCollapsed"
          :aria-label="mobileSidebarFullscreenLabel"
          class="mx-auto mb-1 mt-auto flex h-7 w-7 items-center justify-center rounded-full border border-default bg-elevated text-muted shadow-sm transition-colors duration-200 hover:text-highlighted lg:hidden"
          type="button"
          @click="toggleMobileSidebarFullscreen"
        >
          <UIcon
            :name="isMobileSidebarFullscreen ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
            class="h-3.5 w-3.5"
          />
          <span class="sr-only">{{ mobileSidebarFullscreenLabel }}</span>
        </button>
      </div>
    </aside>

    <div
      v-if="!isLegalPage"
      ref="bottomCardContainer"
      class="absolute bottom-(--layout-gap) left-(--layout-gap) right-(--layout-gap) z-46"
      :class="!isSidebarCollapsed ? 'lg:left-[calc(var(--layout-gap)+var(--sidebar-width)+var(--layout-gap))]' : ''"
    >
      <div class="relative">
        <div class="pointer-events-none absolute bottom-full right-0 mb-2">
          <div class="pointer-events-auto">
            <slot name="bottom-card-controls" />
          </div>
        </div>

        <FloatingBottomCard>
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
    </div>
  </div>
</template>

<script lang="ts" setup>
import { UserButton } from '@clerk/nuxt/components'

const route = useRoute()
const isSidebarCollapsed = ref(false)
const isLegalPage = computed(() => ['/imprint', '/privacy-policy'].includes(route.path))
const mobileSidebarHeight = ref(0)
const isMobileSidebarFullscreen = ref(false)
const bottomCardContainer = ref<HTMLElement | null>(null)

const mobileSidebarFullscreenLabel = computed(() =>
  isMobileSidebarFullscreen.value ? 'Restore sidebar height' : 'Expand sidebar to fullscreen'
)

const viewMode = useState<'nodes' | 'trails'>('dashboard:viewMode', () => 'nodes')

const viewItems = [
  { label: 'Nodes', value: 'nodes' },
  { label: 'Trails', value: 'trails' }
]

const sidebarStyle = computed(() => {
  if (isSidebarCollapsed.value) {
    return undefined
  }

  return {
    '--mobile-sidebar-height': `${mobileSidebarHeight.value}px`
  }
})

const setMobileSidebarHeight = (height: number) => {
  const viewportHeight = window.innerHeight
  const minHeight = 180
  const sidebarTop = 16
  const bottomCardTop = bottomCardContainer.value?.getBoundingClientRect().top ?? viewportHeight - 32
  const maxHeight = Math.max(minHeight, bottomCardTop - sidebarTop - 16)

  mobileSidebarHeight.value = Math.min(Math.max(height, minHeight), maxHeight)
}

const updateMobileSidebarHeight = () => {
  if (isMobileSidebarFullscreen.value) {
    setMobileSidebarHeight(Number.POSITIVE_INFINITY)
    return
  }

  setMobileSidebarHeight(window.innerHeight / 3)
}

const toggleMobileSidebarFullscreen = () => {
  isMobileSidebarFullscreen.value = !isMobileSidebarFullscreen.value
  updateMobileSidebarHeight()
}

onMounted(() => {
  updateMobileSidebarHeight()

  window.addEventListener('resize', updateMobileSidebarHeight)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateMobileSidebarHeight)
})
</script>
