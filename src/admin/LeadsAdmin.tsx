import React, { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  deleteLead,
  listLeads,
  updateLeadNotes,
  updateLeadStatus,
  type LeadRow,
  type LeadStatus,
} from '../lib/queries/leads';

// ── Status vocabulary ──────────────────────────────────────────────
const STATUS_OPTIONS: { value: LeadStatus; label: string }[] = [
  { value: 'new', label: 'Nuevo' },
  { value: 'contacted', label: 'Contactado' },
  { value: 'qualified', label: 'Calificado' },
  { value: 'converted', label: 'Cerrado ✓' },
  { value: 'archived', label: 'Archivado' },
];

const STATUS_META: Record<LeadStatus, { label: string; dot: string; pill: string }> = {
  new: {
    label: 'Nuevo',
    dot: 'bg-blue-500',
    pill: 'bg-blue-500/10 text-blue-700 ring-blue-500/25',
  },
  contacted: {
    label: 'Contactado',
    dot: 'bg-amber-500',
    pill: 'bg-amber-500/10 text-amber-700 ring-amber-500/25',
  },
  qualified: {
    label: 'Calificado',
    dot: 'bg-violet-500',
    pill: 'bg-violet-500/10 text-violet-700 ring-violet-500/25',
  },
  converted: {
    label: 'Cerrado',
    dot: 'bg-key-green',
    pill: 'bg-key-green/15 text-key-green ring-key-green/30',
  },
  archived: {
    label: 'Archivado',
    dot: 'bg-dark-gray/40',
    pill: 'bg-dark-gray/[0.06] text-dark-gray/55 ring-dark-gray/15',
  },
};

