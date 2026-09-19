import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const access = readFileSync(new URL('../access-2026.js', import.meta.url), 'utf8');
const hotfix = readFileSync(new URL('../access-hotfix-20260918.js', import.meta.url), 'utf8');
const combined = `${access}\n${hotfix}`;
const publishedHashes = new Set(combined.match(/[0-9a-f]{64}/g) || []);

const ACTIVE = new Set([
  '6278068d8b6823f8d1974cc72319ec8f4924acbdd1f6df88db9051b6ad618942',
  '8cdbb7e572c6ec0e306b56abbfffa8021845515ab615a7eb471c55272f7ce2f4',
  '30b3b58c449cfff87be9e3da8593d42e5fb3531aadfd4d2cd46b13364d8be591',
  '28fb1a33516a5c9c8f948322f1fc08918bb09c46896ef5bc63b9d03503538902',
  '0639abd8bba5d3d814538040ffe30d0d7c5a6469396c56a9ba006aba2ffd70cf',
  '4db25b5e8d80e30f0a437ae7d1538f3734cd3fcda6707ee4a0f9d4e71024e121',
  'f4ab5b71c20364ebd1ade67b176a2ca20e80d830abdbc19041d2b1be60a87756',
  '933d49e2aa12ec206ea93128fc7d414e38e733fff5762648bb0c00389e3ccaa9',
  'b560d377cfb47abbd4252378efef9dd13c292187037ba9bc719dbf5771a78104',
  '7b3f3a35d718c7299acb98c03446ecefcd76e824faff763264fbabf244b2a74c',
  '368b2bad27d2ba352bc44daae492dbf77cd1345f0f9587d5fb38538c8a76764e',
  'b2ec68728627292fa27043e1b1be0370936b4227d2a033a6672a5674fe16bb8f',
  'a71b38ffbc421d9d7ed23433567ef42a45bc01113f7c71949e7d45b2298d6acb',
  'ccd60fc68ed3c1a50f24be0871ddb819759b3b5ed32d2281635a3c5ba35e4709',
  '95b3c0c72102b306835be9a32b04219f55a3003b84f16b14c9a68ec90cc450a5',
  '41bbe914fbb7f6297c8890cfdc2afbdd57a8321e1a37cc864cb13bbb8f2cbd03',
  'ab9164f2b8aae7b0d2ab27fc6846661457405d0fb65bab8206226da6f7e50adf',
  '9fc0a8a68667af6fded257602bd5d8aa40ff1a1a03afc95e1fb1cb0b3027f3e2',
  '241660eb05bafd12854a60eae8d6df91e0fcfcaf86c5cfa6a448c84053f853a9',
  '6a0328bb3925b995fbbd0035897fa10807ced8ebac16b432c880833d790163f0',
  '8d075d8a7176cf3f7cb3d53f4b31a7bccf3300b7f8d0d6efde1f639d9450be8b',
  '8b9c8fa6b38bb0e39a506b0d5148571bdc278ea2a53aad8f353f35b2faf872e6',
  '80bba27d54ccabb6b22d47f4d4773c312228fba70f6e239e557bf4a2dd68442e',
  'af91f2d667c8db9bf2b2fe4da9f1287834a1be6f672fb6d8470c876988cec5db',
  '5a78d95fb49b359b22991ae1a127196f09bd4071da2497ce7bac24966fca0d1b',
  '8e0d06cd41deda86c776e1a041ee19d5e134e985ea97ac27b5dd4930d0946418',
  '9bd0123c47240b15376c40dbc3066e9244ac82332870cc3eea0bc29cf19f922c',
  'c74996532bbe376d348510e44e382d634333096768ba6908e1d61067ad4fcc48',
  '6c41b7ceacf87ab03e6bdcb46c13750985db35f827e3f20e88dd589e4b9d22c7',
  'bcfbb4d9c8eb8a01e0fcc6dfb377733d6af7dcc058dc32c049a147769c9926e6',
  '588ff7c7bd91e4c7b00a0116f8f0e5dd1e18892ac9d2354c11466594f92d2569',
  'b5575b8bb873f37cfcf809cd4b52747814a3ccdcd4a5fe1c6f8540dd37fdc6f3',
  'e183b2c36352f04f75e73e1e1062a79d244b34712e648b6fd420eb2f67e4da4c',
  '66e876aef0a8cbf432175f54ffae266fab1946a99e70ad60b8cbad9e780f9a51',
  '33c541ce5cfa43ed0447f67ea6ef96c65f61da257d56099451f8760ba56e34c7',
  '9a535c2bc90cc17cce8132d925201266b1b036b88d68f303338d3f0256699681',
  '969e7d92d611e819cc6d34b52b448d3eb3e1faf0fe6c395e6a801ab6d9cd25df',
  '381e347c1c0cb03dd06bd081e04f3ee6d71174090eb4c5442d75949e5e7be796',
  'fdb73883218e9e7b1f378573efffee9ff14f7d52b97a8c1cf5064e639d4ff9c4',
]);

const DENIED = new Set([
  '5d57c7c444759c7267cd775b6d58a1660334f7930a46ca69376332998f58c11b',
  '3357b0727e0aa095fb98ef6e8a20de7a3e503187c9a13b159c3cac1d41f7dcce',
  '6e1e9703cc8c6852fb00f7304765a9e3b5a4c1050db9bf71ea3bf99e60b0cab0',
]);

assert.equal(ACTIVE.size, 39, 'canonical active roster must contain 39 credentials');
assert.equal(DENIED.size, 3, 'denied roster must contain the three non-attendees');
for (const hash of ACTIVE) assert.ok(publishedHashes.has(hash), `active credential hash missing from access policy: ${hash.slice(0, 8)}`);
for (const hash of DENIED) assert.ok(!publishedHashes.has(hash), `denied credential hash still present in access policy: ${hash.slice(0, 8)}`);

assert.match(combined, /\^\(\?:\\d\{7\}\|\\d\{11\}\)\$/, '7/11 credential format gate must remain present');
console.log('COURSE_TELEMETRY_WAVE5_ROSTER_OK');
