// ═══════════════════════════════════════════════════════════════════════
// 单词塔防 Word Tower Defense
//  · 单词怪只怕拼写：打对一个字母 = 射一发魔法弹（扣一格血），拼完整个词它就爆炸
//  · 打错字母：魔法弹打偏，怪物发怒加速；同一个位置错两次会提示正确字母
//  · 防御塔不能直接杀单词怪，只能减速 / 击退 / 电晕 / 打偷金币的蝙蝠 —— 给孩子争取拼写时间
//  · 👻 幽灵怪 = 本关新词，字母是半透明的，照着打（学）；后面的波次它会变成普通怪再来（考）
//  · 每 6 关是「攻城战」：拼对一个词，投石车砸掉敌人城堡的一块砖；砖全掉光就收服 Boss
//  · 一次就拼对（没打错字母）才算「默写正确」，会进间隔复习；拼错的词这一关里还会再来一次
// 依赖 index.html 里的全局函数：S, save, grade, setBox, status, prog, isDue, allWords, packWords,
//   speakWord, tone, toast, burstConfetti, esc, norm, shuffle, pick, gen, keyHandler, kbHTML, bindKb,
//   trickySpots, blankSentence, displayWord, addCoins, questCoins, updateHeader, MONSTERS, fixWords, home
// ═══════════════════════════════════════════════════════════════════════

const TD_COLS = 12, TD_ROWS = 9
const TD_CHAPTERS = [
  { name: "青草平原", icon: "🌳", bg: "#62b04f", bg2: "#59a647", path: "#e2c58f", edge: "#b8995f", decor: ["🌳", "🌼", "🌲", "🌷", "🍄"] },
  { name: "黄沙沙漠", icon: "🏜️", bg: "#e6c26c", bg2: "#dcb75f", path: "#c4934f", edge: "#9c7136", decor: ["🌵", "🪨", "🦴", "🌴"] },
  { name: "冰雪山脉", icon: "❄️", bg: "#e6f2fb", bg2: "#d8e9f6", path: "#a9bccf", edge: "#8599ae", decor: ["⛄", "🌲", "❄️", "🧊"] },
  { name: "火山熔岩", icon: "🌋", bg: "#6e3d33", bg2: "#64372e", path: "#b0703f", edge: "#7d4526", decor: ["🔥", "🪨", "🌋", "💀"] },
  { name: "魔王城堡", icon: "🏯", bg: "#4d4c70", bg2: "#454468", path: "#9d9bbb", edge: "#72709a", decor: ["🕯️", "⚔️", "🗿", "🦴"] },
]
// 路线（格子坐标的拐点，起点在地图外）+ 可以造塔的空地
const TD_MAPS = [
  { path: [[-1, 1], [9, 1], [9, 4], [2, 4], [2, 7], [11, 7]], spots: [[4, 2], [7, 2], [10, 2], [4, 6], [7, 6], [1, 5]] },
  { path: [[2, -1], [2, 6], [6, 6], [6, 2], [9, 2], [9, 7], [11, 7]], spots: [[1, 3], [4, 1], [4, 4], [7, 4], [10, 4], [4, 8]] },
  { path: [[-1, 2], [4, 2], [4, 6], [8, 6], [8, 2], [11, 2]], spots: [[2, 1], [2, 4], [6, 3], [6, 8], [10, 1], [10, 4]] },
  { path: [[-1, 7], [3, 7], [3, 1], [7, 1], [7, 5], [11, 5]], spots: [[1, 5], [5, 3], [5, 6], [9, 3], [9, 7], [5, 0]] },
]
const TD_TOWERS = {
  archer: { icon: "🏹", name: "弓箭塔", cost: [50, 60], range: [2.6, 3.1], unlock: 1, desc: "射偷金币的蝙蝠" },
  ice:    { icon: "❄️", name: "冰冻塔", cost: [60, 70], range: [2.3, 2.8], unlock: 1, desc: "范围内的怪物变慢" },
  cannon: { icon: "💣", name: "大炮塔", cost: [90, 90], range: [2.4, 2.9], unlock: 3, desc: "把单词怪轰回去 + 炸蝙蝠" },
  tesla:  { icon: "⚡", name: "闪电塔", cost: [120, 100], range: [2.6, 3.1], unlock: 7, desc: "定时电晕附近的单词怪" },
}
const TD_UPGRADES = {
  heart: { icon: "❤️", name: "城堡加固", desc: "每关多 1 颗心", cost: [80, 160, 240] },
  gold:  { icon: "💰", name: "战争金库", desc: "开局多 30 金币", cost: [60, 120, 180] },
}

function tdData() {
  if (!S.td) S.td = { level: 1, stars: {}, upg: { heart: 0, gold: 0 } }
  S.td.upg = S.td.upg || { heart: 0, gold: 0 }
  S.td.stars = S.td.stars || {}
  return S.td
}
const tdChapter = (lv) => TD_CHAPTERS[Math.floor((lv - 1) / 6) % TD_CHAPTERS.length]
const tdIsSiege = (lv) => lv % 6 === 0
function tdRand(seed) { // mulberry32
  return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296 }
}

function tdSfx(kind) {
  if (kind === "shoot") tone(1200 + Math.random() * 300, 0.06, "square", 0.04)
  else if (kind === "miss") tone(160, 0.12, "sawtooth", 0.07)
  else if (kind === "boom") { tone(90, 0.35, "sawtooth", 0.16); tone(60, 0.4, "square", 0.08, 0.05) }
  else if (kind === "perfect") [784, 988, 1319].forEach((f, i) => tone(f, 0.12, "triangle", 0.1, i * 0.07))
  else if (kind === "leak") { tone(200, 0.2, "sawtooth", 0.12); tone(120, 0.35, "sawtooth", 0.12, 0.15) }
  else if (kind === "build") [523, 784].forEach((f, i) => tone(f, 0.1, "triangle", 0.1, i * 0.08))
  else if (kind === "zap") tone(1800, 0.15, "sawtooth", 0.05)
  else if (kind === "wave") [392, 523, 659, 784].forEach((f, i) => tone(f, 0.14, "triangle", 0.1, i * 0.1))
  else if (kind === "coin") tone(1500, 0.05, "square", 0.03)
}

