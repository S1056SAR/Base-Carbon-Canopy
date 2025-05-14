import Hero from "@/components/sections/hero"
import MapSection from "@/components/sections/map-section"
import TradingSection from "@/components/sections/trading-section"
import ForecastSection from "@/components/sections/forecast-section"
import AboutSection from "@/components/sections/about-section"

export default function Home() {
  return (
    <div className="flex flex-col w-full">
      <Hero />
      <AboutSection />
      <MapSection />
      <TradingSection />
      <ForecastSection />
    </div>
  )
}
