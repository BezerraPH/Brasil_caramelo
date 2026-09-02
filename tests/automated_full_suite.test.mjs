import test from "node:test";
import assert from "node:assert";
import { nip44, nip04, generateSecretKey, getPublicKey, finalizeEvent, verifyEvent, nip19 } from "nostr-tools";

// ==========================================
// MÓDULO 1: AUTENTICAÇÃO E CRIPTOGRAFIA NOSTR
// ==========================================

test("Módulo Nostr - Geração e Validação de Identidade (NIP-01)", () => {
  const secretKey = generateSecretKey();
  const publicKey = getPublicKey(secretKey);

  assert.ok(publicKey && publicKey.length === 64);
  const npub = nip19.npubEncode(publicKey);
  const nsec = nip19.nsecEncode(secretKey);

  assert.ok(npub.startsWith("npub1"));
  assert.ok(nsec.startsWith("nsec1"));

  const decodedPub = nip19.decode(npub);
  assert.strictEqual(decodedPub.data, publicKey);
});

test("Módulo Nostr - Assinatura e Verificação de Eventos Schnorr (NIP-01)", () => {
  const secretKey = generateSecretKey();
  const publicKey = getPublicKey(secretKey);

  const eventTemplate = {
    kind: 1,
    created_at: Math.floor(Date.now() / 1000),
    tags: [["t", "caramelo"], ["client", "brasil-caramelo"]],
    content: "🐾 Latido soberano descentralizado na rede Nostr!",
  };

  const signedEvent = finalizeEvent(eventTemplate, secretKey);
  assert.strictEqual(signedEvent.pubkey, publicKey);
  assert.ok(signedEvent.sig && signedEvent.sig.length === 128);
  assert.ok(signedEvent.id && signedEvent.id.length === 64);

  const isValid = verifyEvent(signedEvent);
  assert.strictEqual(isValid, true);
});

test("Módulo Nostr - Criptografia NIP-44 v2 (ChaCha20-Poly1305 + HKDF)", () => {
  const alicePriv = generateSecretKey();
  const alicePub = getPublicKey(alicePriv);
  const bobPriv = generateSecretKey();
  const bobPub = getPublicKey(bobPriv);

  const keyAlice = nip44.v2.utils.getConversationKey(alicePriv, bobPub);
  const keyBob = nip44.v2.utils.getConversationKey(bobPriv, alicePub);

  const secretText = "Conversa privada ultrassegura da matilha!";
  const encrypted = nip44.v2.encrypt(secretText, keyAlice);
  assert.ok(encrypted.length > 20);

  const decrypted = nip44.v2.decrypt(encrypted, keyBob);
  assert.strictEqual(decrypted, secretText);
});

test("Módulo Nostr - Criptografia Legada NIP-04 (Fallback Compatibility)", async () => {
  const alicePriv = generateSecretKey();
  const alicePub = getPublicKey(alicePriv);
  const bobPriv = generateSecretKey();
  const bobPub = getPublicKey(bobPriv);

  const secretText = "Mensagem compatível com clientes antigos.";
  const encrypted = await nip04.encrypt(alicePriv, bobPub, secretText);
  assert.ok(encrypted.includes("?iv="));

  const decrypted = await nip04.decrypt(bobPriv, alicePub, encrypted);
  assert.strictEqual(decrypted, secretText);
});

// ==========================================
// MÓDULO 2: GAMIFICAÇÃO, PET & CARAMELOCOINS
// ==========================================

test("Módulo Pet - Cálculo de Decaimento e Humor", () => {
  function computePetStatus(pet, hoursPassed = 4) {
    const hunger = Math.min(100, pet.hunger + hoursPassed * 5);
    const energy = Math.max(0, pet.energy - hoursPassed * 4);
    const hygiene = Math.max(0, pet.hygiene - hoursPassed * 3);
    const happiness = Math.max(0, pet.happiness - hoursPassed * 2);

    let mood = "Tranquilo";
    let emoji = "🐕";
    if (hunger > 70) { mood = "Com Fome"; emoji = "🍖"; }
    else if (energy < 30) { mood = "Com Sono"; emoji = "😴"; }
    else if (happiness > 80) { mood = "Super Feliz"; emoji = "🐶"; }

    return { hunger, energy, hygiene, happiness, mood, emoji };
  }

  const initial = { hunger: 20, energy: 90, hygiene: 90, happiness: 95 };
  const afterTime = computePetStatus(initial, 12);

  assert.strictEqual(afterTime.hunger, 80);
  assert.strictEqual(afterTime.mood, "Com Fome");
  assert.strictEqual(afterTime.emoji, "🍖");
});

