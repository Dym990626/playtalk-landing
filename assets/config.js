/**
 * PlayTalk landing page configuration
 *
 * To start collecting real submissions:
 * 1. Create a free Formspree form (or any endpoint that accepts JSON POST).
 * 2. Paste the endpoint below, for example:
 *    formEndpoint: "https://formspree.io/f/xxxxxxxx"
 * 3. Deploy the site again.
 *
 * When formEndpoint is empty, the form runs in local demo mode:
 * submissions are stored in the visitor's browser only and are NOT sent to you.
 */
window.PLAY_TALK_CONFIG = {
  formBackend: "netlify",
  formEndpoint: "",
  contactEmail: "hello@playtalk.gg",
  posthogKey: "",
  posthogHost: "https://us.i.posthog.com"
};
