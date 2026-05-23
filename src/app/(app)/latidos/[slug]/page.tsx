import { notFound } from "next/navigation";
import { CASINHAS } from "@/lib/casinhas";
import { PageContainer } from "@/components/PageContainer";
import { LatidosRoomClient } from "@/components/LatidosRoomClient";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function LatidosRoomPage({ params }: Props) {
  const { slug } = await params;
  const casinha = CASINHAS.find((c) => c.slug === slug);
  if (!casinha) notFound();

  return (
    <PageContainer>
      <LatidosRoomClient casinha={casinha} />
    </PageContainer>
  );
}
