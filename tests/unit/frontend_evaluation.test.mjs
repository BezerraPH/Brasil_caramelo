import test from "node:test";
import assert from "node:assert";
import { nip44, generateSecretKey, getPublicKey, nip19 } from "nostr-tools";

// Teste 1: Sistema de Criptografia NIP-44 v2
test("Frontend - Nostr NIP-44 v2 ChaCha20-Poly1305 Chat Encryption", () => {
  const alicePriv = generateSecretKey();
  const alicePub = getPublicKey(alicePriv);

  const bobPriv = generateSecretKey();
  const bobPub = getPublicKey(bobPriv);

  const conversationKeyAlice = nip44.v2.utils.getConversationKey(alicePriv, bobPub);
  const rawMessage = "🐾 Au au! Recado ultra secreto criptografado!";

  const encrypted = nip44.v2.encrypt(rawMessage, conversationKeyAlice);
  assert.ok(typeof encrypted === "string" && encrypted.length > 0);

  const conversationKeyBob = nip44.v2.utils.getConversationKey(bobPriv, alicePub);
  const decrypted = nip44.v2.decrypt(encrypted, conversationKeyBob);
  assert.strictEqual(decrypted, rawMessage);
});

// Teste 2: Conversão de Chaves Nostr (Hex -> npub)
test("Frontend - Nostr Key Encoding (Hex to npub)", () => {
  const privKey = generateSecretKey();
  const pubkeyHex = getPublicKey(privKey);
  const npub = nip19.npubEncode(pubkeyHex);

  assert.ok(npub.startsWith("npub1"));
  const decoded = nip19.decode(npub);
  assert.strictEqual(decoded.type, "npub");
  assert.strictEqual(decoded.data, pubkeyHex);
});

// Teste 3: Lógica de Humor do Pet Mini-Widget
test("Frontend - Pet Dynamic Mood Calculation", () => {
  function getPetMood(pet) {
    if (pet.hunger > 70) return { emoji: "🍖", status: "Com Fome" };
    if (pet.energy < 30) return { emoji: "😴", status: "Com Sono" };
    if (pet.happiness > 80) return { emoji: "🐶", status: "Super Feliz" };
    return { emoji: "🐕", status: "Tranquilo" };
  }

  assert.strictEqual(getPetMood({ hunger: 80, energy: 50, happiness: 50 }).status, "Com Fome");
  assert.strictEqual(getPetMood({ hunger: 20, energy: 20, happiness: 50 }).status, "Com Sono");
  assert.strictEqual(getPetMood({ hunger: 10, energy: 90, happiness: 95 }).status, "Super Feliz");
  assert.strictEqual(getPetMood({ hunger: 30, energy: 60, happiness: 60 }).status, "Tranquilo");
});

// Teste 4: Regex de Autocomplete de Menções (@amigo)
test("Frontend - Mention Autocomplete Regex Detection", () => {
  const text1 = "Olá @caramelo";
  const match1 = text1.match(/@(\w*)$/);
  assert.strictEqual(match1 ? match1[1] : null, "caramelo");

  const text2 = "Bom dia @";
  const match2 = text2.match(/@(\w*)$/);
  assert.strictEqual(match2 ? match2[1] : null, "");

  const text3 = "Sem mencao aqui";
  const match3 = text3.match(/@(\w*)$/);
  assert.strictEqual(match3, null);
});

// Teste 5: Estrutura de Navegação Mobile & Desktop
test("Frontend - Navigation Structure Consistency", () => {
  const MOBILE_ROUTES = ["/feed", "/explorar", "/feed?criar=1", "/mensagens", "/perfil"];
  const DESKTOP_ROUTES = ["/feed", "/explorar", "/nostr", "/casinhas", "/cachorro"];

  assert.strictEqual(MOBILE_ROUTES.length, 5);
  assert.strictEqual(DESKTOP_ROUTES.length, 5);
  assert.ok(MOBILE_ROUTES.includes("/feed"));
  assert.ok(DESKTOP_ROUTES.includes("/nostr"));
});

// Teste 6: Filtros Retrô de Stories
test("Frontend - Stories Retro Filter Classes", () => {
  const FILTERS = [
    { id: "none", css: "" },
    { id: "orkut-sepia", css: "sepia contrast-125" },
    { id: "cyber-caramelo", css: "saturate-200 hue-rotate-15" },
    { id: "nostalgia-bnw", css: "grayscale contrast-150" },
    { id: "dreamy-glow", css: "brightness-110 contrast-105" },
  ];

  assert.strictEqual(FILTERS.length, 5);
  assert.ok(FILTERS.some((f) => f.css.includes("sepia")));
  assert.ok(FILTERS.some((f) => f.css.includes("grayscale")));
});
