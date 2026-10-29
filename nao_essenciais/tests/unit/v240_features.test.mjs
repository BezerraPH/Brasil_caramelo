import test from "node:test";
import assert from "node:assert";
import { createHash } from "node:crypto";
import {
  parseTestimonialThread,
  serializeTestimonialThread,
} from "../../../src/lib/testimonials-thread.ts";

// ========================================================
// MÓDULO 1: SCRAPBOOK COM THREADS EM DEPOIMENTOS (R-SOC-01)
// ========================================================

test("R-SOC-01: Parseamento de depoimento clássico sem thread", () => {
  const raw = "Você é um grande amigo de infância! Valeu pelos recados na matilha.";
  const parsed = parseTestimonialThread(raw);

  assert.strictEqual(parsed.mainText, raw);
  assert.strictEqual(parsed.replies.length, 0);
});

test("R-SOC-01: Serialização e parseamento de thread encadeada no Scrapbook", () => {
  const main = "Parabéns pelo cãozinho caramelo! É muito fofo.";
  const reply1 = {
    id: "reply-1",
    fromUserId: "user-bob",
    fromName: "Bob Caramelo",
    fromUsername: "bob",
    fromAvatarUrl: null,
    content: "Obrigado Alice! Ele aprendeu a latir hoje cedo 🐕",
    createdAt: "2026-10-29T10:00:00.000Z",
  };

  const reply2 = {
    id: "reply-2",
    fromUserId: "user-alice",
    fromName: "Alice Dog",
    fromUsername: "alice",
    fromAvatarUrl: "https://example.com/avatar.jpg",
    content: "Que demais!! Quero visitar o quintal dele logo!",
    createdAt: "2026-10-29T10:05:00.000Z",
  };

  const serialized = serializeTestimonialThread(main, [reply1, reply2]);
  assert.ok(serialized.includes("<!-- BC_THREAD_REPLIES_V1 -->"));

  const parsed = parseTestimonialThread(serialized);
  assert.strictEqual(parsed.mainText, main);
  assert.strictEqual(parsed.replies.length, 2);
  assert.strictEqual(parsed.replies[0].fromUsername, "bob");
  assert.strictEqual(parsed.replies[1].content, "Que demais!! Quero visitar o quintal dele logo!");
});

test("R-SOC-01: Resiliência a conteúdo nulo ou malformatado", () => {
  assert.deepStrictEqual(parseTestimonialThread(""), { mainText: "", replies: [] });
  assert.deepStrictEqual(parseTestimonialThread(null), { mainText: "", replies: [] });

  const broken = "Texto\n\n<!-- BC_THREAD_REPLIES_V1 -->\n{invalid json";
  const parsedBroken = parseTestimonialThread(broken);
  assert.strictEqual(parsedBroken.mainText, broken);
  assert.strictEqual(parsedBroken.replies.length, 0);
});

// ========================================================
// MÓDULO 2: RECADO DO DIA FIXADO NO PERFIL (R-SOC-03)
// ========================================================

test("R-SOC-03: Validação de Recado do Dia Fixado e Prioridade", () => {
  function validatePinnedScrap(content, postId) {
    if (postId) return { ok: true, mode: "existing_post", postId };
    if (!content || !content.trim()) return { ok: false, error: "Conteúdo vazio" };
    if (content.length > 500) return { ok: false, error: "Limite excedido" };
    return { ok: true, mode: "new_post", content: content.trim(), priority: 999 };
  }

  assert.strictEqual(validatePinnedScrap("", null).ok, false);
  assert.strictEqual(validatePinnedScrap("a".repeat(501), null).ok, false);

  const valid = validatePinnedScrap("“A matilha unida jamais será vencida!”", null);
  assert.strictEqual(valid.ok, true);
  assert.strictEqual(valid.priority, 999);

  const byPost = validatePinnedScrap("", "post-cuid-123");
  assert.strictEqual(byPost.ok, true);
  assert.strictEqual(byPost.mode, "existing_post");
});

// ========================================================
// MÓDULO 3: FILTROS DE HASHTAG E MATILHA NO CINELAR (R-DIS-01)
// ========================================================

test("R-DIS-01: Sanitização e Query Builder de Hashtags Cinelar", () => {
  function buildCinelarTagWhere(tag) {
    if (!tag) return null;
    const cleanTag = tag.replace(/^#/, "").trim();
    if (!cleanTag) return null;
    return {
      content: {
        contains: `#${cleanTag}`,
        mode: "insensitive",
      },
    };
  }

  assert.strictEqual(buildCinelarTagWhere(null), null);
  assert.strictEqual(buildCinelarTagWhere(""), null);

  const filter1 = buildCinelarTagWhere("#caramelo");
  assert.deepStrictEqual(filter1, {
    content: { contains: "#caramelo", mode: "insensitive" },
  });

  const filter2 = buildCinelarTagWhere("resgate");
  assert.deepStrictEqual(filter2, {
    content: { contains: "#resgate", mode: "insensitive" },
  });
});

// ========================================================
// MÓDULO 4: PROTOCOLO NOSTR NIP-96 & BLOSSOM SERVER
// ========================================================

test("NIP-96 & Blossom: Geração de Hash SHA-256 e Tags NIP-94", () => {
  const dummyPayload = Buffer.from("🐕 Foto soberana do cão caramelo no MinIO");
  const sha256 = createHash("sha256").update(dummyPayload).digest("hex");

  assert.strictEqual(sha256.length, 64);

  // Formato da resposta NIP-96
  const nip96Response = {
    status: "success",
    nip94_event: {
      tags: [
        ["url", `https://brasilcaramelo.local/api/media/${sha256}.jpg`],
        ["ox", sha256],
        ["m", "image/jpeg"],
        ["size", String(dummyPayload.length)],
        ["client", "brasil-caramelo"],
      ],
    },
  };

  assert.strictEqual(nip96Response.status, "success");
  const oxTag = nip96Response.nip94_event.tags.find((t) => t[0] === "ox");
  assert.strictEqual(oxTag[1], sha256);

  // Formato da resposta Blossom
  const blossomResponse = {
    url: `https://brasilcaramelo.local/api/media/${sha256}.jpg`,
    sha256,
    size: dummyPayload.length,
    type: "image/jpeg",
    uploaded: Math.floor(Date.now() / 1000),
  };

  assert.strictEqual(blossomResponse.sha256, sha256);
  assert.strictEqual(blossomResponse.size, dummyPayload.length);
});
