import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { X, ArrowRight, Check, TrendingUp } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { useLanguage } from '../i18n/LanguageContext';
import { submitLead, type LeadInsert } from '../lib/queries/leads';

// ─────────────────────────────────────────────────────────────────────────
//  Progressive 3-step wizard for the Hero projection CTA.
//
//  UX patterns applied (Stripe Checkout / Linear onboarding / Typeform):
//   1. One step is "active" at a time; remaining steps are locked-and-hidden
//      and only unfold once the previous step's required fields are valid.
//   2. Completed steps stay visible & editable (non-destructive progression).
//   3. Visual state machine: locked / active / done — each with its own kicker
//      treatment (lock icon → number → checkmark).
//   4. Smooth `grid-template-rows` height animation + content fadeUp.
//   5. First field autofocused, ESC closes, click-outside closes, body scroll
//      locked while open.
//   6. Submission persists to Supabase (`homie_leads`) AND still pings the
//      original Make.com webhook for backward compatibility.
// ─────────────────────────────────────────────────────────────────────────

type ContactModalProps = {
  onClose: () => void;
};

type StepKey = 'contact' | 'location' | 'property';

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

// Smart defaults for the property details step. We pre-select the first
// option of each dropdown so users whose property matches the common case
// (compact 1-bed / 1-bath Airbnb) don't have to open four selects. Anyone
// with a larger unit just overrides — same friction as before for them,
// less for everyone else. These defaults MUST match the first `<option>`
// value in each select below or validation/display will desync.
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
// The form auto-saves as the user types. This way:
//   • Accidental backdrop click / ESC / tab close never loses work.
//   • Returning visitors can pick up where they left off.
// Cleared on successful submission.
const DRAFT_KEY = 'homie-lead-draft-v1';

