import {
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  CircleCheckBig,
  HandCoins,
  MapPinned,
  ShieldCheck,
  Users,
  Van,
} from "lucide-react";
import Link from "next/link";

import { JoinApplicationForm } from "@/src/components/join/JoinApplicationForm";

type BusinessCard = {
  title: string;
  body: string;
  bullets?: readonly string[];
  note?: string;
  footer?: string;
  icon: typeof Building2;
};

const BUSINESS_CARDS: readonly BusinessCard[] = [
  {
    title: "Your own professional online presence",
    body: "Get a clean, customer-ready courier page that makes your business look established, trustworthy, and easy to contact.",
    bullets: [
      "your own page or subdomain",
      "a quote-first layout built for real enquiries",
      "your own contact details, service area, and van photo",
      "a clear, professional courier presence online",
    ],
    icon: Building2,
  },
  {
    title: "Show your business properly",
    body: "The same layout is used across the wider system, but your page presents your own business identity clearly so customers feel they are dealing with a real independent courier service.",
    bullets: [
      "your business name shown clearly",
      "your own van photo and service area",
      "clear services and straightforward wording",
      "a page that feels professional and believable",
    ],
    note: "It is built to help customers trust what they are seeing and feel confident about getting in touch or requesting a quote.",
    footer: "The goal is simple: present your business well and help you win more direct jobs.",
    icon: MapPinned,
  },
  {
    title: "Win more direct jobs",
    body: "A professional online presence helps customers find you, request an instant quote, and contact you directly about the work they need done.",
    icon: HandCoins,
  },
  {
    title: "Maintained for you",
    body: "Your page uses a proven layout and is maintained for you, so you can focus on running your courier business rather than managing a website yourself.",
    footer: "You stay independent while your online presence stays tidy, current, and ready for enquiries.",
    icon: Users,
  },
];

const WHAT_YOU_GET = [
  "your own professional courier page",
  "a clear quote-first website for customer enquiries",
  "your own business identity shown properly",
  "a stronger professional online presence",
  "a better route to more direct jobs",
] as const;

const SETUP_STEPS = [
  "Apply with your details and a few basics about your courier business",
  "I review the application and come back to you to discuss the right setup",
  "Your page is prepared with your business identity, service area, and vehicle details",
  "Once ready, you have a professional courier presence online that is maintained for you",
] as const;

const WHAT_YOU_CONTROL = [
  "your business name and identity",
  "the jobs you take on",
  "the area you want your page to represent",
  "how your courier business is presented to customers",
] as const;

const WHAT_WE_ASK = [
  "Professional attitude and reliability",
  "Appropriate insurance (Goods in Transit + Public Liability)",
  "A clear photo of your van (customers love this)",
  "Basic business details and service area",
] as const;

const PRICING_POINTS = [
  "If your application looks like a good fit, I will talk you through the setup clearly",
  "What is included is discussed after application, in plain English",
  "The aim is a professional online presence that suits your business properly",
] as const;

const FAQS = [
  {
    question: "Can I do this as a self-employed courier?",
    answer:
      "Yes. It is designed for independent couriers who want a stronger professional online presence and more direct jobs.",
  },
  {
    question: "Do I have to work fixed hours?",
    answer: "No. You stay independent and continue running your business in the way that suits you.",
  },
  {
    question: "Can I keep using other sources of work?",
    answer:
      "Yes. The idea is to help you build more direct work alongside the rest of your business.",
  },
  {
    question: "Will the page show my own business identity?",
    answer:
      "Yes. Your page is set up to show your own business name, service area, contact details, and vehicle information clearly.",
  },
  {
    question: "How is setup handled?",
    answer:
      "After you apply, I will talk you through the next steps and what is included, so everything stays clear and straightforward.",
  },
] as const;

