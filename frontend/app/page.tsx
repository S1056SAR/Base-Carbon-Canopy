// import dynamic from 'next/dynamic' // No longer needed here
import Hero from "@/components/sections/hero"
// import MapSection from "@/components/sections/map-section"
import TradingSection from "@/components/sections/trading-section"
import ImpactScoreSection from "@/components/sections/forecast-section"
import AboutSection from "@/components/sections/about-section"
import MapLoader from "@/components/client/map-loader" // Import the new client component

// const MapSection = dynamic(() => import('@/components/sections/map-section'), { 
//   ssr: false,
//   loading: () => <div className="w-full h-[500px] flex justify-center items-center text-white"><p>Loading Map...</p></div>
// })

export default function Home() {
  return (
    <div className="flex flex-col w-full">
      <Hero />
      <AboutSection />
      <MapLoader /> {/* Use the new client component wrapper */}
      <TradingSection />
      <ImpactScoreSection />
    </div>
  )
}
