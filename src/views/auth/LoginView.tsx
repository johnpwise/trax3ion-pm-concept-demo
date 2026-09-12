import { type FormEvent, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";

import trax3ionLogo from "../../assets/images/trax3ion-pm-logo.png";
import FormField, { inputClassName } from "../../components/common/FormField";
import { useAuthStore } from "../../store/authStore";

export default function LoginView() {
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();
  const location = useLocation();

  // Captured once on mount: if the user already had a session (e.g. a persisted
  // login from a previous visit), skip the form. This intentionally does not
  // react to a currentUser change caused by this component's own handleSubmit,
  // which would otherwise race the explicit post-login navigate() below.
  const [wasAlreadyLoggedIn] = useState(() => useAuthStore.getState().currentUser !== null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | undefined>(undefined);

  if (wasAlreadyLoggedIn) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();

    const result = login(email, password);
    if (!result.ok) {
      setError(result.error);
      return;
    }

    const fromPathname = (location.state as { from?: { pathname: string } } | null)?.from?.pathname;
    navigate(fromPathname ?? "/dashboard", { replace: true });
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 text-foreground">
      <div className="w-full max-w-sm rounded-xl border border-border bg-surface p-8 shadow-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="rounded-lg bg-primary-950 px-5 py-4">
            <img src={trax3ionLogo} alt="Trax3ion PM" className="h-12 w-auto" />
          </div>
          <p className="mt-3 text-sm text-muted-foreground">Sign in to continue</p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <FormField label="Email" htmlFor="login-email">
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className={inputClassName}
            />
          </FormField>

          <FormField label="Password" htmlFor="login-password" error={error}>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className={inputClassName}
            />
          </FormField>

          <button
            type="submit"
            className="mt-2 w-full rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
          >
            Sign in
          </button>
        </form>

        <div className="mt-6 rounded-lg border border-border bg-background p-3 text-xs leading-relaxed text-muted-foreground">
          <p className="font-medium text-surface-foreground">Demo accounts</p>
          <p className="mt-1">Project Manager — pm@trax3ion.demo / trax3ion-pm</p>
          <p>User — user@trax3ion.demo / trax3ion-user</p>
        </div>
      </div>
    </main>
  );
}
