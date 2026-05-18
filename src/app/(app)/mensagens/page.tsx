import { Suspense } from "react";
import { ChatApp } from "@/components/ChatApp";
import { PageContainer } from "@/components/PageContainer";
import { getCurrentUser } from "@/lib/auth";

export default async function MensagensPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  return (
    <PageContainer className="!max-w-5xl pb-24 md:pb-8">
      <Suspense
        fallback={
          <div className="bc-skeleton h-96 w-full rounded-2xl" />
        }
      >
        <ChatApp
          currentUser={{
            id: user.id,
            name: user.name,
            username: user.username,
          }}
          pusherKey={process.env.NEXT_PUBLIC_PUSHER_KEY ?? null}
          pusherCluster={process.env.NEXT_PUBLIC_PUSHER_CLUSTER ?? null}
        />
      </Suspense>
    </PageContainer>
  );
}
