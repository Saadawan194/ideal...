import React from 'react';
import { Layout } from '../components/layout/Layout';
import { Link } from 'react-router-dom';

export const AboutPage: React.FC = () => {
  return (
    <Layout>
      {/* Editorial Banner */}
      <div className="w-full bg-bone py-16 sm:py-24 border-b border-line">
        <div className="max-w-[1440px] mx-auto px-5 sm:px-8 md:px-12 lg:px-16 xl:px-20">
          <span className="eyebrow block mb-3">The Heritage</span>
          <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl font-light text-ink leading-[1.06] tracking-[-0.025em]">
            Our <span className="italic text-accent font-normal">Story</span>
          </h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1440px] mx-auto px-5 sm:px-8 md:px-12 lg:px-16 xl:px-20 py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start">
          
          <div className="lg:col-span-5 space-y-6">
            <h2 className="font-serif text-2xl sm:text-3xl font-light text-ink leading-snug">
              Rooted in centuries of Punjabi timbercraft and Mughal balance.
            </h2>
            <div className="aspect-4/5 w-full bg-bone overflow-hidden border border-line">
              <img
                src="https://images.unsplash.com/photo-1540518614846-7ede433c4ef0?auto=format&fit=crop&w=1000&q=85"
                alt="Ideal Furniture artisan hand carving timber"
                loading="lazy"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="lg:col-span-7 space-y-8 text-sm sm:text-base font-sans font-light leading-relaxed text-ink/80 max-w-[62ch]">
            <p>
              Ideal Furniture was established with a singular conviction: that furnishings inside a home should carry the permanence and dignity of fine sculpture. What began as a modest guild of generational woodcarvers in Lahore has matured into an architectural design house creating pieces for discerning residences across Pakistan and abroad.
            </p>

            <p>
              In our workshops, we reject machine-stamped uniformity and synthetic composites. We select seasoned logs of Himalayan walnut, Chinioti rosewood, and aged teak. Each plank undergoes rigorous kiln-drying and open-air acclimation to ensure absolute stability against regional humidity shifts.
            </p>

            <p>
              Our craftsmen employ traditional mortise, tenon, and pegged joinery. Chisel facets, fluting, and hand-rubbed wax finishes bear the direct touch of artisans whose families have practiced woodworking for generations. We do not apply polyurethane plastic coatings; rather, we build up layers of natural shellac and beeswax that permit timber to breathe and develop a rich patina over decades of domestic life.
            </p>

            <div className="pt-8 border-t border-line space-y-4">
              <h3 className="font-serif text-xl text-ink font-normal">
                Commissions & Studio Visits
              </h3>
              <p className="text-sm text-ink/75">
                Our main studio and display gallery on Ghalib Road welcome architects, patrons, and collectors by appointment and during regular hours.
              </p>
              <div>
                <Link to="/contact" className="btn-primary text-xs">
                  Visit the Lahore Showroom
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};
