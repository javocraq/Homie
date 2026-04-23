import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { guestReviews } from '../data/reviews';
import { ownerTestimonials } from '../data/ownerTestimonials';
import { useLanguage } from '../i18n/LanguageContext';
import { getActiveGuestTestimonials } from '../lib/queries/testimonials';
import type { GuestTestimonialRow } from '../types/blog';

type NormalizedReview = {
  id: string;
  author: string;
  rating: 1 | 2 | 3 | 4 | 5;
  date: string;
  text: string;
  source: string;
  photoUrl: string | null;
};

const Star = ({ filled }: { filled: boolean }) => (
  <svg className={`w-4 h-4 ${filled ? 'text-key-green' : 'text-gray-600'}`} fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

const GuestReviews = () => {
  const { lang, t } = useLanguage();

  const { data: rows } = useQuery({
    queryKey: ['guest-testimonials'],
    queryFn: getActiveGuestTestimonials,
    staleTime: 1000 * 60 * 10,
  });

  // Prefer CMS-managed rows when available, otherwise fall back to the
  // hand-curated list in src/data/reviews.ts so the section never blanks out.
  const reviews: NormalizedReview[] =
    rows && rows.length > 0
      ? rows.map((r: GuestTestimonialRow) => ({
          id: r.id,
          author: r.name,
          rating: r.rating,
          date: (r.published_at ?? r.created_at) ?? '',
          text: r.quote,
          source: 'Airbnb',
          photoUrl: r.photo_url,
        }))
      : guestReviews.map((r, i) => ({
          id: `static-${i}`,
          author: r.author,
          rating: r.rating,
          date: r.date,
          text: r.text[lang],
          source: r.source,
          photoUrl: null,
        }));

  const totalReviews = reviews.length + ownerTestimonials.length;
  const totalRatingSum =
    reviews.reduce((s, r) => s + r.rating, 0) +
    ownerTestimonials.reduce((s, tt) => s + tt.rating, 0);
  const aggregateRating = {
    ratingValue: totalReviews > 0 ? totalRatingSum / totalReviews : 0,
    reviewCount: totalReviews,
  };

  const formatDate = (iso: string) => {
    if (!iso) return '';
    try {
      return new Date(iso).toLocaleDateString(lang === 'en' ? 'en-US' : 'es-PE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return iso;
    }
  };

  const reviewJsonLd = reviews.map((r) => ({
    '@type': 'Review',
    author: { '@type': 'Person', name: r.author },
    datePublished: r.date,
    reviewBody: r.text,
    reviewRating: {
      '@type': 'Rating',
      ratingValue: r.rating,
      bestRating: 5,
      worstRating: 1,
    },
    publisher: { '@type': 'Organization', name: r.source },
  }));

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': 'https://homiebnb.com/#localbusiness',
    name: 'Homie Perú',
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: aggregateRating.ratingValue.toFixed(1),
      reviewCount: aggregateRating.reviewCount,
      bestRating: 5,
      worstRating: 1,
    },
    review: reviewJsonLd,
  };

  return (
    <section id="reviews-huespedes" className="py-20 md:py-24 bg-[#FFFFFF] anchor-section">
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(schema)}</script>
      </Helmet>
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-semibold mb-4 text-dark-gray">{t('guest.heading')}</h2>
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="flex">{[1, 2, 3, 4, 5].map(i => <Star key={i} filled={i <= Math.round(aggregateRating.ratingValue)} />)}</div>
            <span className="text-dark-gray font-semibold">{aggregateRating.ratingValue.toFixed(1)}</span>
            <span className="text-medium-gray text-sm">· {reviews.length} {t('guest.countSuffix')}</span>
          </div>
          <p className="text-lg text-medium-gray max-w-3xl mx-auto">
            {t('guest.intro')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {reviews.map((r) => (
            <article
              key={r.id}
              className="bg-[#F7F7F7] border border-dark-gray/[0.08] rounded-xl p-6 flex flex-col"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  {r.photoUrl ? (
                    <img
                      src={r.photoUrl}
                      alt={r.author}
                      loading="lazy"
                      className="w-10 h-10 rounded-full object-cover ring-1 ring-key-green/25"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-key-green bg-opacity-20 flex items-center justify-center text-key-green font-semibold">
                      {r.author.charAt(0)}
                    </div>
                  )}
                  <div>
                    <p className="text-dark-gray font-medium">{r.author}</p>
                    <p className="text-xs text-medium-gray/70">
                      <time dateTime={r.date}>{formatDate(r.date)}</time>
                    </p>
                  </div>
                </div>
                <div className="flex" aria-label={t('guest.starsLabel', { n: r.rating })}>
                  {[1, 2, 3, 4, 5].map(i => <Star key={i} filled={i <= r.rating} />)}
                </div>
              </div>
              <p className="text-dark-gray/80 text-sm leading-relaxed flex-1">"{r.text}"</p>
              <p className="mt-4 text-xs text-medium-gray/60">{t('guest.publishedOn')} {r.source}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default GuestReviews;
