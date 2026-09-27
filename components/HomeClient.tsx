"use client";

import SiteNav from "./SiteNav";
import SiteFooter from "./SiteFooter";
import SunlitHero from "./home/SunlitHero";
import HowItWorks from "./home/HowItWorks";
import Packages from "./home/Packages";
import BuildYourOwn from "./home/BuildYourOwn";
import FoodSection from "./home/FoodSection";
import EventsHotels from "./home/EventsHotels";
import AppBand from "./home/AppBand";

export default function HomeClient() {
  return (
    <div className="min-h-screen bg-sand-bg text-ink">
      <SiteNav />
      <main>
        <SunlitHero />
        {/* Other pages deep-link to /#features and /#services. */}
        <div id="features">
          <HowItWorks />
        </div>
        <div id="services">
          <Packages />
          <BuildYourOwn />
        </div>
        <FoodSection />
        <EventsHotels />
        <AppBand />
      </main>
      <SiteFooter />
    </div>
  );
}
