import React from 'react';
import { Layout } from '../components/layout/Layout';

export const PrivacyPage: React.FC = () => {
  return (
    <Layout>
      <div className="w-full bg-bone py-16 lg:py-24 border-b border-line">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-12 lg:px-20">
          <span className="eyebrow block mb-2">Data Protection</span>
          <h1 className="font-serif text-3xl sm:text-5xl font-light text-ink">
            Privacy Policy
          </h1>
        </div>
      </div>

      <div className="max-w-[800px] mx-auto px-6 sm:px-12 py-16 lg:py-24 font-sans text-sm text-ink/80 leading-relaxed font-light space-y-8">
        <section className="space-y-3">
          <h2 className="font-serif text-xl text-ink font-normal">Client Confidentiality</h2>
          <p>
            At Ideal Furniture, we value the discretion of our patrons, architects, and estate owners. Any personal data provided via our contact forms, callback requests, or direct WhatsApp correspondence including names, residential addresses, and architectural drawings is retained strictly for communication and fulfillment of your specific commission.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-xl text-ink font-normal">Third-Party Disclosure</h2>
          <p>
            We do not sell, rent, or trade client information to outside marketing entities. Contact details are shared solely with verified logistics couriers to facilitate doorstep delivery and timber assembly.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-xl text-ink font-normal">Direct Inquiries</h2>
          <p>
            If you wish to review, modify, or request deletion of your inquiry records from our studio database, please notify our team via WhatsApp or at our studio email address.
          </p>
        </section>
      </div>
    </Layout>
  );
};
