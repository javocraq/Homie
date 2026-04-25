import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

type Tone = 'dark' | 'light';

const PageShell: React.FC<{
  children: React.ReactNode;
  darkHeader?: boolean;
  tone?: Tone;
}> = ({ children, tone = 'dark' }) => {
  const shell =
    tone === 'light' ? 'bg-white text-dark-gray' : 'bg-dark-gray text-white';
  return (
    <div className={`min-h-screen ${shell}`}>
      <Navbar />
      <main className="pt-28 md:pt-32 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">{children}</div>
      </main>
      <Footer />
    </div>
  );
};

export default PageShell;
