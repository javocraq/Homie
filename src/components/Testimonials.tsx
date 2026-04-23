import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { getActiveOwnerTestimonials } from '../lib/queries/testimonials';
import { useLanguage } from '../i18n/LanguageContext';

const Star = () => (
  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

const Testimonials = () => {
  const { t } = useLanguage();

  const { data: testimonials = [], isLoading } = useQuery({
    queryKey: ['owner-testimonials'],
    queryFn: getActiveOwnerTestimonials,
    staleTime: 1000 * 60 * 10,
  });

  if (!isLoading && testimonials.length === 0) return null;

  const reviewsJsonLd = testimonials.length > 0
    ? {
        '@context': 'https://schema.org',
        '@graph': testimonials.map((tt) => ({
          '@type': 'Review',
          itemReviewed: { '@id': 'https://homiebnb.com/#localbusiness' },
          author: { '@type': 'Person', name: tt.name },
          reviewBody: tt.quote,
          reviewRating: { '@type': 'Rating', ratingValue: tt.rating, bestRating: 5, worstRating: 1 },
        })),
      }
    : null;

  const track = [...testimonials, ...testimonials];

  return (
    <section id="testimonios" className="py-20 md:py-24 bg-[#1E1E1E] anchor-section">
      {reviewsJsonLd && (
        <Helmet>
          <script type="application/ld+json">{JSON.stringify(reviewsJsonLd)}</script>
        </Helmet>
      )}
      <div className="container mx-auto px-4">
        <div className="text-center mb-14 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-semibold mb-4 text-white">
            {t('testimonials.heading')}
          </h2>
          <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto">
            {t('testimonials.subtitle')}
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex gap-6 w-max pl-4 md:pl-6 py-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="w-[320px] sm:w-[360px] md:w-[380px] flex-shrink-0 rounded-2xl bg-key-green/80 p-7 md:p-8 min-h-[320px] animate-pulse"
            >
              <div className="flex items-center gap-4 mb-5">
                <div className="w-14 h-14 rounded-full bg-white/20" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-28 rounded bg-white/20" />
                  <div className="h-3 w-20 rounded bg-white/15" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 w-full rounded bg-white/20" />
                <div className="h-3 w-11/12 rounded bg-white/20" />
                <div className="h-3 w-10/12 rounded bg-white/20" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="group relative w-full overflow-hidden motion-reduce:overflow-x-auto">
          <div className="flex gap-6 w-max pl-4 md:pl-6 py-2 animate-marquee group-hover:[animation-play-state:paused] motion-reduce:animate-none">
            {track.map((testimonial, index) => (
              <article
                key={`${testimonial.id}-${index}`}
                aria-label={`${testimonial.name} — ${testimonial.location}`}
                className="w-[320px] sm:w-[360px] md:w-[380px] flex-shrink-0 rounded-2xl bg-key-green text-white p-7 md:p-8 shadow-lg shadow-black/10 flex flex-col min-h-[320px]"
              >
                <header className="flex items-center gap-4 mb-5">
                  <img
                    src={testimonial.photo_url}
                    alt={testimonial.photo_alt ?? testimonial.name}
                    loading="lazy"
                    className="w-14 h-14 rounded-full object-cover ring-2 ring-white/15 flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-white font-semibold uppercase tracking-wide leading-tight truncate">
                      {testimonial.name}
                    </p>
                    <p className="text-white/90 text-sm mt-1 truncate">{testimonial.location}</p>
                  </div>
                </header>

                <blockquote className="text-white/90 text-[15px] leading-relaxed flex-1">
                  &ldquo;{testimonial.quote}&rdquo;
                </blockquote>

                <div className="flex justify-end gap-1 mt-6" aria-label={`${testimonial.rating} / 5`}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} />
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default Testimonials;
