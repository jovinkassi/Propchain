import { PropertyGrid } from "@/components/PropertyGrid";
import { HeroSection } from "@/components/HeroSection";
import { MarketStats } from "@/components/MarketStats";

export default function Home() {
  return (
    <main>
      <HeroSection />
      <MarketStats />
      <PropertyGrid />
    </main>
  );
}