;(function tdCss() {
  const s = document.createElement("style")
  s.textContent = `
  main.td-mode { max-width: 920px; padding: 8px; gap: 8px; }
  .td-hud { display: flex; align-items: center; gap: 8px; color: #fff; font-weight: 900; font-size: 14px; }
  .td-hud-text { flex: 1; display: flex; gap: 12px; flex-wrap: wrap; align-items: center; }
  .td-hud-text b { color: #ffd700; }
  .td-stage { position: relative; margin: 0 auto; border-radius: 14px; box-shadow: 0 4px 24px rgba(0,0,0,.45); touch-action: none; }
  .td-stage canvas { display: block; border-radius: 14px; }
  .td-banner { position: absolute; inset: 0; border-radius: 14px; display: none; flex-direction: column; align-items: center; justify-content: center; text-align: center; background: rgba(15,8,34,.55); padding: 12px; }
  .td-banner.show { display: flex; }
  .td-banner .tb-title { font-size: 26px; font-weight: 900; color: #ffd700; text-shadow: 0 2px 8px #000; }
  .td-banner .tb-sub { font-size: 14px; color: #fff; margin-top: 6px; text-shadow: 0 1px 4px #000; line-height: 1.5; }
  .td-banner .big-btn { width: auto; padding: 12px 26px; font-size: 18px; }
  .td-pop { position: absolute; display: none; width: 210px; background: #fff; color: #2a2118; border-radius: 14px; padding: 8px; box-shadow: 0 6px 24px rgba(0,0,0,.5); z-index: 5; }
  .td-pop.show { display: block; }
  .td-pop .tp-title { font-size: 13px; font-weight: 900; color: #6b3eb0; text-align: center; }
  .td-opt { display: flex; width: 100%; gap: 8px; align-items: center; padding: 7px 8px; border: 1px solid #e5d9c6; border-radius: 10px; background: #faf6f0; margin-top: 6px; text-align: left; font-size: 13px; font-weight: 800; color: #2a2118; }
  .td-opt:disabled { opacity: .45; }
  .td-opt .to-i { font-size: 22px; }
  .td-opt .to-d { font-size: 11px; color: #8d7a68; font-weight: 600; }
  .td-opt .to-c { margin-left: auto; color: #b45a00; white-space: nowrap; }
  .td-panel { background: rgba(255,255,255,.97); border-radius: 16px; padding: 8px 10px; color: #2a2118; display: flex; align-items: center; gap: 10px; min-height: 86px; }
  .td-panel.shake { animation: shake .3s; }
  .td-say { width: 56px; height: 56px; border-radius: 50%; flex-shrink: 0; background: linear-gradient(135deg,#ba55d3,#6b3eb0); border: 3px solid #f0d060; color: #fff; font-size: 24px; }
  .td-slow { width: 40px; height: 40px; border-radius: 12px; flex-shrink: 0; background: #f0e8da; border: 1px solid #d9cbbb; font-size: 18px; }
  .td-mid { flex: 1; min-width: 0; text-align: center; }
  .td-clue { font-size: 14px; font-weight: 700; line-height: 1.35; }
  .td-clue .blank { min-width: 50px; }
  .td-meaning { font-size: 12px; color: #7a6a5c; margin-top: 1px; }
  .td-slots { display: flex; justify-content: center; flex-wrap: wrap; gap: 3px; margin-top: 5px; }
  .td-slot { width: 21px; height: 29px; border-bottom: 3px solid #c9b8a0; font-size: 22px; font-weight: 900; text-align: center; line-height: 27px; color: #c9b8a0; }
  .td-slot.ok { color: #2d8a4a; border-color: #2d8a4a; }
  .td-slot.cur { border-color: #6b3eb0; }
  .td-slot.ghost { color: #cdbfae; }
  .td-slot.hint { color: #ff8a00; }
  .td-idle { flex: 1; text-align: center; font-size: 14px; font-weight: 800; color: #6b3eb0; }
  #td-kb .keyboard { margin-top: 0; }
  .td-map-ch { margin-top: 14px; }
  .td-map-ch h3 { margin: 0 0 8px; }
  .td-nodes { display: grid; grid-template-columns: repeat(6, 1fr); gap: 8px; }
  @media (max-width: 420px) { .td-nodes { grid-template-columns: repeat(3, 1fr); } }
  .td-node { aspect-ratio: 1; border-radius: 50%; border: 3px solid rgba(255,255,255,.25); background: rgba(255,255,255,.1); color: #fff; font-size: 20px; font-weight: 900; display: flex; flex-direction: column; align-items: center; justify-content: center; line-height: 1.1; }
  .td-node small { font-size: 10px; letter-spacing: -1px; }
  .td-node.done { background: rgba(74,222,128,.25); border-color: #4ade80; }
  .td-node.cur { background: linear-gradient(135deg,#ffcf33,#ff8a00); border-color: #fff; color: #3a1d00; animation: bob 1.6s ease-in-out infinite; }
  .td-node.locked { opacity: .35; }
  .td-node.siege { border-style: double; border-width: 5px; }
  .td-intel { display: flex; flex-direction: column; gap: 10px; margin-top: 10px; }
  .td-intel .card { padding: 12px; }
  .td-intel .big-word { font-size: 32px; margin: 2px 0; }
  `
  document.head.appendChild(s)
})()

// ═══════════════════════════════════════════════════════════════════════
// 地图（关卡选择）+ 军械库
// ═══════════════════════════════════════════════════════════════════════
function tdMap() {
  const d = tdData()
  const el = subFrame("🗺️ 塔防闯关")
  updateHeader()
  const maxCh = Math.floor((d.level - 1) / 6) + 1
  const chapters = []
  for (let c = 0; c < Math.max(maxCh, 1); c++) chapters.push(c)
  const upgHTML = Object.entries(TD_UPGRADES).map(([k, u]) => {
    const n = d.upg[k] || 0, max = u.cost.length
    const cost = u.cost[n]
    return `<button class="opt-btn" data-upg="${k}" ${n >= max || S.coins < cost ? "disabled" : ""}>
      <span class="oi">${u.icon}</span><span><div class="ot">${u.name} ${"★".repeat(n)}${"☆".repeat(max - n)}</div>
      <div class="od">${u.desc}${n >= max ? " · 已满级" : ` · ${cost} 🪙`}</div></span></button>`
  }).join("")
  el.innerHTML = `<div class="panel">
    <div class="sub">单词怪只怕拼写！打对一个字母射一发魔法弹，拼完整个词它就爆炸。<br>防御塔帮你减速、击退、打蝙蝠，争取时间。每 6 关是 🏯 攻城战。</div>
    <button class="big-btn" id="td-go">⚔️ 第 ${d.level} 关 · 开战！</button>
    ${chapters.slice().reverse().map((c) => {
      const ch = TD_CHAPTERS[c % TD_CHAPTERS.length]
      return `<div class="td-map-ch"><h3>${ch.icon} 第 ${c + 1} 章 · ${ch.name}</h3><div class="td-nodes">${[1, 2, 3, 4, 5, 6].map((k) => {
        const lv = c * 6 + k, st = d.stars[lv] || 0
        const cls = lv < d.level || st ? "done" : lv === d.level ? "cur" : "locked"
        return `<button class="td-node ${cls} ${tdIsSiege(lv) ? "siege" : ""}" data-lv="${lv}" ${lv > d.level ? "disabled" : ""}>
          ${tdIsSiege(lv) ? "🏯" : lv}<small>${st ? "⭐".repeat(st) : lv > d.level ? "🔒" : ""}</small></button>`
      }).join("")}</div></div>`
    }).join("")}
    <h3>🛠️ 军械库（永久升级）</h3>
    <div class="opt-list" style="margin-top:0">${upgHTML}</div>
  </div>`
  $("#td-go").onclick = () => tdStart(d.level)
  el.querySelectorAll("[data-lv]").forEach((b) => { b.onclick = () => tdStart(+b.dataset.lv) })
  el.querySelectorAll("[data-upg]").forEach((b) => {
    b.onclick = () => {
      const k = b.dataset.upg, n = d.upg[k] || 0, cost = TD_UPGRADES[k].cost[n]
      if (cost == null || S.coins < cost) return
      S.coins -= cost; d.upg[k] = n + 1; save(); updateHeader(); tdSfx("build"); toast(`${TD_UPGRADES[k].icon} 升级成功！`)
      tdMap()
    }
  })
  keyHandler = { enter: () => tdStart(d.level) }
}

// ═══════════════════════════════════════════════════════════════════════
// 选词 + 波次
// ═══════════════════════════════════════════════════════════════════════
function tdPlanWords(lv, siege) {
  const now = Date.now(), all = allWords()
  const due = all.filter((o) => isDue(o, now)).sort((a, b) => prog(a).box - prog(b).box || prog(a).due - prog(b).due)
  const reviews = due.slice(0, 8)
  const nNew = siege ? 0 : Math.min(4, reviews.length >= 8 ? 2 : S.settings.newPerQuest)
  const fresh = packWords().filter((o) => status(o) === "new").slice(0, nNew)
  const target = siege ? Math.min(12, 7 + Math.floor(lv / 6)) : Math.min(10, 4 + Math.floor(lv / 2))
  let hidden = [...reviews]
  if (hidden.length < target) {
    const rank = (o) => status(o) === "trouble" ? 0 : status(o) === "learning" ? 1 : 2
    const extra = shuffle(all.filter((o) => prog(o) && prog(o).box > 0 && !hidden.includes(o))).sort((a, b) => rank(a) - rank(b))
    hidden = [...hidden, ...extra.slice(0, target - hidden.length)]
  }
  if (siege && hidden.length < 6) hidden = [...hidden, ...packWords().filter((o) => !hidden.includes(o)).slice(0, 6 - hidden.length)]
  if (!siege && !fresh.length && !hidden.length) hidden = shuffle(packWords().length ? packWords() : BANK).slice(0, 5)
  return { fresh, hidden: hidden.slice(0, siege ? 12 : target) }
}

function tdWaves(fresh, hidden) {
  const W = [[], [], []]
  const h = shuffle(hidden)
  if (fresh.length) {
    // 第 1 波：新词幽灵（照着打）+ 少量复习；第 2 波：新词变真怪（凭记忆）；第 3 波：剩下的复习
    fresh.forEach((o, i) => { W[0].push({ o, ghost: true }); if (h.length && i % 2 === 1) W[0].push({ o: h.shift(), ghost: false }) })
    W[1] = shuffle(fresh.map((o) => ({ o, ghost: false })))
    const half = Math.ceil(h.length / 2)
    h.splice(0, half).forEach((o, i) => W[1].splice(Math.min(W[1].length, 1 + i * 2), 0, { o, ghost: false }))
    W[2] = h.map((o) => ({ o, ghost: false }))
    if (!W[2].length) W[2] = shuffle(fresh).slice(0, 2).map((o) => ({ o, ghost: false }))
  } else {
    h.forEach((o, i) => W[Math.min(2, Math.floor(i * 3 / h.length))].push({ o, ghost: false }))
  }
  // 最长的词放到最后一波压轴
  return W.filter((w) => w.length)
}

// ═══════════════════════════════════════════════════════════════════════
// 开始一关（先看「敌人情报」= 新词卡片）
// ═══════════════════════════════════════════════════════════════════════
let TD = null

