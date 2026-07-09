const http = require("http");
const fs = require("fs");
const path = require("path");

const port = 8790;
const root = __dirname;

const members = [
  { id: "korori", name: "Korori", summoner: "\u5fa1\u7d50\u7f8e\u3053\u308d\u308a#TTV" },
  { id: "kuma", name: "Kuma", summoner: "kumakumatwitch#0129" },
  { id: "nanachika", name: "Nanachika", summoner: "\u306a\u306a\u30fc\u3061#\u30e8\u30cdOTP" },
  { id: "kurena", name: "Kurena", summoner: "Yukami907#HIMA" },
  { id: "uni", name: "Rione", summoner: "\u72ac\u6ce5\u68d2#\u3048\u3093\u3056\u3044" }
];

const allowedRanks = new Set([
  "Iron IV", "Iron III", "Iron II", "Iron I",
  "Bronze IV", "Bronze III", "Bronze II", "Bronze I",
  "Silver IV", "Silver III", "Silver II", "Silver I",
  "Gold IV"
]);

function opggUrl(summoner) {
  const [gameName, tagLine = ""] = summoner.split("#");
  return `https://www.op.gg/summoners/jp/${encodeURIComponent(gameName)}-${encodeURIComponent(tagLine)}`;
}

function cleanText(raw) {
  return String(raw || "")
    .replace(/\\u002F/g, "/")
    .replace(/&quot;/g, "\"")
    .replace(/&#x27;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ");
}

function normalizeRank(raw) {
  const text = cleanText(raw);
  const tier = "(Iron|Bronze|Silver|Gold)";
  const division = "(IV|III|II|I|4|3|2|1)";
  const patterns = [
    new RegExp(`Ranked Solo/Duo.{0,1800}?${tier}\\s*${division}`, "i"),
    new RegExp(`"tier"\\s*:\\s*"${tier}".{0,400}?"division"\\s*:\\s*"?${division}"?`, "i"),
    new RegExp(`${tier}\\s*${division}`, "i")
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (!match) continue;
    const tierText = match[1].charAt(0).toUpperCase() + match[1].slice(1).toLowerCase();
    const roman = { "1": "I", "2": "II", "3": "III", "4": "IV", I: "I", II: "II", III: "III", IV: "IV" };
    const rank = `${tierText} ${roman[match[2].toUpperCase()]}`;
    if (allowedRanks.has(rank)) return rank;
  }
  return null;
}

function normalizeLp(raw) {
  const text = cleanText(raw);
  const patterns = [
    /(\d{1,3})\s*LP/i,
    /"leaguePoints"\s*:\s*(\d{1,3})/i,
    /"lp"\s*:\s*(\d{1,3})/i
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (!match) continue;
    const value = Number(match[1]);
    if (Number.isFinite(value)) return Math.max(0, Math.min(100, value));
  }
  return null;
}

async function readRank(member) {
  const response = await fetch(opggUrl(member.summoner), {
    headers: {
      accept: "text/html,application/xhtml+xml",
      "accept-language": "ja,en-US;q=0.9,en;q=0.8",
      "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36"
    }
  });
  if (!response.ok) throw new Error(`${member.name}: HTTP ${response.status}`);
  const html = await response.text();
  const rank = normalizeRank(html);
  if (!rank) throw new Error(`${member.name}: rank not found`);
  return { rank, lp: normalizeLp(html) };
}

function sendJson(res, status, data) {
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "access-control-allow-origin": "*"
  });
  res.end(JSON.stringify(data, null, 2));
}

async function handleRanks(res) {
  const ranks = {};
  const errors = [];

  for (const member of members) {
    try {
      ranks[member.id] = await readRank(member);
    } catch (error) {
      errors.push(error.message);
    }
  }

  sendJson(res, 200, { ranks, errors, checkedAt: new Date().toISOString() });
}

const server = http.createServer(async (req, res) => {
  if (req.url === "/api/ranks") {
    await handleRanks(res);
    return;
  }

  const filePath = req.url === "/" ? path.join(root, "lol-growth-map.html") : path.join(root, req.url.replace(/^\/+/, ""));
  if (!filePath.startsWith(root)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (error, data) => {
    if (error) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }
    res.writeHead(200, { "content-type": filePath.endsWith(".html") ? "text/html; charset=utf-8" : "application/octet-stream" });
    res.end(data);
  });
});

server.listen(port, "127.0.0.1", () => {
  console.log(`TeamForge rank sync: http://127.0.0.1:${port}/`);
});
