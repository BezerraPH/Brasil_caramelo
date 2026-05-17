import { FeedSkeleton } from "@/components/FeedSkeleton";
import { PageContainer } from "@/components/PageContainer";

export default function FeedLoading() {
  return (
    <PageContainer>
      <div className="bc-skeleton mb-6 h-10 w-48 rounded-xl" />
      <FeedSkeleton count={4} />
    </PageContainer>
  );
}
