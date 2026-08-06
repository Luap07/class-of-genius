import React from "react";
import Cog from "../../assets/cog.png";
import LanguageHero from "../../components/languages/Hero/LanguageHero";
import HeroSearch from "../../components/languages/Hero/HeroSearch";
import HeroStats from "../../components/languages/Hero/HeroStats";
import LanguageExplore from "./LanguageExplore";
import WordOfTheDay from "./WordOfTheDay";
import Dictionary from "./Dictionary";
import Vocabulary from "./Vocabulary";
import Phrasebook from "./Phrasebook";
import Flashcards from "./Flashcards";
import LanguageChallenges from "./LanguageChallenges";
import LanguageGames from "./LanguageGames";
import Reading from "./Reading";
import Writing from "./Writing";
import Pronunciation from "./Pronunciation";

export default function LanguagesHome() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#020617] text-white">
      {/* =========================
          BACKGROUND EFFECTS
      ========================= */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        {/* Cyan Glow */}
        <div className="absolute -left-40 top-40 h-[500px] w-[500px] rounded-full bg-cyan-500/20 blur-[150px]" />

        {/* Purple Glow */}
        <div className="absolute right-[-150px] top-20 h-[500px] w-[500px] rounded-full bg-purple-500/20 blur-[150px]" />

        {/* Blue Bottom Glow */}
        <div className="absolute bottom-0 left-1/3 h-[450px] w-[450px] rounded-full bg-blue-500/10 blur-[140px]" />

        {/* Dotted Background */}
        <div className="absolute inset-0 opacity-[0.08] bg-[radial-gradient(circle,_white_1px,transparent_1px)] [background-size:32px_32px]" />
      </div>

      {/* =========================
          HEADER
      ========================= */}
      <header className="fixed left-0 right-0 top-0 z-50 border-b border-white/10 bg-[#020617]/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <img src={Cog} alt="Scholiqen" className="h-10 w-10" />
            <span className="text-2xl font-black">Scholiqen</span>
          </div>

          <nav className="hidden gap-8 md:flex">
            <a href="/dashboard" className="text-slate-300 transition hover:text-cyan-400">
              Dashboard
            </a>
            <a href="/languages" className="font-bold text-cyan-400">
              Languages
            </a>
          </nav>
        </div>
      </header>

      {/* =========================
          PAGE CONTENT
      ========================= */}
      <div className="pt-24">
        {/* Learning Hero */}
        <section className="mx-auto max-w-7xl px-6 pt-8">
          <LanguageHero />
        </section>

        {/* Language Sections */}
        <div className="mx-auto max-w-7xl space-y-24 px-6 py-20">
          <HeroSearch />
          <HeroStats />
          <LanguageExplore />
          <WordOfTheDay />
          <Dictionary />
          <Vocabulary />
          <Phrasebook />
          <Flashcards />
          {/* <Pronunciation /> */}
          {/* <LanguageChallenges /> */}
          {/* <LanguageGames /> */}
        </div>
      </div>

{/* =========================
    PREMIUM FOOTER
========================= */}

<footer className="relative overflow-hidden border-t border-white/10 bg-gradient-to-b from-slate-950 via-[#030712] to-black">

  {/* Background Glow */}
  <div className="absolute inset-0">
    <div className="absolute -left-32 top-0 h-72 w-72 rounded-full bg-cyan-500/10 blur-[120px]" />
    <div className="absolute -right-32 bottom-0 h-72 w-72 rounded-full bg-purple-500/10 blur-[120px]" />
  </div>

  <div className="relative mx-auto max-w-7xl px-6 py-16">

    {/* Top */}
    <div className="grid gap-12 lg:grid-cols-4">

      {/* Brand */}
      <div>

        <div className="flex items-center gap-4">

          <div className="rounded-2xl border border-cyan-400/20 bg-cyan-500/10 p-3 backdrop-blur-xl">
            <img
              src={Cog}
              alt="Scholiqen"
              className="h-10 w-10"
            />
          </div>

          <div>

            <h2 className="text-2xl font-black tracking-wide">
              Scholiqen
            </h2>

            <p className="text-sm text-cyan-300">
              Learn • Build • Achieve
            </p>

          </div>

        </div>

        <p className="mt-6 leading-8 text-slate-400">
          An intelligent learning platform designed to help students,
          professionals and lifelong learners master languages,
          technology and real-world skills through interactive AI
          learning experiences.
        </p>

      </div>

      {/* Platform */}
      <div>

        <h3 className="mb-6 text-lg font-black">
          Platform
        </h3>

        <ul className="space-y-4 text-slate-400">

          <li className="transition hover:text-cyan-300 cursor-pointer">
            Courses
          </li>

          <li className="transition hover:text-cyan-300 cursor-pointer">
            Phrasebook
          </li>

          <li className="transition hover:text-cyan-300 cursor-pointer">
            Flashcards
          </li>

          <li className="transition hover:text-cyan-300 cursor-pointer">
            Language Challenges
          </li>

          <li className="transition hover:text-cyan-300 cursor-pointer">
            AI Tutor
          </li>

        </ul>

      </div>

      {/* Resources */}
      <div>

        <h3 className="mb-6 text-lg font-black">
          Resources
        </h3>

        <ul className="space-y-4 text-slate-400">

          <li className="transition hover:text-cyan-300 cursor-pointer">
            Help Center
          </li>

          <li className="transition hover:text-cyan-300 cursor-pointer">
            Community
          </li>

          <li className="transition hover:text-cyan-300 cursor-pointer">
            Documentation
          </li>

          <li className="transition hover:text-cyan-300 cursor-pointer">
            Blog
          </li>

          <li className="transition hover:text-cyan-300 cursor-pointer">
            Contact
          </li>

        </ul>

      </div>

      {/* Stats */}
      <div>

        <h3 className="mb-6 text-lg font-black">
          Learning Stats
        </h3>

        <div className="grid gap-4">

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">

            <h4 className="text-3xl font-black text-cyan-400">
              100+
            </h4>

            <p className="mt-1 text-slate-400">
              Languages
            </p>

          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">

            <h4 className="text-3xl font-black text-purple-400">
              5K+
            </h4>

            <p className="mt-1 text-slate-400">
              Learning Resources
            </p>

          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">

            <h4 className="text-3xl font-black text-green-400">
              24/7
            </h4>

            <p className="mt-1 text-slate-400">
              AI Learning Support
            </p>

          </div>

        </div>

      </div>

    </div>

    {/* Newsletter */}

    <div className="mt-16 rounded-[32px] border border-cyan-500/20 bg-gradient-to-r from-cyan-500/10 via-sky-500/10 to-purple-500/10 p-8 backdrop-blur-xl">

      <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">

        <div>

          <h2 className="text-3xl font-black">
            Stay Ahead With Scholiqen
          </h2>

          <p className="mt-3 leading-8 text-slate-300">
            Receive new language lessons, AI learning tips,
            productivity strategies and premium educational
            resources directly in your inbox.
          </p>

        </div>

      </div>

    </div>

    {/* Bottom */}

    <div className="mt-14 flex flex-col items-center justify-between gap-6 border-t border-white/10 pt-8 md:flex-row">

      <p className="text-slate-500">
        © {new Date().getFullYear()} Scholiqen. All rights reserved.
      </p>

      <div className="flex flex-wrap items-center gap-6 text-sm text-slate-400">

        <button className="transition hover:text-cyan-300">
          Privacy Policy
        </button>

        <button className="transition hover:text-cyan-300">
          Terms of Service
        </button>

        <button className="transition hover:text-cyan-300">
          Cookie Policy
        </button>

        <button className="transition hover:text-cyan-300">
          Support
        </button>

      </div>

    </div>

  </div>

</footer>
    </main>
  );
}