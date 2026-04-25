import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Image as ImageIcon, Trash2 } from 'lucide-react';
import RichEditor from './editor/RichEditor';
import {
  createPost,
  deletePost,
  estimateReadingMinutes,
  getPostById,
  listAuthors,
  listCategories,
  slugify,
  updatePost,
  uploadImage,
  type PostDraft,
} from './adminQueries';
import { limaInputToIso, nowInLimaIso, toLimaInputValue } from './lima-time';
import type { BlogPostStatus } from '../types/blog';

const STATUSES: { value: BlogPostStatus; label: string }[] = [
  { value: 'draft', label: 'Borrador' },
  { value: 'published', label: 'Publicado' },
  { value: 'archived', label: 'Archivado' },
];

const emptyDraft: PostDraft = {
  slug: '',
  title: '',
  excerpt: '',
  content: '',
  cover_image_url: '',
  cover_image_alt: '',
  author_id: '',
  category_id: '',
  tags: [],
  reading_time_minutes: 1,
  status: 'draft',
  published_at: nowInLimaIso(),
  meta_title: '',
  meta_description: '',
  og_image_url: '',
};

const PostEditor: React.FC = () => {
  const { id } = useParams();
  const isNew = !id || id === 'new';
  const navigate = useNavigate();
  const qc = useQueryClient();

  const authorsQuery = useQuery({ queryKey: ['admin-authors'], queryFn: listAuthors });
  const catsQuery = useQuery({ queryKey: ['admin-categories'], queryFn: listCategories });
  const postQuery = useQuery({
    queryKey: ['admin-post', id],
    queryFn: () => getPostById(id as string),
    enabled: !isNew,
  });

  const [draft, setDraft] = useState<PostDraft>(emptyDraft);
  const [tagsInput, setTagsInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [uploadingCover, setUploadingCover] = useState(false);
  const coverInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isNew) return;
    const p = postQuery.data;
    if (!p) return;
    setDraft({
      id: p.id,
      slug: p.slug,
      title: p.title,
      excerpt: p.excerpt,
      content: p.content,
      cover_image_url: p.cover_image_url,
      cover_image_alt: p.cover_image_alt,
      author_id: p.author_id,
      category_id: p.category_id,
      tags: p.tags ?? [],
      reading_time_minutes: p.reading_time_minutes,
      status: p.status,
      published_at: p.published_at,
      meta_title: p.meta_title,
      meta_description: p.meta_description,
      og_image_url: p.og_image_url,
    });
    setTagsInput((p.tags ?? []).join(', '));
  }, [postQuery.data, isNew]);

  useEffect(() => {
    setDraft((d) => ({ ...d, reading_time_minutes: estimateReadingMinutes(d.content) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft.content]);

  const publishedInput = useMemo(() => toLimaInputValue(draft.published_at), [draft.published_at]);

  const handleCoverUpload = async (file: File) => {
    setUploadingCover(true);
    setErrorMsg(null);
    try {
      const url = await uploadImage(file, 'covers');
      setDraft((d) => ({ ...d, cover_image_url: url }));
    } catch (e) {
      setErrorMsg((e as Error).message ?? 'Error al subir la imagen.');
    } finally {
      setUploadingCover(false);
    }
  };

  const save = useMutation({
    mutationFn: async () => {
      const autoSlug = draft.slug?.trim() ? draft.slug : slugify(draft.title);
      const payload: PostDraft = {
        ...draft,
        slug: autoSlug,
        meta_title: draft.title.slice(0, 70),
        meta_description: (draft.excerpt || '').slice(0, 170) || null,
        og_image_url: draft.cover_image_url || null,
        tags: tagsInput
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
      };
      if (isNew) return createPost(payload);
      return updatePost(id as string, payload);
    },
    onSuccess: (data) => {
      setSaving(false);
      setSavedMsg('Cambios guardados.');
      setErrorMsg(null);
      qc.invalidateQueries({ queryKey: ['admin-posts'] });
      qc.invalidateQueries({ queryKey: ['admin-post', id] });
      if (isNew) navigate(`/admin/posts/${data.id}`, { replace: true });
      window.setTimeout(() => setSavedMsg(null), 2500);
    },
    onError: (err: Error) => {
      setSaving(false);
      setErrorMsg(err.message ?? 'Error al guardar.');
    },
  });

  const del = useMutation({
    mutationFn: () => deletePost(id as string),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-posts'] });
      navigate('/admin/posts', { replace: true });
    },
    onError: (err: Error) => {
      setErrorMsg(err.message ?? 'Error al eliminar.');
    },
  });

  const onDelete = () => {
    if (isNew) return;
    const title = draft.title.trim() || 'este post';
    if (!window.confirm(`¿Eliminar "${title}"? Esta acción no se puede deshacer.`)) return;
    setErrorMsg(null);
    del.mutate();
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.author_id || !draft.category_id) {
      setErrorMsg('Selecciona autor y categoría.');
      return;
    }
    if (!draft.title.trim()) {
      setErrorMsg('El título es obligatorio.');
      return;
    }
    if (!draft.cover_image_url) {
      setErrorMsg('Sube una imagen de portada.');
      return;
    }
    setSaving(true);
    setErrorMsg(null);
    save.mutate();
  };

  const loading =
    (!isNew && postQuery.isLoading) || authorsQuery.isLoading || catsQuery.isLoading;

  if (loading) return <p className="text-dark-gray/55">Cargando…</p>;

  return (
    <form onSubmit={onSubmit} className="space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[12.5px] text-dark-gray/50">
            {isNew ? 'Nuevo post' : 'Editando'}
          </p>
          <h1 className="text-[26px] font-poppins font-semibold tracking-[-0.01em] mt-1 text-dark-gray">
            {draft.title || 'Post sin título'}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          {savedMsg && <span className="text-[12.5px] text-key-green">{savedMsg}</span>}
          {!isNew && (
            <button
              type="button"
              onClick={onDelete}
              disabled={del.isPending}
              className="text-[13px] px-3.5 py-2 rounded-lg bg-red-500/10 ring-1 ring-red-500/30 text-red-700 hover:bg-red-500/15 disabled:opacity-60 transition-colors"
            >
              {del.isPending ? 'Eliminando…' : 'Eliminar'}
            </button>
          )}
          <button
            type="button"
            onClick={() => navigate('/admin/posts')}
            className="text-[13px] px-3.5 py-2 rounded-lg bg-dark-gray/[0.04] ring-1 ring-dark-gray/10 hover:bg-dark-gray/[0.08] text-dark-gray"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="text-[13px] px-4 py-2 rounded-lg bg-key-green text-white font-semibold hover:bg-key-green/90 disabled:opacity-60 transition-colors"
          >
            {saving ? 'Guardando…' : isNew ? 'Crear post' : 'Guardar cambios'}
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="rounded-lg bg-red-500/10 ring-1 ring-red-500/30 px-4 py-3 text-[13px] text-red-700">
          {errorMsg}
        </div>
      )}

      <div className="grid lg:grid-cols-[1fr_340px] gap-8 items-start">
        <div className="space-y-6 min-w-0">
          <Field label="Título">
            <input
              required
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              className={inputCls}
              placeholder="Título del post"
            />
          </Field>

          <Field label="Imagen de portada">
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleCoverUpload(f);
                e.target.value = '';
              }}
            />
            {draft.cover_image_url ? (
              <div className="group relative rounded-xl overflow-hidden ring-1 ring-dark-gray/10 bg-dark-gray/[0.02]">
                <img
                  src={draft.cover_image_url}
                  alt=""
                  className="w-full aspect-[16/9] object-cover"
                />
                {/* Hover overlay with floating action buttons */}
                <div
                  className={[
                    'absolute inset-0 flex items-center justify-center gap-2',
                    'bg-dark-gray/0 group-hover:bg-dark-gray/30',
                    'opacity-0 group-hover:opacity-100',
                    'transition-all duration-200',
                  ].join(' ')}
                >
                  <button
                    type="button"
                    onClick={() => coverInputRef.current?.click()}
                    disabled={uploadingCover}
                    className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg bg-white text-dark-gray text-[13px] font-medium shadow-[0_4px_14px_-4px_rgba(0,0,0,0.25)] ring-1 ring-dark-gray/10 hover:bg-white/95 disabled:opacity-60 transition-colors"
                  >
                    <ImageIcon size={14} strokeWidth={1.75} aria-hidden="true" />
                    {uploadingCover ? 'Subiendo…' : 'Cambiar'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setDraft((d) => ({ ...d, cover_image_url: '' }))}
                    aria-label="Quitar imagen"
                    title="Quitar imagen"
                    className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-white text-red-600 shadow-[0_4px_14px_-4px_rgba(0,0,0,0.25)] ring-1 ring-dark-gray/10 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={15} strokeWidth={1.75} aria-hidden="true" />
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => coverInputRef.current?.click()}
                disabled={uploadingCover}
                className="w-full rounded-xl border-2 border-dashed border-dark-gray/15 hover:border-key-green bg-dark-gray/[0.02] hover:bg-key-green/[0.04] py-14 px-4 text-center transition-colors disabled:opacity-60"
              >
                <span className="block text-[14px] font-medium text-dark-gray">
                  {uploadingCover ? 'Subiendo imagen…' : 'Subir imagen'}
                </span>
                <span className="block text-[12px] text-dark-gray/50 mt-1">
                  JPG o PNG · proporción 16:9 recomendada
                </span>
              </button>
            )}
          </Field>

          <Field label="Extracto" hint="2–3 líneas que aparecen en el listado.">
            <textarea
              value={draft.excerpt}
              onChange={(e) => setDraft({ ...draft, excerpt: e.target.value })}
              className={`${inputCls} min-h-[90px] resize-y`}
              maxLength={280}
              placeholder="Resumen breve del post."
            />
          </Field>

          <Field label="Contenido">
            <RichEditor
              value={draft.content}
              onChange={(html) => setDraft((d) => ({ ...d, content: html }))}
              placeholder="Escribe el contenido del artículo…"
            />
            <p className="text-[11.5px] text-dark-gray/45 mt-2">
              Lectura estimada: {draft.reading_time_minutes} min
            </p>
          </Field>
        </div>

        <aside className="space-y-6 lg:sticky lg:top-0 lg:self-start lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto lg:pr-1 lg:-mr-1">
          <Field label="Alt de la portada (SEO)">
            <input
              value={draft.cover_image_alt ?? ''}
              onChange={(e) => setDraft({ ...draft, cover_image_alt: e.target.value })}
              className={inputCls}
              placeholder="Descripción de la imagen"
            />
          </Field>

          <Field label="Estado">
            <select
              value={draft.status}
              onChange={(e) =>
                setDraft({ ...draft, status: e.target.value as BlogPostStatus })
              }
              className={inputCls}
            >
              {STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Fecha de publicación (Lima)">
            <input
              type="datetime-local"
              value={publishedInput}
              onChange={(e) =>
                setDraft({ ...draft, published_at: limaInputToIso(e.target.value) })
              }
              className={inputCls}
            />
          </Field>

          <Field label="Categoría">
            <select
              value={draft.category_id}
              onChange={(e) => setDraft({ ...draft, category_id: e.target.value })}
              className={inputCls}
              required
            >
              <option value="">— Selecciona —</option>
              {catsQuery.data?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Autor">
            <select
              value={draft.author_id}
              onChange={(e) => setDraft({ ...draft, author_id: e.target.value })}
              className={inputCls}
              required
            >
              <option value="">— Selecciona —</option>
              {authorsQuery.data?.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </Field>

          {/* Tags are preserved in state and saved automatically; the editor UI is hidden. */}
        </aside>
      </div>
    </form>
  );
};

const inputCls =
  'w-full rounded-lg bg-white ring-1 ring-dark-gray/15 focus:ring-2 focus:ring-key-green focus:outline-none px-3.5 py-2.5 text-[14px] text-dark-gray placeholder-dark-gray/35 transition-all';

const Field: React.FC<{ label: string; hint?: string; children: React.ReactNode }> = ({
  label,
  hint,
  children,
}) => (
  <div>
    <label className="block text-[12.5px] font-medium text-dark-gray/65 mb-2">
      {label}
    </label>
    {children}
    {hint && <p className="mt-1.5 text-[11.5px] text-dark-gray/45">{hint}</p>}
  </div>
);

export default PostEditor;
