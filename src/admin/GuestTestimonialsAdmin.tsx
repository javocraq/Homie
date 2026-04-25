import React, { useMemo, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  bulkCreateGuestTestimonials,
  createGuestTestimonial,
  deleteGuestTestimonial,
  GuestDraft,
  GuestTestimonialExtended,
  listGuestTestimonials,
  updateGuestTestimonial,
  uploadTestimonialImage,
} from './testimonialQueries';
import { guestReviews } from '../data/reviews';

const emptyDraft = (order: number): GuestDraft => ({
  name: '',
  country: '',
  photo_url: null,
  quote: '',
  rating: 5,
  stay_district: null,
  published_at: new Date().toISOString().slice(0, 10),
  display_order: order,
  is_active: true,
});

const inputCls =
  'w-full rounded-lg bg-white ring-1 ring-dark-gray/15 focus:ring-2 focus:ring-key-green focus:outline-none px-3.5 py-2.5 text-[14px] text-dark-gray placeholder-dark-gray/35 transition-all';

const GuestTestimonialsAdmin: React.FC = () => {
  const qc = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-guest-testimonials'],
    queryFn: listGuestTestimonials,
  });

  const [editing, setEditing] = useState<null | {
    row?: GuestTestimonialExtended;
    draft: GuestDraft;
  }>(null);

  const nextOrder = useMemo(() => {
    if (!data || data.length === 0) return 1;
    return Math.max(...data.map((t) => t.display_order)) + 1;
  }, [data]);

  const del = useMutation({
    mutationFn: (id: string) => deleteGuestTestimonial(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-guest-testimonials'] }),
  });

  const importFromWeb = useMutation({
    mutationFn: async () => {
      const drafts: GuestDraft[] = guestReviews.map((r, i) => ({
        name: r.author,
        country: '',
        photo_url: null,
        quote: r.text.es,
        rating: r.rating,
        stay_district: null,
        published_at: new Date(r.date).toISOString(),
        display_order: i + 1,
        is_active: true,
      }));
      return bulkCreateGuestTestimonials(drafts);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-guest-testimonials'] }),
  });

  const openNew = () => setEditing({ draft: emptyDraft(nextOrder) });
  const openEdit = (row: GuestTestimonialExtended) =>
    setEditing({
      row,
      draft: {
        id: row.id,
        name: row.name,
        country: row.country,
        photo_url: row.photo_url,
        quote: row.quote,
        rating: row.rating,
        stay_district: row.stay_district,
        published_at: (row.published_at ?? row.created_at ?? '').slice(0, 10) || null,
        display_order: row.display_order,
        is_active: row.is_active,
      },
    });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[26px] font-poppins font-semibold tracking-[-0.01em] text-dark-gray">
            Testimonios de huéspedes
          </h1>
        </div>
        <button
          onClick={openNew}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-key-green text-white font-semibold text-[13px] hover:bg-key-green/90 transition-colors"
        >
          + Nueva reseña
        </button>
      </div>

      {isLoading && <p className="text-dark-gray/55">Cargando…</p>}
      {error && <p className="text-red-600">Error al cargar reseñas.</p>}

      {data && data.length === 0 && (
        <div className="rounded-2xl bg-white ring-1 ring-dark-gray/[0.08] p-10">
          <div className="max-w-lg mx-auto text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-key-green/10 text-key-green mb-4">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" strokeLinejoin="round" />
              </svg>
            </div>
            <h3 className="text-[16px] font-semibold text-dark-gray mb-1.5">
              Aún no hay reseñas en la base de datos
            </h3>
            <p className="text-[13.5px] text-dark-gray/60 leading-relaxed">
              En la web se muestran {guestReviews.length} reseñas de respaldo. Impórtalas al CMS para poder
              editarlas, ocultarlas o añadir nuevas.
            </p>
            <div className="mt-6 flex items-center justify-center gap-2.5">
              <button
                onClick={() => importFromWeb.mutate()}
                disabled={importFromWeb.isPending}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-key-green text-white font-semibold text-[13px] hover:bg-key-green/90 transition-colors disabled:opacity-60"
              >
                {importFromWeb.isPending
                  ? 'Importando…'
                  : `↓ Importar ${guestReviews.length} reseñas de la web`}
              </button>
              <button
                onClick={openNew}
                className="text-[13px] px-4 py-2.5 rounded-lg bg-dark-gray/[0.04] ring-1 ring-dark-gray/10 hover:bg-dark-gray/[0.08] transition-colors text-dark-gray/75"
              >
                + Crear manualmente
              </button>
            </div>
            {importFromWeb.error && (
              <p className="mt-4 text-[12.5px] text-red-700">
                {(importFromWeb.error as Error).message}. Revisa que la tabla <code>guest_testimonials</code>{' '}
                exista en Supabase (ver <code>supabase/cms_testimonials.sql</code>).
              </p>
            )}
          </div>
        </div>
      )}

      {data && data.length > 0 && (
        <div className="rounded-xl ring-1 ring-dark-gray/[0.08] bg-white overflow-hidden">
          <table className="w-full text-[13.5px]">
            <thead>
              <tr className="text-left text-[12px] text-dark-gray/55 bg-dark-gray/[0.02]">
                <th className="px-5 py-3 font-medium">Orden</th>
                <th className="px-5 py-3 font-medium">Huésped</th>
                <th className="px-5 py-3 font-medium">Reseña</th>
                <th className="px-5 py-3 font-medium">Estado</th>
                <th className="px-5 py-3 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={row.id} className="border-t border-dark-gray/[0.06] hover:bg-dark-gray/[0.02]">
                  <td className="px-5 py-3.5 text-dark-gray/70 whitespace-nowrap tabular-nums">
                    {row.display_order}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      {row.photo_url ? (
                        <img
                          src={row.photo_url}
                          alt={row.name}
                          className="w-9 h-9 rounded-full object-cover ring-1 ring-dark-gray/10"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-key-green/15 text-key-green font-semibold grid place-items-center text-[13px]">
                          {row.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-dark-gray font-medium leading-tight">{row.name}</p>
                        <p className="text-[11.5px] text-dark-gray/55 mt-0.5">
                          {row.country}
                          {row.stay_district ? ` · ${row.stay_district}` : ''}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 max-w-[360px] text-dark-gray/75">
                    <p className="line-clamp-2">{row.quote}</p>
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-flex items-center text-[11.5px] font-medium px-2 py-1 rounded ring-1 ${
                        row.is_active
                          ? 'bg-key-green/10 text-key-green ring-key-green/30'
                          : 'bg-dark-gray/[0.06] text-dark-gray/55 ring-dark-gray/10'
                      }`}
                    >
                      {row.is_active ? 'Publicado' : 'Oculto'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      onClick={() => openEdit(row)}
                      className="text-[12.5px] px-2.5 py-1.5 rounded-md bg-dark-gray/[0.04] ring-1 ring-dark-gray/10 hover:bg-dark-gray/[0.08] transition-colors"
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <GuestEditorDialog
          initialDraft={editing.draft}
          isEditing={!!editing.row}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            qc.invalidateQueries({ queryKey: ['admin-guest-testimonials'] });
          }}
          onDelete={
            editing.row
              ? async () => {
                  const name = editing.row?.name ?? 'esta reseña';
                  if (!window.confirm(`¿Eliminar la reseña de "${name}"? Esta acción no se puede deshacer.`))
                    return;
                  await del.mutateAsync(editing.row!.id);
                  setEditing(null);
                }
              : undefined
          }
          deleting={del.isPending}
        />
      )}
    </div>
  );
};

// ── Editor dialog ────────────────────────────────────────────────

const GuestEditorDialog: React.FC<{
  initialDraft: GuestDraft;
  isEditing: boolean;
  onClose: () => void;
  onSaved: () => void;
  onDelete?: () => void | Promise<void>;
  deleting?: boolean;
}> = ({ initialDraft, isEditing, onClose, onSaved, onDelete, deleting }) => {
  const [draft, setDraft] = useState<GuestDraft>(initialDraft);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const save = useMutation({
    mutationFn: async () => {
      if (!draft.name.trim()) throw new Error('El nombre es obligatorio.');
      if (!draft.quote.trim()) throw new Error('La reseña no puede estar vacía.');
      const payload: GuestDraft = {
        ...draft,
        published_at: draft.published_at ? new Date(draft.published_at).toISOString() : null,
      };
      return draft.id
        ? updateGuestTestimonial(draft.id, payload)
        : createGuestTestimonial(payload);
    },
    onSuccess: onSaved,
  });

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      setUploading(true);
      const url = await uploadTestimonialImage(file);
      setDraft((d) => ({ ...d, photo_url: url }));
    } catch (err) {
      console.error(err);
      window.alert('No se pudo subir la imagen.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-gray/30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl ring-1 ring-dark-gray/[0.08] shadow-[0_30px_80px_-20px_rgba(40,40,40,0.35)] w-full max-w-2xl max-h-[92vh] flex flex-col">
        <div className="px-6 py-4 border-b border-dark-gray/[0.06] flex items-center justify-between">
          <h2 className="text-[17px] font-semibold text-dark-gray">
            {isEditing ? 'Editar reseña' : 'Nueva reseña'}
          </h2>
          <button
            onClick={onClose}
            className="text-dark-gray/50 hover:text-dark-gray text-[22px] leading-none"
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Photo (optional) */}
          <div>
            <Label>Foto del huésped (opcional)</Label>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full overflow-hidden ring-1 ring-dark-gray/10 bg-dark-gray/[0.04] flex-shrink-0">
                {draft.photo_url ? (
                  <img src={draft.photo_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full grid place-items-center text-dark-gray/30 text-[10px] uppercase tracking-[0.1em]">
                    —
                  </div>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="text-[13px] px-3 py-2 rounded-lg bg-dark-gray/[0.04] ring-1 ring-dark-gray/10 hover:bg-dark-gray/[0.08] transition-colors disabled:opacity-50"
              >
                {uploading ? 'Subiendo…' : draft.photo_url ? 'Cambiar' : 'Subir imagen'}
              </button>
              {draft.photo_url && (
                <button
                  type="button"
                  onClick={() => setDraft((d) => ({ ...d, photo_url: null }))}
                  className="text-[12.5px] text-red-700 hover:underline"
                >
                  Quitar
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Nombre">
              <input
                className={inputCls}
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                placeholder="Lian"
              />
            </Field>
            <Field label="País / origen">
              <input
                className={inputCls}
                value={draft.country}
                onChange={(e) => setDraft({ ...draft, country: e.target.value })}
                placeholder="Argentina"
              />
            </Field>
          </div>

          <Field label="Reseña">
            <textarea
              rows={5}
              className={`${inputCls} resize-y`}
              value={draft.quote}
              onChange={(e) => setDraft({ ...draft, quote: e.target.value })}
              placeholder="Texto de la reseña…"
            />
          </Field>

          <div className="grid grid-cols-3 gap-3">
            <Field label="Rating">
              <select
                className={inputCls}
                value={draft.rating}
                onChange={(e) =>
                  setDraft({ ...draft, rating: Number(e.target.value) as 1 | 2 | 3 | 4 | 5 })
                }
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>
                    {n} ★
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Distrito de estadía">
              <input
                className={inputCls}
                value={draft.stay_district ?? ''}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    stay_district: e.target.value.trim() === '' ? null : e.target.value,
                  })
                }
                placeholder="Miraflores"
              />
            </Field>
            <Field label="Fecha">
              <input
                type="date"
                className={inputCls}
                value={draft.published_at ? draft.published_at.slice(0, 10) : ''}
                onChange={(e) =>
                  setDraft({ ...draft, published_at: e.target.value || null })
                }
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Orden">
              <input
                type="number"
                min={0}
                className={inputCls}
                value={draft.display_order}
                onChange={(e) => setDraft({ ...draft, display_order: Number(e.target.value) })}
              />
            </Field>
            <div className="flex items-end">
              <label className="flex items-center gap-2.5 text-[13.5px] text-dark-gray/80 cursor-pointer pb-2.5">
                <input
                  type="checkbox"
                  checked={draft.is_active}
                  onChange={(e) => setDraft({ ...draft, is_active: e.target.checked })}
                  className="w-4 h-4 rounded accent-key-green"
                />
                Visible en el sitio web
              </label>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-dark-gray/[0.06] flex items-center justify-between gap-3 bg-dark-gray/[0.015]">
          <div className="flex items-center gap-3 min-w-0">
            {isEditing && onDelete && (
              <button
                type="button"
                onClick={() => onDelete()}
                disabled={deleting}
                className="text-[12.5px] px-3 py-2 rounded-lg bg-red-500/10 ring-1 ring-red-500/30 text-red-700 hover:bg-red-500/15 disabled:opacity-50 transition-colors"
              >
                {deleting ? 'Eliminando…' : 'Eliminar reseña'}
              </button>
            )}
            {save.error && (
              <p className="text-[12.5px] text-red-700 truncate">
                {(save.error as Error).message}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={onClose}
              className="text-[13px] px-4 py-2 rounded-lg text-dark-gray/70 hover:text-dark-gray"
            >
              Cancelar
            </button>
            <button
              onClick={() => save.mutate()}
              disabled={save.isPending}
              className="text-[13px] font-semibold px-4 py-2 rounded-lg bg-key-green text-white hover:bg-key-green/90 disabled:opacity-50 transition-colors"
            >
              {save.isPending ? 'Guardando…' : 'Guardar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <label className="block text-[12.5px] font-medium text-dark-gray/65 mb-2">
    {children}
  </label>
);

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div>
    <Label>{label}</Label>
    {children}
  </div>
);

export default GuestTestimonialsAdmin;
