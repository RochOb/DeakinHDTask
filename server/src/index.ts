// server/src/index.ts
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { sendEmail } from "./mailer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT || 8080);
const NOTIFY_TOKEN = process.env.NOTIFY_TOKEN || "";

// Parse JSON bodies
app.use(express.json());

// Healthcheck
app.get("/healthz", (_req, res) =>
  res.json({ ok: true, service: "discountmate", ts: Date.now() })
);


app.post("/_internal/notify", async (req, res) => {
  const token = req.header("x-api-key") || "";
  if (!NOTIFY_TOKEN || token !== NOTIFY_TOKEN) {
    return res.status(401).json({ ok: false, error: "unauthorized" });
  }

  const { to, subject, text, html } = req.body ?? {};
  if (!to || !subject) {
    return res
      .status(400)
      .json({ ok: false, error: "missing to or subject" });
  }

  try {
    const info = await sendEmail({ to, subject, text, html });
    return res.json({ ok: true, info });
  } catch (err: any) {
    console.error("sendEmail error:", err);
    return res.status(500).json({ ok: false, error: err?.message || String(err) });
  }
});


const staticDir = path.join(__dirname, "../../app_build");
app.use(express.static(staticDir));
app.get("*", (_req, res) => res.sendFile(path.join(staticDir, "index.html")));

app.listen(PORT, () => console.log(`Server listening on :${PORT}`));
