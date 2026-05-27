import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { validationMessage } from "@/lib/api-error";
import { getThreadPollResults } from "@/lib/thread-poll";
import { prisma } from "@/lib/prisma";
import { pollVoteSchema } from "@/lib/validators";

type RouteContext = { params: Promise<{ threadId: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const { threadId } = await context.params;
  const poll = await getThreadPollResults(threadId, user.id);
  if (!poll) {
    return NextResponse.json({ error: "Enquete não encontrada." }, { status: 404 });
  }

  return NextResponse.json({ poll });
}

export async function POST(request: Request, context: RouteContext) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const { threadId } = await context.params;

  const thread = await prisma.thread.findUnique({
    where: { id: threadId },
    select: { archived: true, packId: true, poll: { select: { id: true } } },
  });

  if (!thread?.poll) {
    return NextResponse.json({ error: "Enquete não encontrada." }, { status: 404 });
  }

  if (thread.archived) {
    return NextResponse.json(
      { error: "Arquivo confidencial — enquete encerrada." },
      { status: 403 },
    );
  }

  const member = await prisma.packMember.findUnique({
    where: { packId_userId: { packId: thread.packId, userId: user.id } },
  });
  if (!member) {
    return NextResponse.json(
      { error: "Entre na Matilha para votar." },
      { status: 403 },
    );
  }

  try {
    const body = await request.json();
    const { optionId } = pollVoteSchema.parse(body);

    const option = await prisma.pollOption.findFirst({
      where: { id: optionId, pollId: thread.poll.id },
    });
    if (!option) {
      return NextResponse.json({ error: "Opção inválida." }, { status: 400 });
    }

    const existing = await prisma.pollVote.findUnique({
      where: { pollId_userId: { pollId: thread.poll.id, userId: user.id } },
    });
    if (existing) {
      return NextResponse.json({ error: "Você já votou nesta enquete." }, { status: 409 });
    }

    await prisma.pollVote.create({
      data: {
        pollId: thread.poll.id,
        optionId,
        userId: user.id,
      },
    });

    const poll = await getThreadPollResults(threadId, user.id);
    return NextResponse.json({ poll });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: validationMessage(error) },
        { status: 400 },
      );
    }
    return NextResponse.json({ error: "Voto inválido." }, { status: 400 });
  }
}
