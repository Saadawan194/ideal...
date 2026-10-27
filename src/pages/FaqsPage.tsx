import React, { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { Layout } from '../components/layout/Layout';
import { ChevronIcon } from '../components/ui/Icons';
import { handleWhatsAppInquiry } from '../lib/whatsapp';
import { MOTION_EASE } from '../lib/motion';

export const FaqsPage: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();
  const faqs = [
    {
      q: 'How do I inquire about pricing for a piece?',
      a: 'Because each piece is crafted to individual commission with customized timber selections, finishes, and dimensions, we do not publish static mass-market prices. Simply click "Discuss Price on WhatsApp" on any catalogue item or request a callback. Our design team will provide an exact quotation and timber options immediately.',
    },
    {
      q: 'What species of timber do you work with?',
      a: 'We work primarily with solid Himalayan walnut, aged Chinioti rosewood (sheesham), and reclaimed Burma teak. Every log is seasoned and moisture-tested in our kiln facilities before precision joinery begins.',
    },
    {
      q: 'Can dimensions, finishes, or upholstery fabrics be customized?',
      a: 'Yes. Every catalogue design can be modified in length, depth, and height to match your floor plan. We offer in-house fabric selections including hand-loomed velvets and raw silks, or we can upholster using client-supplied material (COM).',
    },
    {
      q: 'What is your standard production lead time?',
      a: 'Standard furniture pieces require four to six weeks from drawing approval. Intricately hand-carved deewans, large dining suites, or multi-room project commissions generally require six to eight weeks.',
    },
    {
      q: 'How are deliveries handled across Pakistan and internationally?',
      a: 'For major cities in Pakistan (Lahore, Islamabad, Karachi, Peshawar, Multan, Faisalabad), our logistics team provides direct white-glove delivery and assembly. For international consignments (UAE, UK, USA, Europe), pieces are vapor-sealed and custom-crated in treated timber to comply with global phytosanitary standards.',
    },
    {
      q: 'Do you offer on-site interior consultations?',
      a: 'Yes. Our senior spatial directors conduct site visits for residences in Lahore and Islamabad. For other cities and overseas clients, we conduct detailed virtual consultations over WhatsApp with floor plan markups.',
    },
  ];

  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <Layout>
      <div className="w-full bg-bone py-20 lg:py-28 border-b border-line">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-12 lg:px-20">
          <span className="eyebrow block mb-3">Client Inquiries</span>
          <h1 className="font-serif text-4xl sm:text-6xl font-light text-ink">
            Frequently Asked <span className="italic text-accent font-normal">Questions</span>
          </h1>
        </div>
      </div>

      <div className="max-w-[960px] mx-auto px-6 sm:px-12 py-20 lg:py-28">
        <div className="divide-y divide-line border-y border-line">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div key={idx} className="py-6">
                <button
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between text-left font-serif text-xl sm:text-2xl text-ink group cursor-pointer"
                  aria-expanded={isOpen}
                >
                  <span className="group-hover:text-accent transition-colors pr-6">
                    {faq.q}
                  </span>
                  <ChevronIcon size={18} direction={isOpen ? 'up' : 'down'} />
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="content"
                      initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
                      transition={{ duration: 0.28, ease: MOTION_EASE }}
                      className="overflow-hidden"
                    >
                      <p className="pt-4 text-sm font-sans font-light text-ink/80 leading-relaxed max-w-[70ch]">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        <div className="mt-16 p-8 bg-bone border border-line text-center space-y-4">
          <h3 className="font-serif text-2xl text-ink">Have a specific design requirement?</h3>
          <p className="text-xs font-sans text-muted max-w-md mx-auto">
            Our team is available on WhatsApp to answer questions, customize dimensions, or schedule showroom visits.
          </p>
          <div>
            <button
              onClick={() =>
                handleWhatsAppInquiry({
                  source: 'whatsapp_header',
                  customMessage: 'Assalam o Alaikum, I have a specific question not covered in your FAQ.',
                })
              }
              className="btn-primary text-xs"
            >
              Consult With Our Team on WhatsApp
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};
