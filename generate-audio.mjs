#!/usr/bin/env node
// 用 ElevenLabs 把所有场景的句子生成澳音 mp3，存到 audio/，并写 audio/manifest.json
// 用法：
//   1) 列出你账号里的声音，挑一个澳洲口音，复制它的 voice id：
//        ELEVENLABS_API_KEY=xxx node generate-audio.mjs --list
//   2) 生成（增量：已生成的会跳过，加了新场景重跑只生成新的）：
//        ELEVENLABS_API_KEY=xxx ELEVEN_VOICE_ID=你选的澳音id node generate-audio.mjs
import fs from 'node:fs';
import crypto from 'node:crypto';

const KEY = process.env.ELEVENLABS_API_KEY;
const VOICE_ID = process.env.ELEVEN_VOICE_ID;
const MODEL = process.env.ELEVEN_MODEL || 'eleven_multilingual_v2';
const AUDIO_DIR = 'audio';

if (!KEY) { console.error('缺少 ELEVENLABS_API_KEY 环境变量'); process.exit(1); }

const fname = t => crypto.createHash('md5').update(t).digest('hex').slice(0, 12) + '.mp3';
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function listVoices() {
  const r = await fetch('https://api.elevenlabs.io/v1/voices', { headers: { 'xi-api-key': KEY } });
  const j = await r.json();
  console.log('\n可用声音（★ = 澳洲口音，挑一个把它的 id 填给 ELEVEN_VOICE_ID）：\n');
  for (const v of j.voices || []) {
    const acc = (v.labels && (v.labels.accent || v.labels.description)) || '';
    const au = /austral/i.test(acc) ? '★ ' : '  ';
    console.log(`${au}${v.name.padEnd(18)} ${v.voice_id}   ${acc}`);
  }
  console.log('\n若列表里没有澳音，去 elevenlabs.io 的 Voice Library 加一个澳洲口音的声音到你的账号，再重跑 --list。');
}

function collectTexts() {
  const scn = JSON.parse(fs.readFileSync('scenarios.json', 'utf8'));
  const set = new Set();
  set.add('Hi there! What can I get you today?');           // testVoice 示例句
  for (const s of scn) {
    if (s.opening) set.add(s.opening);                       // 对方开场白
    if (s.target) set.add(s.target);                         // 标准主练句
    const narr = (s.setup || s.ctx || '') + (s.goal ? '. ' + s.goal : '');  // 场景旁白(和 app 里 narrateScene 拼法一致)
    if (narr.trim()) set.add(narr);
  }
  return [...set];
}

async function tts(text) {
  const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
    method: 'POST',
    headers: { 'xi-api-key': KEY, 'Content-Type': 'application/json', 'Accept': 'audio/mpeg' },
    body: JSON.stringify({ text, model_id: MODEL, voice_settings: { stability: 0.5, similarity_boost: 0.75 } }),
  });
  if (!r.ok) throw new Error(`${r.status} ${await r.text()}`);
  return Buffer.from(await r.arrayBuffer());
}

async function main() {
  if (process.argv.includes('--list')) return listVoices();
  if (!VOICE_ID) { console.error('缺少 ELEVEN_VOICE_ID（先用 --list 挑一个澳音）'); process.exit(1); }

  const texts = collectTexts();
  const chars = texts.reduce((a, t) => a + t.length, 0);
  console.log(`共 ${texts.length} 句、约 ${chars} 字符要生成（ElevenLabs 按字符计费，注意额度）。`);

  fs.mkdirSync(AUDIO_DIR, { recursive: true });
  const manifest = fs.existsSync(`${AUDIO_DIR}/manifest.json`)
    ? JSON.parse(fs.readFileSync(`${AUDIO_DIR}/manifest.json`, 'utf8')) : {};

  let made = 0, skipped = 0, i = 0;
  for (const t of texts) {
    i++;
    const f = fname(t);
    if (fs.existsSync(`${AUDIO_DIR}/${f}`)) { manifest[t] = f; skipped++; continue; }   // 增量：已有就跳过
    try {
      const buf = await tts(t);
      fs.writeFileSync(`${AUDIO_DIR}/${f}`, buf);
      manifest[t] = f; made++;
      process.stdout.write(`\r生成中 ${i}/${texts.length}（新 ${made}，跳过 ${skipped}）`);
      fs.writeFileSync(`${AUDIO_DIR}/manifest.json`, JSON.stringify(manifest));   // 边生成边存，中断可续
      await sleep(250);   // 轻微限速，避免触发速率限制
    } catch (e) {
      console.error(`\n生成失败："${t.slice(0, 40)}…" → ${e.message}`);
      console.error('已生成的已保存，可稍后重跑续上。'); process.exit(1);
    }
  }
  fs.writeFileSync(`${AUDIO_DIR}/manifest.json`, JSON.stringify(manifest));
  console.log(`\n完成：新生成 ${made}，跳过 ${skipped}。音频在 ${AUDIO_DIR}/，清单 ${AUDIO_DIR}/manifest.json。`);
  console.log('接着：git add audio && git commit && git push，Netlify 部署后所有设备就都有澳音了。');
}

main();
