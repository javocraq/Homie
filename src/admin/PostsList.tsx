import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { listAllPosts } from './adminQueries';
import { formatLimaDisplay } from './lima-time';

const STATUS_STYLES: Record<string, string> = {
  published: 'bg-key-green/10 text-key-green ring-key-green/30',
  draft: 'bg-amber-500/10 text-amber-700 ring-amber-500/30',
  archived: 'bg-dark-gray/[0.06] text-dark-gray/55 ring-dark-gray/10',
};

const STATUS_LABELS: Record<string, string> = {
  published: 'Publicado',
  draft: 'Borrador',
  archived: 'Archivado',
};

const PostsList: React.FC = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-posts'],
    queryFn: listAllPosts,
  });

  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState<string>('all');

  const categories = useMemo(() => {
    if (!data) return [] as { id: string; name: string }[];
    const map = new Map<string, string>();
    for (const p of data) {
      if (p.category?.id) map.set(p.category.id, p.category.name);
    }
    return Array.from(map, ([id, name]) => ({ id, name })).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }, [data]);

  const filtered = useMemo(() => {
    if (!data) return [];
    const q = search.trim().toLowerCase();
    return data.filter((p) => {
      if (categoryId !== 'all' && p.category?.id !== categoryId) return false;
      if (!q) return true;
      return (
        p.title.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q) ||
        (p.author?.name ?? '').toLowerCase().includes(q) ||
        (p.category?.name ?? '').toLowerCase().includes(q)
      );
    });
  }, [data, search, categoryId]);

  const hasActiveFilters = search.trim() !== '' || categoryId !== 'all';

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-[26px] font-poppins font-semibold tracking-[-0.01em] text-dark-gray">
          Posts del blog
        </h1>
      </div>

      {isLoading && <p className="text-dark-gray/55">Cargando…</p>}
      {error && <p className="text-red-600">Error al cargar.</p>}

      {data && data.length > 0 && (
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[240px] max-w-[360px]">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-gray/40"
              aria-hidden
            >
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.6" />
              <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por título, autor o categoría…"
              className="w-full h-10 pl-9 pr-3 rounded-lg bg-white ring-1 ring-dark-gray/[0.12] focus:ring-2 focus:ring-key-green focus:outline-none text-[13.5px] text-dark-gray placeholder-dark-gray/40 transition-all"
            />
          </div>

          <span className="text-[12.5px] text-dark-gray/55 tabular-nums">
            {filtered.length} {filtered.length === 1 ? 'resultado' : 'resultados'}
          </span>

          {hasActiveFilters && (
            <button
              onClick={() => {
                setSearch('');
                setCategoryId('all');
              }}
              className="text-[12.5px] text-dark-gray/60 hover:text-dark-gray underline-offset-4 hover:underline transition-colors"
            >
              Limpiar filtros
            </button>
          )}

          <div className="ml-auto flex items-center gap-3">
            {categories.length > 0 && (
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="h-10 rounded-lg bg-white ring-1 ring-dark-gray/[0.12] focus:ring-2 focus:ring-key-green focus:outline-none text-[13px] text-dark-gray px-3 pr-8 transition-all appearance-none bg-no-repeat bg-[right_0.6rem_center] bg-[length:16px_16px]"
                style={{
                  backgroundImage:
                    "url(\"data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23282828' stroke-width='1.6' stroke-linecap='round'%3e%3cpath d='m6 9 6 6 6-6'/%3e%3c/svg%3e\")",
                }}
              >
                <option value="all">Todas las categorías</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            )}
            <Link
              to="/admin/posts/new"
              className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-key-green text-white font-semibold text-[13px] hover:bg-key-green/90 transition-colors"
            >
              + Nuevo post
            </Link>
          </div>
        </div>
      )}


      {data && data.length === 0 && (
        <div className="rounded-xl bg-white ring-1 ring-dark-gray/[0.08] p-10 text-center">
          <p className="text-dark-gray/65 text-[14px]">Aún no hay posts.</p>
          <Link
            to="/admin/posts/new"
            className="inline-block mt-4 text-key-green text-[13px] font-medium hover:underline"
          >
            Crear el primero →
          </Link>
        </div>
      )}

      {data && data.length > 0 && filtered.length === 0 && (
        <div className="rounded-xl bg-white ring-1 ring-dark-gray/[0.08] p-10 text-center">
          <p className="text-dark-gray/65 text-[14px]">No hay posts que coincidan con los filtros.</p>
        </div>
      )}

      {filtered.length > 0 && (
        <div className="rounded-xl ring-1 ring-dark-gray/[0.08] bg-white overflow-hidden">
          <table className="w-full text-[13.5px]">
            <thead>
              <tr className="text-left text-[12px] text-dark-gray/55 bg-dark-gray/[0.02]">
                <th className="px-5 py-3 font-medium">Fecha de publicación</th>
                <th className="px-5 py-3 font-medium">Título</th>
                <th className="px-5 py-3 font-medium">Categoría</th>
                <th className="px-5 py-3 font-medium">Autor</th>
                <th className="px-5 py-3 font-medium">Estado</th>
                <th className="px-5 py-3 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-t border-dark-gray/[0.06] hover:bg-dark-gray/[0.02]">
                  <td className="px-5 py-3.5 text-dark-gray/60 whitespace-nowrap">
                    {formatLimaDisplay(p.published_at)}
                  </td>
                  <td className="px-5 py-3.5 max-w-[360px]">
                    <Link
                      to={`/admin/posts/${p.id}`}
                      className="text-dark-gray font-medium hover:text-key-green transition-colors line-clamp-1"
                    >
                      {p.title}
                    </Link>
                  </td>
                  <td className="px-5 py-3.5 text-dark-gray/70">{p.category?.name ?? '—'}</td>
                  <td className="px-5 py-3.5 text-dark-gray/70">{p.author?.name ?? '—'}</td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-flex items-center text-[11.5px] font-medium px-2 py-1 rounded ring-1 ${
                        STATUS_STYLES[p.status] ?? STATUS_STYLES.archived
                      }`}
                    >
                      {STATUS_LABELS[p.status] ?? p.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <Link
                      to={`/admin/posts/${p.id}`}
                      className="text-[12.5px] px-2.5 py-1.5 rounded-md bg-dark-gray/[0.04] ring-1 ring-dark-gray/10 hover:bg-dark-gray/[0.08] transition-colors"
                    >
                      Editar
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PostsList;
