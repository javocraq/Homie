import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Seo from '../components/Seo';
import Breadcrumbs, { breadcrumbJsonLd } from '../components/Breadcrumbs';
import PostCard from '../components/blog/PostCard';
import PostCardSkeleton from '../components/blog/PostCardSkeleton';
import CategoryFilter from '../components/blog/CategoryFilter';
import { getAllCategories, getPublishedPosts } from '../lib/queries/blog';
import { useLanguage } from '../i18n/LanguageContext';

const PAGE_SIZE = 9;

const Blog: React.FC = () => {
  const { t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const urlCategory = searchParams.get('category') ?? 'all';
  const [activeCategory, setActiveCategory] = useState<string>(urlCategory);

  useEffect(() => {
    setActiveCategory(urlCategory);
  }, [urlCategory]);

  const crumbs = [{ label: t('crumbs.home'), to: '/' }, { label: t('blog.crumb') }];

  const categoriesQuery = useQuery({
    queryKey: ['blog-categories'],
    queryFn: getAllCategories,
    staleTime: 1000 * 60 * 10,
  });

  const postsQuery = useInfiniteQuery({
    queryKey: ['blog-posts', { category: activeCategory }],
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      getPublishedPosts({
        page: pageParam as number,
        pageSize: PAGE_SIZE,
        categorySlug: activeCategory === 'all' ? null : activeCategory,
      }),
    getNextPageParam: (last) => (last.hasMore ? last.page + 1 : undefined),
  });

  const handleCategoryChange = (slug: string) => {
    setActiveCategory(slug);
    if (slug === 'all') {
      const next = new URLSearchParams(searchParams);
      next.delete('category');
      setSearchParams(next, { replace: true });
    } else {
      setSearchParams({ category: slug }, { replace: true });
    }
  };

  const allPosts = useMemo(
    () => postsQuery.data?.pages.flatMap((p) => p.posts) ?? [],
    [postsQuery.data],
  );

  const blogJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    '@id': 'https://homiebnb.com/blog#blog',
    name: 'Blog Homie — Administración Airbnb Perú',
    url: 'https://homiebnb.com/blog',
    publisher: { '@id': 'https://homiebnb.com/#organization' },
  };

  const isInitialLoading = postsQuery.isLoading;
  const isError = postsQuery.isError;
  const hasPosts = allPosts.length > 0;

  return (
    <div className="min-h-screen bg-white text-dark-gray">
      <Navbar />
      <Seo
        title={t('blog.seoTitle')}
        description={t('blog.seoDesc')}
        canonical="https://homiebnb.com/blog"
        jsonLd={[blogJsonLd, breadcrumbJsonLd(crumbs)]}
      />

      <main>
        {/* ── Hero ── */}
        <section className="pt-32 md:pt-36 pb-10 md:pb-14">
          <div className="container mx-auto px-4">
            <Breadcrumbs crumbs={crumbs} />
            <div className="max-w-3xl">
              <p className="text-[11px] font-medium tracking-[0.22em] uppercase text-key-green mb-5">
                {t('blog.kicker')}
              </p>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-poppins font-semibold tracking-[-0.02em] leading-[1.05] text-dark-gray">
                {t('blog.title')}
              </h1>
              <p className="mt-5 text-[16px] md:text-[17px] text-medium-gray leading-relaxed max-w-2xl">
                {t('blog.intro')}
              </p>
            </div>
          </div>
        </section>

        {/* ── Filters (oculto en mobile) ── */}
        <section className="hidden md:block pb-8">
          <div className="container mx-auto px-4">
            <CategoryFilter
              categories={categoriesQuery.data ?? []}
              active={activeCategory}
              onChange={handleCategoryChange}
            />
          </div>
        </section>

        {/* ── Grid ── */}
        <section className="pb-20 md:pb-24">
          <div className="container mx-auto px-4">
            {isInitialLoading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
                {Array.from({ length: 6 }).map((_, i) => (
                  <PostCardSkeleton key={i} />
                ))}
              </div>
            )}

            {isError && (
              <div className="py-20 text-center">
                <p className="text-medium-gray">{t('blog.error')}</p>
              </div>
            )}

            {!isInitialLoading && !isError && !hasPosts && (
              <div className="py-20 md:py-28 text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full border border-dark-gray/10 mb-6">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6 text-light-gray">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2" />
                  </svg>
                </div>
                <p className="text-lg text-dark-gray">{t('blog.empty.title')}</p>
                <p className="mt-2 text-light-gray text-[14.5px] max-w-md mx-auto">{t('blog.empty.desc')}</p>
              </div>
            )}

            {!isInitialLoading && !isError && hasPosts && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
                  {allPosts.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>

                {postsQuery.hasNextPage && (
                  <div className="mt-16 flex justify-center">
                    <button
                      type="button"
                      disabled={postsQuery.isFetchingNextPage}
                      onClick={() => postsQuery.fetchNextPage()}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-dark-gray/15 text-dark-gray/80 text-[13px] font-medium hover:border-key-green hover:text-key-green transition-colors disabled:opacity-50"
                    >
                      {postsQuery.isFetchingNextPage ? t('blog.loading') : t('blog.loadMore')}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Blog;