export default function JoinPage() {
  return (
    <main className="mx-auto w-full max-w-6xl space-y-12 px-4 py-10 sm:space-y-16 sm:px-6 sm:py-14 lg:px-8">
      <section className="content-panel rounded-2xl border border-[var(--border-subtle)] p-6 sm:p-10">
        <p className="eyebrow-label">Join us</p>
        <h1 className="page-title mt-3">
          Get your own professional online presence.
        </h1>
        <p className="body-copy-lg mt-4 max-w-prose">
          Get a courier page that presents your business properly, helps you win more direct jobs,
          and keeps you independent. The aim is simple: make your business look professional online
          and help customers feel confident about contacting you.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Link
            href="#application"
            className="gradient-button inline-flex rounded-xl px-5 py-2.5 font-semibold"
          >
            Apply to join
          </Link>
          <Link
            href="#setup"
            className="secondary-button inline-flex rounded-xl px-5 py-2.5 font-semibold"
          >
            See how it works
          </Link>
        </div>
        <p className="support-copy mt-4">
          Show your business properly, stay independent, and build more direct work.
        </p>
        <p className="support-copy mt-2">
          Your page uses the same strong layout, but it is tailored to your business identity.
        </p>
      </section>

      <section className="content-panel rounded-2xl border border-[var(--border-subtle)] p-6 sm:p-8">
        <h2 className="section-title">What you get</h2>
        <ul className="body-copy mt-4 space-y-2">
          {WHAT_YOU_GET.map((line) => (
            <li key={line} className="flex items-start gap-2">
              <CheckCircle2 className="mt-1 h-4 w-4 text-[var(--accent-soft)]" />
              <span>{line}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="section-title">
          Why join
        </h2>
        <p className="body-copy max-w-prose">
          A good courier website should do more than simply exist.
          <br />
          It should give your business a professional online presence, make customers trust what
          they see, and make it easier for them to request a quote or get in touch.
          <br />
          This is built for independent couriers who want their business presented clearly and
          professionally online.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="section-title">Get more than just a listing</h2>
        <p className="body-copy max-w-prose">
          This is not about dropping your name onto a generic page.
          <br />
          It is about giving you a proper courier presence online that reflects your business in a
          clear and customer-friendly way.
        </p>
        <ul className="body-copy space-y-2">
          <li className="flex items-start gap-2">
            <CircleCheckBig className="mt-0.5 h-4 w-4 text-[var(--accent-soft)]" />
            <span>your own page or subdomain</span>
          </li>
          <li className="flex items-start gap-2">
            <CircleCheckBig className="mt-0.5 h-4 w-4 text-[var(--accent-soft)]" />
            <span>your own business identity shown properly</span>
          </li>
          <li className="flex items-start gap-2">
            <CircleCheckBig className="mt-0.5 h-4 w-4 text-[var(--accent-soft)]" />
            <span>a page maintained for you so it stays professional</span>
          </li>
        </ul>
      </section>

      <section className="space-y-5">
        <h2 className="section-title">
          What you get
        </h2>
        <div className="grid gap-5 md:grid-cols-2">
          {BUSINESS_CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <article key={card.title} className="content-card rounded-2xl border border-[var(--border-subtle)] p-5 sm:p-6">
                <div className="inline-flex rounded-xl border border-[var(--border-subtle)] bg-[var(--chip-bg)] p-2 text-[var(--accent-soft)]">
                  <Icon className="h-4 w-4" />
                </div>
                <h3 className="card-title mt-3">{card.title}</h3>
                <p className="body-copy mt-2">{card.body}</p>
                {card.bullets ? (
                  <ul className="body-copy mt-3 space-y-2">
                    {card.bullets.map((line) => (
                      <li key={line} className="flex items-start gap-2">
                        <CircleCheckBig className="mt-0.5 h-4 w-4 text-[var(--accent-soft)]" />
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
                {"note" in card && card.note ? (
                  <p className="body-copy mt-3">{card.note}</p>
                ) : null}
                {card.footer ? (
                  <p className="body-copy mt-3">{card.footer}</p>
                ) : null}
              </article>
            );
          })}
        </div>
      </section>

      <section id="setup" className="space-y-4">
        <h2 className="section-title">
          Application and setup
        </h2>
        <ol className="space-y-3">
          {SETUP_STEPS.map((step, index) => (
            <li
              key={step}
              className="content-card flex items-start gap-3 rounded-2xl border border-[var(--border-subtle)] p-4 text-[var(--text-muted)]"
            >
              <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[var(--border-subtle)] bg-[var(--chip-bg)] text-xs font-semibold text-[var(--accent-soft)]">
                {index + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
        <p className="body-copy">
          Setup is discussed after application so it is clear, straightforward, and suited to your
          business.
        </p>
        <p className="body-copy">
          The goal is to give you a professional online presence that feels right for your business
          and helps you attract direct jobs.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="section-title">Stay independent</h2>
        <p className="body-copy">This is built to support your business, not take it over.</p>
        <ul className="body-copy space-y-2">
          {WHAT_YOU_CONTROL.map((line) => (
            <li key={line} className="flex items-start gap-2">
              <ShieldCheck className="mt-0.5 h-4 w-4 text-[var(--accent-soft)]" />
              <span>{line}</span>
            </li>
          ))}
        </ul>
        <p className="body-copy">
          You remain the face of your business while your online presence works harder for you.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="section-title">
          What we ask from couriers
        </h2>
        <p className="body-copy">
          To keep standards high and trust strong:
        </p>
        <ul className="body-copy space-y-2">
          {WHAT_WE_ASK.map((line) => (
            <li key={line} className="flex items-start gap-2">
              <BriefcaseBusiness className="mt-0.5 h-4 w-4 text-[var(--accent-soft)]" />
              <span>{line}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="section-title">Keep it simple</h2>
        <p className="body-copy">The details are discussed clearly after application:</p>
        <ul className="body-copy space-y-2">
          {PRICING_POINTS.map((line) => (
            <li key={line} className="flex items-start gap-2">
              <CircleCheckBig className="mt-0.5 h-4 w-4 text-[var(--accent-soft)]" />
              <span>{line}</span>
            </li>
          ))}
        </ul>
        <p className="body-copy">
          There is no need to overcomplicate it here. If your application is a good fit, the next
          step is a straightforward conversation about what you need.
        </p>
      </section>

      <section id="application" className="space-y-4">
        <div className="space-y-2">
          <h2 className="section-title">
            Apply to get started
          </h2>
        </div>
        <JoinApplicationForm />
      </section>

      <section className="space-y-5 pb-4">
        <h2 className="section-title">FAQ</h2>
        <div className="space-y-4">
          {FAQS.map((faq) => (
            <article key={faq.question} className="content-card rounded-2xl border border-[var(--border-subtle)] p-5 sm:p-6">
              <h3 className="flex items-center gap-2 text-lg font-semibold">
                <Van className="h-4 w-4 text-[var(--accent-soft)]" />
                {faq.question}
              </h3>
              <p className="body-copy mt-3">{faq.answer}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
