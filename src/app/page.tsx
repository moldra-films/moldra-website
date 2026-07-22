"use client";

import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Services from "@/components/Services";
import Portfolio from "@/components/Portfolio";
import Features from "@/components/Features";
import Process from "@/components/Process";
import Testimonials from "@/components/Testimonials";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

export default function Home() {
  const handleScrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      {/* Floating Navbar */}
      <Navbar onScrollToSection={handleScrollToSection} />

      <main className="relative flex-grow">
        {/* Hero Section */}
        <Hero
          onScrollToPortfolio={() => handleScrollToSection("portfolio")}
          onScrollToContact={() => handleScrollToSection("contato")}
        />

        {/* About Section */}
        <About />

        {/* Services Section */}
        <Services />

        {/* Portfolio Section */}
        <Portfolio />

        {/* Diferenciais Section */}
        <Features />

        {/* Processo Section */}
        <Process />

        {/* Depoimentos Section */}
        <Testimonials />

        {/* Contato Section */}
        <Contact />
      </main>

      {/* Footer Section */}
      <Footer onScrollToSection={handleScrollToSection} />
    </>
  );
}