// ── Utilities ──────────────────────────────────────────────────────
const formatDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString('es-PE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const formatDateTime = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleString('es-PE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const whatsappLink = (phone: string, name: string) => {
  const digits = phone.replace(/\D/g, '');
  const text = encodeURIComponent(
    `Hola ${name.split(' ')[0] ?? ''}, soy de Homie 🏠. Recibimos tu solicitud de proyección y queremos enviarte la estimación personalizada para tu propiedad.`,
  );
  return `https://wa.me/${digits}?text=${text}`;
};

const csvEscape = (v: string | number | boolean | null | undefined) => {
  if (v === null || v === undefined) return '';
  const s = String(v);
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
};

const downloadCsv = (rows: LeadRow[]) => {
  const header = [
    'created_at',
    'status',
    'name',
    'phone',
    'email',
    'city',
    'district',
    'address',
    'sqm',
    'bedrooms',
    'bathrooms',
    'guests',
    'source',
    'lang',
    'notes',
  ];
  const lines = [header.join(',')];
  for (const r of rows) {
    lines.push(
      [
        r.created_at,
        r.status,
        r.name,
        r.phone,
        r.email,
        r.city,
        r.district,
        r.address,
        r.sqm,
        r.bedrooms,
        r.bathrooms,
        r.guests,
        r.source,
        r.lang,
        r.notes ?? '',
      ]
        .map(csvEscape)
        .join(','),
    );
  }
  const blob = new Blob(['\uFEFF' + lines.join('\n')], {
    type: 'text/csv;charset=utf-8;',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `homie-leads-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

// ── Main page ──────────────────────────────────────────────────────
type StatusFilter = 'all' | LeadStatus;

const LeadsAdmin: React.FC = () => {
  const qc = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-leads'],
    queryFn: listLeads,
  });

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [search, setSearch] = useState('');
  const [openRow, setOpenRow] = useState<LeadRow | null>(null);

  const setStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: LeadStatus }) =>
      updateLeadStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-leads'] }),
  });

  const saveNotes = useMutation({
    mutationFn: ({ id, notes }: { id: string; notes: string }) =>
      updateLeadNotes(id, notes),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-leads'] }),
  });

  const removeLead = useMutation({
    mutationFn: (id: string) => deleteLead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-leads'] }),
  });

  // ── Counters per status (all-time, ignores search) ───────────────
  const counts = useMemo(() => {
    const base: Record<StatusFilter, number> = {
      all: 0,
      new: 0,
      contacted: 0,
      qualified: 0,
      converted: 0,
      archived: 0,
    };
    if (!data) return base;
    base.all = data.length;
    for (const l of data) base[l.status] += 1;
    return base;
  }, [data]);

  // ── Filtered list ────────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!data) return [];
    const q = search.trim().toLowerCase();
    return data.filter((l) => {
      if (statusFilter !== 'all' && l.status !== statusFilter) return false;
      if (!q) return true;
      return (
        l.name.toLowerCase().includes(q) ||
        l.email.toLowerCase().includes(q) ||
        l.phone.toLowerCase().includes(q) ||
        l.district.toLowerCase().includes(q) ||
        l.city.toLowerCase().includes(q) ||
        l.address.toLowerCase().includes(q)
      );
    });
  }, [data, statusFilter, search]);

  return (
    <div>
      {/* ── Header ───────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 mb-7">
        <div>
          <h1 className="text-[26px] font-poppins font-semibold tracking-[-0.01em] text-dark-gray">
            Proyecciones · Leads
          </h1>
          <p className="text-[13.5px] text-dark-gray/55 mt-1">
            Propietarios que solicitaron una estimación de ingresos desde el sitio.
          </p>
        </div>
        <button
          onClick={() => data && downloadCsv(filtered.length ? filtered : data)}
          disabled={!data || data.length === 0}
          className="shrink-0 inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white ring-1 ring-dark-gray/15 text-[13px] text-dark-gray hover:bg-dark-gray/[0.03] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="Exportar a CSV"
        >
          <DownloadIcon /> Exportar CSV
        </button>
      </div>

      {/* ── Status filter chips ─────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-1.5 mb-4">
        <FilterChip
          label="Todos"
          count={counts.all}
          active={statusFilter === 'all'}
          onClick={() => setStatusFilter('all')}
        />
        {STATUS_OPTIONS.map((s) => (
          <FilterChip
            key={s.value}
            label={STATUS_META[s.value].label}
            count={counts[s.value]}
            active={statusFilter === s.value}
            dot={STATUS_META[s.value].dot}
            onClick={() => setStatusFilter(s.value)}
          />
        ))}
      </div>

      {/* ── Search ──────────────────────────────────────────────── */}
      <div className="relative mb-5 max-w-md">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-gray/40">
          <SearchIcon />
        </span>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nombre, email, distrito…"
          className="w-full pl-9 pr-3 py-2 rounded-lg bg-white ring-1 ring-dark-gray/15 focus:ring-2 focus:ring-key-green focus:outline-none text-[13.5px] text-dark-gray placeholder-dark-gray/35 transition-all"
        />
      </div>

      {/* ── Loading / error states ──────────────────────────────── */}
      {isLoading && <p className="text-dark-gray/55 text-[13.5px]">Cargando…</p>}
      {error && (
        <p className="text-red-600 text-[13.5px]">Error al cargar los leads.</p>
      )}

      {/* ── Empty state ─────────────────────────────────────────── */}
      {data && data.length === 0 && (
        <div className="rounded-xl bg-white ring-1 ring-dark-gray/[0.08] p-12 text-center">
          <div className="w-12 h-12 mx-auto rounded-full bg-key-green/10 grid place-items-center mb-3 text-key-green">
            <InboxIcon />
          </div>
          <p className="text-dark-gray font-medium text-[14.5px]">
            Aún no hay proyecciones
          </p>
          <p className="text-dark-gray/55 text-[13px] mt-1">
            Cuando alguien envíe el formulario desde el sitio, aparecerá aquí.
          </p>
        </div>
      )}

      {/* ── Filtered-empty state ────────────────────────────────── */}
      {data && data.length > 0 && filtered.length === 0 && (
        <div className="rounded-xl bg-white ring-1 ring-dark-gray/[0.08] p-10 text-center">
          <p className="text-dark-gray/60 text-[13.5px]">
            No hay leads que coincidan con los filtros.
          </p>
          <button
            onClick={() => {
              setStatusFilter('all');
              setSearch('');
            }}
            className="mt-3 text-[12.5px] text-key-green hover:underline"
          >
            Limpiar filtros
          </button>
        </div>
      )}

      {/* ── Table ───────────────────────────────────────────────── */}
      {data && filtered.length > 0 && (
        <div className="rounded-xl ring-1 ring-dark-gray/[0.08] bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-[13.5px]">
              <thead>
                <tr className="text-left text-[12px] text-dark-gray/55 bg-dark-gray/[0.02]">
                  <th className="px-5 py-3 font-medium whitespace-nowrap">Fecha</th>
                  <th className="px-5 py-3 font-medium">Propietario</th>
                  <th className="px-5 py-3 font-medium">Propiedad</th>
                  <th className="px-5 py-3 font-medium">Detalles</th>
                  <th className="px-5 py-3 font-medium">Estado</th>
                  <th className="px-5 py-3 font-medium text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => (
                  <tr
                    key={row.id}
                    className="border-t border-dark-gray/[0.06] hover:bg-dark-gray/[0.02] transition-colors"
                  >
                    <td className="px-5 py-3.5 text-dark-gray/70 whitespace-nowrap tabular-nums">
                      {formatDate(row.created_at)}
                    </td>
                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => setOpenRow(row)}
                        className="text-left block group"
                      >
                        <p className="text-dark-gray font-medium leading-tight group-hover:text-key-green transition-colors">
                          {row.name}
                        </p>
                        <p className="text-[12.5px] text-dark-gray/55 mt-0.5 truncate max-w-[220px]">
                          {row.email}
                        </p>
                      </button>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-dark-gray leading-tight">
                        {row.district}
                        <span className="text-dark-gray/40">, </span>
                        <span className="text-dark-gray/60">{row.city}</span>
                      </p>
                      <p className="text-[12.5px] text-dark-gray/50 mt-0.5 truncate max-w-[240px]">
                        {row.address}
                      </p>
                    </td>
                    <td className="px-5 py-3.5 text-dark-gray/75">
                      <div className="flex flex-wrap gap-1.5">
                        <TinyTag>{row.sqm} m²</TinyTag>
                        <TinyTag>
                          {row.bedrooms} hab · {row.bathrooms} baños
                        </TinyTag>
                        <TinyTag>{row.guests} huésp.</TinyTag>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusSelect
                        value={row.status}
                        onChange={(next) =>
                          setStatus.mutate({ id: row.id, status: next })
                        }
                        pending={
                          setStatus.isPending &&
                          setStatus.variables?.id === row.id
                        }
                      />
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="inline-flex items-center gap-1">
                        <a
                          href={whatsappLink(row.phone, row.name)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-md text-dark-gray/55 hover:text-key-green hover:bg-key-green/10 transition-colors"
                          title="Contactar por WhatsApp"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <WhatsAppIcon />
                        </a>
                        <a
                          href={`mailto:${row.email}`}
                          className="p-2 rounded-md text-dark-gray/55 hover:text-dark-gray hover:bg-dark-gray/[0.06] transition-colors"
                          title="Enviar email"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MailIcon />
                        </a>
                        <button
                          onClick={() => setOpenRow(row)}
                          className="text-[12.5px] px-2.5 py-1.5 rounded-md bg-dark-gray/[0.04] ring-1 ring-dark-gray/10 hover:bg-dark-gray/[0.08] transition-colors ml-1"
                        >
                          Ver
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-2.5 text-[12px] text-dark-gray/50 bg-dark-gray/[0.01] border-t border-dark-gray/[0.06]">
            Mostrando {filtered.length} de {data.length}{' '}
            {data.length === 1 ? 'lead' : 'leads'}
          </div>
        </div>
      )}

      {/* ── Detail drawer ───────────────────────────────────────── */}
      {openRow && (
        <LeadDetailDialog
          lead={openRow}
          onClose={() => setOpenRow(null)}
          onStatusChange={(status) =>
            setStatus.mutate(
              { id: openRow.id, status },
              {
                onSuccess: () =>
                  setOpenRow((cur) => (cur ? { ...cur, status } : cur)),
              },
            )
          }
          onNotesSave={(notes) =>
            saveNotes.mutate(
              { id: openRow.id, notes },
              {
                onSuccess: () =>
                  setOpenRow((cur) => (cur ? { ...cur, notes } : cur)),
              },
            )
          }
          notesSaving={saveNotes.isPending}
          onDelete={async () => {
            const ok = window.confirm(
              `¿Eliminar el lead de "${openRow.name}"? Esta acción no se puede deshacer.`,
            );
            if (!ok) return;
            await removeLead.mutateAsync(openRow.id);
            setOpenRow(null);
          }}
          deleting={removeLead.isPending}
        />
      )}
    </div>
  );
};

// ── Filter chip ───────────────────────────────────────────────────
const FilterChip: React.FC<{
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
  dot?: string;
}> = ({ label, count, active, onClick, dot }) => (
  <button
    onClick={onClick}
    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[12.5px] font-medium transition-colors ${
      active
        ? 'bg-dark-gray text-white'
        : 'bg-white text-dark-gray/75 ring-1 ring-dark-gray/12 hover:bg-dark-gray/[0.04]'
    }`}
  >
    {dot && (
      <span
        className={`w-1.5 h-1.5 rounded-full ${dot} ${active ? 'opacity-90' : ''}`}
      />
    )}
    <span>{label}</span>
    <span
      className={`tabular-nums text-[11px] ${
        active ? 'text-white/65' : 'text-dark-gray/45'
      }`}
    >
      {count}
    </span>
  </button>
);

// ── Tiny property tag ─────────────────────────────────────────────
const TinyTag: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-dark-gray/[0.05] text-[11.5px] text-dark-gray/70 tabular-nums">
    {children}
  </span>
);

// ── Inline status select ──────────────────────────────────────────
const StatusSelect: React.FC<{
  value: LeadStatus;
  onChange: (v: LeadStatus) => void;
  pending?: boolean;
}> = ({ value, onChange, pending }) => {
  const meta = STATUS_META[value];
  return (
    <div className="relative inline-flex">
      <span
        className={`pointer-events-none inline-flex items-center gap-1.5 pl-2 pr-6 py-1 rounded-md ring-1 text-[12px] font-medium ${meta.pill} ${pending ? 'opacity-60' : ''}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
        {meta.label}
      </span>
      <span className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-current opacity-70">
        <Caret />
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as LeadStatus)}
        className="absolute inset-0 opacity-0 cursor-pointer"
        aria-label="Cambiar estado"
        disabled={pending}
      >
        {STATUS_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
};

// ── Detail dialog ─────────────────────────────────────────────────
const LeadDetailDialog: React.FC<{
  lead: LeadRow;
  onClose: () => void;
  onStatusChange: (s: LeadStatus) => void;
  onNotesSave: (notes: string) => void;
  notesSaving: boolean;
  onDelete: () => void;
  deleting: boolean;
}> = ({
  lead,
  onClose,
  onStatusChange,
  onNotesSave,
  notesSaving,
  onDelete,
  deleting,
}) => {
  const [notes, setNotes] = useState(lead.notes ?? '');
  const notesDirty = (lead.notes ?? '') !== notes;

  // ESC to close
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-gray/30 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl ring-1 ring-dark-gray/[0.08] shadow-[0_30px_80px_-20px_rgba(40,40,40,0.35)] w-full max-w-2xl max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-dark-gray/[0.06] flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-dark-gray/45 mb-1">
              Lead · {formatDateTime(lead.created_at)}
            </p>
            <h2 className="text-[20px] font-semibold text-dark-gray leading-tight truncate">
              {lead.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-dark-gray/50 hover:text-dark-gray text-[22px] leading-none flex-shrink-0"
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Status + quick actions */}
          <div className="flex flex-wrap items-center gap-2 justify-between">
            <StatusSelect value={lead.status} onChange={onStatusChange} />
            <div className="flex items-center gap-1.5">
              <a
                href={whatsappLink(lead.phone, lead.name)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-key-green text-white text-[12.5px] font-medium hover:bg-key-green/90 transition-colors"
              >
                <WhatsAppIcon /> WhatsApp
              </a>
              <a
                href={`mailto:${lead.email}`}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ring-1 ring-dark-gray/15 bg-white text-dark-gray text-[12.5px] font-medium hover:bg-dark-gray/[0.04] transition-colors"
              >
                <MailIcon /> Email
              </a>
              <a
                href={`tel:${lead.phone}`}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ring-1 ring-dark-gray/15 bg-white text-dark-gray text-[12.5px] font-medium hover:bg-dark-gray/[0.04] transition-colors"
              >
                <PhoneIcon /> Llamar
              </a>
            </div>
          </div>

          {/* Contact */}
          <Section title="Contacto">
            <InfoGrid>
              <Info label="Nombre" value={lead.name} />
              <Info label="Teléfono" value={lead.phone} copy mono />
              <Info label="Email" value={lead.email} copy mono />
            </InfoGrid>
          </Section>

          {/* Location */}
          <Section title="Ubicación">
            <InfoGrid>
              <Info label="Ciudad" value={lead.city} />
              <Info label="Distrito" value={lead.district} />
            </InfoGrid>
            <div className="mt-3">
              <Info label="Dirección" value={lead.address} />
            </div>
          </Section>

          {/* Property */}
          <Section title="Detalles de la propiedad">
            <InfoGrid cols={4}>
              <Info label="Metraje" value={`${lead.sqm} m²`} />
              <Info label="Habitaciones" value={lead.bedrooms} />
              <Info label="Baños" value={lead.bathrooms} />
              <Info label="Capacidad" value={`${lead.guests} huéspedes`} />
            </InfoGrid>
          </Section>

          {/* Meta */}
          <Section title="Origen">
            <InfoGrid cols={3}>
              <Info label="Fuente" value={sourceLabel(lead.source)} />
              <Info
                label="Idioma"
                value={lead.lang === 'es' ? 'Español' : 'English'}
              />
              <Info
                label="Términos"
                value={lead.terms_accepted ? 'Aceptados ✓' : 'No aceptados'}
              />
            </InfoGrid>
            {(lead.referrer || lead.user_agent) && (
              <div className="mt-3 space-y-2 text-[11.5px] text-dark-gray/50 font-mono break-all">
                {lead.referrer && (
                  <p>
                    <span className="text-dark-gray/40">referrer:</span>{' '}
                    {lead.referrer}
                  </p>
                )}
                {lead.user_agent && (
                  <p>
                    <span className="text-dark-gray/40">ua:</span>{' '}
                    {lead.user_agent}
                  </p>
                )}
              </div>
            )}
          </Section>

          {/* Notes */}
          <Section title="Notas internas">
            <textarea
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Anota el seguimiento, la visita, objeciones…"
              className="w-full rounded-lg bg-white ring-1 ring-dark-gray/15 focus:ring-2 focus:ring-key-green focus:outline-none px-3.5 py-2.5 text-[14px] text-dark-gray placeholder-dark-gray/35 transition-all resize-y"
            />
            <div className="mt-2 flex items-center justify-end gap-2">
              {notesDirty && (
                <button
                  onClick={() => setNotes(lead.notes ?? '')}
                  className="text-[12.5px] text-dark-gray/60 hover:text-dark-gray"
                >
                  Descartar
                </button>
              )}
              <button
                onClick={() => onNotesSave(notes)}
                disabled={!notesDirty || notesSaving}
                className="text-[12.5px] font-semibold px-3 py-1.5 rounded-md bg-dark-gray text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-dark-gray/90 transition-colors"
              >
                {notesSaving ? 'Guardando…' : 'Guardar notas'}
              </button>
            </div>
          </Section>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-dark-gray/[0.06] flex items-center justify-between gap-3 bg-dark-gray/[0.015]">
          <button
            onClick={onDelete}
            disabled={deleting}
            className="text-[12.5px] px-3 py-2 rounded-lg bg-red-500/10 ring-1 ring-red-500/30 text-red-700 hover:bg-red-500/15 disabled:opacity-50 transition-colors"
          >
            {deleting ? 'Eliminando…' : 'Eliminar lead'}
          </button>
          <button
            onClick={onClose}
            className="text-[13px] px-4 py-2 rounded-lg text-dark-gray/70 hover:text-dark-gray"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

const sourceLabel = (s: LeadRow['source']) =>
  s === 'hero_modal'
    ? 'Modal Hero'
    : s === 'contact_form'
      ? 'Formulario Contacto'
      : 'Otro';

// ── Detail building blocks ────────────────────────────────────────
const Section: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <div>
    <h3 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-dark-gray/50 mb-2.5">
      {title}
    </h3>
    {children}
  </div>
);

const InfoGrid: React.FC<{ children: React.ReactNode; cols?: 2 | 3 | 4 }> = ({
  children,
  cols = 2,
}) => {
  const map: Record<number, string> = {
    2: 'sm:grid-cols-2',
    3: 'sm:grid-cols-3',
    4: 'sm:grid-cols-4',
  };
  return (
    <div className={`grid grid-cols-1 ${map[cols]} gap-3`}>{children}</div>
  );
};

const Info: React.FC<{
  label: string;
  value: string;
  copy?: boolean;
  mono?: boolean;
}> = ({ label, value, copy, mono }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      // ignore
    }
  };
  return (
    <div>
      <p className="text-[11px] font-medium uppercase tracking-[0.06em] text-dark-gray/45 mb-1">
        {label}
      </p>
      <div className="flex items-start gap-2">
        <p
          className={`flex-1 min-w-0 text-[13.5px] text-dark-gray break-words ${mono ? 'font-mono' : ''}`}
        >
          {value}
        </p>
        {copy && (
          <button
            onClick={handleCopy}
            className="flex-shrink-0 text-[11px] text-dark-gray/50 hover:text-key-green transition-colors"
            title="Copiar"
          >
            {copied ? '✓' : <CopyIcon />}
          </button>
        )}
      </div>
    </div>
  );
};

// ── Icons ─────────────────────────────────────────────────────────
const SearchIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
);
const DownloadIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M12 3v12M6 11l6 6 6-6M4 21h16" />
  </svg>
);
const InboxIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M22 12h-6l-2 3h-4l-2-3H2" />
    <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11Z" />
  </svg>
);
const Caret = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="m6 9 6 6 6-6" />
  </svg>
);
const WhatsAppIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M20.52 3.48A11.86 11.86 0 0 0 12 0C5.37 0 0 5.37 0 12a11.9 11.9 0 0 0 1.64 6L0 24l6.18-1.62A12 12 0 0 0 12 24c6.63 0 12-5.37 12-12a11.86 11.86 0 0 0-3.48-8.52ZM12 22a10 10 0 0 1-5.1-1.4l-.36-.22-3.66.96.98-3.57-.24-.37A10 10 0 1 1 22 12a10 10 0 0 1-10 10Zm5.47-7.5c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15s-.77.96-.94 1.16c-.17.2-.34.23-.64.08a8.16 8.16 0 0 1-2.4-1.48 9 9 0 0 1-1.66-2.06c-.17-.3 0-.45.13-.6.13-.13.3-.35.45-.52a2 2 0 0 0 .3-.5.55.55 0 0 0 0-.52c-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.5l-.57-.01a1.1 1.1 0 0 0-.8.37 3.35 3.35 0 0 0-1.04 2.48 5.8 5.8 0 0 0 1.22 3.12 13.33 13.33 0 0 0 5.09 4.5c.71.3 1.27.48 1.7.61a4.12 4.12 0 0 0 1.87.12 3.06 3.06 0 0 0 2-1.41 2.48 2.48 0 0 0 .17-1.41c-.07-.12-.27-.2-.57-.35Z" />
  </svg>
);
const MailIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3 7 9 7 9-7" />
  </svg>
);
const PhoneIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.1 9.9a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.1-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92Z" />
  </svg>
);
const CopyIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <rect x="9" y="9" width="13" height="13" rx="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

export default LeadsAdmin;
