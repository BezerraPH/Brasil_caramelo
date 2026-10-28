import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const USER_DATA_DIR = 'C:\\Users\\pedro\\.gemini\\antigravity-ide\\brain\\ef53d5ee-cea5-4c9e-badf-59c01407ef9a\\scratch\\chrome-user-data';
const OUT_DIR = path.resolve('docs/screenshots');

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

class CDPClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.ws = null;
    this.id = 1;
    this.callbacks = new Map();
    this.events = new Map();
  }

  async connect() {
    return new Promise((resolve, reject) => {
      this.ws = new globalThis.WebSocket(this.wsUrl);
      this.ws.onopen = () => resolve();
      this.ws.onerror = (err) => reject(err);
      this.ws.onmessage = (msg) => {
        const data = JSON.parse(msg.data);
        if (data.id && this.callbacks.has(data.id)) {
          const { resolve, reject } = this.callbacks.get(data.id);
          this.callbacks.delete(data.id);
          if (data.error) reject(new Error(data.error.message));
          else resolve(data.result);
        } else if (data.method) {
          const listeners = this.events.get(data.method) || [];
          listeners.forEach(fn => fn(data.params));
        }
      };
    });
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = this.id++;
      this.callbacks.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  close() {
    if (this.ws) this.ws.close();
  }
}

async function main() {
  console.log('==> Iniciando Chrome Headless com DevTools Protocol...');
  const chrome = spawn(CHROME_PATH, [
    '--headless=new',
    '--remote-debugging-port=9222',
    `--user-data-dir=${USER_DATA_DIR}`,
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    '--hide-scrollbars',
    'about:blank'
  ]);

  await new Promise(r => setTimeout(r, 2000));

  try {
    const targetsRes = await fetch('http://127.0.0.1:9222/json/list');
    const targets = await targetsRes.json();
    const pageTarget = targets.find(t => t.type === 'page') || targets[0];
    if (!pageTarget) throw new Error('Nenhuma página encontrada');

    const cdp = new CDPClient(pageTarget.webSocketDebuggerUrl);
    await cdp.connect();

    await cdp.send('Page.enable');
    await cdp.send('Network.enable');

    // Auto-dismiss banners and hide compilation toast
    await cdp.send('Page.addScriptToEvaluateOnNewDocument', {
      source: `
        try {
          sessionStorage.setItem("bc-connection-banner-dismiss", "1");
          localStorage.setItem("bc_pwa_install_dismiss", "1");
        } catch(e) {}
        const style = document.createElement("style");
        style.textContent = "nextjs-portal, [data-next-badge], [class*='next-indicator'], [data-nextjs-toast], next-portal { display: none !important; }";
        document.documentElement.appendChild(style);
      `
    });

    const SESSION_TOKEN = 'caramelo_demo_session_token_2026';

    const pages = [
      {
        name: '01-landing-page.png',
        url: 'http://localhost:3000',
        auth: false,
        width: 1280,
        height: 850,
        mobile: false,
        scrollY: 0,
        waitMs: 1500,
        title: 'Página Inicial & Apresentação'
      },
      {
        name: '02-login-hibrido.png',
        url: 'http://localhost:3000/entrar',
        auth: false,
        width: 1280,
        height: 850,
        mobile: false,
        scrollY: 0,
        waitMs: 1500,
        title: 'Login Híbrido (Web2 + Nostr NIP-07)'
      },
      {
        name: '03-feed-dual-engine.png',
        url: 'http://localhost:3000/feed',
        auth: true,
        width: 1280,
        height: 900,
        mobile: false,
        scrollY: 180,
        waitMs: 2500,
        title: 'Feed de Recados Dual-Engine'
      },
      {
        name: '04-perfil-estilo-orkut.png',
        url: 'http://localhost:3000/perfil/pedro',
        auth: true,
        width: 1280,
        height: 900,
        mobile: false,
        scrollY: 0,
        waitMs: 2500,
        title: 'Perfil Nostálgico com Depoimentos e Selos'
      },
      {
        name: '05-pet-virtual-caramelo.png',
        url: 'http://localhost:3000/cachorro',
        auth: true,
        width: 1280,
        height: 900,
        mobile: false,
        scrollY: 180,
        waitMs: 2500,
        title: 'Pet Virtual Caramelo'
      },
      {
        name: '06-comunidades-casinhas.png',
        url: 'http://localhost:3000/comunidades',
        auth: true,
        width: 1280,
        height: 850,
        mobile: false,
        scrollY: 0,
        waitMs: 2000,
        title: 'Comunidades & Casinhas'
      },
      {
        name: '07-tribunal-do-cao.png',
        url: 'http://localhost:3000/tribunal',
        auth: true,
        width: 1280,
        height: 850,
        mobile: false,
        scrollY: 0,
        waitMs: 2000,
        title: 'Tribunal do Cão (Moderação Coletiva)'
      },
      {
        name: '08-mobile-pwa-feed.png',
        url: 'http://localhost:3000/feed',
        auth: true,
        width: 412,
        height: 915,
        mobile: true,
        scrollY: 140,
        waitMs: 2500,
        title: 'Experiência Mobile PWA'
      }
    ];

    for (const p of pages) {
      console.log(`\n📸 Capturando [${p.name}] - ${p.title}...`);

      if (p.auth) {
        await cdp.send('Network.setCookie', {
          name: 'bc_session',
          value: SESSION_TOKEN,
          domain: 'localhost',
          path: '/',
          httpOnly: true
        });
      } else {
        await cdp.send('Network.deleteCookies', {
          name: 'bc_session',
          domain: 'localhost',
          path: '/'
        });
      }

      await cdp.send('Emulation.setDeviceMetricsOverride', {
        width: p.width,
        height: p.height,
        deviceScaleFactor: 2,
        mobile: p.mobile
      });

      if (p.mobile) {
        await cdp.send('Emulation.setUserAgentOverride', {
          userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36'
        });
      } else {
        await cdp.send('Emulation.setUserAgentOverride', {
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        });
      }

      await cdp.send('Page.navigate', { url: p.url });
      await new Promise(r => setTimeout(r, p.waitMs));

      if (p.scrollY > 0) {
        await cdp.send('Runtime.evaluate', {
          expression: `window.scrollTo({ top: ${p.scrollY}, behavior: 'instant' });`
        });
        await new Promise(r => setTimeout(r, 400));
      }

      const screenshot = await cdp.send('Page.captureScreenshot', {
        format: 'png',
        quality: 100
      });

      const buffer = Buffer.from(screenshot.data, 'base64');
      const filePath = path.join(OUT_DIR, p.name);
      fs.writeFileSync(filePath, buffer);
      console.log(`   ✓ Salvo em ${filePath} (${(buffer.length / 1024).toFixed(1)} KB)`);
    }

    cdp.close();
    console.log('\n🎉 Todas as capturas de tela foram geradas com sucesso!');
  } finally {
    chrome.kill();
  }
}

main().catch(err => {
  console.error('Erro na captura:', err);
  process.exit(1);
});
