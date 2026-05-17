import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { diagnoseUploadthingToken } from "@/lib/uploadthing-token";

const f = createUploadthing();

function requireUploadAuth() {
  const token = diagnoseUploadthingToken();
  if (!token.ok) {
    throw new UploadThingError(token.hint ?? "Uploadthing não configurado no servidor.");
  }
}

export const ourFileRouter = {
  avatar: f({
    image: { maxFileSize: "4MB", maxFileCount: 1 },
  })
    .middleware(async () => {
      requireUploadAuth();
      const user = await getCurrentUser();
      if (!user) throw new UploadThingError("Não autorizado");
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      await prisma.user.update({
        where: { id: metadata.userId },
        data: { avatarUrl: file.ufsUrl },
      });
      return { avatarUrl: file.ufsUrl };
    }),

  postImage: f({
    image: { maxFileSize: "8MB", maxFileCount: 1 },
  })
    .middleware(async () => {
      requireUploadAuth();
      const user = await getCurrentUser();
      if (!user) throw new UploadThingError("Não autorizado");
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata }) => {
      return { userId: metadata.userId };
    }),

  postVideo: f({
    video: { maxFileSize: "32MB", maxFileCount: 1 },
  })
    .middleware(async () => {
      requireUploadAuth();
      const user = await getCurrentUser();
      if (!user) throw new UploadThingError("Não autorizado");
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata }) => {
      return { userId: metadata.userId };
    }),

  storyMedia: f({
    image: { maxFileSize: "8MB", maxFileCount: 1 },
    video: { maxFileSize: "16MB", maxFileCount: 1 },
  })
    .middleware(async () => {
      requireUploadAuth();
      const user = await getCurrentUser();
      if (!user) throw new UploadThingError("Não autorizado");
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata }) => {
      return { userId: metadata.userId };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
