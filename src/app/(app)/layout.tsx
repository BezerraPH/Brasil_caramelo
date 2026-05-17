import { redirect } from "next/navigation";
import { NavBar } from "@/components/NavBar";
import { ViewModeSwitcher } from "@/components/ViewModeSwitcher";
import { getCurrentUser } from "@/lib/auth";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/entrar");

  return (
    <>
      <NavBar user={user} />
      {children}
      <ViewModeSwitcher currentMode={user.viewMode} />
    </>
  );
}
