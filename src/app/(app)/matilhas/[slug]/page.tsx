import Link from "next/link";
import { PageContainer } from "@/components/PageContainer";
import { MatilhaPackView } from "@/components/MatilhaPackView";
import { getCurrentUser } from "@/lib/auth";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function MatilhaPackPage({ params }: PageProps) {
  const user = await getCurrentUser();
  if (!user) return null;

  const { slug } = await params;

  return (
    <PageContainer narrow>
      <Link href="/matilhas" className="mb-4 inline-block text-sm text-bc-blue hover:underline">
        ← Todas as Matilhas
      </Link>
      <MatilhaPackView slug={slug} />
    </PageContainer>
  );
}
