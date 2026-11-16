import { Hero } from "@/components/Hero";
import { Showcase } from "@/components/home/Showcase";
import { AllCategories, Articles, Faq, HowItWorks, MatchTeaser, ProBand, Trust } from "@/components/home/Sections";

export default function Home() {
  return (
    <>
      <Hero />
      <Showcase />
      <HowItWorks />
      <AllCategories />
      <MatchTeaser />
      <Trust />
      <Articles />
      <ProBand />
      <Faq limit={4} />
    </>
  );
}
