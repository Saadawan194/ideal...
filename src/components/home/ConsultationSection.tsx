import React from 'react';
import { handleWhatsAppInquiry } from '../../lib/whatsapp';

interface ConsultationSectionProps {
  heading?: string;
  accentWord?: string;
  lines?: string[];
  image?: string;
}

export const ConsultationSection: React.FC<ConsultationSectionProps> = ({
  heading = 'Free',
  accentWord = 'Interior',
  lines = [
    'Our design directors collaborate with homeowners, architects, and interior designers to compose tailored spatial layouts.',
    'From customized dimensions and premium wood finishes to fabric selections, every detail is refined to match your residence.',
    'Connect directly with our senior furnishing team on WhatsApp to begin reviewing floor plans and timber samples.',
  ],
  image = 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=85',
}) => {
  const handleConsultationClick = () => {
    handleWhatsAppInquiry({
      source: 'consultation',
      customMessage: 'Assalam o Alaikum, I would like to book a free interior consultation for my project.',
    });
  };

  // Clean up and prevent duplicate words like "Free Interior Consultation Consultation"
  const renderHeading = () => {
    let h = (heading || '').trim();
    let a = (accentWord || '').trim();
    if (!h && !a) {
      h = 'Free';
      a = 'Interior';
    }
    // If heading already ends with "Interior" and accent word is "Consultation", split correctly:
    if (h.toLowerCase().endsWith('interior') && a.toLowerCase() === 'consultation') {
      h = h.substring(0, h.length - 8).trim();
      a = 'Interior';
    }
    const combined = `${h} ${a}`.toLowerCase();
    const hasConsultation = combined.includes('consultation');
    return (
      <h2 className="font-sans text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-8 leading-tight tracking-tight">
        {h} {a && <span className="text-[#B89360]">{a}</span>}{!hasConsultation ? ' Consultation' : ''}
      </h2>
    );
  };

  return (
    <section className="w-full bg-ink text-paper">
      <div className="grid grid-cols-1 lg:grid-cols-2">
        {/* Left: 50% Content Panel */}
        <div className="p-8 sm:p-14 lg:p-20 xl:p-24 flex flex-col justify-center max-w-xl mx-auto lg:mx-0">
          <span className="eyebrow text-accent block mb-3">Personalized Service</span>
          {renderHeading()}
          <div className="space-y-4 text-neutral-300 text-sm sm:text-base font-sans font-normal leading-relaxed mb-10">
            {lines.map((line, idx) => (
              <p key={idx}>{line}</p>
            ))}
          </div>
          <div>
            <button
              onClick={handleConsultationClick}
              className="btn-white text-center w-full sm:w-auto"
            >
              Book Free Consultation on WhatsApp
            </button>
          </div>
        </div>

        {/* Right: 50% Single Image */}
        <div className="relative min-h-[380px] lg:min-h-[580px] bg-ink overflow-hidden">
          <img
            src={image}
            alt="Interior design consultation showroom layout"
            loading="lazy"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </section>
  );
};
