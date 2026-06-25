import Cog from "../../assets/cog.png";

import HeroSection from "../../components/HeroSection";
import SubjectSection from "../../components/SubjectSection";
import ExperimentsSection from "../../components/ExperimentsSection";
import AIAssistantSection from "../../components/AIAssistantSection";
import FeaturesSection from "../../components/FeaturesSection";
import LabCTASection from "../../components/LabCTASection";
import LabFooter from "../../components/LabFooter";
import FloatingParticles from "../../components/FloatingParticles";

export default function Index() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">

      {/* Premium Background */}
      <div className="absolute inset-0">

        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,.15) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,.15) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
          }}
        />

        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-cyan-500/10 blur-[150px] rounded-full" />
        <div className="absolute top-40 right-0 w-[450px] h-[450px] bg-blue-500/10 blur-[150px] rounded-full" />
        <div className="absolute bottom-0 left-1/3 w-[500px] h-[500px] bg-purple-500/10 blur-[150px] rounded-full" />

      </div>

      <FloatingParticles />

      {/* Premium Glass Header */}
      <header className="fixed top-6 left-1/2 -translate-x-1/2 z-50">

        <div
          className="
            flex items-center gap-4
            px-6 py-3
            rounded-2xl
            border border-white/10
            bg-white/5
            backdrop-blur-xl
            shadow-[0_8px_32px_rgba(0,0,0,0.35)]
          "
        >

          <img
            src={Cog}
            alt="Scholiqen"
            className="w-10 h-10 object-contain"
          />

          <div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              Scholiqen VirtualLab
            </h1>

            <p className="text-xs text-slate-400">
              Interactive Science Learning Platform
            </p>
          </div>

        </div>

      </header>

      {/* Content */}
      <main className="relative z-10">

        <section>
          <HeroSection />
        </section>

        <section className="py-8">
          <SubjectSection />
        </section>

        <section className="py-8">
          <ExperimentsSection />
        </section>

        <section className="py-8">
          <AIAssistantSection />
        </section>

        <section className="py-8">
          <FeaturesSection />
        </section>

        <section className="py-10">
          <LabCTASection />
        </section>

      </main>

      <LabFooter />

    </div>
  );
}