
import React from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Advantages from '../components/Advantages';
import Process from '../components/Process';
import Testimonials from '../components/Testimonials';
import GuestReviews from '../components/GuestReviews';
import FAQ from '../components/FAQ';
import Contact from '../components/Contact';
import Footer from '../components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen overflow-x-hidden">
      <Navbar />
      <Hero />
      <Advantages />
      <Process />
      <Testimonials />
      <GuestReviews />
      <Contact />
      <FAQ />
      <Footer />
    </div>
  );
};

export default Index;
