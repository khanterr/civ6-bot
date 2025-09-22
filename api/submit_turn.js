import crypto from "crypto";

const API_KEY = process.env.TELEGRAM_BOT_API_KEY;

const GAME_2_CHAT = {
  test: "-760003626",
  Madlen: "-1001605973535",
  "Mad Mad World": "-1001512980961",
  "Las dosmil y una islas": "-1001937517537",
  "Stranger Things": "-711973754",
  "Guardin Apocalipsis": "-830664474",
  "Mala Gente": "-1001948188428",
  "Dungeon I": "-803748085",
  Argyn: "-796911059",
  "Dungeon II": "-939135039",
  "El muerto": "-1001810322189",
  "Family Affairs": "-1001975074731",
  Dinero: "-1002124050216",
  "La Cosa Nostra": "-1002478747503",
  Bizcocho: "-1002821093496",
  "Fruta Prohibida": "-1002429758923",
  ahshit: "-1003011585583",
};

const NICKNAME_2_TELEGRAM_USER = {
  Orion: "nogayevnuras",
  brotandos: "brotherdos",
  khanter: "khanterr",
  Cocosus: "MegaCocos",
  ARTURhot: "ArturHot",
  p53: "temoxa_top",
};

const ignoreGames = new Set([
  "Invierno Nuclear",
  "4 Son Multitud",
  "4 tristes Tigres",
  "Ofensiva de Primavera",
  "The Usual Suspects",
]);

const emojies = [
  "✈","🚀","🛰","🛸","😁","🤗","😜","🤖","👾","👽","👻","🎨","🎭",
  "🌍","🌏","🗺","🧭","🏔","🌋","🗻","🏕","🏖","🏜","🏝","🏞",
];

const seenTurnSet = new Set();

function stableStringify(obj) {
  if (Array.isArray(obj)) return "[" + obj.map(stableStringify).join(",") + "]";
  if (obj && typeof obj === "object") {
    return (
      "{" +
      Object.keys(obj)
        .sort()
        .map((k) => JSON.stringify(k) + ":" + stableStringify(obj[k]))
        .join(",") +
      "}"
    );
  }
  return JSON.stringify(obj);
}

function stableHash(obj) {
  return crypto.createHash("sha256").update(stableStringify(obj)).digest("hex");
}

function getRawBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => (data += chunk));
    req.on("end", () => resolve(data));
    req.on("error", reject);
  });
}

async function sendTgMessage(message, chatId) {
  if (!API_KEY) throw new Error("TELEGRAM_BOT_API_KEY not set");
  const url = `https://api.telegram.org/bot${API_KEY}/sendMessage`;
  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
      parse_mode: "Markdown",
    }),
  });
  const text = await resp.text();
  if (!resp.ok) throw new Error("Telegram API error: " + text);
}

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

  try {
    const raw = await getRawBody(req);
    let body = {};
    try {
      body = raw ? JSON.parse(raw) : {};
    } catch {
      return res.status(400).send("Invalid JSON");
    }

    const { value1, value2, value3 } = body;
    if (!value1 || !value2 || value3 === undefined) {
      return res.status(400).send("Missing fields: value1, value2, value3");
    }

    const hash = stableHash(body);
    if (seenTurnSet.has(hash)) return res.status(200).send("Received duplicate");
    seenTurnSet.add(hash);

    const emoji = emojies[Math.floor(Math.random() * emojies.length)];
    const nickname = NICKNAME_2_TELEGRAM_USER[value2] || value2;
    const notification = `@${nickname}, you get your turn #${value3} in game: ${value1}! ${emoji}`;
    const chatId = GAME_2_CHAT[value1] || "-1003011585583";

    if (!ignoreGames.has(value1)) {
      await sendTgMessage(notification, chatId);
    }

    res.status(200).send("Received");
  } catch (err) {
    console.error("Handler error:", err);
    res.status(500).send("Internal Server Error");
  }
};
