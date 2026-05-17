"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <span className="mb-4 text-5xl">😵</span>
      <h1 className="text-2xl font-bold text-bc-blue">Ops! Algo deu ruim</h1>
      <p className="mt-2 max-w-md text-sm text-bc-brown">
        A matilha tropeçou numa patinha. Tente de novo.
      </p>
      <div className="mt-6 flex gap-3">
        <button type="button" onClick={reset} className="bc-btn-primary">
          Tentar novamente
        </button>
        <Link href="/feed" className="bc-btn-secondary">
          Ir ao feed
        </Link>
      </div>
    </main>
  );
}