const loadDraft = (): FormState => {
  if (typeof window === 'undefined') return initialState;
  try {
    const raw = window.localStorage.getItem(DRAFT_KEY);
    if (!raw) return initialState;
    const parsed = JSON.parse(raw) as Partial<FormState>;
    // Merge shallowly — future-proofs new fields without breaking old drafts.
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
    // Quota / disabled storage — silently ignore; UX must still work.
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
 * The form is "dirty" only if the user has changed something from the
 * starting state. Comparing against `initialState` (not against empty
 * strings) is important: the property-detail selects ship with smart
 * defaults ("Menos de 50", "1", "1", "1-2"), so a naive `!== ''` check
 * would flag every freshly-opened form as dirty and trigger the
 * "¿Salir sin enviar?" confirm for users who never typed anything.
 * Free-text fields get `.trim()` so stray whitespace doesn't count.
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

// ── Validation helpers ────────────────────────────────────────────────────
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

const ContactModal: React.FC<ContactModalProps> = ({ onClose }) => {
  const { toast } = useToast();
  const { t, lang } = useLanguage();
  // Lazy-init from localStorage so a returning visitor keeps their progress.
  const [form, setForm] = useState<FormState>(() => loadDraft());
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Modal phase machine. 'form' → user is filling in.
  // 'processing' → short 2.7s animation that reinforces we're actually doing
  // work (queries, projection math, PDF render) instead of feeling robotic.
  // 'success' → final confirmation with email receipt expectation.
  const [phase, setPhase] = useState<'form' | 'processing' | 'success'>('form');
  const isSuccess = phase === 'success';
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const firstFieldRef = useRef<HTMLInputElement>(null);
  const step2Ref = useRef<HTMLDivElement>(null);
  const step3Ref = useRef<HTMLDivElement>(null);
  const submitRef = useRef<HTMLDivElement>(null);

  // Persist the draft every time the form changes.
  useEffect(() => {
    if (isDirtyForm(form)) saveDraft(form);
  }, [form]);

  // Guarded close — if the user has typed anything, confirm before leaving.
  // Otherwise close silently. Once the submit succeeds (`isSuccess`) the
  // draft no longer matters, so we bypass the confirm dialog. During the
  // short `processing` animation we silently refuse to close so the reveal
  // plays to completion (it's already a sunk commitment at that point).
  const requestClose = useCallback(
    (opts?: { force?: boolean }) => {
      if (phase === 'processing') return;
      if (opts?.force || isSuccess || !isDirtyForm(form)) {
        onClose();
        return;
      }
      setShowExitConfirm(true);
    },
    [form, isSuccess, onClose, phase],
  );

  // ── Derived step state ─────────────────────────────────────────────────
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

  const currentStep: StepKey = !step1Done
    ? 'contact'
    : !step2Done
      ? 'location'
      : 'property';

  // ── Side effects ──────────────────────────────────────────────────────
  // Split into three single-purpose effects so none of them re-run on every
  // keystroke. A single combined effect would depend on `requestClose` (which
  // is recreated every form change) and would refocus the first field each
  // time the user typed or selected something — the bug we're avoiding.

  // 1. Body scroll lock — runs once per mount.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // 2. Autofocus the first field — hard one-shot. Guarded with a ref so
  //    that even under React StrictMode (double-invocation in dev) or HMR
  //    the focus is never stolen back from whatever field the user is
  //    currently editing. Also bails out if focus is already inside the
  //    modal card — only fires on the very first mount with no active field.
  const hasAutofocusedRef = useRef(false);
  useEffect(() => {
    if (hasAutofocusedRef.current) return;
    const focusTimer = window.setTimeout(() => {
      if (hasAutofocusedRef.current) return;
      const active = document.activeElement as HTMLElement | null;
      const isInsideModal =
        active && active !== document.body && active.closest('[role="dialog"]');
      if (isInsideModal) {
        hasAutofocusedRef.current = true;
        return;
      }
      firstFieldRef.current?.focus();
      hasAutofocusedRef.current = true;
    }, 140);
    return () => {
      window.clearTimeout(focusTimer);
    };
  }, []);

  // 3. ESC handler — uses a ref for `requestClose` so the listener stays
  //    stable and we don't need to add/remove it on every render.
  const requestCloseRef = useRef(requestClose);
  useEffect(() => {
    requestCloseRef.current = requestClose;
  }, [requestClose]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      // ESC in the confirm dialog just dismisses the dialog — the least
      // destructive action for an "are you sure?" modal.
      if (showExitConfirm) {
        setShowExitConfirm(false);
        return;
      }
      requestCloseRef.current();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
    };
  }, [showExitConfirm]);

  // No auto-scroll: it was hijacking the scroll position every time a select
  // value changed (because step-done memos recompute on each field edit).
  // The CollapseReveal height+fade animation already signals the new section
  // clearly; the user stays in control of scroll.

  // ── Handlers ──────────────────────────────────────────────────────────
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
      source: 'hero_modal',
      lang: lang === 'en' ? 'en' : 'es',
      user_agent:
        typeof navigator !== 'undefined' ? navigator.userAgent : null,
      referrer: typeof document !== 'undefined' ? document.referrer : null,
    };

    // Run Supabase insert + legacy webhook in parallel. Either can fail
    // without blocking the other — we still want the lead captured.
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
      source: 'hero_modal',
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

    // Surface individual failures loudly. `Promise.allSettled` hides them by
    // design; in production we want to know when Supabase rejects (missing
    // table, RLS mismatch, schema drift) even if Make.com accepted the
    // webhook. A silent Supabase rejection is exactly what just happened
    // when `homie_leads` didn't exist yet in the production database.
    const [supabaseRes, webhookRes] = results;
    if (supabaseRes.status === 'rejected') {
      // eslint-disable-next-line no-console
      console.error('[lead:hero_modal] Supabase insert failed:', supabaseRes.reason);
    }
    if (webhookRes.status === 'rejected') {
      // eslint-disable-next-line no-console
      console.error('[lead:hero_modal] Make.com webhook failed:', webhookRes.reason);
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

    // Transition to the "processing" phase. The ProcessingView runs its own
    // ~2.7s sequence, then calls onComplete which promotes us to 'success'.
    // We clear the draft here (the submission is already persisted) so a
    // backgrounded tab reload lands on a clean form.
    clearDraft();
    setIsSubmitting(false);
    setPhase('processing');
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
      role="dialog"
      aria-modal="true"
      aria-labelledby="contact-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8"
    >
      {/* Blur veil (click to close — guarded) */}
      <button
        type="button"
        aria-label={t('nav.closeMenu')}
        onClick={() => requestClose()}
        className="absolute inset-0 bg-dark-gray/55 supports-[backdrop-filter]:bg-dark-gray/40 backdrop-blur-xl backdrop-saturate-150 animate-[backdropIn_0.3s_ease-out_both] cursor-default"
      />

      {/* Dialog card */}
      <div className="relative w-full max-w-xl max-h-full flex flex-col overflow-hidden rounded-[28px] bg-white ring-1 ring-dark-gray/[0.08] shadow-[0_40px_120px_-30px_rgba(0,0,0,0.45)] animate-[modalIn_0.45s_cubic-bezier(0.2,0.8,0.2,1)_both]">
        {/* Close — hidden during the 2.7s processing phase so the user
            doesn't bail mid-animation. Visible during form + success. */}
        {phase !== 'processing' && (
          <button
            type="button"
            onClick={() => (isSuccess ? onClose() : requestClose())}
            aria-label={t('nav.closeMenu')}
            className="absolute top-4 right-4 inline-flex items-center justify-center w-9 h-9 rounded-full ring-1 ring-dark-gray/10 bg-white hover:bg-[#F2F2F2] hover:ring-dark-gray/20 text-dark-gray/70 hover:text-dark-gray transition-all z-10"
          >
            <X size={16} strokeWidth={1.75} />
          </button>
        )}

        {phase === 'processing' ? (
          <ProcessingView onComplete={() => setPhase('success')} />
        ) : isSuccess ? (
          <SuccessView onClose={onClose} email={form.email} />
        ) : (
        /* Scroll area — scrollbar hidden but scroll still works (wheel/touch/keys) */
        <div
          className="flex-1 min-h-0 overflow-y-auto px-6 pt-8 pb-7 md:px-9 md:pt-10 md:pb-8 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        >
          {/* Header */}
          <div className="mb-6">
            <span className="inline-block text-[10.5px] font-semibold tracking-[0.28em] uppercase text-key-green mb-3">
              {t('form.modal.kicker') as string}
            </span>
            <h3
              id="contact-modal-title"
              className="text-[24px] md:text-[27px] font-poppins font-semibold text-dark-gray tracking-[-0.015em] leading-[1.15]"
            >
              {t('form.modal.title')}
            </h3>
            <p className="mt-2 text-[13.5px] text-medium-gray leading-relaxed">
              {t('form.modal.subtitle') as string}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 mt-2">
            {/* ── Step 1 · Contacto (siempre visible) ── */}
            <StepCard
              kicker="01"
              title={t('form.section.contact.title')}
              state={step1Done ? 'done' : 'active'}
            >
              <div className="space-y-4">
                <Field label={t('form.nombre.label')} htmlFor="m-nombre">
                  <input
                    ref={firstFieldRef}
                    id="m-nombre"
                    type="text"
                    name="nombre"
                    placeholder={t('form.nombre.placeholderShort')}
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field
                    label={t('form.telefono.label')}
                    htmlFor="m-telefono"
                  >
                    <input
                      id="m-telefono"
                      type="tel"
                      name="telefono"
                      placeholder={t('form.telefono.placeholderShort')}
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
                    htmlFor="m-email"
                  >
                    <input
                      id="m-email"
                      type="email"
                      name="email"
                      placeholder={t('form.email.placeholderShort')}
                      autoComplete="email"
                      required
                      className={inputClass('email', isValidEmail(form.email))}
                      onChange={(e) => setField('email', e.target.value)}
                      onBlur={() => markTouched('email')}
                      value={form.email}
                    />
                  </Field>
                </div>
              </div>
            </StepCard>

            {/* ── Step 2 · Ubicación ── */}
            <CollapseReveal open={step1Done}>
              <div ref={step2Ref}>
                <StepCard
                  kicker="02"
                  title={t('form.section.location.title')}
                  state={step2Done ? 'done' : 'active'}
                >
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Field label={t('form.ciudad.label')} htmlFor="m-ciudad">
                        <input
                          id="m-ciudad"
                          type="text"
                          name="ciudad"
                          placeholder={t('form.ciudad.placeholderShort')}
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
                      <Field label={t('form.distrito.label')} htmlFor="m-distrito">
                        <select
                          id="m-distrito"
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
                            {t('form.distrito.placeholderShort')}
                          </option>
                          <option value="Miraflores">Miraflores</option>
                          <option value="Barranco">Barranco</option>
                          <option value="San Isidro">San Isidro</option>
                          <option value="San Miguel">San Miguel</option>
                          <option value="Magdalena del Mar">
                            Magdalena del Mar
                          </option>
                          <option value="Otro">
                            {t('form.distrito.other')}
                          </option>
                        </select>
                      </Field>
                    </div>
                    <Field
                      label={t('form.direccion.label')}
                      htmlFor="m-direccion"
                      hint={t('form.hint.direccion') as string}
                    >
                      <input
                        id="m-direccion"
                        type="text"
                        name="direccion"
                        placeholder={t('form.direccion.placeholderShort')}
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
              </div>
            </CollapseReveal>

            {/* Collapsed preview for Step 2 while Step 1 incomplete */}
            {!step1Done && (
              <CollapsedStep
                kicker="02"
                title={t('form.section.location.title')}
              />
            )}

            {/* ── Step 3 · Detalles de la propiedad ── */}
            <CollapseReveal open={step2Done}>
              <div ref={step3Ref}>
                <StepCard
                  kicker="03"
                  title={t('form.section.property.title')}
                  state={step3Done ? 'done' : 'active'}
                >
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Field label={t('form.metraje.label')} htmlFor="m-metraje">
                        <select
                          id="m-metraje"
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
                          <option value="" disabled>
                            {t('form.metraje.placeholderShort')}
                          </option>
                          <option value="Menos de 50">
                            {t('form.metraje.lt50')}
                          </option>
                          <option value="50-80">{t('form.metraje.50-80')}</option>
                          <option value="80-120">
                            {t('form.metraje.80-120')}
                          </option>
                          <option value="120-150">
                            {t('form.metraje.120-150')}
                          </option>
                          <option value="Más de 150">
                            {t('form.metraje.gt150')}
                          </option>
                        </select>
                      </Field>
                      <Field
                        label={t('form.habitaciones.label')}
                        htmlFor="m-habitaciones"
                      >
                        <select
                          id="m-habitaciones"
                          name="habitaciones"
                          required
                          className={
                            inputClass(
                              'habitaciones',
                              form.habitaciones.length > 0,
                            ) + selectExtras
                          }
                          onChange={(e) =>
                            setField('habitaciones', e.target.value)
                          }
                          onBlur={() => markTouched('habitaciones')}
                          value={form.habitaciones}
                        >
                          <option value="" disabled>
                            {t('form.habitaciones.placeholderShort')}
                          </option>
                          <option value="1">{t('form.habitaciones.1')}</option>
                          <option value="2">{t('form.habitaciones.2')}</option>
                          <option value="3">{t('form.habitaciones.3')}</option>
                          <option value="4+">{t('form.habitaciones.4+')}</option>
                        </select>
                      </Field>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Field label={t('form.banos.label')} htmlFor="m-banos">
                        <select
                          id="m-banos"
                          name="banos"
                          required
                          className={
                            inputClass('banos', form.banos.length > 0) +
                            selectExtras
                          }
                          onChange={(e) => setField('banos', e.target.value)}
                          onBlur={() => markTouched('banos')}
                          value={form.banos}
                        >
                          <option value="" disabled>
                            {t('form.banos.placeholderShort')}
                          </option>
                          <option value="1">{t('form.banos.1')}</option>
                          <option value="2">{t('form.banos.2')}</option>
                          <option value="3+">{t('form.banos.3+')}</option>
                        </select>
                      </Field>
                      <Field
                        label={t('form.capacidad.label')}
                        htmlFor="m-capacidad"
                      >
                        <select
                          id="m-capacidad"
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
                          <option value="" disabled>
                            {t('form.capacidad.placeholderShort')}
                          </option>
                          <option value="1-2">{t('form.capacidad.1-2')}</option>
                          <option value="3-4">{t('form.capacidad.3-4')}</option>
                          <option value="5-6">{t('form.capacidad.5-6')}</option>
                          <option value="7+">{t('form.capacidad.7+')}</option>
                        </select>
                      </Field>
                    </div>
                  </div>
                </StepCard>
              </div>
            </CollapseReveal>

            {!step2Done && step1Done && (
              <CollapsedStep
                kicker="03"
                title={t('form.section.property.title')}
              />
            )}

            {/* ── Terms + submit (siempre visibles; deshabilitados hasta completar) ── */}
            <div
              ref={submitRef}
              className="pt-5 mt-2 border-t border-dark-gray/[0.08]"
            >
              <div
                className={`flex items-start gap-3 pb-5 transition-opacity duration-300 ${
                  step3Done ? 'opacity-100' : 'opacity-55'
                }`}
              >
                <Checkbox
                  id="m-terminos"
                  checked={form.aceptaTerminos}
                  disabled={!step3Done}
                  onCheckedChange={(c) => {
                    setField('aceptaTerminos', Boolean(c));
                    markTouched('aceptaTerminos');
                  }}
                  className="mt-0.5 h-5 w-5 rounded-md data-[state=checked]:bg-key-green data-[state=checked]:border-key-green"
                />
                <Label
                  htmlFor="m-terminos"
                  className={`text-[13px] leading-relaxed text-medium-gray ${
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
                <p className="text-red-500 text-[12px] -mt-3 mb-3">
                  {t('form.error.terminos')}
                </p>
              )}

              <button
                type="submit"
                disabled={!canSubmit}
                className={`group inline-flex w-full items-center justify-center gap-2 h-12 rounded-full text-[14px] font-semibold tracking-[0.005em] transition-all ${
                  canSubmit
                    ? 'bg-dark-gray text-white shadow-[0_12px_30px_-14px_rgba(40,40,40,0.55)] hover:bg-dark-gray/90'
                    : 'bg-dark-gray/25 text-white/85 cursor-not-allowed'
                }`}
              >
                {isSubmitting
                  ? t('form.submitting')
                  : t('form.submit.modal')}
                <ArrowRight
                  size={15}
                  strokeWidth={2.25}
                  className={`transition-transform duration-200 ${
                    canSubmit ? 'group-hover:translate-x-0.5' : ''
                  }`}
                />
              </button>

              <p className="text-[12px] text-medium-gray/80 text-center mt-4">
                {t('form.disclaimer.modal')}
              </p>
            </div>
          </form>
        </div>
        )}

        {/* ── Exit confirmation overlay ──────────────────────────────── */}
        {showExitConfirm && (
          <ExitConfirm
            onStay={() => setShowExitConfirm(false)}
            onLeave={() => {
              setShowExitConfirm(false);
              requestClose({ force: true });
            }}
          />
        )}
      </div>
    </div>
  );
};

// ── Exit confirmation ────────────────────────────────────────────────────
// Shown only when the user has typed something and tries to close. Explains
// that progress is auto-saved so the decision feels low-risk — per Nielsen
// "error prevention": block destructive defaults with a soft, informative
// interruption instead of a browser confirm().
const ExitConfirm: React.FC<{ onStay: () => void; onLeave: () => void }> = ({
  onStay,
  onLeave,
}) => {
  const stayRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    // Focus "seguir editando" by default — it's the safe choice.
    stayRef.current?.focus();
  }, []);
  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="exit-confirm-title"
      className="absolute inset-0 z-20 flex items-center justify-center p-6 bg-white/70 backdrop-blur-md animate-[backdropIn_0.2s_ease-out_both]"
    >
      <div className="w-full max-w-sm rounded-2xl bg-white ring-1 ring-dark-gray/[0.08] shadow-[0_25px_60px_-20px_rgba(40,40,40,0.35)] p-6 animate-[modalIn_0.3s_cubic-bezier(0.2,0.8,0.2,1)_both]">
        <h4
          id="exit-confirm-title"
          className="text-[16.5px] font-poppins font-semibold text-dark-gray tracking-[-0.01em]"
        >
          ¿Salir sin enviar?
        </h4>
        <p className="mt-2 text-[13px] text-medium-gray leading-relaxed">
          Guardamos tu información en este navegador, así que podrás continuar
          donde la dejaste cuando vuelvas.
        </p>
        <div className="mt-5 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
          <button
            type="button"
            onClick={onLeave}
            className="inline-flex items-center justify-center h-10 px-4 rounded-full text-[13px] font-medium text-medium-gray hover:text-dark-gray hover:bg-dark-gray/[0.04] transition-colors"
          >
            Salir de todas formas
          </button>
          <button
            ref={stayRef}
            type="button"
            onClick={onStay}
            className="inline-flex items-center justify-center h-10 px-5 rounded-full text-[13px] font-semibold bg-key-green text-white hover:bg-key-green/90 shadow-[0_8px_20px_-8px_rgba(104,180,131,0.55)] transition-colors"
          >
            Seguir editando
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Layout primitives ───────────────────────────────────────────────────

/** CSS-only collapse/expand using the grid-rows 0fr→1fr technique. */
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
  state: StepCardState;
  children: React.ReactNode;
}> = ({ kicker, title, state, children }) => {
  const done = state === 'done';
  return (
    <section className="rounded-2xl bg-white ring-1 ring-dark-gray/[0.08] p-5 md:p-6 transition-shadow">
      <header className="flex items-center gap-3 mb-5">
        <span
          aria-hidden="true"
          className={`grid place-items-center h-7 w-7 rounded-full text-[11px] font-semibold transition-all ${
            done
              ? 'bg-key-green text-white ring-2 ring-key-green/20'
              : 'bg-key-green/10 text-key-green ring-1 ring-key-green/25'
          }`}
        >
          {done ? <Check size={13} strokeWidth={3} /> : kicker}
        </span>
        <h4 className="text-[14.5px] md:text-[15.5px] font-poppins font-semibold text-dark-gray tracking-[-0.005em]">
          {title}
        </h4>
      </header>
      {children}
    </section>
  );
};

/**
 * Collapsed preview card for upcoming steps. Same visual language as the
 * active StepCard header, just muted — no lock icon, no warning copy, so the
 * user sees the roadmap without feeling restricted.
 */
const CollapsedStep: React.FC<{ kicker: string; title: string }> = ({
  kicker,
  title,
}) => (
  <section
    aria-hidden="true"
    className="rounded-2xl bg-white ring-1 ring-dark-gray/[0.06] px-5 py-4 md:px-6 animate-[fadeUp_0.4s_cubic-bezier(0.2,0.8,0.2,1)_both]"
  >
    <div className="flex items-center gap-3">
      <span className="grid place-items-center h-7 w-7 rounded-full bg-dark-gray/[0.04] text-dark-gray/35 text-[11px] font-semibold">
        {kicker}
      </span>
      <h4 className="text-[14.5px] md:text-[15.5px] font-poppins font-semibold text-dark-gray/40 tracking-[-0.005em]">
        {title}
      </h4>
    </div>
  </section>
);

// ── Processing view ─────────────────────────────────────────────────────
// A ~2.7s narrative beat between submit and success. Instead of a generic
// spinner, we surface the actual work being done — this tells the user
// "a real projection is being built from your inputs", not "a form was
// posted". Four steps reveal sequentially; each one checks off before the
// next activates. The whole block fades in on mount and fades out just
// before the SuccessView takes over.
const PROCESSING_STEPS = [
  'Analizando los datos de tu propiedad',
  'Revisando ocupación en tu zona',
  'Calculando tu proyección de ingresos',
  'Preparando tu reporte personalizado',
] as const;

const STEP_DURATION_MS = 620; // per step
const EXIT_FADE_MS = 360;

const ProcessingView: React.FC<{ onComplete: () => void }> = ({
  onComplete,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Drive the step sequence, then play the exit animation, then swap.
    if (activeIndex < PROCESSING_STEPS.length) {
      const t = window.setTimeout(() => {
        setActiveIndex((i) => i + 1);
      }, STEP_DURATION_MS);
      return () => window.clearTimeout(t);
    }
    // All steps done → play exit, then signal completion.
    const exitDelay = window.setTimeout(() => {
      setIsExiting(true);
    }, 260);
    const completeTimer = window.setTimeout(() => {
      onComplete();
    }, 260 + EXIT_FADE_MS);
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
      className={`flex-1 min-h-0 overflow-hidden flex flex-col items-center justify-center text-center px-8 py-14 md:py-16 ${
        isExiting
          ? 'animate-[processingFadeOut_0.36s_cubic-bezier(0.4,0,0.2,1)_both]'
          : 'animate-[fadeUp_0.5s_cubic-bezier(0.2,0.8,0.2,1)_both]'
      }`}
    >
      {/* Rotating ring with a rising-trend icon at the center */}
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
      <h3 className="text-[21px] md:text-[24px] font-poppins font-semibold text-dark-gray tracking-[-0.015em] leading-[1.15]">
        Estamos trabajando en tu simulación
      </h3>
      <p className="mt-2 max-w-sm text-[13px] text-medium-gray leading-relaxed">
        Cruzamos tus datos con el mercado de tu zona para calcular una
        proyección realista. Toma solo unos segundos.
      </p>

      {/* Step list — each row goes pending → active → done */}
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
                className={`text-[13px] transition-colors duration-300 ${
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
// Inline success state shown inside the modal card after a successful submit.
// Sets the expectation that matches the actual business flow: the backend
// generates a personalized income-projection PDF and emails it to the
// address the user just registered. Showing the email back to them
// reinforces where to look and catches typos fast.
const SuccessView: React.FC<{ onClose: () => void; email: string }> = ({
  onClose,
  email,
}) => (
  <div
    role="status"
    aria-live="polite"
    className="flex-1 min-h-0 overflow-hidden flex flex-col items-center justify-center text-center px-8 py-14 md:py-16 animate-[fadeUp_0.5s_cubic-bezier(0.2,0.8,0.2,1)_both]"
  >
    {/* Animated check disk */}
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
    <h3 className="text-[22px] md:text-[25px] font-poppins font-semibold text-dark-gray tracking-[-0.015em] leading-[1.15]">
      ¡Estamos calculando tu proyección!
    </h3>
    <p className="mt-3 max-w-md text-[13.5px] text-medium-gray leading-relaxed">
      En los próximos minutos recibirás un <strong className="font-semibold text-dark-gray">PDF con la simulación de ingresos</strong> de tu propiedad en:
    </p>
    <p className="mt-2 max-w-md text-[14px] font-medium text-dark-gray break-all">
      {email}
    </p>
    <p className="mt-3 max-w-md text-[12px] text-medium-gray/80 leading-relaxed">
      Si no lo ves, revisa la carpeta de <em className="not-italic font-medium">spam</em> o promociones.
    </p>

    <button
      type="button"
      onClick={onClose}
      autoFocus
      className="mt-7 inline-flex items-center justify-center h-11 px-7 rounded-full text-[13.5px] font-semibold bg-dark-gray text-white hover:bg-dark-gray/90 shadow-[0_12px_30px_-14px_rgba(40,40,40,0.55)] transition-colors"
    >
      Entendido
    </button>
  </div>
);

const Field: React.FC<{
  label: string;
  htmlFor: string;
  hint?: string;
  children: React.ReactNode;
}> = ({ label, htmlFor, hint, children }) => (
  <div>
    <label
      htmlFor={htmlFor}
      className="block text-[12px] font-medium text-medium-gray mb-1.5"
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

export default ContactModal;
