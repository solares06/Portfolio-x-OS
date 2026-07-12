import { login } from "./actions";
import { Lock, AlertTriangle } from "lucide-react";

export default function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const error = searchParams.error;

  return (
    <div className="theme-os min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient glow effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-container/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-secondary-container/5 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <span className="font-mono text-[10px] text-primary border border-primary-container/30 bg-primary-container/10 px-2 py-1 rounded uppercase tracking-widest font-bold">
              SYSTEM AUTH
            </span>
            <div className="w-2 h-2 rounded-full bg-primary-container animate-pulse"></div>
          </div>
          <h1 className="font-display text-4xl md:text-5xl text-foreground font-bold tracking-tight mb-2">
            Core_OS
          </h1>
          <p className="font-mono text-xs text-on-surface-variant uppercase tracking-widest">
            IDENTITY VERIFICATION REQUIRED
          </p>
        </div>

        {/* Login Card */}
        <div className="glass-panel rounded-xl border border-card-border p-8 relative overflow-hidden group">
          {/* Top accent line */}
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary-container to-transparent opacity-50"></div>

          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded bg-primary-container/10 border border-primary-container/30 flex items-center justify-center">
              <Lock className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-display text-lg text-foreground font-bold">
                Authenticate
              </h2>
              <p className="font-mono text-[10px] text-on-surface-variant uppercase tracking-widest">
                SINGLE-USER ACCESS
              </p>
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-6 p-3 bg-error-container/20 border border-error/30 rounded flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-error shrink-0 mt-0.5" />
              <p className="font-mono text-xs text-error">{error}</p>
            </div>
          )}

          <form action={login} className="space-y-6">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block font-mono text-[10px] text-on-surface-variant uppercase tracking-widest mb-2 font-bold"
              >
                Operator ID (Email)
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="operator@core-os.sys"
                className="w-full bg-surface-container-lowest border border-card-border rounded px-4 py-3 text-foreground font-mono text-sm placeholder:text-outline focus:outline-none focus:border-primary-container focus:ring-0 focus:shadow-[0_0_12px_rgba(0,242,255,0.2)] transition-all"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block font-mono text-[10px] text-on-surface-variant uppercase tracking-widest mb-2 font-bold"
              >
                Access Key (Password)
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••••••••"
                className="w-full bg-surface-container-lowest border border-card-border rounded px-4 py-3 text-foreground font-mono text-sm placeholder:text-outline focus:outline-none focus:border-primary-container focus:ring-0 focus:shadow-[0_0_12px_rgba(0,242,255,0.2)] transition-all"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full bg-primary-container text-on-primary-container font-mono text-xs py-3.5 rounded uppercase tracking-widest font-bold hover:bg-primary-fixed-dim transition-colors neon-glow hover:shadow-[0_0_20px_rgba(0,242,255,0.5)] active:scale-[0.98] transform"
            >
              Initialize Session →
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-card-border/50 text-center">
            <p className="font-mono text-[10px] text-outline uppercase tracking-widest">
              Unauthorized access is prohibited
            </p>
          </div>
        </div>

        {/* Bottom Status */}
        <div className="mt-6 text-center">
          <p className="font-mono text-[10px] text-outline uppercase tracking-widest flex items-center justify-center gap-2">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary-container"></span>
            System Online • Auth Module v1.0
          </p>
        </div>
      </div>
    </div>
  );
}
