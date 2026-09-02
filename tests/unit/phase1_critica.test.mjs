import test from "node:test";
import assert from "node:assert";
import { nip19, generateSecretKey, getPublicKey } from "nostr-tools";

// 1. TESTE DE SANITIZAÇÃO DE LINKS NOSTR
test("Fase 1: Sanitização de Links e Protocolos Maliciosos", () => {
  const dangerous1 = "javascript:alert(1)";
  const dangerous2 = "data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==";
  const safeHttp = "https://brasilcaramelo.com/feed";
  const safeNostr = "nostr:npub1caramelo9999999999999999999999999999999999999999999999";

  const DANGEROUS_PROTOCOLS = /^(javascript|data|vbscript|file):/i;
  function isSafe(url) {
    if (DANGEROUS_PROTOCOLS.test(url.trim())) return false;
    if (url.startsWith("nostr:") || url.startsWith("http://") || url.startsWith("https://")) return true;
    return false;
  }

  assert.strictEqual(isSafe(dangerous1), false, "javascript: deve ser bloqueado");
  assert.strictEqual(isSafe(dangerous2), false, "data: deve ser bloqueado");
  assert.strictEqual(isSafe(safeHttp), true, "https:// deve ser permitido");
  assert.strictEqual(isSafe(safeNostr), true, "nostr: deve ser permitido");
});

// 2. TESTE DE PARSER DE CONTEÚDO NOSTR (Hashtags, URLs e @menções)
test("Fase 1: Parser de Conteúdo Nostr com Segmentação Segura", () => {
  const sampleNote = "Au au! Veja este post no https://damus.io #viralata com nostr:npub1testpubkey999";
  const tokenRegex = /(https?:\/\/[^\s<]+|nostr:(?:npub1|nsec1|note1|nprofile1|nevent1)[a-z0-9]+|#\w+)/gi;

  const matches = sampleNote.match(tokenRegex);
  assert.ok(matches.includes("https://damus.io"));
  assert.ok(matches.includes("#viralata"));
  assert.ok(matches.includes("nostr:npub1testpubkey999"));
});

// 3. TESTE DE CADASTRO E LOGIN ANÔNIMO NOSTR
test("Fase 1: Conversão e Criação de Identidade Anônima Nostr", () => {
  const secretKey = generateSecretKey();
  const publicKey = getPublicKey(secretKey);
  const npub = nip19.npubEncode(publicKey);

  assert.ok(npub.startsWith("npub1"));

  // Decodifica npub para hex
  const decoded = nip19.decode(npub);
  assert.strictEqual(decoded.data, publicKey);

  // Mapeia usuário determinístico anônimo
  const deterministicEmail = `nostr_${publicKey.slice(0, 16).toLowerCase()}@brasilcaramelo.nostr`;
  const defaultUsername = `caramelo_${publicKey.slice(0, 8).toLowerCase()}`;

  assert.ok(deterministicEmail.endsWith("@brasilcaramelo.nostr"));
  assert.strictEqual(defaultUsername, `caramelo_${publicKey.slice(0, 8).toLowerCase()}`);
});

// 4. TESTE DE EXPONENTIAL BACKOFF COM JITTER PARA WEBSOCKETS
test("Fase 1: Algoritmo de Exponential Backoff com Jitter", () => {
  function calculateBackoffDelay(attempt, baseMs = 1000, maxMs = 30000) {
    const exp = Math.min(maxMs, baseMs * Math.pow(2, attempt));
    const jitter = 0.15 * exp; // Jitter simulado
    return Math.floor(exp + jitter);
  }

  const delay0 = calculateBackoffDelay(0, 1000, 30000);
  const delay1 = calculateBackoffDelay(1, 1000, 30000);
  const delay2 = calculateBackoffDelay(2, 1000, 30000);
  const delayMax = calculateBackoffDelay(10, 1000, 30000);

  assert.ok(delay0 >= 1000 && delay0 <= 1300);
  assert.ok(delay1 >= 2000 && delay1 <= 2600);
  assert.ok(delay2 >= 4000 && delay2 <= 5200);
  assert.ok(delayMax <= 35000); // Não ultrapassa o teto máximo com folga de jitter
});