function tdStart(lv) {
  const siege = tdIsSiege(lv)
  const plan = tdPlanWords(lv, siege)
  if (!plan.fresh.length) return tdBattle(lv, plan)
  const el = subFrame(`${tdChapter(lv).icon} 第 ${lv} 关 · 敌人情报`)
  $("#back").onclick = tdMap
  el.innerHTML = `<div class="panel center">
    <div class="sub">这一关会出现 <b>${plan.fresh.length}</b> 个新敌人 👻<br>先看一眼它们长什么样（红色 = 最容易写错的地方）</div>
    <div class="td-intel">${plan.fresh.map((o, i) => {
      const spots = new Set(trickySpots(o)); let pos = 0
      const w = o.s.map((syl, si) => `<span class="${si % 2 ? "syl-b" : "syl-a"}">${[...syl].map((c) => spots.has(pos++) ? `<span class="tricky">${esc(c)}</span>` : esc(c)).join("")}</span>`).join("")
      return `<div class="card"><div class="big-word">${w}</div><div class="syl-hint">${o.s.map(esc).join(" · ")}</div>
        ${o.m ? `<div class="meaning" style="font-size:14px">${esc(o.m)}</div>` : ""}
        <button class="mini-btn" data-say="${i}" style="margin-top:6px">🔊 听一听</button></div>`
    }).join("")}</div>
    <button class="big-btn" id="td-fight">⚔️ 记住了，开战！</button>
  </div>`
  el.querySelectorAll("[data-say]").forEach((b) => { b.onclick = () => speakWord(plan.fresh[+b.dataset.say].w) })
  speakWord(plan.fresh[0].w)
  $("#td-fight").onclick = () => tdBattle(lv, plan)
  keyHandler = { enter: () => tdBattle(lv, plan) }
}

function tdBattle(lv, plan) {
  gen++
  keyHandler = null
  stopSpeech()
  const d = tdData()
  const siege = tdIsSiege(lv)
  const ch = tdChapter(lv)
  const map = TD_MAPS[(lv - 1) % TD_MAPS.length]
  const hearts = 5 + (d.upg.heart || 0)
  TD = {
    gen, lv, siege, ch, map, plan,
    hearts, heartsMax: hearts, gold: 120 + 30 * (d.upg.gold || 0), goldEarned: 0,
    phase: "build", waveNo: 0, waves: siege ? [] : tdWaves(plan.fresh, plan.hidden),
    queue: [], retry: [], spawnT: 0, minions: 0, minionT: 0,
    mons: [], shots: [], parts: [], texts: [], towers: map.spots.map(() => null),
    target: null, res: new Map(), paused: false, menu: -1, last: 0, t: 0, nextId: 1,
    speed: Math.min(0.75, 0.42 * (1 + 0.025 * (lv - 1))), gap: Math.max(7, 13 - 0.25 * lv),
    maxAlive: lv <= 3 ? 2 : lv <= 9 ? 3 : 4,
  }
  // 路径
  const pts = map.path.map(([x, y]) => [x + 0.5, y + 0.5])
  const segs = []; let len = 0
  for (let i = 0; i < pts.length - 1; i++) {
    const [ax, ay] = pts[i], [bx, by] = pts[i + 1], l = Math.hypot(bx - ax, by - ay)
    segs.push({ ax, ay, bx, by, l, s: len }); len += l
  }
  TD.pts = pts; TD.segs = segs; TD.len = len; TD.castle = pts[pts.length - 1]
  // 装饰
  const onPath = new Set()
  segs.forEach((s) => { for (let k = 0; k <= s.l * 2; k++) { const f = k / (s.l * 2); onPath.add(`${Math.floor(s.ax + (s.bx - s.ax) * f)},${Math.floor(s.ay + (s.by - s.ay) * f)}`) } })
  map.spots.forEach(([x, y]) => onPath.add(`${x},${y}`))
  const rnd = tdRand(lv * 977)
  TD.decor = []
  for (let i = 0; i < 18; i++) {
    const x = Math.floor(rnd() * TD_COLS), y = Math.floor(rnd() * TD_ROWS)
    if (!onPath.has(`${x},${y}`)) TD.decor.push({ x: x + 0.2 + rnd() * 0.6, y: y + 0.2 + rnd() * 0.6, e: ch.decor[Math.floor(rnd() * ch.decor.length)], s: 0.5 + rnd() * 0.35 })
  }
  if (siege) tdSiegeInit()

  app.classList.add("td-mode")
  app.innerHTML = `
    <div class="td-hud"><button class="quit" id="td-pause">⏸</button><div class="td-hud-text" id="td-hud"></div></div>
    <div class="td-stage" id="td-stage"><canvas id="td-cv"></canvas><div class="td-pop" id="td-pop"></div><div class="td-banner" id="td-banner"></div></div>
    <div class="td-panel" id="td-panel"></div>
    <div id="td-kb">${kbHTML(null)}</div>`
  TD.cv = $("#td-cv"); TD.ctx = TD.cv.getContext("2d")
  tdLayout()
  $("#td-pause").onclick = tdPauseMenu
  TD.cv.addEventListener("pointerdown", tdTap)
  bindKb($("#td-kb"), { letter: tdLetter, back: () => {}, enter: () => { if (TD && TD.phase === "build") tdStartWave() } })
  if (siege) {
    tdBanner(`🏯 攻城战！`, `拼对一个词，投石车就砸掉一块砖。<br>敌人的大炮会定时开火，一次全对能挡下一炮 🛡️<br>砖全部打掉，就能收服 <b>${esc(TD.boss.name)}</b>！`, "⚔️ 开始攻城", tdStartWave)
  } else {
    tdBanner(`${ch.icon} 第 ${lv} 关`, `单词怪只怕拼写！听发音，把单词打出来。<br>先点地图上的 <b>＋</b> 造防御塔（有 💰${TD.gold}）`, "⚔️ 开始第 1 波", tdStartWave)
  }
  tdPanel()
  requestAnimationFrame(tdLoop)
}

function tdLayout() {
  if (!TD) return
  const stage = $("#td-stage")
  const W = app.clientWidth - 16
  const avail = window.innerHeight - ($("header").offsetHeight || 54) - 34 - 92 - 175 - 40
  const tile = Math.max(22, Math.min(W / TD_COLS, Math.max(avail, 200) / TD_ROWS))
  const dpr = window.devicePixelRatio || 1
  TD.tile = tile
  TD.cv.width = Math.round(tile * TD_COLS * dpr); TD.cv.height = Math.round(tile * TD_ROWS * dpr)
  TD.cv.style.width = tile * TD_COLS + "px"; TD.cv.style.height = tile * TD_ROWS + "px"
  stage.style.width = tile * TD_COLS + "px"
  TD.ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
}
window.addEventListener("resize", () => { if (TD && TD.gen === gen) tdLayout() })
document.addEventListener("visibilitychange", () => { if (document.hidden && TD && TD.gen === gen && TD.phase === "wave" && !TD.paused) tdPauseMenu() })

function tdBanner(title, sub, btn, onClick) {
  const b = $("#td-banner")
  b.innerHTML = `<div class="tb-title">${title}</div><div class="tb-sub">${sub}</div>${btn ? `<button class="big-btn" id="tb-btn">${btn}</button>` : ""}`
  b.classList.add("show")
  if (btn) $("#tb-btn").onclick = () => { b.classList.remove("show"); onClick() }
}
function tdHideBanner() { const b = $("#td-banner"); if (b) b.classList.remove("show") }

// ═══════════════════════════════════════════════════════════════════════
// 波次 / 刷怪
// ═══════════════════════════════════════════════════════════════════════
function tdStartWave() {
  if (!TD || TD.phase !== "build") return
  tdHideBanner(); tdCloseMenu()
  if (TD.siege) { TD.phase = "wave"; tdSiegeNext(); return }
  const items = TD.waves[TD.waveNo] || []
  TD.queue = [...items, ...TD.retry.splice(0)]
  TD.phase = "wave"
  TD.spawnT = 1.2
  TD.minions = Math.min(8, 2 + Math.floor(TD.lv / 2) + TD.waveNo)
  TD.minionT = 4
  tdSfx("wave")
  tdFloat(TD_COLS / 2, TD_ROWS / 2, `第 ${TD.waveNo + 1} 波！`, "#ffd700", 1.6)
  tdPanel()
}

