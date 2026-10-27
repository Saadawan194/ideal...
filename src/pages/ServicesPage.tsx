import React from 'react';
import { Layout } from '../components/layout/Layout';
import { handleWhatsAppInquiry } from '../lib/whatsapp';

export const ServicesPage: React.FC = () => {
  const handleServiceInquiry = (serviceName: string) => {
    handleWhatsAppInquiry({
      source: 'consultation',
      customMessage: `Assalam o Alaikum, I would like to inquire about your ${serviceName} service.`,
    });
  };

  return (
    <Layout>
      {/* Banner */}
      <div className="w-full bg-bone py-16 sm:py-24 border-b border-line">
        <div className="max-w-[1440px] mx-auto px-5 sm:px-8 md:px-12 lg:px-16 xl:px-20">
          <span className="eyebrow block mb-3">Capabilities</span>
          <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl font-light text-ink leading-[1.06] tracking-[-0.025em]">
            Our <span className="italic text-accent font-normal">Services</span>
          </h1>
        </div>
      </div>

      {/* Services List in Prose Paragraphs (NO icon cards) */}
      <div className="max-w-[1440px] mx-auto px-5 sm:px-8 md:px-12 lg:px-16 xl:px-20 py-16 lg:py-24 divide-y divide-line">
        
        {/* Service 1: Interior Consultation */}
        <section className="py-16 first:pt-0 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-4">
            <span className="eyebrow text-accent block mb-2">01 • Spatial Composition</span>
            <h2 className="font-serif text-3xl text-ink font-light">
              Interior Consultation
            </h2>
          </div>
          <div className="lg:col-span-8 space-y-6 text-sm sm:text-base font-sans font-light text-ink/80 max-w-[62ch]">
            <p>
              Our design directors assist homeowners and architects in curating cohesive interior environments. We begin by reviewing architectural floor plans, sightlines, and natural light patterns. Rather than proposing arbitrary showroom sets, we compose balanced seating arrangements, proportioned dining layouts, and subtle focal accents tailored to daily living habits.
            </p>
            <p>
              Consultations encompass timber selection, wood staining samples, fabric textures, and custom dimensions. Clients receive detailed finish palettes and layout schematics before production begins.
            </p>
            <div>
              <button
                onClick={() => handleServiceInquiry('Interior Consultation')}
                className="btn-primary text-xs"
              >
                Discuss Consultation on WhatsApp
              </button>
            </div>
          </div>
        </section>

        {/* Service 2: Custom Furniture */}
        <section className="py-16 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-4">
            <span className="eyebrow text-accent block mb-2">02 • Bespoke Joinery</span>
            <h2 className="font-serif text-3xl text-ink font-light">
              Custom Furniture
            </h2>
          </div>
          <div className="lg:col-span-8 space-y-6 text-sm sm:text-base font-sans font-light text-ink/80 max-w-[62ch]">
            <p>
              When a specific residence demands unique proportions or specialized details, our workshops produce bespoke pieces to exact millimeter tolerances. Whether altering the dimensions of an existing catalogue dining table or crafting an original twelve-foot deewan, our master joiners accommodate individual client requirements.
            </p>
            <p>
              Every custom commission includes timber grading documentation, joinery mock-ups for review, and progress photographic updates from the carving and polishing benches.
            </p>
            <div>
              <button
                onClick={() => handleServiceInquiry('Custom Furniture Commission')}
                className="btn-primary text-xs"
              >
                Inquire About Custom Commission
              </button>
            </div>
          </div>
        </section>

        {/* Service 3: Project Furnishing */}
        <section className="py-16 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-4">
            <span className="eyebrow text-accent block mb-2">03 • Complete Residences</span>
            <h2 className="font-serif text-3xl text-ink font-light">
              Project Furnishing
            </h2>
          </div>
          <div className="lg:col-span-8 space-y-6 text-sm sm:text-base font-sans font-light text-ink/80 max-w-[62ch]">
            <p>
              For private estates, boutique hospitality residences, and embassies, Ideal Furniture executes comprehensive turnkey furnishing packages. We coordinate the synchronized production of primary living suites, dining banquets, master bedroom suites, architectural consoles, credenzas, and bespoke upholstery.
            </p>
            <p>
              A dedicated project manager oversees timeline milestones, batch finishing to ensure identical timber patinas across multiple rooms, and final on-site white-glove installation.
            </p>
            <div>
              <button
                onClick={() => handleServiceInquiry('Turnkey Project Furnishing')}
                className="btn-primary text-xs"
              >
                Connect With Project Desk
              </button>
            </div>
          </div>
        </section>

      </div>
    </Layout>
  );
};
