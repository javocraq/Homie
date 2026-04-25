import React, { useMemo, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  HERO_MAX_IMAGES,
  HeroImageRow,
  createHeroImage,
  deleteHeroImage,
  listHeroImages,
  reorderHeroImages,
  updateHeroImage,
  uploadHeroImage,
} from './heroQueries';

const HeroImagesAdmin: React.FC = () => {
  const qc = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-hero-images'],
    queryFn: listHeroImages,
  });

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const sorted = useMemo(
    () => (data ?? []).slice().sort((a, b) => a.display_order - b.display_order),
    [data]
  );
  const canAddMore = sorted.length < HERO_MAX_IMAGES;
  const nextOrder = useMemo(() => {
    if (sorted.length === 0) return 1;
    return Math.max(...sorted.map((r) => r.display_order)) + 1;
  }, [sorted]);

  const create = useMutation({
    mutationFn: (file: File) =>
      (async () => {
        const url = await uploadHeroImage(file);
        return createHeroImage({
          image_url: url,
          image_alt: null,
          display_order: nextOrder,
          is_active: true,
        });
      })(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-hero-images'] }),
  });

  const update = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<HeroImageRow> }) =>
      updateHeroImage(id, patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-hero-images'] }),
  });

  const del = useMutation({
    mutationFn: (id: string) => deleteHeroImage(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-hero-images'] }),
  });

  const reorder = useMutation({
    mutationFn: (ordered: { id: string; display_order: number }[]) =>
      reorderHeroImages(ordered),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-hero-images'] }),
  });

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploadError(null);
    const remaining = HERO_MAX_IMAGES - sorted.length;
    if (remaining <= 0) {
      setUploadError(`Máximo ${HERO_MAX_IMAGES} imágenes.`);
      return;
    }
    const list = Array.from(files).slice(0, remaining);
    try {
      setUploading(true);
      for (const file of list) {
        // secuencial para mantener display_order consecutivo
        await create.mutateAsync(file);
      }
    } catch (err) {
      console.error(err);
      const raw = err instanceof Error ? err.message : String(err);
      const friendly = /bucket not found/i.test(raw)
        ? 'El bucket de imágenes aún no existe en Supabase. Ejecuta supabase/cms_hero_images.sql en el SQL Editor para crearlo, luego vuelve a intentarlo.'
        : raw || 'No se pudo subir alguna imagen.';
      setUploadError(friendly);
    } finally {
      setUploading(false);
    }
  };

  const moveUp = async (index: number) => {
    if (index <= 0) return;
    const a = sorted[index - 1];
    const b = sorted[index];
    await reorder.mutateAsync([
      { id: a.id, display_order: b.display_order },
      { id: b.id, display_order: a.display_order },
    ]);
  };

  const moveDown = async (index: number) => {
    if (index >= sorted.length - 1) return;
    const a = sorted[index];
    const b = sorted[index + 1];
    await reorder.mutateAsync([
      { id: a.id, display_order: b.display_order },
      { id: b.id, display_order: a.display_order },
    ]);
  };

  const confirmAndDelete = async (row: HeroImageRow) => {
    if (!window.confirm('¿Eliminar esta imagen del hero? Esta acción no se puede deshacer.'))
      return;
    await del.mutateAsync(row.id);
  };

  return (
    <div>
      <div className="flex items-start justify-between mb-8 gap-4">
        <div>
          <h1 className="text-[26px] font-poppins font-semibold tracking-[-0.01em] text-dark-gray">
            Imágenes del hero
          </h1>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              handleFiles(e.target.files);
              e.target.value = '';
            }}
          />
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading || !canAddMore}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-key-green text-white font-semibold text-[13px] hover:bg-key-green/90 transition-colors disabled:opacity-50"
          >
            {uploading
              ? 'Subiendo…'
              : canAddMore
              ? '+ Subir imagen'
              : 'Máximo alcanzado'}
          </button>
        </div>
      </div>

      {uploadError && (
        <div className="mb-5 rounded-lg bg-red-500/10 ring-1 ring-red-500/25 px-4 py-3 text-[13px] text-red-700">
          {uploadError}
        </div>
      )}

      {isLoading && <p className="text-dark-gray/55">Cargando…</p>}
      {error && <p className="text-red-600">Error al cargar imágenes.</p>}

      {data && data.length === 0 && (
        <div className="rounded-xl bg-white ring-1 ring-dark-gray/[0.08] p-10 text-center">
          <p className="text-dark-gray/65 text-[14px]">Aún no has subido imágenes del hero.</p>
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="inline-block mt-4 text-key-green text-[13px] font-medium hover:underline disabled:opacity-50"
          >
            Subir la primera →
          </button>
        </div>
      )}

      {sorted.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {sorted.map((row, index) => (
            <article
              key={row.id}
              className="rounded-xl bg-white ring-1 ring-dark-gray/[0.08] overflow-hidden flex flex-col"
            >
              <div className="relative aspect-[16/10] bg-dark-gray/[0.04]">
                <img
                  src={row.image_url}
                  alt={row.image_alt ?? `Slide ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2 px-2 py-1 rounded bg-black/60 text-white text-[11px] font-medium tabular-nums">
                  #{index + 1}
                </div>
                {!row.is_active && (
                  <div className="absolute top-2 right-2 px-2 py-1 rounded bg-black/60 text-white text-[11px] font-medium">
                    Oculta
                  </div>
                )}
              </div>

              <div className="p-4 flex flex-col gap-3">
                <label className="block text-[12px] font-medium text-dark-gray/65">
                  Texto alternativo (SEO)
                </label>
                <input
                  defaultValue={row.image_alt ?? ''}
                  onBlur={(e) => {
                    const next = e.target.value.trim() === '' ? null : e.target.value;
                    if (next === (row.image_alt ?? null)) return;
                    update.mutate({ id: row.id, patch: { image_alt: next } });
                  }}
                  placeholder="Describe la imagen para lectores de pantalla"
                  className="w-full rounded-lg bg-white ring-1 ring-dark-gray/15 focus:ring-2 focus:ring-key-green focus:outline-none px-3 py-2 text-[13px] text-dark-gray placeholder-dark-gray/35 transition-all"
                />

                <label className="flex items-center gap-2 text-[13px] text-dark-gray/80 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={row.is_active}
                    onChange={(e) =>
                      update.mutate({ id: row.id, patch: { is_active: e.target.checked } })
                    }
                    className="w-4 h-4 rounded accent-key-green"
                  />
                  Visible en el sitio
                </label>

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => moveUp(index)}
                      disabled={index === 0 || reorder.isPending}
                      title="Subir"
                      className="p-1.5 rounded-md ring-1 ring-dark-gray/10 hover:bg-dark-gray/[0.06] disabled:opacity-40"
                    >
                      <ArrowUp />
                    </button>
                    <button
                      onClick={() => moveDown(index)}
                      disabled={index === sorted.length - 1 || reorder.isPending}
                      title="Bajar"
                      className="p-1.5 rounded-md ring-1 ring-dark-gray/10 hover:bg-dark-gray/[0.06] disabled:opacity-40"
                    >
                      <ArrowDown />
                    </button>
                  </div>
                  <button
                    onClick={() => confirmAndDelete(row)}
                    className="text-[12.5px] px-3 py-1.5 rounded-md bg-red-500/10 ring-1 ring-red-500/30 text-red-700 hover:bg-red-500/15 transition-colors"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

const ArrowUp = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M12 19V5M5 12l7-7 7 7" />
  </svg>
);

const ArrowDown = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M12 5v14M19 12l-7 7-7-7" />
  </svg>
);

export default HeroImagesAdmin;
