const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" }
});

async function ensureTable(DB) {
  await DB.prepare(`CREATE TABLE IF NOT EXISTS app_data (
    id TEXT PRIMARY KEY,
    payload TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )`).run();
}

function authorized(context) {
  const expected = context.env.SYNC_KEY;
  const actual = context.request.headers.get("x-sync-key") || "";
  return Boolean(expected && actual && actual === expected);
}

export async function onRequest(context) {
  if (!authorized(context)) return json({ error: "同步密碼錯誤" }, 401);
  if (!context.env.DB) return json({ error: "尚未綁定 Cloudflare D1，綁定名稱必須是 DB" }, 500);

  await ensureTable(context.env.DB);

  if (context.request.method === "GET") {
    const row = await context.env.DB.prepare(
      "SELECT payload, updated_at FROM app_data WHERE id = ?"
    ).bind("main").first();
    if (!row) return json({ data: null, updatedAt: null });
    return json({ data: JSON.parse(row.payload), updatedAt: row.updated_at });
  }

  if (context.request.method === "PUT") {
    let data;
    try { data = await context.request.json(); }
    catch { return json({ error: "資料格式錯誤" }, 400); }
    if (!data || !Array.isArray(data.projects) || !Array.isArray(data.reports)) {
      return json({ error: "資料內容不完整" }, 400);
    }
    const updatedAt = new Date().toISOString();
    await context.env.DB.prepare(`
      INSERT INTO app_data (id, payload, updated_at) VALUES (?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET payload = excluded.payload, updated_at = excluded.updated_at
    `).bind("main", JSON.stringify(data), updatedAt).run();
    return json({ ok: true, updatedAt });
  }

  return new Response("Method Not Allowed", { status: 405, headers: { Allow: "GET, PUT" } });
}
