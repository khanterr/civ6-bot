export default function handler(req, res) {
    if (req.method === "GET") {
      res.status(200).send("The bot is still running fine 😀");
    } else {
      res.status(405).send("Method Not Allowed");
    }
  }