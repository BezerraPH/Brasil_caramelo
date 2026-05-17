"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="pt-BR">
      <body className="flex min-h-screen items-center justify-center bg-[#e8f0ec] p-4 text-center font-sans">
        <div>
          <p className="text-4xl">🐕</p>
          <h1 className="mt-4 text-xl font-bold text-[#1b6ca8]">
            Brasil Caramelo — erro crítico
          </h1>
          <button
            type="button"
            onClick={reset}
            className="mt-6 rounded-xl bg-[#2d8b57] px-5 py-2.5 text-sm font-semibold text-white"
          >
            Recarregar
          </button>
        </div>
      </body>
    </html>
  );
}