function tdSpecies(o, ghost) {
  const n = norm(o.w).length
  if (ghost) return { e: "👻", sp: 0.8, size: 1, big: false }
  if (n <= 5) return { e: pick(["🐺", "🦊", "🐗"]), sp: 1.2, size: 0.95, big: false }
  if (n <= 8) return { e: pick(["👹", "🧟", "🦂", "🐊", "👺"]), sp: 1, size: 1.05, big: false }
  return { e: pick(["🦏", "🐲", "🦍", "🐘"]), sp: 0.8, size: 1.3, big: true }
}
function tdSpawnWord(it) {
  const sp = tdSpecies(it.o, it.ghost)
  const n = norm(it.o.w).length
  TD.mons.push({ id: TD.nextId++, kind: "word", o: it.o, ghost: it.ghost, retry: !!it.retry, e: sp.e, size: sp.size, big: sp.big,
    sp: TD.speed * sp.sp, d: 0, hp: n, hpMax: n, typed: "", mistakes: 0, posWrong: 0, hint: false,
    slowT: 0, stunT: 0, rageT: 0, kbT: 0, dead: false, bob: Math.random() * 6 })
}
function tdSpawnMinion() {
  TD.mons.push({ id: TD.nextId++, kind: "minion", e: "🦇", size: 0.7, sp: TD.speed * 1.9, d: 0, hp: 2, hpMax: 2,
    slowT: 0, stunT: 0, rageT: 0, kbT: 0, dead: false, bob: Math.random() * 6 })
}
function tdPos(d) {
  const segs = TD.segs
  if (d <= 0) return { x: segs[0].ax, y: segs[0].ay }
  for (const s of segs) if (d <= s.s + s.l) { const f = (d - s.s) / s.l; return { x: s.ax + (s.bx - s.ax) * f, y: s.ay + (s.by - s.ay) * f } }
  return { x: TD.castle[0], y: TD.castle[1] }
}
const tdAlive = (kind) => TD.mons.filter((m) => !m.dead && (!kind || m.kind === kind))

// ═══════════════════════════════════════════════════════════════════════
// 打字 = 开火
// ═══════════════════════════════════════════════════════════════════════
function tdCur() { return TD.siege ? TD.sw : TD.target }
function tdLetter(l) {
  if (!TD || TD.paused || TD.phase !== "wave") return
  const m = tdCur()
  if (!m || m.dead) return
  const w = norm(m.o.w), need = w[m.typed.length]
  const from = TD.siege ? { x: 1.6, y: TD_ROWS - 2.4 } : { x: TD.castle[0], y: TD.castle[1] - 0.4 }
  if (l === need) {
    m.typed += l; m.posWrong = 0; m.hint = false
    m.hp = w.length - m.typed.length
    TD.shots.push({ x: from.x, y: from.y, m, tx: null, ty: null, v: 14, kind: "bolt", c: "#ffe066" })
    tdSfx("shoot")
    if (m.typed.length === w.length) TD.siege ? tdSiegeHit(m) : tdKill(m)
  } else {
    m.mistakes++; m.posWrong++; m.rageT = 1.5
    if (m.posWrong >= 2) m.hint = true
    const p = TD.siege ? { x: TD_COLS - 2.5, y: 3 } : tdPos(m.d)
    TD.shots.push({ x: from.x, y: from.y, m: null, tx: p.x + (Math.random() - 0.5) * 2, ty: p.y - 1.2, v: 12, kind: "miss", c: "#bbb" })
    tdSfx("miss")
    const pn = $("#td-panel"); pn.classList.remove("shake"); void pn.offsetWidth; pn.classList.add("shake")
  }
  tdPanel()
}

function tdRecord(o, field, val) {
  const r = TD.res.get(o.key) || { o }
  if (r[field] === undefined) r[field] = val
  TD.res.set(o.key, r)
  return r
}
function tdKill(m) {
  m.dead = true
  const perfect = m.mistakes === 0
  const p = tdPos(m.d)
  if (m.ghost) {
    tdRecord(m.o, "learned", true)
    if (status(m.o) === "new") setBox(m.o, 1)
  } else if (!m.retry) {
    tdRecord(m.o, "first", perfect)
    grade(m.o, perfect)
    if (!perfect) TD.retry.push({ o: m.o, ghost: false, retry: true })
  } else tdRecord(m.o, "retryOk", true)
  const g = 8 + m.hpMax * 2 + (perfect ? 6 : 0)
  TD.gold += g; TD.goldEarned += g
  tdBoom(p.x, p.y, m.big ? 34 : 22, ["#ffd700", "#ff7a00", "#ff3d3d", "#fff"])
  tdFloat(p.x, p.y - 0.6, `+${g}💰`, "#ffd700")
  if (perfect) { tdFloat(p.x, p.y - 1.2, m.ghost ? "学会了！" : "PERFECT!", "#7CFC00", 1.3); tdSfx("perfect") } else tdSfx("boom")
  if (!perfect && !m.ghost) tdFloat(p.x, p.y - 1.2, displayWord(m.o), "#fff", 2)
  save()
  TD.target = null
}
function tdLeak(m) {
  m.dead = true
  if (m.kind === "minion") {
    const g = Math.min(TD.gold, 10); TD.gold -= g
    tdFloat(TD.castle[0], TD.castle[1] - 0.8, `-${g}💰 被偷了！`, "#ff8888"); tdSfx("leak"); return
  }
  const dmg = m.big ? 2 : 1
  TD.hearts = Math.max(0, TD.hearts - dmg)
  tdFloat(TD.castle[0], TD.castle[1] - 0.8, `-${dmg}❤️`, "#ff5555", 1.4)
  tdFloat(TD.castle[0] - 1, TD.castle[1] - 1.5, displayWord(m.o), "#fff", 2.2)
  tdBoom(TD.castle[0], TD.castle[1], 18, ["#ff3d3d", "#999"])
  tdSfx("leak")
  if (m.ghost) { tdRecord(m.o, "learned", true); if (status(m.o) === "new") setBox(m.o, 1) }
  else if (!m.retry) { tdRecord(m.o, "first", false); grade(m.o, false); TD.retry.push({ o: m.o, ghost: false, retry: true }) }
  save()
  if (TD.target === m) TD.target = null
  if (TD.hearts <= 0) tdEnd(false)
}

function tdPickTarget() {
  const ws = tdAlive("word")
  if (!ws.length) return null
  return ws.reduce((a, b) => (b.d > a.d ? b : a))
}
function tdSetTarget(m) {
  if (TD.target === m) { speakWord(m.o.w); return }
  TD.target = m
  speakWord(m.o.w)
  tdPanel()
}

// ═══════════════════════════════════════════════════════════════════════
// 下方拼写面板
// ═══════════════════════════════════════════════════════════════════════
function tdPanel() {
  const pn = $("#td-panel")
  if (!pn || !TD) return
  const m = tdCur()
  if (TD.phase === "build" || !m || m.dead) {
    const msg = TD.phase === "build"
      ? (TD.siege ? "准备攻城！" : `🔨 点地图上的 ＋ 造塔（💰${TD.gold}），然后开始第 ${TD.waveNo + 1} 波`)
      : "👀 等待敌人出现…"
    const key = "idle" + msg
    if (TD.panelKey === key) return
    TD.panelKey = key
    pn.innerHTML = `<div class="td-idle">${msg}</div>${TD.phase === "build" && TD.waveNo > 0 ? `<button class="btn btn-primary" id="td-next">下一波 ▶</button>` : ""}`
    const nb = $("#td-next"); if (nb) nb.onclick = tdStartWave
    return
  }
  const w = norm(m.o.w)
  const key = `${m.id}|${m.typed}|${m.hint}`
  if (TD.panelKey === key) return
  TD.panelKey = key
  const clue = m.ghost ? `👻 新词！照着灰色字母打出来` : (blankSentence(m.o) || (m.o.m ? esc(m.o.m) : "听发音拼出来"))
  pn.innerHTML = `
    <button class="td-say" id="td-say">🔊</button>
    <div class="td-mid">
      <div class="td-clue">${clue}</div>
      ${m.o.m && (m.ghost || blankSentence(m.o)) ? `<div class="td-meaning">${esc(m.o.m)}</div>` : ""}
      <div class="td-slots">${[...w].map((c, i) => {
        if (i < m.typed.length) return `<span class="td-slot ok">${c}</span>`
        if (m.ghost) return `<span class="td-slot ghost ${i === m.typed.length ? "cur" : ""}">${c}</span>`
        if (i === m.typed.length) return `<span class="td-slot cur ${m.hint ? "hint" : ""}">${m.hint ? c : ""}</span>`
        return `<span class="td-slot"></span>`
      }).join("")}</div>
    </div>
    <button class="td-slow" id="td-slow" title="慢速">🐢</button>`
  $("#td-say").onclick = () => speakWord(m.o.w)
  $("#td-slow").onclick = () => speakWord(m.o.w, { slow: true })
}

