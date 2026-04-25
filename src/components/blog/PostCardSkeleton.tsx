import React from 'react';

const PostCardSkeleton: React.FC = () => (
  <div className="flex flex-col animate-pulse">
    <div className="aspect-[16/9] rounded-2xl bg-dark-gray/[0.06]" />
    <div className="pt-5">
      <div className="h-3 w-20 rounded bg-dark-gray/[0.08]" />
      <div className="mt-3 h-5 w-11/12 rounded bg-dark-gray/[0.1]" />
      <div className="mt-2 h-5 w-3/4 rounded bg-dark-gray/[0.1]" />
      <div className="mt-4 h-3 w-full rounded bg-dark-gray/[0.06]" />
      <div className="mt-2 h-3 w-10/12 rounded bg-dark-gray/[0.06]" />
      <div className="mt-6 pt-4 border-t border-dark-gray/[0.08] flex items-center gap-3">
        <div className="w-7 h-7 rounded-full bg-dark-gray/[0.1]" />
        <div className="h-3 w-40 rounded bg-dark-gray/[0.08]" />
      </div>
    </div>
  </div>
);

export default PostCardSkeleton;
