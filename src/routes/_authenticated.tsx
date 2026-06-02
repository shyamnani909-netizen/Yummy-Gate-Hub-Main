import { createFileRoute, Outlet, useNavigate, useRouter } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/_authenticated")({ component: AuthLayout });

function AuthLayout() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const router = useRouter();

  const currentPath = router.state.location.pathname;
  const isPublicProfile = currentPath === "/profile";

  useEffect(() => {
    if (!loading && !user && !isPublicProfile) navigate({ to: "/login" });
  }, [loading, user, navigate, isPublicProfile]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Loading...
      </div>
    );
  }
  if (!user && !isPublicProfile) return null;
  return <Outlet />;
}
