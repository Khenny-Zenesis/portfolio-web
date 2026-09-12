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
    <main className="mx-auto flex max-w-sm flex-col gap-4 px-6 py-24">
      <h1
        style={{ fontFamily: "var(--font-display)", color: "var(--color-text-primary)" }}
        className="text-2xl"
      >
        Admin sign in
      </h1>

      <form action={authenticate} className="flex flex-col gap-4">
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
    </main>
  );
}
