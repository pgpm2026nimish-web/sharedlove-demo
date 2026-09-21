import { Link } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'

const SECTIONS = [
  {
    heading: 'Overview',
    body: `SharedLove is a student prototype built for an SPJIMR Service Operations Management course project, not a live commercial service. This page explains what happens to information you enter here, written honestly for what the app actually does, not generic boilerplate.`,
  },
  {
    heading: 'What we collect',
    body: `Account details you enter at registration (real name, display name, email, password), listing details you enter when selling (photos, condition questionnaire, price), and activity such as logins, purchases, and any rating or feedback you submit when logging out.`,
  },
  {
    heading: 'Where it is stored',
    body: `Everything lives only in your own browser's local and session storage on the device you're using. There is no real server or database behind this app. Nothing you enter is stored on a company server, sold, or shared with advertisers, because there is no backend to do any of that. Closing your browser's private/incognito window, clearing site data, or switching devices will lose this information; it is not backed up anywhere.`,
  },
  {
    heading: 'AI features',
    body: `If an administrator connects a real AI provider (Google Gemini, OpenAI, Anthropic Claude, OpenRouter, or a local Ollama model) for condition grading, descriptions, or the support chat, the photos and text involved in that specific request are sent directly from your browser to that provider to generate a response. No account is created with that provider on your behalf, and this only happens for the specific action you take (e.g. pressing "Get AI condition grade"). By default, grading uses a simulated engine that runs entirely in your browser and sends nothing anywhere.`,
  },
  {
    heading: 'Payment information',
    body: `Payment and payout details (UPI IDs, card details) are simulated for this prototype. No real payment gateway is used, no real transaction occurs, and card numbers are never stored in full, only a masked last-4-digit reference for display.`,
  },
  {
    heading: 'Cookies and local storage',
    body: `SharedLove uses your browser's local and session storage to keep you logged in, remember your theme and settings, and hold demo data like listings and activity history. It does not use tracking cookies, third-party analytics, or advertising trackers.`,
  },
  {
    heading: 'Your choices',
    body: `You can change or delete your account's password from your Profile page, remove saved payment methods there, and clear all demo activity from your browser at any time by clearing this site's data in your browser settings. There is no way to request data deletion "from a server," because none is kept on one.`,
  },
  {
    heading: 'Changes to this policy',
    body: `Since this is a coursework prototype, this page may change as the project develops. Check back here for the current version.`,
  },
  {
    heading: 'Contact',
    body: `Questions about this prototype can be sent through the Contact Us page.`,
  },
]

export default function PrivacyPolicy() {
  return (
    <div className="p-4 md:p-8 md:max-w-2xl md:mx-auto space-y-6">
      <div className="flex items-center gap-2">
        <ShieldCheck className="text-emerald-600" size={22} />
        <h1 className="text-xl md:text-2xl font-semibold text-neutral-900 dark:text-neutral-50">Privacy Policy</h1>
      </div>

      <p className="text-xs text-neutral-400">Last updated for this prototype build.</p>

      <div className="space-y-5">
        {SECTIONS.map((s) => (
          <div key={s.heading}>
            <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-1.5">{s.heading}</h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">{s.body}</p>
          </div>
        ))}
      </div>

      <Link to="/" className="inline-block text-sm text-emerald-600 dark:text-emerald-400 font-medium underline underline-offset-2">
        Back to home
      </Link>
    </div>
  )
}
