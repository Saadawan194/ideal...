import React from 'react';
import { Layout } from '../components/layout/Layout';

export const TermsPage: React.FC = () => {
  return (
    <Layout>
      <div className="w-full bg-bone py-16 lg:py-24 border-b border-line">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-12 lg:px-20">
          <span className="eyebrow block mb-2">Legal Policy</span>
          <h1 className="font-serif text-3xl sm:text-5xl font-light text-ink">
            Terms & Conditions
          </h1>
        </div>
      </div>

      <div className="max-w-[800px] mx-auto px-6 sm:px-12 py-16 lg:py-24 font-sans text-sm text-ink/80 leading-relaxed font-light space-y-8">
        <section className="space-y-3">
          <h2 className="font-serif text-xl text-ink font-normal">1. Custom Commissions</h2>
          <p>
            All Ideal Furniture pieces are individually built to order according to client-approved timber specifications, dimensions, and finishes. Commission confirmation occurs upon approval of production schematics and receipt of the agreed deposit.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-xl text-ink font-normal">2. Timber Characteristics</h2>
          <p>
            Natural solid hardwoods exhibit organic variation in grain density, burl patterns, and mineral shading. These characteristics are hallmarks of authentic organic timber and do not constitute structural flaws.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-xl text-ink font-normal">3. Delivery & Inspection</h2>
          <p>
            Upon delivery by our logistics team or partner freight forwarder, clients are requested to inspect each piece prior to signing the delivery acceptance receipt. Any transit adjustments must be noted immediately on the consignment bill.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-xl text-ink font-normal">4. Intellectual Property</h2>
          <p>
            All custom designs, carving patterns, photographs, and architectural renderings displayed by Ideal Furniture remain the exclusive intellectual property of Ideal Furniture.
          </p>
        </section>
      </div>
    </Layout>
  );
};
