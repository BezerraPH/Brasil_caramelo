import { PageContainer } from "@/components/PageContainer";
import { MatilhaThreadView } from "@/components/MatilhaThreadView";
import { getCurrentUser } from "@/lib/auth";

type PageProps = {
  params: Promise<{ threadId: string }>;
};

export default async function MatilhaThreadPage({ params }: PageProps) {
  const user = await getCurrentUser();
  if (!user) return null;

  const { threadId } = await params;

  return (
    <PageContainer narrow>
      <MatilhaThreadView threadId={threadId} />
    </PageContainer>
  );
}
