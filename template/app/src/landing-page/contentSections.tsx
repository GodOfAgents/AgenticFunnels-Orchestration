import daBoiAvatar from "../client/static/da-boi.webp";
import kivo from "../client/static/examples/kivo.webp";
import messync from "../client/static/examples/messync.webp";
import microinfluencerClub from "../client/static/examples/microinfluencers.webp";
import promptpanda from "../client/static/examples/promptpanda.webp";
import reviewradar from "../client/static/examples/reviewradar.webp";
import scribeist from "../client/static/examples/scribeist.webp";
import searchcraft from "../client/static/examples/searchcraft.webp";
import { BlogUrl, DocsUrl } from "../shared/common";
import type { GridFeature } from "./components/FeaturesGrid";

export const features: GridFeature[] = [
  {
    name: "End-to-End Voice AI",
    description: "Single model handles STT, LLM, and TTS. No pipeline complexity, 211ms latency.",
    emoji: "🎙️",
    href: DocsUrl,
    size: "large",
  },
  {
    name: "17 Voice Personas",
    description: "Professional, friendly, casual voices. Match your brand identity perfectly.",
    emoji: "🎭",
    href: DocsUrl,
    size: "small",
  },
  {
    name: "Multi-Language",
    description: "19 input languages with auto-detection. Serve global customers effortlessly.",
    emoji: "🌍",
    href: DocsUrl,
    size: "small",
  },
  {
    name: "Visual Workflow Builder",
    description: "Drag-and-drop automation. Lead qualification, scheduling, support - all no-code.",
    emoji: "🔧",
    href: DocsUrl,
    size: "medium",
  },
  {
    name: "Calendar Integration",
    description: "Google Calendar & Calendly. Auto-schedule meetings, send reminders automatically.",
    emoji: "📅",
    href: DocsUrl,
    size: "small",
  },
  {
    name: "CRM Sync",
    description: "Webhook-based integration. Auto-update Salesforce, HubSpot, and more.",
    emoji: "🔄",
    href: DocsUrl,
    size: "small",
  },
  {
    name: "Emotion Detection",
    description: "Understand tone and urgency from voice. Respond with appropriate empathy.",
    emoji: "😊",
    href: DocsUrl,
    size: "medium",
  },
  {
    name: "Video Support",
    description: "Screen sharing during calls. Visual troubleshooting and product demos.",
    emoji: "🎥",
    href: DocsUrl,
    size: "small",
  },
  {
    name: "Knowledge Base (RAG)",
    description: "Upload documents, auto-train agents. Accurate, context-aware responses.",
    emoji: "📚",
    href: DocsUrl,
    size: "small",
  },
  {
    name: "Real-Time Analytics",
    description: "Monitor live calls, track performance, measure ROI instantly.",
    emoji: "📊",
    href: DocsUrl,
    size: "medium",
  },
  {
    name: "85% Cost Savings",
    description: "Self-hosted option. No per-minute charges. Scale without breaking the bank.",
    emoji: "💰",
    href: DocsUrl,
    size: "small",
  },
  {
    name: "Open Source",
    description: "Apache 2.0 license. Full transparency, community-driven, no vendor lock-in.",
    emoji: "⭐",
    href: DocsUrl,
    size: "small",
  },
];

export const testimonials = [
  {
    name: "Da Boi",
    role: "Wasp Mascot",
    avatarSrc: daBoiAvatar,
    socialUrl: "https://twitter.com/wasplang",
    quote: "I don't even know how to code. I'm just a plushie.",
  },
  {
    name: "Mr. Foobar",
    role: "Founder @ Cool Startup",
    avatarSrc: daBoiAvatar,
    socialUrl: "",
    quote: "This product makes me cooler than I already am.",
  },
  {
    name: "Jamie",
    role: "Happy Customer",
    avatarSrc: daBoiAvatar,
    socialUrl: "#",
    quote: "My cats love it!",
  },
];

export const faqs = [
  {
    id: 1,
    question: "Whats the meaning of life?",
    answer: "42.",
    href: "https://en.wikipedia.org/wiki/42_(number)",
  },
];

export const footerNavigation = {
  app: [
    { name: "Documentation", href: DocsUrl },
    { name: "Blog", href: BlogUrl },
  ],
  company: [
    { name: "About", href: "https://wasp.sh" },
    { name: "Privacy", href: "#" },
    { name: "Terms of Service", href: "#" },
  ],
};

export const examples = [
  {
    name: "Example #1",
    description: "Describe your example here.",
    imageSrc: kivo,
    href: "#",
  },
  {
    name: "Example #2",
    description: "Describe your example here.",
    imageSrc: messync,
    href: "#",
  },
  {
    name: "Example #3",
    description: "Describe your example here.",
    imageSrc: microinfluencerClub,
    href: "#",
  },
  {
    name: "Example #4",
    description: "Describe your example here.",
    imageSrc: promptpanda,
    href: "#",
  },
  {
    name: "Example #5",
    description: "Describe your example here.",
    imageSrc: reviewradar,
    href: "#",
  },
  {
    name: "Example #6",
    description: "Describe your example here.",
    imageSrc: scribeist,
    href: "#",
  },
  {
    name: "Example #7",
    description: "Describe your example here.",
    imageSrc: searchcraft,
    href: "#",
  },
];