function tdHud() {
  const h = $("#td-hud")
  if (!h) return
  const wave = TD.siege ? `🧱 ${TD.bricks.filter((b) => !b.down).length}/${TD.bricks.length}` : `🌊 ${Math.min(TD.waveNo + (TD.phase === "wave" ? 1 : 0), TD.waves.length) || 1}/${TD.waves.length}`
  const s = `<span>${TD.ch.icon} 第 <b>${TD.lv}</b> 关</span><span>${wave}</span><span>❤️ <b>${TD.hearts}</b></span><span>💰 <b>${TD.gold}</b></span>${TD.siege && TD.shield ? "<span>🛡️</span>" : ""}`
  if (h._s !== s) { h._s = s; h.innerHTML = s }
}

// ═══════════════════════════════════════════════════════════════════════
// 造塔
// ═══════════════════════════════════════════════════════════════════════
function tdTap(e) {
  if (!TD || TD.paused && TD.menu < 0) return
  const r = TD.cv.getBoundingClientRect()
  const x = (e.clientX - r.left) / TD.tile, y = (e.clientY - r.top) / TD.tile
  if (TD.siege) return
  // 点到防御塔空地
  const si = TD.map.spots.findIndex(([sx, sy]) => Math.hypot(sx + 0.5 - x, sy + 0.5 - y) < 0.6)
  if (si >= 0) { tdOpenMenu(si); return }
  tdCloseMenu()
  // 点到单词怪 = 切换目标
  let best = null, bd = 0.8
  tdAlive("word").forEach((m) => { const p = tdPos(m.d); const dd = Math.hypot(p.x - x, p.y - 0.2 - y); if (dd < bd) { bd = dd; best = m } })
  if (best) tdSetTarget(best)
}
function tdOpenMenu(si) {
  TD.menu = si
  TD.paused = true
  const t = TD.towers[si]
  const pop = $("#td-pop")
  const [sx, sy] = TD.map.spots[si]
  let html
  if (!t) {
    html = `<div class="tp-title">🔨 造一座塔（游戏暂停中）</div>${Object.entries(TD_TOWERS).map(([k, T]) => {
      const locked = TD.lv < T.unlock
      return `<button class="td-opt" data-build="${k}" ${locked || TD.gold < T.cost[0] ? "disabled" : ""}>
        <span class="to-i">${T.icon}</span><span><div>${T.name}</div><div class="to-d">${locked ? `第 ${T.unlock} 关解锁` : T.desc}</div></span>
        <span class="to-c">${locked ? "🔒" : `💰${T.cost[0]}`}</span></button>`
    }).join("")}`
  } else {
    const T = TD_TOWERS[t.k]
    html = `<div class="tp-title">${T.icon} ${T.name} Lv.${t.lv}</div>
      ${t.lv < 2 ? `<button class="td-opt" data-up ${TD.gold < T.cost[1] ? "disabled" : ""}><span class="to-i">⬆️</span><span><div>升级</div><div class="to-d">范围更大、效果更强</div></span><span class="to-c">💰${T.cost[1]}</span></button>` : ""}
      <button class="td-opt" data-sell><span class="to-i">💰</span><span><div>卖掉</div><div class="to-d">返还一半金币</div></span><span class="to-c">+${tdSellValue(t)}</span></button>`
  }
  html += `<button class="td-opt" data-close style="justify-content:center">✕ 关闭</button>`
  pop.innerHTML = html
  const W = TD.tile * TD_COLS, H = TD.tile * TD_ROWS
  let left = (sx + 0.5) * TD.tile - 105, top = (sy + 1) * TD.tile
  left = Math.max(4, Math.min(W - 214, left))
  if (top + 250 > H && sy * TD.tile - 250 > 0) top = sy * TD.tile - 250
  pop.style.left = left + "px"; pop.style.top = Math.max(4, top) + "px"
  pop.classList.add("show")
  pop.querySelectorAll("[data-build]").forEach((b) => { b.onclick = () => {
    const k = b.dataset.build, T = TD_TOWERS[k]
    if (TD.gold < T.cost[0]) return
    TD.gold -= T.cost[0]; TD.towers[si] = { k, lv: 1, cd: 0.5, spent: T.cost[0] }
    tdSfx("build"); tdBoom(sx + 0.5, sy + 0.5, 14, ["#fff", "#ffd700"]); tdCloseMenu()
  } })
  const up = pop.querySelector("[data-up]")
  if (up) up.onclick = () => { const T = TD_TOWERS[t.k]; if (TD.gold < T.cost[1]) return; TD.gold -= T.cost[1]; t.lv = 2; t.spent += T.cost[1]; tdSfx("build"); tdCloseMenu() }
  const sell = pop.querySelector("[data-sell]")
  if (sell) sell.onclick = () => { TD.gold += tdSellValue(t); TD.towers[si] = null; tdSfx("coin"); tdCloseMenu() }
  pop.querySelector("[data-close]").onclick = tdCloseMenu
}
function tdSellValue(t) { return Math.floor(t.spent / 2) }
function tdCloseMenu() {
  const pop = $("#td-pop"); if (pop) pop.classList.remove("show")
  if (TD) { TD.menu = -1; TD.paused = false; TD.panelKey = null; tdPanel() }
}

function tdPauseMenu() {
  if (!TD) return
  TD.paused = true
  stopSpeech()
  $("#overlay-card").innerHTML = `<div class="res-emoji">⏸</div><div class="res-title">暂停</div>
    <button class="big-btn" id="td-resume">▶ 继续</button>
    <button class="btn btn-ghost full" id="td-restart">🔄 重新开始这一关</button>
    <button class="btn btn-ghost full" id="td-quit">🗺️ 回到地图</button>`
  $("#overlay").classList.add("open")
  $("#td-resume").onclick = () => { $("#overlay").classList.remove("open"); if (TD) { TD.paused = TD.menu >= 0; TD.last = 0 } }
  $("#td-restart").onclick = () => { $("#overlay").classList.remove("open"); const lv = TD.lv, plan = TD.plan; TD = null; tdBattle(lv, plan) }
  $("#td-quit").onclick = () => { $("#overlay").classList.remove("open"); TD = null; tdMap() }
}

// ═══════════════════════════════════════════════════════════════════════
// 主循环
// ═══════════════════════════════════════════════════════════════════════
function tdLoop(ts) {
  if (!TD || TD.gen !== gen) return
  const dt = TD.last ? Math.min(0.05, (ts - TD.last) / 1000) : 0
  TD.last = ts
  if (!TD.paused && TD.phase !== "over") { TD.t += dt; TD.siege ? tdSiegeUpdate(dt) : tdUpdate(dt) }
  tdFxUpdate(TD.paused ? 0 : dt)
  TD.siege ? tdSiegeDraw() : tdDraw()
  tdHud()
  requestAnimationFrame(tdLoop)
}

