import { prisma } from "./prisma";

export type PollResults = {
  pollId: string;
  question: string | null;
  totalVotes: number;
  myVoteOptionId: string | null;
  options: {
    id: string;
    text: string;
    voteCount: number;
    percent: number;
  }[];
};

export async function getThreadPollResults(
  threadId: string,
  viewerId: string,
): Promise<PollResults | null> {
  const poll = await prisma.threadPoll.findUnique({
    where: { threadId },
    include: {
      options: { orderBy: { sortOrder: "asc" } },
      votes: { select: { userId: true, optionId: true } },
    },
  });

  if (!poll) return null;

  const myVote = poll.votes.find((v) => v.userId === viewerId);
  const totalVotes = poll.votes.length;

  const options = poll.options.map((opt) => {
    const voteCount = poll.votes.filter((v) => v.optionId === opt.id).length;
    return {
      id: opt.id,
      text: opt.text,
      voteCount,
      percent: totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0,
    };
  });

  return {
    pollId: poll.id,
    question: poll.question,
    totalVotes,
    myVoteOptionId: myVote?.optionId ?? null,
    options,
  };
}
