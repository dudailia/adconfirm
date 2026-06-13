import { NavigationBar } from "../components/NavigationBar";
import { TickerBar } from "../components/TickerBar";
import { FooterBar } from "../components/FooterBar";
import Hero from "../components/sections/Hero";
import HowItWorks from "../components/sections/HowItWorks";
import TimestampMechanism from "../components/sections/TimestampMechanism";
import Integrations from "../components/sections/Integrations";
import Stats from "../components/sections/Stats";
import BusinessAdvertiserTabs from "../components/sections/BusinessAdvertiserTabs";
import SocialProof from "../components/sections/SocialProof";
import Pricing from "../components/sections/Pricing";
import FinalCTA from "../components/sections/FinalCTA";

export default function HomePage() {
  return (
    <main style={{ background: "var(--bg)", color: "var(--text-1)", overflowX: "hidden" }}>
      <NavigationBar />
      <Hero />
      <TickerBar />
      <HowItWorks />
      <TimestampMechanism />
      <Integrations />
      <Stats />
      <BusinessAdvertiserTabs />
      <SocialProof />
      <Pricing />
      <FinalCTA />
      <FooterBar />
    </main>
  );
}
