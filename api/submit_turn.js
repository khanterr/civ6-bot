import crypto from "crypto";
import fetch from "node-fetch";

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

// in-memory deduplication (resets if function cold-starts)
const seenTurnSet = new Set();

function stableHash(body) {
  return crypto.createHash("sha256")
    .update(JSON.stringify(body))
    .digest("hex");
}

async function sendTgMessage(message, chatId) {
  const url = `https://api.telegram.org/bot${API_KEY}/sendMessage`;
  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
      parse_mode: "Markdown"
    }),
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Telegram API error: ${text}`);
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  try {
    const body = req.body;

    const hash = stableHash(body);
    if (seenTurnSet.has(hash)) {
      return res.status(200).send("Received duplicate");
    }
    seenTurnSet.add(hash);

    const emoji = emojies[Math.floor(Math.random() * emojies.length)];
    const nickname = NICKNAME_2_TELEGRAM_USER[body.value2] || body.value2;
    const notification = `@${nickname}, you get your turn #${body.value3} in game: ${body.value1}! ${emoji}`;

    const chatId = GAME_2_CHAT[body.value1] || "-760003626";

    if (!ignoreGames.has(body.value1)) {
      await sendTgMessage(notification, chatId);
    }

    return res.status(200).send("Received");
  } catch (err) {
    console.error(err);
    return res.status(500).send("Internal Server Error");
  }
}
