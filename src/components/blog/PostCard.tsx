import React from 'react';
import { Link } from 'react-router-dom';
import type { BlogPostWithRelations } from '../../types/blog';

type Props = { post: BlogPostWithRelations };

const PostCard: React.FC<Props> = ({ post }) => {
  return (
    <article className="group flex flex-col">
      <Link
        to={`/blog/${post.slug}`}
        className="block relative overflow-hidden rounded-2xl bg-[#F7F7F7] ring-1 ring-dark-gray/[0.06]"
      >
        <div className="aspect-[16/9] overflow-hidden">
          <img
            src={post.cover_image_url}
            alt={post.cover_image_alt ?? post.title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          />
        </div>
      </Link>

      <div className="pt-5 flex flex-col flex-1">
        <div>
          <Link
            to={`/blog?category=${post.category.slug}`}
            className="inline-block text-[11px] font-medium tracking-[0.14em] uppercase text-key-green hover:text-key-green/80 transition-colors"
          >
            {post.category.name}
          </Link>
        </div>
        <h3 className="mt-2 text-[19px] md:text-[20px] font-poppins font-semibold leading-snug text-dark-gray line-clamp-2">
          <Link to={`/blog/${post.slug}`} className="hover:text-key-green transition-colors">
            {post.title}
          </Link>
        </h3>
        <p className="mt-2 text-[14.5px] leading-relaxed text-medium-gray line-clamp-3">{post.excerpt}</p>
      </div>
    </article>
  );
};

export default PostCard;
