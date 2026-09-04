import React from "react";
import { ArrowRight, Clapperboard, Megaphone, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import CineVenueLogo from "../components/CineVenueLogo";

const services = [
  {
    title: "Movie Production",
    description: "Build your film with the right talent and crew.",
    path: "/film-production",
    icon: Clapperboard,
    accent: "text-amber-300",
  },
  {
    title: "Event Management",
    description: "Create, manage, promote and sell tickets for your events.",
    path: "/event-management",
    icon: Sparkles,
    accent: "text-cyan-300",
  },
  {
    title: "Media Promotions",
    description: "Promote movies, events, brands and entertainment content.",
    path: "/media-promotions",
    icon: Megaphone,
    accent: "text-rose-300",
  },
];

export default function Services() {
  return (
    <main className="min-h-screen bg-[#09090A] px-4 pb-24 pt-6 text-white sm:px-6 md:px-12 md:pb-12">
      <div className="mx-auto max-w-6xl">
        <header className="flex items-center justify-between border-b border-white/10 pb-5">
          <Link to="/" aria-label="Go to CineVenue home">
            <CineVenueLogo size="md" />
          </Link>
          <Link className="text-xs uppercase tracking-[0.18em] text-white/60 transition hover:text-gold" to="/">
            Home
          </Link>
        </header>

        <section className="py-16 md:py-24">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-gold">CineVenue ecosystem</p>
          <h1 className="font-display text-4xl font-light italic sm:text-6xl">
            CineVenue <span className="not-italic text-gold">Services</span>
          </h1>
          <p className="mt-5 max-w-xl text-sm leading-7 text-white/60">Create. Manage. Promote. Grow.</p>
        </section>

        <section className="grid gap-5 md:grid-cols-3" aria-label="CineVenue services">
          {services.map(({ title, description, path, icon: Icon, accent }) => (
            <article key={path} className="flex min-h-72 flex-col justify-between border border-white/10 bg-white/[0.03] p-6 transition hover:border-gold/50">
              <div>
                <Icon className={`mb-6 h-9 w-9 ${accent}`} aria-hidden="true" />
                <h2 className="font-display text-2xl text-white">{title}</h2>
                <p className="mt-3 text-sm leading-6 text-white/60">{description}</p>
              </div>
              <Link to={path} className="mt-8 inline-flex min-h-12 items-center justify-between border border-gold/40 px-4 text-xs font-bold uppercase tracking-[0.16em] text-gold transition hover:bg-gold hover:text-black">
                Explore service
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
