export async function signInWithCredentials(
  email: string,
  password: string,
  callbackUrl = "/menu",
) {
  const csrfResponse = await fetch("/api/auth/csrf");
  if (!csrfResponse.ok) {
    return { ok: false, message: "Could not start login. Please try again." };
  }

  const { csrfToken } = await csrfResponse.json();
  if (!csrfToken) {
    return { ok: false, message: "Could not verify login. Please try again." };
  }

  const response = await fetch("/api/auth/callback/credentials", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      csrfToken,
      email,
      password,
      callbackUrl,
    }),
  });

  const finalUrl = response.url ? new URL(response.url, window.location.origin) : null;
  const error = finalUrl?.searchParams.get("error");

  if (!response.ok || error) {
    return { ok: false, message: "Invalid email or password." };
  }

  return { ok: true, message: "Signed in successfully." };
}