function tdUpdate(dt) {
  if (TD.phase === "wave") {
    // 刷单词怪（同时在场的数量有上限，孩子拼不过来就先不刷）
    TD.spawnT -= dt
    if (TD.queue.length && TD.spawnT <= 0 && tdAlive("word").length < TD.maxAlive) { tdSpawnWord(TD.queue.shift()); TD.spawnT = TD.gap }
    if (TD.queue.length && !tdAlive("word").length && TD.spawnT > 1.5) TD.spawnT = 1.5
    TD.minionT -= dt
    if (TD.minions > 0 && TD.minionT <= 0) { tdSpawnMinion(); TD.minions--; TD.minionT = TD.minions % 3 === 0 ? 5 : 0.8 }
  }
  // 怪物移动
  for (const m of TD.mons) {
    if (m.dead) continue
    m.slowT = Math.max(0, m.slowT - dt); m.stunT = Math.max(0, m.stunT - dt); m.rageT = Math.max(0, m.rageT - dt)
    if (m.kbT > 0) { const k = Math.min(m.kbT, dt * 4); m.d = Math.max(0, m.d - k); m.kbT -= k; continue }
    if (m.stunT > 0) continue
    m.d += m.sp * (m.slowT > 0 ? 0.55 : 1) * (m.rageT > 0 ? 1.6 : 1) * dt
    if (m.d >= TD.len) tdLeak(m)
    if (TD.phase === "over") return
  }
  // 防御塔
  TD.towers.forEach((t, i) => {
    if (!t) return
    const T = TD_TOWERS[t.k], [sx, sy] = TD.map.spots[i], cx = sx + 0.5, cy = sy + 0.5, R = T.range[t.lv - 1]
    const inR = tdAlive().filter((m) => { const p = tdPos(m.d); return Math.hypot(p.x - cx, p.y - cy) <= R })
    t.cd -= dt
    if (t.k === "ice") { inR.forEach((m) => { m.slowT = Math.max(m.slowT, t.lv === 2 ? 0.6 : 0.4) }); return }
    if (t.cd > 0) return
    if (t.k === "archer") {
      const bats = inR.filter((m) => m.kind === "minion")
      if (bats.length) { const m = bats.reduce((a, b) => (b.d > a.d ? b : a)); TD.shots.push({ x: cx, y: cy, m, v: 9, kind: "arrow", dmg: t.lv, c: "#8b5a2b" }); t.cd = t.lv === 2 ? 0.55 : 0.85 }
    } else if (t.k === "cannon") {
      if (inR.length) {
        const m = inR.reduce((a, b) => (b.d > a.d ? b : a))
        TD.shots.push({ x: cx, y: cy, m, v: 6, kind: "ball", c: "#333" }); t.cd = t.lv === 2 ? 3.2 : 4.5
      }
    } else if (t.k === "tesla") {
      const ws = inR.filter((m) => m.kind === "word")
      if (ws.length) {
        ws.forEach((m) => { m.stunT = t.lv === 2 ? 2.4 : 1.6; const p = tdPos(m.d); TD.parts.push({ zap: true, x1: cx, y1: cy, x2: p.x, y2: p.y, t: 0.35 }) })
        tdSfx("zap"); t.cd = t.lv === 2 ? 6 : 8
      }
    }
  })
  // 目标
  if (!TD.target || TD.target.dead) {
    const nt = tdPickTarget()
    if (nt) tdSetTarget(nt)
    else if (TD.target) { TD.target = null; tdPanel() }
  }
  // 波次结束
  if (TD.phase === "wave" && !TD.queue.length && TD.minions <= 0 && !tdAlive().length) {
    TD.waveNo++
    if (TD.waveNo >= TD.waves.length && !TD.retry.length) return tdEnd(true)
    if (TD.waveNo >= TD.waves.length) TD.waves.push([])   // 还有要「再来一次」的词：加一小波
    TD.phase = "build"
    TD.gold += 20
    tdFloat(TD_COLS / 2, TD_ROWS / 2, `第 ${TD.waveNo} 波完成！+20💰`, "#7CFC00", 1.8)
    TD.panelKey = null; tdPanel()
    tdBanner(`🌊 第 ${TD.waveNo} 波完成！`, `可以造塔 / 升级塔（💰${TD.gold}）${TD.retry.length ? `<br>刚才写错的 ${TD.retry.length} 个词会在下一波再来` : ""}`, `⚔️ 开始第 ${TD.waveNo + 1} 波`, tdStartWave)
  }
}

function tdFxUpdate(dt) {
  // 子弹
  for (const s of TD.shots) {
    let tx = s.tx, ty = s.ty
    if (s.m) {
      if (TD.siege) { tx = s.m.tx ?? (TD_COLS - 2.5); ty = s.m.ty ?? 3 }
      else { const p = tdPos(s.m.d); tx = p.x; ty = p.y - 0.15 }
    }
    const dx = tx - s.x, dy = ty - s.y, dist = Math.hypot(dx, dy), step = s.v * dt
    if (dist <= step || dist < 0.05) {
      s.done = true
      if (s.kind === "bolt") TD.parts.push(...tdSpark(tx, ty, 5, "#ffe066"))
      else if (s.kind === "miss") TD.parts.push(...tdSpark(tx, ty, 4, "#aaa"))
      else if (s.kind === "arrow" && s.m && !s.m.dead) { s.m.hp -= s.dmg; if (s.m.hp <= 0) { s.m.dead = true; TD.gold += 3; TD.goldEarned += 3; tdFloat(tx, ty - 0.4, "+3💰", "#ffd700"); TD.parts.push(...tdSpark(tx, ty, 10, "#9d6bd1")) } }
      else if (s.kind === "ball") {
        tdBoom(tx, ty, 14, ["#555", "#ff9a3c", "#ffd700"]); tdSfx("boom")
        tdAlive().forEach((m) => {
          const p = tdPos(m.d); if (Math.hypot(p.x - tx, p.y - ty) > 1.3) return
          if (m.kind === "minion") { m.dead = true; TD.gold += 3; TD.goldEarned += 3 } else m.kbT = 1.2
        })
      }
    } else { s.x += dx / dist * step; s.y += dy / dist * step }
  }
  TD.shots = TD.shots.filter((s) => !s.done)
  for (const p of TD.parts) { p.t -= dt; if (!p.zap) { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 6 * dt } }
  TD.parts = TD.parts.filter((p) => p.t > 0)
  for (const f of TD.texts) { f.t -= dt; f.y -= 0.8 * dt }
  TD.texts = TD.texts.filter((f) => f.t > 0)
  TD.mons = TD.mons.filter((m) => !m.dead || m === TD.target)
}
function tdSpark(x, y, n, c) { return [...Array(n)].map(() => ({ x, y, vx: (Math.random() - 0.5) * 4, vy: (Math.random() - 0.8) * 4, t: 0.4 + Math.random() * 0.3, c, s: 0.08 })) }
function tdBoom(x, y, n, colors) { for (let i = 0; i < n; i++) TD.parts.push({ x, y, vx: (Math.random() - 0.5) * 7, vy: (Math.random() - 0.7) * 7, t: 0.5 + Math.random() * 0.5, c: pick(colors), s: 0.07 + Math.random() * 0.08 }) }
function tdFloat(x, y, text, c, t = 1) { TD.texts.push({ x, y, text, c, t, t0: t }) }

