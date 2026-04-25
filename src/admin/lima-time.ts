export const LIMA_TZ = 'America/Lima';

export function nowInLimaIso(): string {
  return new Date().toISOString();
}

export function toLimaInputValue(iso: string | undefined | null): string {
  const d = iso ? new Date(iso) : new Date();
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: LIMA_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(d);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '00';
  return `${get('year')}-${get('month')}-${get('day')}T${get('hour')}:${get('minute')}`;
}

export function limaInputToIso(value: string): string {
  const [datePart, timePart = '00:00'] = value.split('T');
  const [y, m, d] = datePart.split('-').map(Number);
  const [hh, mm] = timePart.split(':').map(Number);
  const asUtc = Date.UTC(y, m - 1, d, hh, mm, 0);
  const probe = new Date(asUtc);
  const offsetMinutes = getLimaOffsetMinutes(probe);
  return new Date(asUtc - offsetMinutes * 60_000).toISOString();
}

function getLimaOffsetMinutes(date: Date): number {
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone: LIMA_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
  const parts = dtf.formatToParts(date);
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value ?? 0);
  const asUtc = Date.UTC(
    get('year'),
    get('month') - 1,
    get('day'),
    get('hour'),
    get('minute'),
    get('second'),
  );
  return (asUtc - date.getTime()) / 60_000;
}

export function formatLimaDisplay(iso: string): string {
  return new Intl.DateTimeFormat('es-PE', {
    timeZone: LIMA_TZ,
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}
