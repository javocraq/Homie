import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, Check, TrendingUp } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { useLanguage } from '../i18n/LanguageContext';
import { submitLead, type LeadInsert } from '../lib/queries/leads';

// ─────────────────────────────────────────────────────────────────────────
//  Embedded page version of the lead wizard (the long form rendered inside
//  a section of the homepage). Shares its behavior with the hero modal
//  (`ContactModal.tsx`) but keeps its own draft storage and page-level
//  chrome (no backdrop, ESC, body-lock, close button, exit confirmation).
//
//  Functional parity with ContactModal:
//   • Progressive 3-step wizard with collapse/expand reveals.
//   • Smart defaults in property details (first option pre-selected).
//   • Draft auto-save to localStorage (separate key from the modal).
//   • Dual-persistence on submit (Supabase + Make.com webhook) in parallel.
//   • Processing phase (~2.7s narrative beat) → success phase.
//   • Inline SuccessView with the user's email echoed back — no redirect.
//
//  Deliberate differences from the modal:
//   • No modal shell: no ESC handler, no body-lock, no backdrop, no close.
//   • No autofocus on mount — would hijack page scroll to this section.
//   • SuccessView's primary CTA scrolls the user back to the top of the
//     page instead of closing a modal.
//   • Draft key is `homie-lead-draft-embed-v1` so the two forms are
//     independent (filling one doesn't prefill the other).
// ─────────────────────────────────────────────────────────────────────────

type FormState = {
  nombre: string;
  telefono: string;
  email: string;
  ciudad: string;
  distrito: string;
  direccion: string;
  metraje: string;
  habitaciones: string;
  banos: string;
  capacidad: string;
  aceptaTerminos: boolean;
};

// Smart defaults for the property details step — same strategy as the
// modal: pre-select the first option so users whose unit matches the
// common case (compact 1-bed / 1-bath) don't open four dropdowns. MUST
// match the first `<option>` value below or the select will desync.
const initialState: FormState = {
  nombre: '',
  telefono: '',
  email: '',
  ciudad: 'Lima',
  distrito: '',
  direccion: '',
  metraje: 'Menos de 50',
  habitaciones: '1',
  banos: '1',
  capacidad: '1-2',
  aceptaTerminos: false,
};

// ── Draft persistence ─────────────────────────────────────────────────────
const DRAFT_KEY = 'homie-lead-draft-embed-v1';

const loadDraft = (): FormState => {
  if (typeof window === 'undefined') return initialState;
  try {
    const raw = window.localStorage.getItem(DRAFT_KEY);
    if (!raw) return initialState;
    const parsed = JSON.parse(raw) as Partial<FormState>;
    return { ...initialState, ...parsed, aceptaTerminos: false };
  } catch {
    return initialState;
  }
};

const saveDraft = (state: FormState) => {
  if (typeof window === 'undefined') return;
  try {
    const { aceptaTerminos: _omit, ...persistable } = state;
    window.localStorage.setItem(DRAFT_KEY, JSON.stringify(persistable));
  } catch {
    // quota / disabled storage — silently ignore
  }
};

const clearDraft = () => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(DRAFT_KEY);
  } catch {
    // ignore
  }
};

/**
 * Dirty iff something differs from the starting state. Compared against
 * `initialState` (not `''`) so property-detail smart defaults don't flag
 * an untouched form as dirty — same footgun we hit in ContactModal.
 */
const isDirtyForm = (f: FormState) =>
  f.nombre.trim() !== initialState.nombre ||
  f.telefono.trim() !== initialState.telefono ||
  f.email.trim() !== initialState.email ||
  f.ciudad !== initialState.ciudad ||
  f.distrito !== initialState.distrito ||
  f.direccion.trim() !== initialState.direccion ||
  f.metraje !== initialState.metraje ||
  f.habitaciones !== initialState.habitaciones ||
  f.banos !== initialState.banos ||
  f.capacidad !== initialState.capacidad;

// ── Validation ────────────────────────────────────────────────────────────
const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
const isValidPhone = (v: string) => v.replace(/\D/g, '').length >= 7;

const contactValid = (f: FormState) =>
  f.nombre.trim().length >= 2 &&
  isValidPhone(f.telefono) &&
  isValidEmail(f.email);

const locationValid = (f: FormState) =>
  f.ciudad.trim().length >= 2 &&
  f.distrito.trim().length > 0 &&
  f.direccion.trim().length >= 4;

