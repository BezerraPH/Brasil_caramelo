import test from "node:test";
import assert from "node:assert";
import { nip44, generateSecretKey, getPublicKey } from "nostr-tools";

test("Nostr NIP-44 v2 encryption and decryption", () => {
  const aliceSecret = generateSecretKey();
  const alicePublic = getPublicKey(aliceSecret);

  const bobSecret = generateSecretKey();
  const bobPublic = getPublicKey(bobSecret);

  // Alice cria chave de conversa com a chave pública do Bob
  const conversationKeyAlice = nip44.v2.utils.getConversationKey(aliceSecret, bobPublic);
  const secretMessage = "Au au! Mensagem ultra segura da matilha Caramelo!";
  const encrypted = nip44.v2.encrypt(secretMessage, conversationKeyAlice);

  // Bob cria chave de conversa com a chave pública da Alice
  const conversationKeyBob = nip44.v2.utils.getConversationKey(bobSecret, alicePublic);
  const decrypted = nip44.v2.decrypt(encrypted, conversationKeyBob);

  assert.strictEqual(decrypted, secretMessage);
});

test("Rate Limit Sliding Window Logic", () => {
  const timestamps = [1000, 2000, 3000];
  const now = 5000;
  const windowMs = 4000;

  const valid = timestamps.filter((t) => now - t < windowMs);
  assert.strictEqual(valid.length, 2); // 2000 e 3000
});
