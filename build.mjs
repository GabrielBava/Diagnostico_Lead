#!/usr/bin/env node
/* =====================================================================
   BUILD DO DIAGNÓSTICO LIFE POCKET (Node 18+, sem dependências)

   node build.mjs              → dist/  (produção: motor empacotado,
                                  trava de domínio e anti-inspeção ligados)
   node build.mjs --dev        → dist-dev/ (sem travas de domínio e inspeção,
                                  para testar no computador)
   node build.mjs --preview D  → D/ (fragmento para pré-visualização)

   Publique no site somente o conteúdo de dist/.
   ===================================================================== */
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, rmSync, existsSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

/* Domínios onde o diagnóstico pode rodar (subdomínios inclusos).
   Fora deles (cópia salva, outro site, arquivo local) a página não abre. */
const DOMINIOS_PERMITIDOS = ['grupolifebrasil.com.br', 'localhost', '127.0.0.1'];

const raiz = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const modo = args.includes('--preview') ? 'preview' : args.includes('--dev') ? 'dev' : 'producao';
const saida = modo === 'preview' ? args[args.indexOf('--preview') + 1] : join(raiz, modo === 'dev' ? 'dist-dev' : 'dist');
if (!saida) { console.error('Informe a pasta: node build.mjs --preview <pasta>'); process.exit(1); }

const ler = p => readFileSync(join(raiz, p), 'utf8');
const dataUri = (p, tipo) => `data:${tipo};base64,${readFileSync(join(raiz, p)).toString('base64')}`;
const LOGO = dataUri('assets/img/logo-life-planejamento-branco.png', 'image/png');
const CORACAO = dataUri('assets/img/coracao-life.png', 'image/png');

/* remove comentários de linha inteira e a indentação (seguro para este código) */
function enxugar(js) {
  return js
    .replace(/^\s*\/\*[\s\S]*?\*\/\s*$/gm, '')
    .split('\n')
    .filter(l => !/^\s*\/\//.test(l))
    .map(l => l.replace(/^\s+/, ''))
    .filter(l => l.length)
    .join('\n');
}

const partes = ['src/config.js', 'src/motor.js', 'src/graficos.js', 'src/protecao.js', 'src/app.js'].map(ler);
let js = '"use strict";\n' + partes.join('\n') + '\niniciarApp();';
js = js.replaceAll('{{LOGO}}', LOGO).replaceAll('{{CORACAO}}', CORACAO);
if (modo !== 'dev') js = enxugar(js);

let scriptTag;
if (modo === 'producao') {
  /* empacota o motor: o código vai cifrado e só é aberto nos domínios permitidos */
  const chave = randomBytes(48);
  const dados = Buffer.from(js, 'utf8');
  const cifrado = Buffer.alloc(dados.length);
  for (let i = 0; i < dados.length; i++) cifrado[i] = dados[i] ^ chave[i % chave.length] ^ ((i * 7) & 255);
  const loader = `(function(){var D=${JSON.stringify(DOMINIOS_PERMITIDOS)},h=location.hostname,ok=D.some(function(d){return h===d||h.slice(-d.length-1)==="."+d});if(!ok){document.body.innerHTML='<p style="font:16px/1.6 sans-serif;color:#eee;background:#111;padding:48px;margin:0;min-height:100vh">Este diagnóstico só pode ser acessado pelo site oficial do Grupo Life Brasil.<br><a style="color:#f39a3c" href="https://www.grupolifebrasil.com.br">grupolifebrasil.com.br</a></p>';return}var k=atob("${chave.toString('base64')}"),p=atob("${cifrado.toString('base64')}"),o=new Uint8Array(p.length);for(var i=0;i<p.length;i++)o[i]=p.charCodeAt(i)^k.charCodeAt(i%k.length)^((i*7)&255);window.__LIFE_PROTECAO={antiDevtools:true};var s=new TextDecoder().decode(o);k=p=o=null;(new Function(s))();s=null})();`;
  scriptTag = `<script>${loader}</script>`;
} else {
  scriptTag = `<script>(function(){window.__LIFE_PROTECAO={antiDevtools:false};\n${js}\n})();</script>`;
}

let html = ler('src/index.html')
  .replace('/*CSS*/', () => ler('src/styles.css'))
  .replaceAll('{{CORACAO}}', CORACAO)
  .replace('<!--JS-->', () => scriptTag);

if (modo === 'preview') {
  const cab = html.split('<!--INICIO-CABECA-->')[1].split('<!--FIM-CABECA-->')[0]
    .replace(/<meta charset[^>]*>\n?/, '').replace(/<meta name="viewport"[^>]*>\n?/, '');
  const corpo = html.split('<!--INICIO-CORPO-->')[1].split('<!--FIM-CORPO-->')[0];
  html = cab + corpo;
} else {
  html = html.replace(/<!--(INICIO|FIM)-(CABECA|CORPO)-->\n?/g, '');
}

if (existsSync(saida) && modo !== 'preview') rmSync(saida, { recursive: true, force: true });
mkdirSync(join(saida, 'assets/video'), { recursive: true });
writeFileSync(join(saida, 'index.html'), html);
for (const f of ['familia-1080.mp4', 'familia-720.mp4', 'familia-poster.jpg']) {
  copyFileSync(join(raiz, 'assets/video', f), join(saida, 'assets/video', f));
}
console.log(`ok · modo ${modo} · ${join(saida, 'index.html')} · ${(html.length / 1024).toFixed(0)} KB`);