// ═══════════════════════════════════════════════════════════════════════
// 绘制（塔防）
// ═══════════════════════════════════════════════════════════════════════
function tdEmo(ctx, e, x, y, size, alpha = 1) {
  ctx.globalAlpha = alpha
  ctx.font = `${size}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`
  ctx.textAlign = "center"; ctx.textBaseline = "middle"
  ctx.fillText(e, x, y)
  ctx.globalAlpha = 1
}
function tdText(ctx, text, x, y, size, color, stroke = "#000") {
  ctx.font = `900 ${size}px -apple-system, system-ui, sans-serif`
  ctx.textAlign = "center"; ctx.textBaseline = "middle"
  ctx.lineWidth = Math.max(2, size / 5); ctx.strokeStyle = stroke; ctx.strokeText(text, x, y)
  ctx.fillStyle = color; ctx.fillText(text, x, y)
}
function tdDraw() {
  const ctx = TD.ctx, T = TD.tile, ch = TD.ch
  // 地面
  for (let y = 0; y < TD_ROWS; y++) for (let x = 0; x < TD_COLS; x++) { ctx.fillStyle = (x + y) % 2 ? ch.bg : ch.bg2; ctx.fillRect(x * T, y * T, T + 1, T + 1) }
  TD.decor.forEach((d) => tdEmo(ctx, d.e, d.x * T, d.y * T, T * d.s, 0.9))
  // 道路
  ctx.lineCap = "round"; ctx.lineJoin = "round"
  ctx.beginPath(); TD.pts.forEach(([x, y], i) => i ? ctx.lineTo(x * T, y * T) : ctx.moveTo(x * T, y * T))
  ctx.strokeStyle = ch.edge; ctx.lineWidth = T * 0.86; ctx.stroke()
  ctx.strokeStyle = ch.path; ctx.lineWidth = T * 0.7; ctx.stroke()
  // 城堡
  const [cx, cy] = TD.castle
  tdEmo(ctx, "🏰", cx * T, cy * T - T * 0.1, T * 1.35)
  tdEmo(ctx, "🧙", cx * T + T * 0.35, cy * T - T * 0.75, T * 0.6)
  // 塔位
  TD.map.spots.forEach(([sx, sy], i) => {
    const t = TD.towers[i], x = (sx + 0.5) * T, y = (sy + 0.5) * T
    if (TD.menu === i && t) {
      ctx.beginPath(); ctx.arc(x, y, TD_TOWERS[t.k].range[t.lv - 1] * T, 0, Math.PI * 2)
      ctx.fillStyle = "rgba(255,255,255,0.15)"; ctx.fill(); ctx.strokeStyle = "rgba(255,255,255,0.6)"; ctx.lineWidth = 2; ctx.stroke()
    }
    ctx.beginPath(); ctx.arc(x, y, T * 0.42, 0, Math.PI * 2)
    if (!t) {
      ctx.fillStyle = TD.menu === i ? "rgba(255,215,0,0.5)" : "rgba(0,0,0,0.18)"; ctx.fill()
      ctx.setLineDash([4, 3]); ctx.strokeStyle = "rgba(255,255,255,0.8)"; ctx.lineWidth = 2; ctx.stroke(); ctx.setLineDash([])
      tdText(ctx, "+", x, y, T * 0.5, "#fff", "rgba(0,0,0,0.4)")
    } else {
      ctx.fillStyle = "#6d5a48"; ctx.fill(); ctx.strokeStyle = t.lv === 2 ? "#ffd700" : "#3d2f22"; ctx.lineWidth = 3; ctx.stroke()
      tdEmo(ctx, TD_TOWERS[t.k].icon, x, y - T * 0.05, T * 0.62)
      if (t.lv === 2) tdEmo(ctx, "⭐", x + T * 0.32, y - T * 0.32, T * 0.3)
    }
  })
  // 怪物
  const ms = TD.mons.filter((m) => !m.dead).map((m) => ({ m, p: tdPos(m.d) })).sort((a, b) => a.p.y - b.p.y)
  for (const { m, p } of ms) {
    const x = p.x * T, y = p.y * T + Math.sin(TD.t * 6 + m.bob) * T * 0.05 - T * 0.15
    const size = T * 0.75 * m.size
    if (m === TD.target) {
      const r = size * 0.62 + Math.sin(TD.t * 8) * 2
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.strokeStyle = "#ffd700"; ctx.lineWidth = 3; ctx.stroke()
      tdEmo(ctx, "🎯", x, y - size * 0.95, T * 0.35)
    }
    if (m.slowT > 0) { ctx.beginPath(); ctx.arc(x, y + size * 0.35, size * 0.45, 0, Math.PI * 2); ctx.fillStyle = "rgba(120,200,255,0.45)"; ctx.fill() }
    tdEmo(ctx, m.e, x, y, size, m.ghost ? 0.75 : 1)
    if (m.rageT > 0) tdEmo(ctx, "💢", x + size * 0.45, y - size * 0.45, T * 0.3)
    if (m.stunT > 0) tdEmo(ctx, "💫", x, y - size * 0.6, T * 0.32)
    // 血条（每个字母一格）
    if (m.kind === "word") {
      const bw = Math.min(T * 1.4, Math.max(T * 0.7, m.hpMax * T * 0.12)), bh = Math.max(4, T * 0.12), bx = x - bw / 2, by = y + size * 0.55
      ctx.fillStyle = "rgba(0,0,0,0.55)"; ctx.fillRect(bx - 1, by - 1, bw + 2, bh + 2)
      ctx.fillStyle = m.ghost ? "#c9b8ff" : "#ff4d4d"; ctx.fillRect(bx, by, bw * (m.hp / m.hpMax), bh)
      if (m.hpMax <= 14) { ctx.fillStyle = "rgba(0,0,0,0.5)"; for (let k = 1; k < m.hpMax; k++) ctx.fillRect(bx + bw * k / m.hpMax, by, 1, bh) }
      if (m.ghost) tdText(ctx, "NEW", x, by + bh + T * 0.17, T * 0.24, "#fff", "#6b3eb0")
    }
  }
  tdDrawFx(ctx, T)
}
function tdDrawFx(ctx, T) {
  for (const s of TD.shots) {
    ctx.beginPath(); ctx.arc(s.x * T, s.y * T, s.kind === "ball" ? T * 0.13 : T * 0.08, 0, Math.PI * 2)
    ctx.fillStyle = s.c; ctx.fill()
    if (s.kind === "bolt") { ctx.shadowColor = "#ffe066"; ctx.shadowBlur = 10; ctx.fill(); ctx.shadowBlur = 0 }
  }
  for (const p of TD.parts) {
    if (p.zap) {
      ctx.beginPath(); ctx.moveTo(p.x1 * T, p.y1 * T)
      for (let k = 1; k < 5; k++) ctx.lineTo((p.x1 + (p.x2 - p.x1) * k / 5 + (Math.random() - 0.5) * 0.3) * T, (p.y1 + (p.y2 - p.y1) * k / 5 + (Math.random() - 0.5) * 0.3) * T)
      ctx.lineTo(p.x2 * T, p.y2 * T); ctx.strokeStyle = "#aef"; ctx.lineWidth = 3; ctx.stroke()
      continue
    }
    ctx.globalAlpha = Math.min(1, p.t * 2)
    if (p.brick) { ctx.fillStyle = "#a7653a"; ctx.fillRect(p.x * T, p.y * T, p.w * T, p.h * T) }
    else { ctx.fillStyle = p.c; ctx.fillRect(p.x * T, p.y * T, p.s * T, p.s * T) }
    ctx.globalAlpha = 1
  }
  for (const f of TD.texts) { ctx.globalAlpha = Math.min(1, f.t * 2); tdText(ctx, f.text, f.x * T, f.y * T, T * 0.42, f.c); ctx.globalAlpha = 1 }
}

