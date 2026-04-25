import React from 'react';
import { Helmet } from 'react-helmet-async';

type SeoProps = {
  title: string;
  description: string;
  canonical?: string;
  noindex?: boolean;
  ogImage?: string;
  ogType?: 'website' | 'article';
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
};

const SITE_URL = 'https://homiebnb.com';
const DEFAULT_OG = `${SITE_URL}/images/brand/homie-logo.png`;

const Seo: React.FC<SeoProps> = ({
  title,
  description,
  canonical,
  noindex = false,
  ogImage = DEFAULT_OG,
  ogType = 'website',
  jsonLd,
}) => {
  const canonicalUrl = canonical ?? `${SITE_URL}/`;
  const jsonLdArray = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />
      <meta
        name="robots"
        content={noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1'}
      />
      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content="Homie Perú" />
      <meta property="og:locale" content="es_PE" />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      {jsonLdArray.map((block, i) => (
        <script key={i} type="application/ld+json">{JSON.stringify(block)}</script>
      ))}
    </Helmet>
  );
};

export default Seo;
