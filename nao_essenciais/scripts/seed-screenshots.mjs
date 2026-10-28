import bcrypt from 'bcryptjs';
import pg from 'pg';

const pool = new pg.Pool({
  connectionString: 'postgresql://caramelo:caramelo_secret@localhost:5432/brasil_caramelo'
});

async function main() {
  const client = await pool.connect();
  try {
    console.log('Connected to PostgreSQL...');

    const hash = await bcrypt.hash('123456', 10);
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    // 1. Insert Pedro
    await client.query(`
      INSERT INTO "User" (
        id, email, "passwordHash", name, username, bio, "avatarUrl",
        "viewMode", "profileVibe", "showVisits", "isFoundingMember", "profileTheme",
        "biscuitBalance", "locationCity", "locationArea", "showLocation",
        "isPremium", "createdAt", "updatedAt"
      ) VALUES (
        'usr_pedro_demo', 'pedro@brasilcaramelo.com', $1, 'Pedro Henrique', 'pedro',
        'Criador do Brasil Caramelo 🐕 | Soberania Digital, Nostr & Nostalgia Anos 2000 ⚡',
        '/icons/icon-192.png',
        'FEED', 'FEED', true, true, 'CARAMELO',
        520, 'São Paulo', 'Brasil', true,
        true, NOW(), NOW()
      ) ON CONFLICT (email) DO UPDATE SET
        name = EXCLUDED.name,
        username = EXCLUDED.username,
        bio = EXCLUDED.bio,
        "isPremium" = true,
        "biscuitBalance" = 520;
    `, [hash]);

    // 2. Insert Amigo 1
    await client.query(`
      INSERT INTO "User" (
        id, email, "passwordHash", name, username, bio,
        "isFoundingMember", "createdAt", "updatedAt"
      ) VALUES (
        'usr_amigo_caramelo', 'amigo@brasilcaramelo.com', $1, 'Caramelo Raiz', 'caramelo_raiz',
        'Fiel protetor do bairro e fã do Brasil Caramelo 🐾',
        true, NOW(), NOW()
      ) ON CONFLICT (email) DO NOTHING;
    `, [hash]);

    // 3. Insert Amigo 2 (Mel)
    await client.query(`
      INSERT INTO "User" (
        id, email, "passwordHash", name, username, bio,
        "isFoundingMember", "createdAt", "updatedAt"
      ) VALUES (
        'usr_mel_viralata', 'mel@brasilcaramelo.com', $1, 'Mel Caramelo', 'melzinha',
        'Dona da casinha de Vira-latas e apaixonada por petiscos 🦴',
        true, NOW(), NOW()
      ) ON CONFLICT (email) DO NOTHING;
    `, [hash]);

    // 4. Session for Pedro
    await client.query(`
      INSERT INTO "Session" (id, token, "userId", "expiresAt", "createdAt")
      VALUES ('sess_demo_1', 'caramelo_demo_session_token_2026', 'usr_pedro_demo', $1, NOW())
      ON CONFLICT (token) DO UPDATE SET "expiresAt" = $1;
    `, [expiresAt]);

    // 5. Friendship
    await client.query(`
      INSERT INTO "Friendship" (id, "requesterId", "addresseeId", status, "requesterDegree", "addresseeDegree", "createdAt")
      VALUES 
        ('fr_1', 'usr_amigo_caramelo', 'usr_pedro_demo', 'ACCEPTED', 'BEST_FRIEND', 'BEST_FRIEND', NOW()),
        ('fr_2', 'usr_mel_viralata', 'usr_pedro_demo', 'ACCEPTED', 'FRIEND', 'FRIEND', NOW())
      ON CONFLICT DO NOTHING;
    `);

    // 6. Pet for Pedro
    await client.query(`
      INSERT INTO "Pet" (
        id, "userId", name, color, hunger, energy, happiness, level, experience, coins, "createdAt", "updatedAt"
      ) VALUES (
        'pet_pedro_1', 'usr_pedro_demo', 'Caramelo Soberano', 'gold', 95, 90, 100, 7, 450, 1500, NOW(), NOW()
      ) ON CONFLICT ("userId") DO UPDATE SET
        name = EXCLUDED.name,
        hunger = 95,
        energy = 90,
        happiness = 100,
        level = 7,
        coins = 1500;
    `);

    // 7. Testimonials (Depoimentos)
    await client.query(`
      INSERT INTO "Testimonial" (
        id, "fromUserId", "toUserId", content, accepted, "acceptedAt", "createdAt"
      ) VALUES (
        'testim_1', 'usr_amigo_caramelo', 'usr_pedro_demo',
        'Conheço o Pedro desde os primórdios da internet! Cara 100% confiável, amigão da matilha e pioneiro da soberania digital! DONO DO MEU TOPO! 🐕👑 Não aceita sem ler hein rsrs!',
        true, NOW(), NOW()
      ) ON CONFLICT DO NOTHING;
    `);

    // 8. Reputations
    await client.query(`
      INSERT INTO "Reputation" (id, "fromUserId", "toUserId", level, "createdAt", "updatedAt")
      VALUES
        ('rep_1', 'usr_amigo_caramelo', 'usr_pedro_demo', 'GOLDEN', NOW(), NOW()),
        ('rep_2', 'usr_mel_viralata', 'usr_pedro_demo', 'CARAMELO', NOW(), NOW())
      ON CONFLICT DO NOTHING;
    `);

    // 9. Posts
    await client.query(`
      INSERT INTO "Post" (
        id, "authorId", content, "createdAt", "updatedAt"
      ) VALUES 
      (
        'post_demo_1', 'usr_pedro_demo',
        '🐾 Bem-vindos ao Brasil Caramelo! Uma rede social brasileira, soberana e resistente a qualquer censura. Conectada à rede Nostr mundial com chaves criptográficas sob seu controle e micro-gorjetas Lightning instantâneas! ⚡🇧🇷 #nostr #brasilcaramelo #viralata',
        NOW() - INTERVAL '10 minutes', NOW()
      ),
      (
        'post_demo_2', 'usr_amigo_caramelo',
        'Sorte do dia: Quem tem um vira-lata caramelo na vida nunca anda desprotegido. Não esqueçam de alimentar seus pets no jogo diário para coletar as CarameloCoins da matilha! 🦴🐕',
        NOW() - INTERVAL '45 minutes', NOW()
      ),
      (
        'post_demo_3', 'usr_mel_viralata',
        'Nostalgia pura relembrar o Orkut com scraps, comunidades clássicas e depoimentos no mural, mas agora com criptografia NIP-44 v2 e sem algoritmo predatório. O Brasil precisava disso! 💛✨',
        NOW() - INTERVAL '2 hours', NOW()
      )
      ON CONFLICT DO NOTHING;
    `);

    // 10. Likes
    await client.query(`
      INSERT INTO "Like" (id, "postId", "userId", reaction, "createdAt")
      VALUES 
        ('like_1', 'post_demo_1', 'usr_amigo_caramelo', 'HEART', NOW()),
        ('like_2', 'post_demo_1', 'usr_mel_viralata', 'AUAU', NOW()),
        ('like_3', 'post_demo_2', 'usr_pedro_demo', 'HEART', NOW())
      ON CONFLICT DO NOTHING;
    `);

    // 11. Packs (Matilhas Oficiais)
    await client.query(`
      INSERT INTO "Pack" (id, slug, name, description, "ownerId", "createdAt")
      VALUES
        ('pack_1', 'odeio-acordar-cedo', 'Eu Odeio Acordar Cedo (Versão Caramelo)', 'Para quem bate o despertador três vezes e ainda posta scrap às 6h59. Solidariedade matinal.', 'usr_pedro_demo', NOW()),
        ('pack_2', 'so-add-com-scrap', 'Só add com scrap', 'Regra simples: amizade só vale com recado público. Sem scrap, sem add.', 'usr_pedro_demo', NOW()),
        ('pack_3', 'nostr-brasil', 'Nostr & Soberania Digital Brasil', 'Tudo sobre clientes Nostr, relays descentralizados, Zaps e privacidade.', 'usr_pedro_demo', NOW())
      ON CONFLICT (slug) DO NOTHING;
    `);

    await client.query(`
      INSERT INTO "PackMember" (id, "packId", "userId", "joinedAt")
      VALUES
        ('pm_1', 'pack_1', 'usr_pedro_demo', NOW()),
        ('pm_2', 'pack_2', 'usr_pedro_demo', NOW()),
        ('pm_3', 'pack_3', 'usr_pedro_demo', NOW()),
        ('pm_4', 'pack_1', 'usr_amigo_caramelo', NOW()),
        ('pm_5', 'pack_3', 'usr_amigo_caramelo', NOW())
      ON CONFLICT DO NOTHING;
    `);

    // 12. Communities (Casinhas / Comunidades)
    await client.query(`
      INSERT INTO "Community" (id, slug, name, description, emoji, category, "themePrimary", "themeAccent", "ownerId", "createdAt")
      VALUES
        ('cmty_1', 'vira-lata-caramelo', 'Vira-Lata Caramelo Oficial', 'Patrimônio Imaterial Brasileiro. Se você ama vira-latas caramelo, sua casinha é aqui!', '🐕', 'pets', '#c27a29', '#237e50', 'usr_pedro_demo', NOW()),
        ('cmty_2', 'orkut-nostalgia', 'Anos 2000 & Orkut Raiz', 'Scraps, depoimentos no topo, sorte do dia e a melhor época da internet mundial.', '💬', 'social', '#0b4f8a', '#c27a29', 'usr_pedro_demo', NOW()),
        ('cmty_3', 'nostr-web3', 'Soberania Nostr & Lightning', 'Discussões sobre relays, NIPs, chaves soberanas e pagamentos com Bitcoin.', '⚡', 'tecnologia', '#6b21a8', '#fbbf24', 'usr_pedro_demo', NOW())
      ON CONFLICT (slug) DO NOTHING;
    `);

    // 13. Tribunal Case
    await client.query(`
      INSERT INTO "PostTribunalCase" (id, "postId", status, "votesKeep", "votesRemove", "createdAt")
      VALUES
        ('case_demo_1', 'post_demo_3', 'OPEN', 8, 2, NOW())
      ON CONFLICT ("postId") DO NOTHING;
    `);

    console.log('Demo seed completed successfully!');
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
