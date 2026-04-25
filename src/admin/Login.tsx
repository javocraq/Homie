import React, { useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

const Login: React.FC = () => {
  const { signIn, session, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation() as { state?: { from?: string } };
  const from = location.state?.from ?? '/admin';

  const [email, setEmail] = useState('contacto@homiebnb.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    document.title = 'Ingreso · Homie Admin';
  }, []);

  if (!loading && session) return <Navigate to={from} replace />;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const { error: err } = await signIn(email.trim(), password);
    setSubmitting(false);
    if (err) {
      setError(err === 'Invalid login credentials' ? 'Credenciales incorrectas.' : err);
      return;
    }
    navigate(from, { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0e0f10] px-4">
      <div className="w-full max-w-[420px]">
        <div className="flex items-center gap-2 mb-10 justify-center">
          <img src="/Homie-sinfondo.png" alt="Homie" className="h-9 w-auto" />
          <span className="text-white/40 text-[11px] tracking-[0.32em] uppercase ml-3">Admin</span>
        </div>

        <div className="rounded-2xl bg-white/[0.03] ring-1 ring-white/10 p-8 md:p-9 backdrop-blur">
          <h1 className="text-[22px] font-poppins font-semibold text-white tracking-[-0.01em]">
            Ingresa al panel
          </h1>
          <p className="mt-1.5 text-[13.5px] text-white/55">
            Acceso para administradores de Homie.
          </p>

          <form onSubmit={onSubmit} className="mt-7 space-y-5">
            <div>
              <label className="block text-[11.5px] font-medium tracking-[0.12em] uppercase text-white/50 mb-2">
                Correo
              </label>
              <input
                type="email"
                required
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg bg-white/[0.04] ring-1 ring-white/10 focus:ring-key-green focus:outline-none px-4 py-3 text-[15px] text-white placeholder-white/30 transition-colors"
                placeholder="tu@correo.com"
              />
            </div>

            <div>
              <label className="block text-[11.5px] font-medium tracking-[0.12em] uppercase text-white/50 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg bg-white/[0.04] ring-1 ring-white/10 focus:ring-key-green focus:outline-none px-4 py-3 pr-16 text-[15px] text-white placeholder-white/30 transition-colors"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-medium tracking-wider uppercase text-white/40 hover:text-white/80 transition-colors"
                >
                  {showPassword ? 'Ocultar' : 'Ver'}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-lg bg-red-500/10 ring-1 ring-red-500/30 px-4 py-3 text-[13px] text-red-200">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-key-green text-dark-gray font-semibold py-3.5 text-[14.5px] tracking-[0.01em] hover:bg-key-green/90 active:bg-key-green/80 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? 'Ingresando…' : 'Ingresar'}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-[12px] text-white/30">
          © {new Date().getFullYear()} Homie · Panel interno
        </p>
      </div>
    </div>
  );
};

export default Login;
