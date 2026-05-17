type PageContainerProps = {
  children: React.ReactNode;
  className?: string;
  narrow?: boolean;
};

export function PageContainer({
  children,
  className = "",
  narrow = false,
}: PageContainerProps) {
  return (
    <main
      className={`mx-auto px-4 py-6 ${narrow ? "max-w-2xl" : "max-w-6xl"} ${className}`}
    >
      {children}
    </main>
  );
}