// ═══════════════════════════════════════════════════════════════════════
// 攻城战（每 6 关）：拼对一个词砸一块砖
// ═══════════════════════════════════════════════════════════════════════
function tdSiegeInit() {
  const n = Math.max(6, TD.plan.hidden.length)
  TD.boss = (typeof nextBoss === "function" ? nextBoss() : MONSTERS[0])
  TD.sq = shuffle(TD.plan.hidden).slice(0, n).map((o) => ({ o }))
  const cols = 3, rows = Math.ceil(TD.sq.length / cols)
  TD.bricks = []
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) if (TD.bricks.length < TD.sq.length) TD.bricks.push({ r, c, down: false })
  TD.bRows = rows
  TD.cannonMax = Math.max(9, 16 - TD.lv * 0.12)
  TD.cannonT = TD.cannonMax
  TD.shield = false
  TD.rocks = []
  TD.sw = null
}
function tdBrickXY(b) {
  const bw = 0.95, bh = 0.62, left = TD_COLS - 1.2 - 3 * bw, base = TD_ROWS - 1.6
  return { x: left + b.c * bw, y: base - (b.r + 1) * bh, w: bw, h: bh }
}
function tdSiegeNext() {
  if (TD.phase === "over") return
  if (!TD.sq.length) return
  const it = TD.sq.shift()
  const n = norm(it.o.w).length
  TD.sw = { id: TD.nextId++, o: it.o, typed: "", mistakes: 0, posWrong: 0, hint: false, hp: n, hpMax: n, dead: false }
  const top = TD.bricks.filter((b) => !b.down).sort((a, b) => b.r - a.r || a.c - b.c)[0]
  if (top) { const p = tdBrickXY(top); TD.sw.tx = p.x + p.w / 2; TD.sw.ty = p.y + p.h / 2; TD.sw.brick = top }
  speakWord(it.o.w)
  TD.panelKey = null; tdPanel()
}
function tdSiegeHit(m) {
  m.dead = true
  const perfect = m.mistakes === 0
  tdRecord(m.o, "first", perfect)
  grade(m.o, perfect)
  save()
  TD.rocks.push({ x: 1.6, y: TD_ROWS - 2.4, sx: 1.6, sy: TD_ROWS - 2.4, b: m.brick, t: 0, dur: 0.9 })
  tdSfx("boom")
  if (perfect) { TD.shield = true; tdFloat(3, TD_ROWS - 3.5, "PERFECT! 🛡️", "#7CFC00", 1.4); tdSfx("perfect") }
  else tdFloat(TD_COLS / 2, 2.2, displayWord(m.o), "#fff", 2)
  const g = 8 + m.hpMax * 2 + (perfect ? 6 : 0); TD.gold += g; TD.goldEarned += g
  later(() => { if (TD && TD.phase === "wave") tdSiegeNext() }, 1100)
}
function tdSiegeUpdate(dt) {
  if (TD.phase !== "wave") return
  for (const r of TD.rocks) {
    r.t += dt
    if (r.t >= r.dur && !r.hit) {
      r.hit = true
      if (r.b) { r.b.down = true; const p = tdBrickXY(r.b); tdBoom(p.x + p.w / 2, p.y + p.h / 2, 26, ["#a0522d", "#cd853f", "#777", "#ffd700"]); TD.parts.push({ brick: true, x: p.x, y: p.y, w: p.w, h: p.h, vx: (Math.random() - 0.3) * 2, vy: -2, t: 1.2, rot: 0 }) }
    }
  }
  TD.rocks = TD.rocks.filter((r) => !r.hit)
  if (TD.bricks.every((b) => b.down) && !TD.rocks.length) return tdEnd(true)
  // 敌人大炮
  TD.cannonT -= dt
  if (TD.cannonT <= 0) {
    TD.cannonT = TD.cannonMax
    TD.balls = TD.balls || []
    TD.balls.push({ t: 0, dur: 1.3 })
    tdSfx("boom")
  }
  for (const b of TD.balls || []) {
    b.t += dt
    if (b.t >= b.dur && !b.hit) {
      b.hit = true
      if (TD.shield) { TD.shield = false; tdFloat(2, TD_ROWS - 3.4, "🛡️ 挡住了！", "#7CFC00", 1.4); tdBoom(2, TD_ROWS - 2.6, 14, ["#9cf", "#fff"]) }
      else {
        TD.hearts--; tdFloat(2, TD_ROWS - 3.4, "-1❤️", "#ff5555", 1.4); tdBoom(1.6, TD_ROWS - 2.4, 20, ["#ff3d3d", "#555"]); tdSfx("leak")
        if (TD.hearts <= 0) return tdEnd(false)
      }
    }
  }
  if (TD.balls) TD.balls = TD.balls.filter((b) => !b.hit)
}
function tdSiegeDraw() {
  const ctx = TD.ctx, T = TD.tile, ch = TD.ch
  const g = ctx.createLinearGradient(0, 0, 0, TD_ROWS * T)
  g.addColorStop(0, "#7ec8f0"); g.addColorStop(0.7, "#cfe9f7"); ctx.fillStyle = g; ctx.fillRect(0, 0, TD_COLS * T, TD_ROWS * T)
  ctx.fillStyle = ch.bg; ctx.fillRect(0, (TD_ROWS - 1.6) * T, TD_COLS * T, 1.6 * T)
  ctx.fillStyle = ch.edge; ctx.fillRect(0, (TD_ROWS - 1.6) * T, TD_COLS * T, 4)
  TD.decor.slice(0, 5).forEach((d, i) => tdEmo(ctx, d.e, (3.5 + i * 0.9) * T, (TD_ROWS - 1.2) * T, T * 0.55))
  tdEmo(ctx, "☁️", ((TD.t * 0.3) % (TD_COLS + 2) - 1) * T, 1.2 * T, T * 1.1)
  tdEmo(ctx, "☁️", ((TD.t * 0.2 + 6) % (TD_COLS + 2) - 1) * T, 2.2 * T, T * 0.8)
  // 我方
  tdEmo(ctx, "🏰", 1.6 * T, (TD_ROWS - 2.3) * T, T * 1.6)
  tdEmo(ctx, "🧙", 2.6 * T, (TD_ROWS - 2.0) * T, T * 0.8)
  if (TD.shield) { ctx.beginPath(); ctx.arc(1.8 * T, (TD_ROWS - 2.4) * T, T * 1.15, 0, Math.PI * 2); ctx.strokeStyle = "rgba(120,200,255,0.9)"; ctx.lineWidth = 4; ctx.stroke(); ctx.fillStyle = "rgba(120,200,255,0.15)"; ctx.fill() }
  // 敌方城堡
  const alive = TD.bricks.filter((b) => !b.down)
  const topRow = alive.length ? Math.max(...alive.map((b) => b.r)) : -1
  TD.bricks.forEach((b) => {
    if (b.down) return
    const p = tdBrickXY(b)
    ctx.fillStyle = (b.r + b.c) % 2 ? "#a7653a" : "#b8744a"; ctx.fillRect(p.x * T, p.y * T, p.w * T, p.h * T)
    ctx.strokeStyle = "#5a3a20"; ctx.lineWidth = 2; ctx.strokeRect(p.x * T + 1, p.y * T + 1, p.w * T - 2, p.h * T - 2)
    if (TD.sw && TD.sw.brick === b && !TD.sw.dead) { ctx.strokeStyle = "#ffd700"; ctx.lineWidth = 3; ctx.strokeRect(p.x * T + 2, p.y * T + 2, p.w * T - 4, p.h * T - 4) }
  })
  const left = TD_COLS - 1.2 - 3 * 0.95
  const bossY = TD_ROWS - 1.6 - (topRow + 1) * 0.62 - 0.55
  tdEmo(ctx, TD.boss.emoji, (left + 1.43) * T, bossY * T + Math.sin(TD.t * 3) * 3, T * 1.1)
  tdEmo(ctx, "💣", (left - 0.2) * T, (TD_ROWS - 2.0) * T, T * 0.6)
  // 大炮倒计时
  const f = Math.max(0, TD.cannonT / TD.cannonMax)
  const bx = (left - 0.3) * T, by = (TD_ROWS - 1.2) * T
  ctx.fillStyle = "rgba(0,0,0,0.5)"; ctx.fillRect(bx, by, T * 3.4, 8)
  ctx.fillStyle = f < 0.3 ? "#ff4d4d" : "#ffb300"; ctx.fillRect(bx, by, T * 3.4 * f, 8)
  tdText(ctx, "敌人开炮", bx + T * 1.7, by + 18, T * 0.26, "#fff")
  // 石头（抛物线）
  for (const r of TD.rocks) {
    const p = tdBrickXY(r.b || TD.bricks[0]), k = Math.min(1, r.t / r.dur)
    const x = r.sx + (p.x + p.w / 2 - r.sx) * k, y = r.sy + (p.y + p.h / 2 - r.sy) * k - Math.sin(k * Math.PI) * 3
    tdEmo(ctx, "🪨", x * T, y * T, T * 0.5)
  }
  for (const b of TD.balls || []) {
    const k = Math.min(1, b.t / b.dur), sx = left - 0.2, sy = TD_ROWS - 2.2
    const x = sx + (1.8 - sx) * k, y = sy + ((TD_ROWS - 2.4) - sy) * k - Math.sin(k * Math.PI) * 2.5
    ctx.beginPath(); ctx.arc(x * T, y * T, T * 0.16, 0, Math.PI * 2); ctx.fillStyle = "#222"; ctx.fill()
  }
  tdDrawFx(ctx, T)
}

// ═══════════════════════════════════════════════════════════════════════
// 结算
// ═══════════════════════════════════════════════════════════════════════
function tdEnd(win) {
  if (TD.phase === "over") return
  TD.phase = "over"
  stopSpeech()
  keyHandler = null
  const d = tdData(), lv = TD.lv
  const lost = TD.heartsMax - TD.hearts
  const stars = win ? (lost === 0 ? 3 : lost <= 2 ? 2 : 1) : 0
  questCoins = 0
  const res = [...TD.res.values()]
  const graded = res.filter((r) => r.first !== undefined)
  const perfectAll = graded.length > 0 && graded.every((r) => r.first)
  let captured = false
  if (win) {
    d.stars[lv] = Math.max(d.stars[lv] || 0, stars)
    if (lv === d.level) d.level = lv + 1
    addCoins(Math.round(TD.goldEarned / 10) + stars * 5)
    if (TD.siege) {
      captured = true
      const c = S.collection[TD.boss.id] || { n: 0, shiny: false }
      c.n++; if (perfectAll) c.shiny = true
      S.collection[TD.boss.id] = c
      addCoins(perfectAll ? 30 : 15)
    }
    const newDay = bumpDaily()
    if (newDay && streakNow() > 1) addCoins(Math.min(streakNow(), 10))
  } else addCoins(Math.round(TD.goldEarned / 20))
  save(); updateHeader()
  sfx(win ? "win" : "wrong")
  const wrong = res.filter((r) => r.first === false).map((r) => r.o)
  setTimeout(() => {
    if (!TD || TD.lv !== lv) return
    if (win) burstConfetti(window.innerWidth / 2, 200, 70)
    $("#overlay-card").innerHTML = `
      <div class="res-emoji">${win ? (captured ? TD.boss.emoji : "🏆") : "💥"}</div>
      <div class="res-title">${win ? (captured ? (perfectAll ? "✨ 完美收服！" : "攻城成功！") : "守住了！") : "城堡被攻破…"}</div>
      <div class="stars">${win ? "⭐".repeat(stars) + "☆".repeat(3 - stars) : ""}</div>
      ${captured ? `<div class="sub">${esc(TD.boss.name)} 加入了你的图鉴${perfectAll ? "（闪光版 ✨）" : ""}</div>` : ""}
      <div class="reward-box">+${questCoins} 🪙</div>
      <div class="word-list" style="max-height:30vh;overflow:auto">${res.map((r) => `<div class="wl-row"><b>${esc(displayWord(r.o))}</b><span class="wl-meta ${r.first === false ? "bad" : ""}">${
        r.first === true ? "✅ 一次拼对" : r.first === false ? "🔁 拼错过，会再复习" : "👻 新学"}</span></div>`).join("")}</div>
      ${wrong.length ? `<button class="btn btn-secondary full" id="td-fix">✍️ 订正 ${wrong.length} 个错词</button>` : ""}
      <button class="big-btn" id="td-next">${win ? `▶ 下一关（第 ${d.level} 关）` : "🔄 再来一次"}</button>
      <button class="btn btn-ghost full" id="td-map">🗺️ 地图</button>`
    $("#overlay").classList.add("open")
    const close = () => $("#overlay").classList.remove("open")
    $("#td-next").onclick = () => { close(); TD = null; win ? tdStart(d.level) : tdStart(lv) }
    $("#td-map").onclick = () => { close(); TD = null; tdMap() }
    const fx = $("#td-fix"); if (fx) fx.onclick = () => { close(); TD = null; fixWords(wrong, tdMap) }
  }, 1200)
}
