import React, { useState } from 'react';
import { Layout } from '../components/layout/Layout';
import { SITE_CONFIG, buildWhatsAppLink } from '../config/site';
import { db } from '../lib/db';
import { handleWhatsAppInquiry } from '../lib/whatsapp';
import { WhatsAppIcon } from '../components/ui/Icons';

export const ContactPage: React.FC = () => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [interestedIn, setInterestedIn] = useState('Handcrafted Furniture');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    setIsSubmitting(true);
    try {
      await db.createLead({
        name,
        phone,
        city: city || 'Unspecified',
        source: 'contact_form',
        message: `Interested in: ${interestedIn}. Notes: ${message}`,
        status: 'New',
        assignedTo: 'Unassigned',
      });
      setSubmitted(true);
    } catch {
      setSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDirectWhatsApp = () => {
    handleWhatsAppInquiry({
      source: 'whatsapp_header',
      customMessage: 'Assalam o Alaikum, I would like to visit the Ideal Furniture showroom.',
    });
  };

  const whatsappFollowUp = `Assalam o Alaikum, my name is ${name}. I submitted a contact inquiry regarding ${interestedIn}.`;

  return (
    <Layout>
      {/* Banner */}
      <div className="w-full bg-bone py-16 sm:py-24 border-b border-line">
        <div className="max-w-[1440px] mx-auto px-5 sm:px-8 md:px-12 lg:px-16 xl:px-20">
          <span className="eyebrow block mb-3">Showroom & Inquiries</span>
          <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl font-light text-ink leading-[1.06] tracking-[-0.025em]">
            Contact <span className="italic text-accent font-normal">Us</span>
          </h1>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-5 sm:px-8 md:px-12 lg:px-16 xl:px-20 py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-start">
          
          {/* Left Column (5 cols): Showroom details + WhatsApp CTA + Map Placeholder */}
          <div className="lg:col-span-5 space-y-10">
            <div className="space-y-4">
              <span className="eyebrow text-accent block">Studio Address</span>
              <h2 className="font-serif text-2xl text-ink font-light">
                Lahore Flagship Showroom
              </h2>
              <p className="text-sm font-sans font-light text-ink/80 leading-relaxed">
                {SITE_CONFIG.address}
              </p>
            </div>

            <div className="space-y-2 border-t border-line pt-6 text-sm font-sans">
              <span className="eyebrow text-accent block mb-2">Visiting Hours</span>
              <p className="text-ink/80 font-light leading-relaxed">
                {SITE_CONFIG.showroomHours}
              </p>
            </div>

            <div className="space-y-3 border-t border-line pt-6 text-sm font-sans">
              <span className="eyebrow text-accent block mb-2">Direct Communication</span>
              <p className="text-ink/80">
                Telephone: <span className="text-ink font-normal">{SITE_CONFIG.phone}</span>
              </p>
              <p className="text-ink/80">
                Email: <span className="text-ink font-normal">{SITE_CONFIG.email}</span>
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleDirectWhatsApp}
                  className="btn-primary flex items-center space-x-2 text-xs"
                >
                  <WhatsAppIcon size={16} className="text-[#25D366]" />
                  <span>Start WhatsApp Conversation</span>
                </button>
              </div>
            </div>

            {/* Map Embed Placeholder */}
            <div className="border border-line bg-bone p-6 space-y-2">
              <span className="eyebrow block">Location Map</span>
              <p className="font-serif text-base text-ink">Ghalib Road, Gulberg III, Lahore</p>
              <div className="aspect-16/9 bg-paper border border-line flex items-center justify-center text-xs font-sans text-muted p-4 text-center">
                Interactive Google Map coordinates anchored to Gulberg III flagship studio. Available on request.
              </div>
            </div>
          </div>

          {/* Right Column (7 cols): Inquiry Form */}
          <div className="lg:col-span-7 bg-paper border border-line p-8 sm:p-12">
            {submitted ? (
              <div className="py-8 space-y-6">
                <span className="eyebrow text-accent block">Inquiry Logged</span>
                <h2 className="font-serif text-3xl text-ink font-light">
                  Thank you, {name}.
                </h2>
                <p className="text-sm font-sans font-light text-ink/80 leading-relaxed">
                  Your inquiry has been received by our senior studio directors. We will review your request and contact you directly via WhatsApp or mobile.
                </p>
                <div className="pt-6 border-t border-line flex flex-col sm:flex-row gap-4">
                  <a
                    href={buildWhatsAppLink(whatsappFollowUp)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary flex items-center justify-center space-x-2 text-xs"
                  >
                    <WhatsAppIcon size={16} className="text-[#25D366]" />
                    <span>Continue on WhatsApp</span>
                  </a>
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setName('');
                      setPhone('');
                      setMessage('');
                    }}
                    className="btn-secondary text-xs"
                  >
                    Send Another Note
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="mb-8 space-y-2">
                  <span className="eyebrow block">Direct Inquiry</span>
                  <h2 className="font-serif text-3xl text-ink font-light">
                    Send a Message
                  </h2>
                  <p className="text-sm font-sans font-light text-ink/70 leading-relaxed">
                    Please provide your contact details and project requirements below.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 text-xs font-sans">
                  <div>
                    <label className="block uppercase tracking-wider text-ink font-medium mb-2" htmlFor="contact-name">
                      Full Name *
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Tariq Mansoor"
                      className="w-full px-4 py-3 bg-paper border border-line focus:outline-hidden focus:border-ink text-sm text-ink placeholder:text-muted/60"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block uppercase tracking-wider text-ink font-medium mb-2" htmlFor="contact-phone">
                        WhatsApp Number *
                      </label>
                      <input
                        id="contact-phone"
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="e.g. +92 300 8472910"
                        className="w-full px-4 py-3 bg-paper border border-line focus:outline-hidden focus:border-ink text-sm text-ink placeholder:text-muted/60"
                      />
                    </div>

                    <div>
                      <label className="block uppercase tracking-wider text-ink font-medium mb-2" htmlFor="contact-city">
                        City / Country
                      </label>
                      <input
                        id="contact-city"
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="e.g. Lahore / Dubai"
                        className="w-full px-4 py-3 bg-paper border border-line focus:outline-hidden focus:border-ink text-sm text-ink placeholder:text-muted/60"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block uppercase tracking-wider text-ink font-medium mb-2" htmlFor="contact-interest">
                      Interested In
                    </label>
                    <select
                      id="contact-interest"
                      value={interestedIn}
                      onChange={(e) => setInterestedIn(e.target.value)}
                      className="w-full px-4 py-3 bg-paper border border-line focus:outline-hidden focus:border-ink text-xs uppercase tracking-wider text-ink"
                    >
                      <option value="Handcrafted Furniture">Handcrafted Furniture</option>
                      <option value="Drawing & Dining Sets">Drawing & Dining Sets</option>
                      <option value="Interior Consultation">Interior Consultation</option>
                      <option value="Architectural Joinery">Architectural Joinery</option>
                      <option value="Export Delivery">International Export & Delivery</option>
                      <option value="General Inquiry">General Inquiry</option>
                    </select>
                  </div>

                  <div>
                    <label className="block uppercase tracking-wider text-ink font-medium mb-2" htmlFor="contact-msg">
                      Message & Requirements
                    </label>
                    <textarea
                      id="contact-msg"
                      rows={4}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Share dimensions, room details, or specific designs you have in mind..."
                      className="w-full px-4 py-3 bg-paper border border-line focus:outline-hidden focus:border-ink text-sm text-ink leading-relaxed placeholder:text-muted/60"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="btn-primary w-full py-4 text-center text-xs tracking-[0.14em] disabled:opacity-60"
                    >
                      {isSubmitting ? 'Logging Inquiry...' : 'Submit Inquiry'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};
