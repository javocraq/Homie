
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

const GraciasPage = () => {
  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-radial-gradient p-4">
      <div className="text-center max-w-xl bg-dark-gray bg-opacity-90 p-8 md:p-12 rounded-xl border border-key-green border-opacity-20 shadow-lg">
        <div className="w-16 h-16 rounded-full bg-key-green bg-opacity-10 flex items-center justify-center mx-auto mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-8 h-8 text-key-green">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h1 className="text-3xl md:text-4xl font-semibold mb-4 text-white">
          ¡Gracias por contactarnos!
        </h1>
        
        <p className="text-lg text-gray-300 mb-8">
          Hemos recibido tu solicitud y un asesor de Homie se pondrá en contacto contigo dentro de las próximas 24 horas para brindarte una proyección personalizada.
        </p>
        
        <p className="text-md text-gray-400 mb-8">
          Si deseas agilizar el proceso, escríbenos directamente por WhatsApp al <a href="https://wa.me/51912407529" className="text-key-green hover:underline">+51 912 407 529</a>
        </p>
        
        <Link to="/" className="btn-primary">
          Volver al inicio
        </Link>
      </div>
    </div>
  );
};

export default GraciasPage;