test("Módulo Economia - Validação de Saque Lightning de CarameloCoins", () => {
  function validateWithdrawal(userCoins, amountRequested, invoice) {
    const amount = parseInt(String(amountRequested), 10);
    if (isNaN(amount) || amount < 100) {
      return { ok: false, error: "Saque mínimo de 100 CarameloCoins." };
    }
    if (!invoice || !invoice.startsWith("lnbc")) {
      return { ok: false, error: "Fatura Lightning inválida." };
    }
    if (userCoins < amount) {
      return { ok: false, error: "Saldo insuficiente." };
    }
    return { ok: true, remaining: userCoins - amount };
  }

  const valid = validateWithdrawal(500, 200, "lnbc21000n1pjtestinvoice999...");
  assert.strictEqual(valid.ok, true);
  assert.strictEqual(valid.remaining, 300);

  const invalidAmount = validateWithdrawal(500, 50, "lnbc21000n1pj...");
  assert.strictEqual(invalidAmount.ok, false);

  const invalidInvoice = validateWithdrawal(500, 200, "bc1qtestaddress...");
  assert.strictEqual(invalidInvoice.ok, false);
});

// ==========================================
// MÓDULO 3: RATE LIMITING & CACHING EM MEMÓRIA
// ==========================================

test("Módulo Performance - Algoritmo Sliding Window Rate Limiter", () => {
  const store = new Map();
  function checkLimit(key, max = 3, windowMs = 1000, now = Date.now()) {
    const record = store.get(key) ?? { timestamps: [] };
    record.timestamps = record.timestamps.filter((t) => now - t < windowMs);
    if (record.timestamps.length >= max) return false;
    record.timestamps.push(now);
    store.set(key, record);
    return true;
  }

  const t0 = 10000;
  assert.strictEqual(checkLimit("ip:127.0.0.1", 3, 1000, t0), true);
  assert.strictEqual(checkLimit("ip:127.0.0.1", 3, 1000, t0 + 100), true);
  assert.strictEqual(checkLimit("ip:127.0.0.1", 3, 1000, t0 + 200), true);
  // Quarta requisição no mesmo segundo deve ser bloqueada
  assert.strictEqual(checkLimit("ip:127.0.0.1", 3, 1000, t0 + 300), false);
  // Após expirar a janela, volta a ser permitida
  assert.strictEqual(checkLimit("ip:127.0.0.1", 3, 1000, t0 + 1200), true);
});

test("Módulo Performance - TTL In-Memory Cache com Invalidação", async () => {
  const cache = new Map();
  function getOrSet(key, ttlSeconds, fetcher, now = Date.now()) {
    const entry = cache.get(key);
    if (entry && entry.expiresAt > now) return entry.data;
    const fresh = fetcher();
    cache.set(key, { data: fresh, expiresAt: now + ttlSeconds * 1000 });
    return fresh;
  }

  let calls = 0;
  const fetchTrends = () => { calls++; return ["#caramelo", "#viralata", "#pet"]; };

  const res1 = getOrSet("trends", 60, fetchTrends, 1000);
  const res2 = getOrSet("trends", 60, fetchTrends, 5000);
  assert.strictEqual(calls, 1);
  assert.deepStrictEqual(res1, res2);

  // Após 70 segundos (expirou o TTL de 60s)
  const res3 = getOrSet("trends", 60, fetchTrends, 75000);
  assert.strictEqual(calls, 2);
  assert.deepStrictEqual(res3, res1);
});

// ==========================================
// MÓDULO 4: REPUTAÇÃO E MODERAÇÃO DO TRIBUNAL
// ==========================================

test("Módulo Tribunal - Cálculo de Veredito de Votação Popular", () => {
  function evaluateTribunalCase(votesInnocent, votesGuilty, minQuorum = 5) {
    const total = votesInnocent + votesGuilty;
    if (total < minQuorum) return { status: "VOTING", verdict: null };
    if (votesGuilty > votesInnocent * 1.5) {
      return { status: "CONDEMNED", verdict: "GUILTY", action: "HIDE_POST" };
    }
    return { status: "ACQUITTED", verdict: "INNOCENT", action: "KEEP_POST" };
  }

  assert.strictEqual(evaluateTribunalCase(2, 2, 5).status, "VOTING");
  assert.strictEqual(evaluateTribunalCase(1, 6, 5).verdict, "GUILTY");
  assert.strictEqual(evaluateTribunalCase(5, 2, 5).verdict, "INNOCENT");
});
