<script lang="ts" setup>
definePageMeta({
  layout: 'default'
})

useSeoMeta({
  title: 'Imprint | TrailSense',
  description: 'Legal information and contact details for the TrailSense project.'
})
</script>

<template>
  <div class="absolute bottom-4 right-4 top-4 left-4 overflow-y-auto overscroll-contain lg:left-[calc(var(--layout-gap)+var(--sidebar-width)+var(--layout-gap))]">
    <UCard class="min-h-full w-full">
      <div class="px-6 py-6 sm:px-8">
        <div class="space-y-6">
          <div>
            <p class="font-body-small uppercase tracking-[0.2em] text-muted">
              Legal
            </p>
            <h1 class="mt-2 font-h1 text-highlighted">
              Imprint
            </h1>
          </div>
          <div class="space-y-6 font-body-normal text-muted">
            <div>
              <h2 class="font-semibold text-highlighted">
                Project Information
              </h2>
              <p>
                TrailSense is a non-commercial student project developed as part of the MultiMedia Technology programme at Salzburg University of Applied Sciences (FH Salzburg).
              </p>
            </div>

            <div>
              <h2 class="font-semibold text-highlighted">
                Project Team
              </h2>

              <p>
                Lea Etzlinger<br>
                Frontend Development, UI/UX Design and Project Management
              </p>

              <p>
                Felix Beer<br>
                Backend Development, Data Processing and Infrastructure
              </p>

              <p>
                Francesco Lanthaler<br>
                Hardware Development, Firmware and Sensor Deployment
              </p>
            </div>

            <div>
              <h2 class="font-semibold text-highlighted">
                Contact
              </h2>

              <p>
                Email: contact@trailsense-project.com
              </p>

              <p>
                For questions regarding the project, pilot deployments or research activities, please contact the project team via email.
              </p>
            </div>

            <div>
              <h2 class="font-semibold text-highlighted">
                Project Purpose
              </h2>

              <p>
                TrailSense explores privacy-friendly methods for measuring visitor flows on hiking trails and outdoor recreation areas. The project combines low-cost sensor hardware with a web-based analytics platform to support tourism organizations, municipalities and trail managers in understanding trail usage patterns.
              </p>
            </div>

            <div>
              <h2 class="font-semibold text-highlighted">
                Liability for Content
              </h2>

              <p>
                The contents of this website were created with great care. However, we cannot guarantee the accuracy, completeness or timeliness of the information provided.
              </p>
            </div>

            <div>
              <h2 class="font-semibold text-highlighted">
                Copyright
              </h2>

              <p>
                Unless otherwise stated, all content on this website is created by the TrailSense project team. Any reproduction or distribution requires prior permission from the respective authors.
              </p>
            </div>

            <div>
              <h2 class="font-semibold text-highlighted">
                Status
              </h2>

              <p>
                TrailSense is currently a research and prototype project. The website and associated software are provided for demonstration, evaluation and educational purposes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </UCard>
  </div>
</template>