const propertyValid = (f: FormState) =>
  f.metraje.length > 0 &&
  f.habitaciones.length > 0 &&
  f.banos.length > 0 &&
  f.capacidad.length > 0;

const ContactForm: React.FC = () => {
  const { toast } = useToast();
  const { t, lang } = useLanguage();
  const [form, setForm] = useState<FormState>(() => loadDraft());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [phase, setPhase] = useState<'form' | 'processing' | 'success'>('form');
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const rootRef = useRef<HTMLDivElement>(null);

  // Persist the draft on every edit.
  useEffect(() => {
    if (isDirtyForm(form)) saveDraft(form);
  }, [form]);

  // Step-completion memos drive the collapse/expand and the final submit.
  const step1Done = useMemo(() => contactValid(form), [form]);
  const step2Done = useMemo(
    () => step1Done && locationValid(form),
    [step1Done, form],
  );
  const step3Done = useMemo(
    () => step2Done && propertyValid(form),
    [step2Done, form],
  );
  const canSubmit = step3Done && form.aceptaTerminos && !isSubmitting;

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((p) => ({ ...p, [key]: value }));
  };

  const markTouched = (name: string) =>
    setTouched((t) => ({ ...t, [name]: true }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) {
      if (!form.aceptaTerminos) markTouched('aceptaTerminos');
      return;
    }

    setIsSubmitting(true);

    const leadPayload: LeadInsert = {
      name: form.nombre,
      phone: form.telefono,
      email: form.email,
      city: form.ciudad,
      district: form.distrito,
      address: form.direccion,
      sqm: form.metraje,
      bedrooms: form.habitaciones,
      bathrooms: form.banos,
      guests: form.capacidad,
      terms_accepted: form.aceptaTerminos,
      source: 'contact_form',
      lang: lang === 'en' ? 'en' : 'es',
      user_agent:
        typeof navigator !== 'undefined' ? navigator.userAgent : null,
      referrer: typeof document !== 'undefined' ? document.referrer : null,
    };

    const webhookPayload = {
      nombre: form.nombre,
      telefono: form.telefono,
      email: form.email,
      direccion: form.direccion,
      ciudad: form.ciudad,
      distrito: form.distrito,
      habitaciones: form.habitaciones,
      metraje: form.metraje,
      banos: form.banos,
      capacidad: form.capacidad,
      aceptaTerminos: form.aceptaTerminos ? 'Sí' : 'No',
      source: 'contact_form',
      lang,
    };

    const results = await Promise.allSettled([
      submitLead(leadPayload),
      fetch('https://hook.us1.make.com/8elap4k96vp4krwzng265tpgevgfkkch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(webhookPayload),
        mode: 'no-cors',
      }),
    ]);

    // See ContactModal for rationale — allSettled hides per-promise failures
    // and we just learned that a silent Supabase reject can empty the CMS.
    const [supabaseRes, webhookRes] = results;
    if (supabaseRes.status === 'rejected') {
      // eslint-disable-next-line no-console
      console.error('[lead:contact_form] Supabase insert failed:', supabaseRes.reason);
    }
    if (webhookRes.status === 'rejected') {
      // eslint-disable-next-line no-console
      console.error('[lead:contact_form] Make.com webhook failed:', webhookRes.reason);
    }

    const allFailed = results.every((r) => r.status === 'rejected');
    if (allFailed) {
      setIsSubmitting(false);
      toast({
        title: t('form.toast.error.title'),
        description: t('form.toast.error.desc'),
        variant: 'destructive',
      });
      return;
    }

    clearDraft();
    setIsSubmitting(false);
    setPhase('processing');
    // Keep the success state visible at the top of this section so the
    // user doesn't have to scroll to find confirmation.
    window.setTimeout(() => {
      rootRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 60);
  };

  const resetForm = () => {
    setForm(initialState);
    setTouched({});
    setPhase('form');
    // Scroll the user back to the top of the page so the form reset feels
    // like a clean slate, not just a state change in place.
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ── Shared input visuals ──────────────────────────────────────────────
  const inputBase =
    'w-full h-12 rounded-xl bg-white border px-4 text-[15px] text-dark-gray placeholder:text-dark-gray/35 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-key-green/15';
  const inputOk = `${inputBase} border-dark-gray/15 focus:border-key-green`;
  const inputErr = `${inputBase} border-red-400 focus:border-red-500 focus:ring-red-200/30`;
  const selectExtras =
    " appearance-none pr-10 bg-[url(\"data:image/svg+xml;charset=UTF-8,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%2024%2024'%20fill='none'%20stroke='%23282828'%20stroke-width='2'%20stroke-linecap='round'%20stroke-linejoin='round'%3e%3cpolyline%20points='6,9%2012,15%2018,9'%3e%3c/polyline%3e%3c/svg%3e\")] bg-no-repeat bg-[length:16px] bg-[position:right_14px_center]";

  const inputClass = (name: keyof FormState, isValid: boolean) =>
    touched[name] && !isValid ? inputErr : inputOk;

  return (
    <div
      id="form"
      ref={rootRef}
      className="relative bg-white rounded-[28px] ring-1 ring-dark-gray/[0.08] shadow-[0_30px_80px_-40px_rgba(40,40,40,0.25)] overflow-hidden"
    >
      {/* Decorative top band — brand continuity on the full page card */}
      <div className="h-1.5 bg-gradient-to-r from-key-green via-key-green/60 to-key-green" />

      {phase === 'processing' ? (
        <ProcessingView onComplete={() => setPhase('success')} />
      ) : phase === 'success' ? (
        <SuccessView email={form.email} onReset={resetForm} />
      ) : (
        <form
          onSubmit={handleSubmit}
          className="p-7 md:p-10 space-y-7"
          noValidate
        >
          {/* ── Step 1 · Contacto ── */}
          <StepCard
            kicker="01"
            title={t('form.section.contact.title')}
            subtitle={t('form.section.contact.subtitle')}
            state={step1Done ? 'done' : 'active'}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field label={t('form.nombre.label')} htmlFor="f-nombre">
                <input
                  id="f-nombre"
                  type="text"
                  name="nombre"
                  placeholder={t('form.nombre.placeholder')}
                  autoComplete="name"
                  required
                  className={inputClass(
                    'nombre',
                    form.nombre.trim().length >= 2,
                  )}
                  onChange={(e) => setField('nombre', e.target.value)}
                  onBlur={() => markTouched('nombre')}
                  value={form.nombre}
                />
              </Field>
              <Field label={t('form.telefono.label')} htmlFor="f-telefono">
                <input
                  id="f-telefono"
                  type="tel"
                  name="telefono"
                  placeholder={t('form.telefono.placeholder')}
                  autoComplete="tel"
                  required
                  className={inputClass(
                    'telefono',
                    isValidPhone(form.telefono),
                  )}
                  onChange={(e) => setField('telefono', e.target.value)}
                  onBlur={() => markTouched('telefono')}
                  value={form.telefono}
                />
              </Field>
              <Field
                label={t('form.email.label')}
                htmlFor="f-email"
                className="md:col-span-2"
              >
                <input
                  id="f-email"
                  type="email"
                  name="email"
                  placeholder={t('form.email.placeholder')}
                  autoComplete="email"
                  required
                  className={inputClass('email', isValidEmail(form.email))}
                  onChange={(e) => setField('email', e.target.value)}
                  onBlur={() => markTouched('email')}
                  value={form.email}
                />
              </Field>
            </div>
          </StepCard>

          {/* ── Step 2 · Ubicación ── */}
          <CollapseReveal open={step1Done}>
            <StepCard
              kicker="02"
              title={t('form.section.location.title')}
              subtitle={t('form.section.location.subtitle')}
              state={step2Done ? 'done' : 'active'}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Field label={t('form.ciudad.label')} htmlFor="f-ciudad">
                  <input
                    id="f-ciudad"
                    type="text"
                    name="ciudad"
                    placeholder={t('form.ciudad.placeholder')}
                    autoComplete="address-level2"
                    required
                    className={inputClass(
                      'ciudad',
                      form.ciudad.trim().length >= 2,
                    )}
                    onChange={(e) => setField('ciudad', e.target.value)}
                    onBlur={() => markTouched('ciudad')}
                    value={form.ciudad}
                  />
                </Field>
                <Field label={t('form.distrito.label')} htmlFor="f-distrito">
                  <select
                    id="f-distrito"
                    name="distrito"
                    required
                    className={
                      inputClass('distrito', form.distrito.length > 0) +
                      selectExtras
                    }
                    onChange={(e) => setField('distrito', e.target.value)}
                    onBlur={() => markTouched('distrito')}
                    value={form.distrito}
                  >
                    <option value="" disabled>
                      {t('form.distrito.placeholder')}
                    </option>
                    <option value="San Isidro">San Isidro</option>
                    <option value="Miraflores">Miraflores</option>
                    <option value="Barranco">Barranco</option>
                    <option value="San Miguel">San Miguel</option>
                    <option value="Magdalena del Mar">Magdalena del Mar</option>
                    <option value="Otro">{t('form.distrito.other')}</option>
                  </select>
                </Field>
                <Field
                  label={t('form.direccion.label')}
                  htmlFor="f-direccion"
                  hint={t('form.hint.direccion') as string}
                  className="md:col-span-2"
                >
                  <input
                    id="f-direccion"
                    type="text"
                    name="direccion"
                    placeholder={t('form.direccion.placeholder')}
                    autoComplete="street-address"
                    required
                    className={inputClass(
                      'direccion',
                      form.direccion.trim().length >= 4,
                    )}
                    onChange={(e) => setField('direccion', e.target.value)}
                    onBlur={() => markTouched('direccion')}
                    value={form.direccion}
                  />
                </Field>
              </div>
            </StepCard>
          </CollapseReveal>

          {!step1Done && (
            <CollapsedStep
              kicker="02"
              title={t('form.section.location.title')}
              subtitle={t('form.section.location.subtitle')}
            />
          )}

          {/* ── Step 3 · Detalles de la propiedad ── */}
          <CollapseReveal open={step2Done}>
            <StepCard
              kicker="03"
              title={t('form.section.property.title')}
              subtitle={t('form.section.property.subtitle')}
              state={step3Done ? 'done' : 'active'}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Field label={t('form.metraje.label')} htmlFor="f-metraje">
                  <select
                    id="f-metraje"
                    name="metraje"
                    required
                    className={
                      inputClass('metraje', form.metraje.length > 0) +
                      selectExtras
                    }
                    onChange={(e) => setField('metraje', e.target.value)}
                    onBlur={() => markTouched('metraje')}
                    value={form.metraje}
                  >
                    <option value="Menos de 50">{t('form.metraje.lt50')}</option>
                    <option value="50-80">{t('form.metraje.50-80')}</option>
                    <option value="80-120">{t('form.metraje.80-120')}</option>
                    <option value="120-150">{t('form.metraje.120-150')}</option>
                    <option value="Más de 150">{t('form.metraje.gt150')}</option>
                  </select>
                </Field>
                <Field
                  label={t('form.habitaciones.label')}
                  htmlFor="f-habitaciones"
                >
                  <select
                    id="f-habitaciones"
                    name="habitaciones"
                    required
                    className={
                      inputClass(
                        'habitaciones',
                        form.habitaciones.length > 0,
                      ) + selectExtras
                    }
                    onChange={(e) => setField('habitaciones', e.target.value)}
                    onBlur={() => markTouched('habitaciones')}
                    value={form.habitaciones}
                  >
                    <option value="1">{t('form.habitaciones.1')}</option>
                    <option value="2">{t('form.habitaciones.2')}</option>
                    <option value="3">{t('form.habitaciones.3')}</option>
                    <option value="4+">{t('form.habitaciones.4+')}</option>
                  </select>
                </Field>
                <Field label={t('form.banos.label')} htmlFor="f-banos">
                  <select
                    id="f-banos"
                    name="banos"
                    required
                    className={
                      inputClass('banos', form.banos.length > 0) + selectExtras
                    }
                    onChange={(e) => setField('banos', e.target.value)}
                    onBlur={() => markTouched('banos')}
                    value={form.banos}
                  >
                    <option value="1">{t('form.banos.1')}</option>
                    <option value="2">{t('form.banos.2')}</option>
                    <option value="3+">{t('form.banos.3+')}</option>
                  </select>
                </Field>
                <Field label={t('form.capacidad.label')} htmlFor="f-capacidad">
                  <select
                    id="f-capacidad"
                    name="capacidad"
                    required
                    className={
                      inputClass('capacidad', form.capacidad.length > 0) +
                      selectExtras
                    }
                    onChange={(e) => setField('capacidad', e.target.value)}
                    onBlur={() => markTouched('capacidad')}
                    value={form.capacidad}
                  >
                    <option value="1-2">{t('form.capacidad.1-2')}</option>
                    <option value="3-4">{t('form.capacidad.3-4')}</option>
                    <option value="5-6">{t('form.capacidad.5-6')}</option>
                    <option value="7+">{t('form.capacidad.7+')}</option>
                  </select>
                </Field>
              </div>
            </StepCard>
          </CollapseReveal>

          {!step2Done && step1Done && (
            <CollapsedStep
              kicker="03"
              title={t('form.section.property.title')}
              subtitle={t('form.section.property.subtitle')}
            />
          )}

          {/* ── Terms + submit ── */}
          <div className="pt-4 border-t border-dark-gray/[0.08]">
            <div
              className={`flex items-start gap-3 pt-6 pb-6 transition-opacity duration-300 ${
                step3Done ? 'opacity-100' : 'opacity-55'
              }`}
            >
              <Checkbox
                id="f-terminos"
                checked={form.aceptaTerminos}
                disabled={!step3Done}
                onCheckedChange={(c) => {
                  setField('aceptaTerminos', Boolean(c));
                  markTouched('aceptaTerminos');
                }}
                className="mt-0.5 h-5 w-5 rounded-md data-[state=checked]:bg-key-green data-[state=checked]:border-key-green"
              />
              <Label
                htmlFor="f-terminos"
                className={`text-[13.5px] leading-relaxed text-medium-gray ${
                  step3Done ? 'cursor-pointer' : 'cursor-not-allowed'
                }`}
              >
                {t('form.terminos.prefix')}{' '}
                <a
                  href="/terminos"
                  className="text-key-green font-medium hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t('form.terminos.link')}
                </a>{' '}
                {t('form.terminos.and')}{' '}
                <a
                  href="/privacidad"
                  className="text-key-green font-medium hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t('form.terminos.privacy')}
                </a>
              </Label>
            </div>
            {touched.aceptaTerminos && !form.aceptaTerminos && step3Done && (
              <p className="text-red-500 text-[12.5px] -mt-4 mb-4">
                {t('form.error.terminos')}
              </p>
            )}

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <p className="text-[12.5px] text-medium-gray md:max-w-[340px]">
                {t('form.disclaimer')}
              </p>
              <button
                id="form-submit"
                type="submit"
                disabled={!canSubmit}
                className={`group inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full text-[14px] font-semibold transition-all ${
                  canSubmit
                    ? 'bg-dark-gray text-white shadow-[0_10px_30px_-12px_rgba(40,40,40,0.5)] hover:bg-dark-gray/90'
                    : 'bg-dark-gray/25 text-white/85 cursor-not-allowed'
                }`}
              >
                {isSubmitting ? t('form.submitting') : t('form.submit')}
                <ArrowRight
                  size={16}
                  strokeWidth={2.25}
                  className={`transition-transform duration-200 ${
                    canSubmit ? 'group-hover:translate-x-0.5' : ''
                  }`}
                />
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

// ── Processing view ─────────────────────────────────────────────────────
// Same narrative beat as the modal's processing phase — four sequential
// steps that communicate "we're actually running a projection against your
// inputs", not "form posted". See ContactModal.tsx for the full rationale.
const PROCESSING_STEPS = [
  'Analizando los datos de tu propiedad',
  'Revisando ocupación en tu zona',
  'Calculando tu proyección de ingresos',
  'Preparando tu reporte personalizado',
] as const;

const STEP_DURATION_MS = 620;
const EXIT_FADE_MS = 360;

const ProcessingView: React.FC<{ onComplete: () => void }> = ({
  onComplete,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (activeIndex < PROCESSING_STEPS.length) {
      const t = window.setTimeout(() => {
        setActiveIndex((i) => i + 1);
      }, STEP_DURATION_MS);
      return () => window.clearTimeout(t);
    }
    const exitDelay = window.setTimeout(() => setIsExiting(true), 260);
    const completeTimer = window.setTimeout(
      () => onComplete(),
      260 + EXIT_FADE_MS,
    );
    return () => {
      window.clearTimeout(exitDelay);
      window.clearTimeout(completeTimer);
    };
  }, [activeIndex, onComplete]);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Preparando tu proyección"
      className={`flex flex-col items-center justify-center text-center px-8 py-16 md:py-20 ${
        isExiting
          ? 'animate-[processingFadeOut_0.36s_cubic-bezier(0.4,0,0.2,1)_both]'
          : 'animate-[fadeUp_0.5s_cubic-bezier(0.2,0.8,0.2,1)_both]'
      }`}
    >
      <div className="relative grid place-items-center h-20 w-20 mb-7">
        <span
          aria-hidden="true"
          className="absolute inset-0 rounded-full border-[3px] border-key-green/15"
        />
        <span
          aria-hidden="true"
          className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-key-green border-r-key-green/60 animate-[processingSpin_1.1s_linear_infinite]"
        />
        <span className="relative grid place-items-center h-12 w-12 rounded-full bg-key-green/10 text-key-green">
          <TrendingUp size={22} strokeWidth={2.25} />
        </span>
      </div>

      <span className="inline-block text-[10.5px] font-semibold tracking-[0.28em] uppercase text-key-green mb-3">
        Preparando tu proyección
      </span>
      <h3 className="text-[22px] md:text-[26px] font-poppins font-semibold text-dark-gray tracking-[-0.015em] leading-[1.15]">
        Estamos trabajando en tu simulación
      </h3>
      <p className="mt-2 max-w-md text-[13.5px] text-medium-gray leading-relaxed">
        Cruzamos tus datos con el mercado de tu zona para calcular una
        proyección realista. Toma solo unos segundos.
      </p>

      <ul className="mt-7 w-full max-w-xs space-y-2.5 text-left">
        {PROCESSING_STEPS.map((step, i) => {
          const state =
            i < activeIndex ? 'done' : i === activeIndex ? 'active' : 'pending';
          return (
            <li
              key={step}
              className="flex items-center gap-3 animate-[processingStepIn_0.4s_cubic-bezier(0.2,0.8,0.2,1)_both]"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <span
                aria-hidden="true"
                className={`grid place-items-center h-5 w-5 rounded-full shrink-0 transition-all duration-300 ${
                  state === 'done'
                    ? 'bg-key-green text-white'
                    : state === 'active'
                      ? 'bg-key-green/15 ring-1 ring-key-green/35'
                      : 'bg-dark-gray/[0.06] ring-1 ring-dark-gray/10'
                }`}
              >
                {state === 'done' ? (
                  <Check size={12} strokeWidth={3} />
                ) : state === 'active' ? (
                  <span className="h-1.5 w-1.5 rounded-full bg-key-green animate-[processingDotPulse_0.9s_ease-in-out_infinite]" />
                ) : (
                  <span className="h-1 w-1 rounded-full bg-dark-gray/25" />
                )}
              </span>
              <span
                className={`text-[13.5px] transition-colors duration-300 ${
                  state === 'done'
                    ? 'text-dark-gray/60'
                    : state === 'active'
                      ? 'text-dark-gray font-medium'
                      : 'text-dark-gray/35'
                }`}
              >
                {step}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

// ── Success view ────────────────────────────────────────────────────────
// Embedded variant of the success state. Primary CTA resets the form +
// scrolls to the top of the page — useful if the user wants to register
// another property, and also provides a definite "end of task" signal.
const SuccessView: React.FC<{ email: string; onReset: () => void }> = ({
  email,
  onReset,
}) => (
  <div
    role="status"
    aria-live="polite"
    className="flex flex-col items-center justify-center text-center px-8 py-16 md:py-20 animate-[fadeUp_0.5s_cubic-bezier(0.2,0.8,0.2,1)_both]"
  >
    <div className="relative grid place-items-center h-20 w-20 mb-7">
      <span
        aria-hidden="true"
        className="absolute inset-0 rounded-full bg-key-green/15 animate-[successPulse_1.6s_ease-out_infinite]"
      />
      <span
        aria-hidden="true"
        className="absolute inset-2 rounded-full bg-key-green/25"
      />
      <span className="relative grid place-items-center h-14 w-14 rounded-full bg-key-green text-white shadow-[0_10px_30px_-8px_rgba(104,180,131,0.55)] animate-[successPop_0.55s_cubic-bezier(0.2,0.9,0.3,1.25)_both]">
        <Check size={26} strokeWidth={3} />
      </span>
    </div>

    <span className="inline-block text-[10.5px] font-semibold tracking-[0.28em] uppercase text-key-green mb-3">
      Proyección en camino
    </span>
    <h3 className="text-[22px] md:text-[26px] font-poppins font-semibold text-dark-gray tracking-[-0.015em] leading-[1.15]">
      ¡Estamos calculando tu proyección!
    </h3>
    <p className="mt-3 max-w-md text-[13.5px] text-medium-gray leading-relaxed">
      En los próximos minutos recibirás un{' '}
      <strong className="font-semibold text-dark-gray">
        PDF con la simulación de ingresos
      </strong>{' '}
      de tu propiedad en:
    </p>
    <p className="mt-2 max-w-md text-[14.5px] font-medium text-dark-gray break-all">
      {email}
    </p>
    <p className="mt-3 max-w-md text-[12.5px] text-medium-gray/80 leading-relaxed">
      Si no lo ves, revisa la carpeta de{' '}
      <em className="not-italic font-medium">spam</em> o promociones.
    </p>

    <button
      type="button"
      onClick={onReset}
      className="mt-7 inline-flex items-center justify-center h-11 px-7 rounded-full text-[13.5px] font-semibold bg-dark-gray text-white hover:bg-dark-gray/90 shadow-[0_12px_30px_-14px_rgba(40,40,40,0.55)] transition-colors"
    >
      Volver al inicio
    </button>
  </div>
);

// ── Layout primitives ───────────────────────────────────────────────────
// Same collapse technique as the modal. Kept local to this file for now;
// if/when the modal and embedded form diverge further this can be pulled
// into a shared `lead-wizard` module.
const CollapseReveal: React.FC<{
  open: boolean;
  children: React.ReactNode;
}> = ({ open, children }) => (
  <div
    className={`grid transition-[grid-template-rows,opacity] duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${
      open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
    }`}
    aria-hidden={!open}
  >
    <div className="overflow-hidden min-h-0">
      <div
        className={
          open
            ? 'animate-[fadeUp_0.5s_cubic-bezier(0.2,0.8,0.2,1)_both]'
            : ''
        }
      >
        {children}
      </div>
    </div>
  </div>
);

type StepCardState = 'active' | 'done';

const StepCard: React.FC<{
  kicker: string;
  title: string;
  subtitle?: string;
  state: StepCardState;
  children: React.ReactNode;
}> = ({ kicker, title, subtitle, state, children }) => {
  const done = state === 'done';
  return (
    <section>
      <header className="flex items-center gap-3 mb-6">
        <span
          aria-hidden="true"
          className={`grid place-items-center h-8 w-8 rounded-full text-[11px] font-semibold transition-all ${
            done
              ? 'bg-key-green text-white ring-2 ring-key-green/20'
              : 'bg-key-green/10 text-key-green ring-1 ring-key-green/25'
          }`}
        >
          {done ? <Check size={14} strokeWidth={3} /> : kicker}
        </span>
        <div>
          <h3 className="text-[17px] md:text-[18px] font-poppins font-semibold text-dark-gray tracking-[-0.01em]">
            {title}
          </h3>
          {subtitle && (
            <p className="text-[12.5px] text-medium-gray mt-0.5">{subtitle}</p>
          )}
        </div>
      </header>
      {children}
    </section>
  );
};

const CollapsedStep: React.FC<{
  kicker: string;
  title: string;
  subtitle?: string;
}> = ({ kicker, title, subtitle }) => (
  <section
    aria-hidden="true"
    className="animate-[fadeUp_0.4s_cubic-bezier(0.2,0.8,0.2,1)_both]"
  >
    <div className="flex items-center gap-3">
      <span className="grid place-items-center h-8 w-8 rounded-full bg-dark-gray/[0.04] text-dark-gray/35 text-[11px] font-semibold">
        {kicker}
      </span>
      <div>
        <h3 className="text-[17px] md:text-[18px] font-poppins font-semibold text-dark-gray/40 tracking-[-0.01em]">
          {title}
        </h3>
        {subtitle && (
          <p className="text-[12.5px] text-medium-gray/50 mt-0.5">{subtitle}</p>
        )}
      </div>
    </div>
  </section>
);

const Field: React.FC<{
  label: string;
  htmlFor: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}> = ({ label, htmlFor, hint, className, children }) => (
  <div className={className}>
    <label
      htmlFor={htmlFor}
      className="block text-[12.5px] font-medium text-medium-gray mb-1.5"
    >
      {label}
    </label>
    {children}
    {hint && (
      <p className="mt-1.5 text-[11.5px] text-medium-gray/65 leading-snug">
        {hint}
      </p>
    )}
  </div>
);

export default ContactForm;
