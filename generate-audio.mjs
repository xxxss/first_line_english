#!/usr/bin/env node
// 用 ElevenLabs 生成场景音频到 audio/，写 audio/manifest.json (text→mp3)。支持双音色：
//   对话(opening)+标准句(target) 用 ELEVEN_VOICE_ID；场景旁白(setup) 用 ELEVEN_VOICE_NARR。
// 增量：文件已存在且用的是同一个声音就跳过；换了声音会只重生成受影响的句子。
// 用法：
//   列声音： ELEVENLABS_API_KEY=xxx node generate-audio.mjs --list
//   生成：   ELEVENLABS_API_KEY=xxx ELEVEN_VOICE_ID=对话音id ELEVEN_VOICE_NARR=旁白音id node generate-audio.mjs
import fs from 'node:fs';
import crypto from 'node:crypto';

const KEY = process.env.ELEVENLABS_API_KEY;
const VOICE_MAIN = process.env.ELEVEN_VOICE_ID;                     // 对话(opening) + testVoice
const VOICE_NARR = process.env.ELEVEN_VOICE_NARR || VOICE_MAIN;     // 场景旁白(叙述)
const VOICE_TGT  = process.env.ELEVEN_VOICE_TARGET || VOICE_MAIN;   // 标准跟读句(慢、清晰)
const MODEL = process.env.ELEVEN_MODEL || 'eleven_multilingual_v2';
const DIR = 'audio';
if (!KEY) { console.error('缺少 ELEVENLABS_API_KEY'); process.exit(1); }

const fname = t => crypto.createHash('md5').update(t).digest('hex').slice(0, 12) + '.mp3';
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function listVoices() {
  const r = await fetch('https://api.elevenlabs.io/v1/voices', { headers: { 'xi-api-key': KEY } });
  const j = await r.json();
  console.log('\n账号里的声音（★=澳音）：\n');
  for (const v of j.voices || []) {
    const acc = (v.labels && (v.labels.accent || v.labels.description)) || '';
    console.log(`${/austral/i.test(acc) ? '★ ' : '  '}${v.name.padEnd(20)} ${v.voice_id}  ${acc}`);
  }
}

function collectItems() {
  const scn = JSON.parse(fs.readFileSync('scenarios.json', 'utf8'));
  const arr = [{ text: 'Hi there! What can I get you today?', voice: VOICE_MAIN }];
  for (const s of scn) {
    if (s.opening) arr.push({ text: s.opening, voice: VOICE_MAIN });
    if (s.target) arr.push({ text: s.target, voice: VOICE_TGT });
    const narr = (s.setup || s.ctx || '') + (s.goal ? '. ' + s.goal : '');   // 和 app 里 narrateScene 拼法一致
    if (narr.trim()) arr.push({ text: narr, voice: VOICE_NARR });
  }
  const seen = new Set();
  return arr.filter(o => seen.has(o.text) ? false : (seen.add(o.text), true));  // 去重
}

async function tts(text, voice) {
  const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice}`, {
    method: 'POST',
    headers: { 'xi-api-key': KEY, 'Content-Type': 'application/json', 'Accept': 'audio/mpeg' },
    body: JSON.stringify({ text, model_id: MODEL, voice_settings: { stability: 0.5, similarity_boost: 0.75 } }),
  });
  if (!r.ok) throw new Error(`${r.status} ${await r.text()}`);
  return Buffer.from(await r.arrayBuffer());
}

async function main() {
  if (process.argv.includes('--list')) return listVoices();
  if (!VOICE_MAIN) { console.error('缺少 ELEVEN_VOICE_ID'); process.exit(1); }

  fs.mkdirSync(DIR, { recursive: true });
  const load = f => fs.existsSync(`${DIR}/${f}`) ? JSON.parse(fs.readFileSync(`${DIR}/${f}`, 'utf8')) : {};
  const manifest = load('manifest.json');
  let built = load('.built.json');   // text -> 生成时用的 voice id
  // 老的 audio 没有 .built 记录：视为都用 VOICE_MAIN 生成的（这样换旁白音只会重生成旁白）
  if (Object.keys(built).length === 0) for (const t of Object.keys(manifest)) built[t] = VOICE_MAIN;

  const items = collectItems();
  const todo = items.filter(o => !(fs.existsSync(`${DIR}/${fname(o.text)}`) && built[o.text] === o.voice));
  console.log(`共 ${items.length} 句，需(重)生成 ${todo.length} 句、约 ${todo.reduce((a, o) => a + o.text.length, 0)} 字符。`);

  let made = 0;
  for (const { text, voice } of items) {
    const f = fname(text);
    if (fs.existsSync(`${DIR}/${f}`) && built[text] === voice) { manifest[text] = f; continue; }
    try {
      fs.writeFileSync(`${DIR}/${f}`, await tts(text, voice));
      manifest[text] = f; built[text] = voice; made++;
      process.stdout.write(`\r生成中 ${made}/${todo.length}`);
      fs.writeFileSync(`${DIR}/manifest.json`, JSON.stringify(manifest));
      fs.writeFileSync(`${DIR}/.built.json`, JSON.stringify(built));
      await sleep(250);
    } catch (e) {
      console.error(`\n失败："${text.slice(0, 40)}…" → ${e.message}\n已生成的已保存，可重跑续上。`); process.exit(1);
    }
  }
  fs.writeFileSync(`${DIR}/manifest.json`, JSON.stringify(manifest));
  fs.writeFileSync(`${DIR}/.built.json`, JSON.stringify(built));
  console.log(`\n完成：(重)生成 ${made} 句。git add audio && commit && push 即可上线。`);
}
main();
