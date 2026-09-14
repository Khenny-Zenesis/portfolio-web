import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { signIn } from "@/lib/auth";

// Unlinked from any public page/nav element, reachable only by direct URL
// (security.md). A Server Action posts credentials directly to NextAuth —
// no next-auth/react client hooks needed, so no SessionProvider has to be
// added to the already-finalized layout.tsx (Checkpoint 4: use as-is).
export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  async function authenticate(formData: FormData) {
    "use server";
    try {
      await signIn("credentials", {
        email: formData.get("email"),
        password: formData.get("password"),
        redirectTo: "/admin/dashboard",
      });
    } catch (err) {
      // signIn()'s own success path also redirects by throwing a Next.js
      // internal redirect signal — it is not an AuthError instance, so it
      // falls through to the rethrow below untouched. Only an actual failed
      // sign-in (an AuthError) gets redirected back with an error message.
      if (err instanceof AuthError) {
        redirect("/admin/login?error=CredentialsSignin");
      }
      throw err;
    }
  }

  const inputStyle = {
    borderRadius: "var(--radius-md)",
    borderColor: "var(--color-border)",
    background: "var(--color-bg-secondary)",
    color: "var(--color-text-primary)",
    fontFamily: "var(--font-primary)",
  };

  return (
    <main className="admin-login-shell">
      <div className="admin-login-brand">
        <span className="admin-login-mark">KO</span>
        <span>Portfolio control room</span>
      </div>
      <div className="admin-login-card">
        <p className="admin-kicker">Private workspace</p>
        <h1>Welcome back.</h1>
        <p className="admin-login-copy">Sign in to shape the work, stories, and projects behind the portfolio.</p>

        <form action={authenticate} className="admin-login-form">
        <div>
          <label
            htmlFor="email"
            style={{ fontFamily: "var(--font-primary)", color: "var(--color-text-secondary)" }}
            className="text-sm"
          >
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            style={inputStyle}
            className="mt-1 w-full border px-3 py-2"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            style={{ fontFamily: "var(--font-primary)", color: "var(--color-text-secondary)" }}
            className="text-sm"
          >
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            style={inputStyle}
            className="mt-1 w-full border px-3 py-2"
          />
        </div>

        {error && (
          <p role="alert" style={{ color: "var(--color-error)", fontFamily: "var(--font-primary)" }}>
            Incorrect email or password.
          </p>
        )}

        <button
          type="submit"
          style={{
            fontFamily: "var(--font-primary)",
            borderRadius: "var(--radius-md)",
            background: "var(--color-primary)",
            color: "var(--color-on-primary)",
          }}
          className="px-6 py-3 font-semibold"
        >
          Sign in
        </button>
        </form>
      </div>
      <p className="admin-login-footer">Fagbo Kehinde Omolola <span>·</span> Product Engineer &amp; AI Builder</p>
    </main>
  );
}
