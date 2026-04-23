import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { es, enUS } from 'date-fns/locale';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Seo from '../components/Seo';
import { breadcrumbJsonLd } from '../components/Breadcrumbs';
import PostCard from '../components/blog/PostCard';
import PostCardSkeleton from '../components/blog/PostCardSkeleton';
import ArticleContent from '../components/blog/ArticleContent';
import ShareButton from '../components/blog/ShareButton';
import NotFound from './NotFound';
import { getPostBySlug, getRelatedPosts } from '../lib/queries/blog';
import { useLanguage } from '../i18n/LanguageContext';
import { useContactModal } from '../components/ContactModalProvider';

/**
 * Editorial blog post page — inspired by ecosdigitales.com.
 *
 * Key hierarchy: category kicker → title → meta+share → hero image → body.
 * Body uses the widely-read 680–720px column with 18px body text, 1.75 leading,
 * and near-black body color for newspaper-grade legibility.
 */
const BlogPost: React.FC = () => {
  const { slug = '' } = useParams();
  const { lang, t } = useLanguage();
  const { open: openContactModal } = useContactModal();
  const locale = lang === 'en' ? enUS : es;

  const postQuery = useQuery({
    queryKey: ['blog-post', slug],
    queryFn: () => getPostBySlug(slug),
    enabled: Boolean(slug),
  });

  const post = postQuery.data;

  const relatedQuery = useQuery({
    queryKey: ['blog-related', post?.id, post?.category_id],
    queryFn: () => getRelatedPosts(post!.id, post!.category_id, 3),
    enabled: Boolean(post?.id && post?.category_id),
  });

  if (postQuery.isLoading) {
    return (
      <div className="min-h-screen bg-white text-dark-gray">
        <Navbar />
        <main className="pt-32 md:pt-36 pb-16">
          <div className="container mx-auto px-4">
            <div className="max-w-[760px] mx-auto space-y-5 animate-pulse">
              <div className="h-3 w-28 rounded bg-dark-gray/[0.08]" />
              <div className="h-11 w-full rounded bg-dark-gray/[0.1]" />
              <div className="h-11 w-4/5 rounded bg-dark-gray/[0.1]" />
              <div className="h-4 w-52 rounded bg-dark-gray/[0.06] mt-6" />
            </div>
            <div className="mt-10 max-w-[1100px] mx-auto aspect-[16/9] rounded-2xl bg-dark-gray/[0.06] animate-pulse" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (postQuery.isError || !post) return <NotFound />;

  const url = `https://homiebnb.com/blog/${post.slug}`;
  const dateLabel = format(new Date(post.published_at), "d 'de' MMMM 'de' yyyy", { locale });
  const shortDate = format(new Date(post.published_at), 'd MMM yyyy', { locale });

  const crumbs = [
    { label: t('crumbs.home'), to: '/' },
    { label: t('blog.crumb'), to: '/blog' },
    { label: post.title },
  ];

  /**
   * Split body into two halves to insert an inline CTA roughly mid-article.
   * Works for both markdown (split by blank lines) and HTML (split by closing
   * block tags).
   */
  const contentParts = (() => {
    const raw = post.content ?? '';
    // Markdown path
    if (/\n\s*\n/.test(raw)) {
      const blocks = raw.split(/\n{2,}/);
      if (blocks.length < 4) return { first: raw, second: '' };
      const mid = Math.ceil(blocks.length / 2);
      return {
        first: blocks.slice(0, mid).join('\n\n'),
        second: blocks.slice(mid).join('\n\n'),
      };
    }
    // HTML path — split after the Nth closing paragraph or heading tag
    const closers = [...raw.matchAll(/<\/(p|h2|h3)>/gi)];
    if (closers.length < 4) return { first: raw, second: '' };
    const midMatch = closers[Math.ceil(closers.length / 2) - 1];
    if (!midMatch || midMatch.index === undefined) return { first: raw, second: '' };
    const cut = midMatch.index + midMatch[0].length;
    return {
      first: raw.slice(0, cut),
      second: raw.slice(cut),
    };
  })();

  /**
   * Prose styling — editorial density.
   *
   * Body text uses `#232323` (dark-gray) rather than medium-gray for the
   * newspaper-grade contrast that long-form readers tolerate for 30+ seconds.
   */
  const proseClassName = [
    'prose prose-lg max-w-none',
    // Headings
    'prose-headings:font-poppins prose-headings:font-semibold prose-headings:tracking-[-0.015em] prose-headings:text-dark-gray',
    'prose-h2:text-[30px] md:prose-h2:text-[34px] prose-h2:leading-[1.25] prose-h2:mt-14 prose-h2:mb-5',
    'prose-h3:text-[22px] md:prose-h3:text-[24px] prose-h3:leading-[1.3] prose-h3:mt-10 prose-h3:mb-4',
    'prose-h4:text-[18px] prose-h4:mt-8 prose-h4:mb-3',
    // Body — near-black for editorial readability (matches ecosdigitales)
    'prose-p:text-[18px] prose-p:leading-[1.75] prose-p:text-dark-gray prose-p:mb-6',
    'prose-p:first-of-type:text-[19px] prose-p:first-of-type:leading-[1.7]',
    // Links
    'prose-a:text-key-green prose-a:font-medium prose-a:no-underline hover:prose-a:underline prose-a:underline-offset-4 prose-a:decoration-key-green/40',
    'prose-strong:text-dark-gray prose-strong:font-semibold',
    'prose-em:italic',
    // Blockquote — editorial pull-quote feel
    'prose-blockquote:not-italic prose-blockquote:border-l-[3px] prose-blockquote:border-key-green prose-blockquote:text-[20px] prose-blockquote:leading-[1.6] prose-blockquote:text-dark-gray prose-blockquote:bg-transparent prose-blockquote:pl-6 prose-blockquote:py-1 prose-blockquote:font-medium prose-blockquote:my-10',
    'prose-blockquote:before:hidden prose-blockquote:after:hidden',
    // Lists
    'prose-ul:text-[18px] prose-ul:text-dark-gray prose-ul:leading-[1.75] prose-ul:my-6',
    'prose-ol:text-[18px] prose-ol:text-dark-gray prose-ol:leading-[1.75] prose-ol:my-6',
    'prose-li:my-2 prose-li:marker:text-key-green',
    // Images
    'prose-img:rounded-xl prose-img:ring-1 prose-img:ring-dark-gray/[0.08] prose-img:my-10',
    // Rule
    'prose-hr:border-dark-gray/10 prose-hr:my-12',
    // Code
    'prose-code:text-key-green prose-code:bg-key-green/[0.08] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-[15px] prose-code:font-normal before:prose-code:content-none after:prose-code:content-none',
    // Tables
    'prose-table:text-[15.5px] prose-table:my-8',
    'prose-th:text-dark-gray prose-th:font-semibold prose-th:py-3',
    'prose-td:text-dark-gray prose-td:py-3',
    'prose-thead:border-b-2 prose-thead:border-dark-gray/20',
    'prose-tr:border-b prose-tr:border-dark-gray/10',
  ].join(' ');

  const inlineCta = (
    <aside className="not-prose my-14 md:my-16 rounded-2xl bg-key-green text-dark-gray p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
      <div>
        <p className="text-[10.5px] font-semibold tracking-[0.24em] uppercase text-dark-gray/70">
          {t('blog.cta.kicker')}
        </p>
        <p className="mt-2 text-[22px] md:text-[26px] font-poppins font-semibold leading-snug tracking-[-0.01em]">
          {t('blog.cta.prompt')}
        </p>
      </div>
      <button
        type="button"
        onClick={openContactModal}
        className="group inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-dark-gray text-white text-[13.5px] font-semibold whitespace-nowrap hover:bg-dark-gray/90 transition-colors"
      >
        {t('blog.cta.button')}
        <span aria-hidden="true" className="inline-block transition-transform duration-200 group-hover:translate-x-0.5">→</span>
      </button>
    </aside>
  );

  const postJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.published_at,
    dateModified: post.updated_at,
    url,
    mainEntityOfPage: url,
    inLanguage: lang === 'en' ? 'en' : 'es-PE',
    image: post.og_image_url ?? post.cover_image_url,
    author: {
      '@type': 'Person',
      name: post.author.name,
      ...(post.author.role ? { jobTitle: post.author.role } : {}),
    },
    publisher: { '@id': 'https://homiebnb.com/#organization' },
    articleSection: post.category.name,
    keywords: post.tags?.join(', '),
  };

  return (
    <div className="min-h-screen bg-white text-dark-gray">
      <Navbar />
      <Seo
        title={post.meta_title ?? `${post.title} | Blog Homie`}
        description={post.meta_description ?? post.excerpt}
        canonical={url}
        ogType="article"
        ogImage={post.og_image_url ?? post.cover_image_url}
        jsonLd={[postJsonLd, breadcrumbJsonLd(crumbs)]}
      />

      <main>
        {/* ── Title + meta (BEFORE hero image, ecosdigitales pattern) ── */}
        <section className="pt-28 md:pt-32 pb-8 md:pb-10">
          <div className="container mx-auto px-4">
            <div className="max-w-[720px] mx-auto">
              {/* Category kicker — subtle, uppercase, editorial */}
              <Link
                to={`/blog?category=${post.category.slug}`}
                className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.22em] uppercase text-key-green hover:opacity-70 transition-opacity"
              >
                <span className="inline-block w-6 h-px bg-key-green" aria-hidden="true" />
                {post.category.name}
              </Link>

              {/* Title — larger, tighter, heavier */}
              <h1 className="mt-6 text-[32px] md:text-[48px] lg:text-[56px] font-poppins font-bold tracking-[-0.025em] leading-[1.08] text-dark-gray">
                {post.title}
              </h1>

              {/* Excerpt as deck/standfirst */}
              {post.excerpt && (
                <p className="mt-6 text-[19px] md:text-[20px] leading-[1.55] text-medium-gray">
                  {post.excerpt}
                </p>
              )}

              {/* Meta row — author · date · reading time + share */}
              <div className="mt-8 pt-6 border-t border-dark-gray/[0.08] flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-col">
                  <span className="text-[13.5px] font-medium text-dark-gray leading-tight">
                    {post.author.name}
                  </span>
                  <div className="flex items-center gap-2 text-[12px] text-light-gray leading-tight mt-1">
                    <time dateTime={post.published_at}>{shortDate}</time>
                    <span aria-hidden="true" className="text-dark-gray/25">·</span>
                    <span>{post.reading_time_minutes} {t('blog.readingSuffix')}</span>
                  </div>
                </div>

                <ShareButton url={url} title={post.title} />
              </div>
            </div>
          </div>
        </section>

        {/* ── Hero image (AFTER title, ecosdigitales pattern) ── */}
        <section className="pb-12 md:pb-16">
          <div className="container mx-auto px-4">
            <div className="max-w-[720px] mx-auto">
              <figure className="relative overflow-hidden rounded-2xl ring-1 ring-dark-gray/[0.08]">
                <div className="aspect-[16/9] w-full">
                  <img
                    src={post.cover_image_url}
                    alt={post.cover_image_alt ?? post.title}
                    className="w-full h-full object-cover"
                    loading="eager"
                    fetchPriority="high"
                  />
                </div>
                {post.cover_image_alt && (
                  <figcaption className="sr-only">{post.cover_image_alt}</figcaption>
                )}
              </figure>
            </div>
          </div>
        </section>

        {/* ── Body ── */}
        <section className="pb-16 md:pb-24">
          <div className="container mx-auto px-4">
            <article className="max-w-[720px] mx-auto">
              <ArticleContent content={contentParts.first} className={proseClassName} />
              {contentParts.second && inlineCta}
              {contentParts.second && (
                <ArticleContent content={contentParts.second} className={proseClassName} />
              )}
            </article>
          </div>
        </section>

        {/* ── Related ── */}
        <section className="pb-16 md:pb-24 border-t border-dark-gray/[0.08] pt-14 md:pt-20">
          <div className="container mx-auto px-4">
            <div className="max-w-[1100px] mx-auto">
              <div className="flex items-end justify-between mb-10 md:mb-12">
                <div>
                  <p className="text-[11px] font-semibold tracking-[0.22em] uppercase text-key-green mb-3">
                    {t('blog.kicker')}
                  </p>
                  <h2 className="text-[26px] md:text-[34px] font-poppins font-semibold tracking-[-0.015em] text-dark-gray leading-[1.15]">
                    {t('blog.related.heading')}
                  </h2>
                </div>
                <Link
                  to="/blog"
                  className="hidden md:inline-flex items-center gap-1.5 text-[13px] font-medium text-dark-gray/70 hover:text-dark-gray transition-colors"
                >
                  {t('blog.crumb')}
                  <span aria-hidden="true">→</span>
                </Link>
              </div>

              {relatedQuery.isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
                  {Array.from({ length: 3 }).map((_, i) => <PostCardSkeleton key={i} />)}
                </div>
              ) : (relatedQuery.data?.length ?? 0) > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
                  {relatedQuery.data!.map((rp) => (
                    <PostCard key={rp.id} post={rp} />
                  ))}
                </div>
              ) : (
                <p className="text-light-gray">{t('blog.related.empty')}</p>
              )}
            </div>
          </div>
        </section>

        {/* Full accessible date for screen readers */}
        <span className="sr-only">{dateLabel}</span>
      </main>

      <Footer />
    </div>
  );
};

export default BlogPost;
