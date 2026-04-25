import React, { useMemo, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createOwnerTestimonial,
  deleteOwnerTestimonial,
  listOwnerTestimonials,
  OwnerDraft,
  updateOwnerTestimonial,
  uploadTestimonialImage,
} from './testimonialQueries';
import type { OwnerTestimonialRow } from '../types/blog';

const emptyDraft = (order: number): OwnerDraft => ({
  name: '',
  location: '',
  photo_url: '',
  photo_alt: null,
  quote: '',
  rating: 5,
  occupation_rate: null,
  display_order: order,
  is_active: true,
});

const OwnerTestimonialsAdmin: React.FC = () => {
  const qc = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-owner-testimonials'],
    queryFn: listOwnerTestimonials,
  });

  const [editing, setEditing] = useState<null | { row?: OwnerTestimonialRow; draft: OwnerDraft }>(
    null
  );

  const nextOrder = useMemo(() => {
    if (!data || data.length === 0) return 1;
    return Math.max(...data.map((t) => t.display_order)) + 1;
  }, [data]);

  const del = useMutation({
    mutationFn: (id: string) => deleteOwnerTestimonial(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-owner-testimonials'] }),
  });

  const openNew = () => setEditing({ draft: emptyDraft(nextOrder) });
  const openEdit = (row: OwnerTestimonialRow) =>
    setEditing({
      row,
      draft: {
        id: row.id,
        name: row.name,
        location: row.location,
        photo_url: row.photo_url,
        photo_alt: row.photo_alt,
        quote: row.quote,
        rating: row.rating,
        occupation_rate: row.occupation_rate,
        display_order: row.display_order,
        is_active: row.is_active,
      },
    });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[26px] font-poppins font-semibold tracking-[-0.01em] text-dark-gray">
            Testimonios de propietarios
          </h1>
        </div>
        <button
          onClick={openNew}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-key-green text-white font-semibold text-[13px] hover:bg-key-green/90 transition-colors"
        >
          + Nuevo testimonio
        </button>
      </div>

      {isLoading && <p className="text-dark-gray/55">Cargando…</p>}
      {error && <p className="text-red-600">Error al cargar testimonios.</p>}

      {data && data.length === 0 && (
        <div className="rounded-xl bg-white ring-1 ring-dark-gray/[0.08] p-10 text-center">
          <p className="text-dark-gray/65 text-[14px]">No hay testimonios todavía.</p>
          <button
            onClick={openNew}
            className="inline-block mt-4 text-key-green text-[13px] font-medium hover:underline"
          >
            Crear el primero →
          </button>
        </div>
      )}

      {data && data.length > 0 && (
        <div className="rounded-xl ring-1 ring-dark-gray/[0.08] bg-white overflow-hidden">
          <table className="w-full text-[13.5px]">
            <thead>
              <tr className="text-left text-[12px] text-dark-gray/55 bg-dark-gray/[0.02]">
                <th className="px-5 py-3 font-medium">Orden</th>
                <th className="px-5 py-3 font-medium">Propietario</th>
                <th className="px-5 py-3 font-medium">Testimonio</th>
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
                      <img
                        src={row.photo_url}
                        alt={row.photo_alt ?? row.name}
                        className="w-9 h-9 rounded-full object-cover ring-1 ring-dark-gray/10 flex-shrink-0 bg-dark-gray/[0.04]"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).style.opacity = '0.3';
                        }}
                      />
                      <div className="min-w-0">
                        <p className="text-dark-gray font-medium leading-tight">{row.name}</p>
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
        <OwnerEditorDialog
          initialDraft={editing.draft}
          isEditing={!!editing.row}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            qc.invalidateQueries({ queryKey: ['admin-owner-testimonials'] });
          }}
          onDelete={
            editing.row
              ? async () => {
                  const name = editing.row?.name ?? 'este testimonio';
                  if (!window.confirm(`¿Eliminar el testimonio de "${name}"? Esta acción no se puede deshacer.`))
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

const inputCls =
  'w-full rounded-lg bg-white ring-1 ring-dark-gray/15 focus:ring-2 focus:ring-key-green focus:outline-none px-3.5 py-2.5 text-[14px] text-dark-gray placeholder-dark-gray/35 transition-all';

const OwnerEditorDialog: React.FC<{
  initialDraft: OwnerDraft;
  isEditing: boolean;
  onClose: () => void;
  onSaved: () => void;
  onDelete?: () => void | Promise<void>;
  deleting?: boolean;
}> = ({ initialDraft, isEditing, onClose, onSaved, onDelete, deleting }) => {
  const [draft, setDraft] = useState<OwnerDraft>(initialDraft);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const save = useMutation({
    mutationFn: async () => {
      if (!draft.name.trim()) throw new Error('El nombre es obligatorio.');
      if (!draft.quote.trim()) throw new Error('El testimonio no puede estar vacío.');
      if (!draft.photo_url) throw new Error('Sube una foto del propietario.');
      return draft.id
        ? updateOwnerTestimonial(draft.id, draft)
        : createOwnerTestimonial(draft);
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
            {isEditing ? 'Editar testimonio' : 'Nuevo testimonio'}
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
          {/* Photo */}
          <div>
            <Label>Foto del propietario</Label>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full overflow-hidden ring-1 ring-dark-gray/10 bg-dark-gray/[0.04] flex-shrink-0">
                {draft.photo_url ? (
                  <img src={draft.photo_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full grid place-items-center text-dark-gray/30 text-[10px] uppercase tracking-[0.1em]">
                    Sin foto
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
                  onClick={() => setDraft((d) => ({ ...d, photo_url: '' }))}
                  className="text-[12.5px] text-red-700 hover:underline"
                >
                  Quitar
                </button>
              )}
            </div>
          </div>

          <Field label="Nombre">
            <input
              className={inputCls}
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              placeholder="Pilar Reyes"
            />
          </Field>

          <Field label="Ubicación">
            <input
              className={inputCls}
              value={draft.location}
              onChange={(e) => setDraft({ ...draft, location: e.target.value })}
              placeholder="Miraflores, Lima"
            />
          </Field>

          <Field label="Texto alternativo (SEO)">
            <input
              className={inputCls}
              value={draft.photo_alt ?? ''}
              onChange={(e) =>
                setDraft({ ...draft, photo_alt: e.target.value.trim() === '' ? null : e.target.value })
              }
              placeholder="Pilar Reyes, propietaria en Miraflores"
            />
          </Field>

          <Field label="Testimonio">
            <textarea
              rows={4}
              className={`${inputCls} resize-y`}
              value={draft.quote}
              onChange={(e) => setDraft({ ...draft, quote: e.target.value })}
              placeholder="Comparte la experiencia del propietario…"
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
            <Field label="Ocupación (%)">
              <input
                type="number"
                min={0}
                max={100}
                className={inputCls}
                value={draft.occupation_rate ?? ''}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    occupation_rate: e.target.value === '' ? null : Number(e.target.value),
                  })
                }
                placeholder="—"
              />
            </Field>
            <Field label="Orden">
              <input
                type="number"
                min={0}
                className={inputCls}
                value={draft.display_order}
                onChange={(e) => setDraft({ ...draft, display_order: Number(e.target.value) })}
              />
            </Field>
          </div>

          <label className="flex items-center gap-2.5 text-[13.5px] text-dark-gray/80 cursor-pointer">
            <input
              type="checkbox"
              checked={draft.is_active}
              onChange={(e) => setDraft({ ...draft, is_active: e.target.checked })}
              className="w-4 h-4 rounded accent-key-green"
            />
            Visible en el sitio web
          </label>
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
                {deleting ? 'Eliminando…' : 'Eliminar testimonio'}
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

export default OwnerTestimonialsAdmin;
