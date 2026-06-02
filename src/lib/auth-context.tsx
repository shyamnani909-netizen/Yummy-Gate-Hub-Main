import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type AuthUser = {
  id?: string;
  email?: string | null;
  name?: string | null;
  image?: string | null;
};

type AuthSession = {
  user?: AuthUser;
  expires?: string;
};

interface AuthCtx {
  user: AuthUser | null;
  session: AuthSession | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthCtx>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((response) => response.json())
      .then((session: AuthSession) => {
        const activeSession = session?.user ? session : null;
        setSession(activeSession);
        setUser(activeSession?.user ?? null);
      })
      .finally(() => setLoading(false));
  }, []);

  const signOut = async () => {
    const csrfResponse = await fetch("/api/auth/csrf");
    const { csrfToken } = await csrfResponse.json();
    await fetch("/api/auth/signout", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ csrfToken, callbackUrl: "/" }),
    });
    setSession(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
