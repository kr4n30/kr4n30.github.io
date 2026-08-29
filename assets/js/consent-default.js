/* consent-default.js — debe cargarse ANTES que cualquier otro script
   Define Consent Mode v2 en denied por defecto. Sin inline script para respetar CSP. */
window.dataLayer = window.dataLayer || [];
function gtag(){ window.dataLayer.push(arguments); }
gtag('consent', 'default', {
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  analytics_storage: 'denied',
  wait_for_update: 500
});
