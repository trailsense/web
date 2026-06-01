<script lang="ts" setup>
definePageMeta({
  layout: 'default'
})

useSeoMeta({
  title: 'Privacy Policy | TrailSense',
  description: 'Privacy policy for the TrailSense project.'
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
              Privacy Policy
            </h1>
          </div>

          <div class="space-y-6 font-body-normal text-muted">
            <div>
              <h2 class="font-semibold text-highlighted">
                General Information
              </h2>
              <p>
                Protecting personal data is important to us. This website is operated as part of the TrailSense student project. We only process personal data where necessary to provide the website, manage user accounts, respond to enquiries, and operate the TrailSense platform.
              </p>
            </div>

            <div>
              <h2 class="font-semibold text-highlighted">
                Website Hosting
              </h2>
              <p>
                This website is hosted on servers provided by Hetzner Online GmbH. When visiting the website, technical information such as IP address, browser information, requested pages and access times may be processed automatically to ensure secure and reliable operation.
              </p>
            </div>

            <div>
              <h2 class="font-semibold text-highlighted">
                Contact Forms and Email Enquiries
              </h2>
              <p>
                If you contact us through a form or by email, we process the information you provide, such as your name, email address and message, solely for the purpose of handling your enquiry and communicating with you.
              </p>
              <p>
                The submitted information is forwarded directly to the project team via email and is not used for marketing purposes.
              </p>
            </div>

            <div>
              <h2 class="font-semibold text-highlighted">
                User Accounts and Authentication
              </h2>
              <p>
                TrailSense uses Clerk for user authentication and account management. If you create an account, personal information required for login and account administration may be processed by Clerk.
              </p>
              <p>
                Further information about how Clerk processes personal data can be found in Clerk's own privacy documentation.
              </p>
            </div>

            <div>
              <h2 class="font-semibold text-highlighted">
                Maps and Visualisation
              </h2>
              <p>
                TrailSense uses MapLibre to display maps and geographic information. Depending on the configured map source, requests may be made to external tile providers in order to load map data.
              </p>
            </div>

            <div>
              <h2 class="font-semibold text-highlighted">
                Analytics and Tracking
              </h2>
              <p>
                We do not use Google Analytics, advertising trackers, marketing cookies, or other visitor tracking services on this website.
              </p>
            </div>

            <div>
              <h2 class="font-semibold text-highlighted">
                Technical Logs
              </h2>
              <p>
                Server logs may be created automatically to ensure system security, investigate technical issues, and prevent misuse of the platform. These logs are only accessed when necessary for maintenance or security purposes.
              </p>
            </div>

            <div>
              <h2 class="font-semibold text-highlighted">
                Sensor Data
              </h2>
              <p>
                The TrailSense sensor nodes are designed to collect anonymous visitor statistics. During data collection, WiFi probe requests are processed locally to generate temporary fingerprints used for counting purposes.
              </p>
              <p>
                Raw identifiers are not stored permanently and are not transmitted to the backend. Only aggregated visitor statistics together with location and time information are transferred and visualised within the platform.
              </p>
            </div>

            <div>
              <h2 class="font-semibold text-highlighted">
                Your Rights
              </h2>
              <p>
                Under applicable data protection laws, including the GDPR, you may have the right to request information about your personal data, request correction or deletion of data, restrict processing, or object to certain forms of processing.
              </p>
            </div>

            <div>
              <h2 class="font-semibold text-highlighted">
                Contact
              </h2>
              <p>
                If you have questions regarding this privacy policy or the processing of personal data, please contact us at:
              </p>
              <p>
                servus@trailsense.at
              </p>
            </div>

            <div>
              <h2 class="font-semibold text-highlighted">
                Last Updated
              </h2>
              <p>
                May 2026
              </p>
            </div>
          </div>
        </div>
      </div>
    </UCard>
  </div>
</template>
