import { Suspense } from "react";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/AuthForm";
import { getCurrentUser } from "@/lib/auth";

export default async function RegisterPage() {
  const user = await getCurrentUser();
  if (user) redirect("/feed");

  return (
    <main className="bc-auth-page flex min-h-screen items-center justify-center px-4 py-12">
      <Suspense
        fallback={
          <div className="bc-skeleton h-96 w-full max-w-md rounded-2xl" aria-hidden />
        }
      >
        <AuthForm mode="register" />
      </Suspense>
    </main>
  );
}
