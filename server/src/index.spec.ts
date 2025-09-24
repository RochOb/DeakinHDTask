import request from "supertest";
import express from "express";

const app = express();
app.use(express.json());
app.get("/healthz", (_req, res) =>
  res.json({ ok: true, service: "discountmate", ts: Date.now() })
);

test("GET /healthz → ok", async () => {
  const r = await request(app).get("/healthz");
  expect(r.status).toBe(200);
  expect(r.body.ok).toBe(true);
  expect(r.body.service).toBe("discountmate");
});
