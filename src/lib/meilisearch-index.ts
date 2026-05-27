import {
  isMeilisearchEnabled,
  meiliRequest,
  MEILI_INDEX_POSTS,
  MEILI_INDEX_USERS,
} from "@/lib/meilisearch";
import { extractHashtags } from "@/lib/search-tags";
import { prisma } from "@/lib/prisma";

async function ensureIndex(
  uid: string,
  primaryKey: string,
  searchable: string[],
  filterable: string[],
  sortable?: string[],
): Promise<void> {
  await meiliRequest(`/indexes/${uid}`, {
    method: "PUT",
    body: JSON.stringify({ uid, primaryKey }),
  });
  await meiliRequest(`/indexes/${uid}/settings/searchable-attributes`, {
    method: "PUT",
    body: JSON.stringify(searchable),
  });
  await meiliRequest(`/indexes/${uid}/settings/filterable-attributes`, {
    method: "PUT",
    body: JSON.stringify(filterable),
  });
  if (sortable?.length) {
    await meiliRequest(`/indexes/${uid}/settings/sortable-attributes`, {
      method: "PUT",
      body: JSON.stringify(sortable),
    });
  }
}

export async function ensureMeilisearchIndexes(): Promise<boolean> {
  if (!isMeilisearchEnabled()) return false;
  await ensureIndex(MEILI_INDEX_USERS, "id", ["name", "username", "bio"], [
    "shadowbanned",
  ]);
  await ensureIndex(
    MEILI_INDEX_POSTS,
    "id",
    ["content", "authorName", "authorUsername", "tags"],
    ["tribunalHidden", "communityLevel", "authorShadowbanned"],
    ["createdAt"],
  );
  return true;
}

export async function indexUserDocument(userId: string): Promise<void> {
  if (!isMeilisearchEnabled()) return;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, username: true, bio: true, shadowbanned: true },
  });
  if (!user) return;
  await meiliRequest(`/indexes/${MEILI_INDEX_USERS}/documents`, {
    method: "POST",
    body: JSON.stringify([
      {
        id: user.id,
        name: user.name,
        username: user.username,
        bio: user.bio ?? "",
        shadowbanned: user.shadowbanned,
      },
    ]),
  });
}

export async function indexPostDocument(postId: string): Promise<void> {
  if (!isMeilisearchEnabled()) return;
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: {
      id: true,
      content: true,
      communityLevel: true,
      tribunalHidden: true,
      createdAt: true,
      author: { select: { name: true, username: true, shadowbanned: true } },
    },
  });
  if (!post) return;
  await meiliRequest(`/indexes/${MEILI_INDEX_POSTS}/documents`, {
    method: "POST",
    body: JSON.stringify([
      {
        id: post.id,
        content: post.content,
        authorName: post.author.name,
        authorUsername: post.author.username,
        tags: extractHashtags(post.content),
        communityLevel: post.communityLevel,
        tribunalHidden: post.tribunalHidden,
        authorShadowbanned: post.author.shadowbanned,
        createdAt: post.createdAt.getTime(),
      },
    ]),
  });
}

export async function removePostDocument(postId: string): Promise<void> {
  if (!isMeilisearchEnabled()) return;
  await meiliRequest(`/indexes/${MEILI_INDEX_POSTS}/documents/${postId}`, {
    method: "DELETE",
  });
}

export async function reindexAllMeilisearch(): Promise<{
  users: number;
  posts: number;
}> {
  if (!isMeilisearchEnabled()) return { users: 0, posts: 0 };
  await ensureMeilisearchIndexes();

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      username: true,
      bio: true,
      shadowbanned: true,
    },
  });
  const userDocs = users.map((u) => ({
    id: u.id,
    name: u.name,
    username: u.username,
    bio: u.bio ?? "",
    shadowbanned: u.shadowbanned,
  }));
  for (let i = 0; i < userDocs.length; i += 500) {
    await meiliRequest(`/indexes/${MEILI_INDEX_USERS}/documents`, {
      method: "POST",
      body: JSON.stringify(userDocs.slice(i, i + 500)),
    });
  }

  const posts = await prisma.post.findMany({
    select: {
      id: true,
      content: true,
      communityLevel: true,
      tribunalHidden: true,
      createdAt: true,
      author: { select: { name: true, username: true, shadowbanned: true } },
    },
  });
  const postDocs = posts.map((p) => ({
    id: p.id,
    content: p.content,
    authorName: p.author.name,
    authorUsername: p.author.username,
    tags: extractHashtags(p.content),
    communityLevel: p.communityLevel,
    tribunalHidden: p.tribunalHidden,
    authorShadowbanned: p.author.shadowbanned,
    createdAt: p.createdAt.getTime(),
  }));
  for (let i = 0; i < postDocs.length; i += 500) {
    await meiliRequest(`/indexes/${MEILI_INDEX_POSTS}/documents`, {
      method: "POST",
      body: JSON.stringify(postDocs.slice(i, i + 500)),
    });
  }

  return { users: userDocs.length, posts: postDocs.length };
}
