const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,PATCH,DELETE,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Content-Type": "application/json; charset=utf-8"
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: cors });
}
function id() { return crypto.randomUUID(); }
function authorized(request, env) {
  const header = request.headers.get("Authorization") || "";
  return Boolean(env.ADMIN_TOKEN) && header === `Bearer ${env.ADMIN_TOKEN}`;
}
function cleanUser(row) {
  return { id: row.id, name: row.name, email: row.email, status: row.status,
    traffic_limit_gb: row.traffic_limit_gb, traffic_used_bytes: row.traffic_used_bytes,
    expires_at: row.expires_at, device_limit: row.device_limit,
    created_at: row.created_at, updated_at: row.updated_at };
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") return new Response(null, { headers: cors });
    const url = new URL(request.url);
    if (url.pathname === "/api/health" && request.method === "GET") {
      try {
        await env.DB.prepare("SELECT 1").first();
        return json({ ok: true, service: "noghreh-api", database: "connected" });
      } catch {
        return json({ ok: false, error: "database_not_ready" }, 503);
      }
    }
    if (!url.pathname.startsWith("/api/")) return json({ error: "not_found" }, 404);
    if (!authorized(request, env)) return json({ error: "unauthorized" }, 401);

    try {
      if (url.pathname === "/api/users" && request.method === "GET") {
        const { results } = await env.DB.prepare(
          "SELECT * FROM users ORDER BY created_at DESC LIMIT 500"
        ).all();
        return json({ users: results.map(cleanUser) });
      }
      if (url.pathname === "/api/users" && request.method === "POST") {
        const body = await request.json();
        const name = String(body.name || "").trim().slice(0, 100);
        const email = String(body.email || "").trim().slice(0, 254);
        const traffic = Number(body.traffic_limit_gb ?? 100);
        const devices = Number(body.device_limit ?? 2);
        if (!name) return json({ error: "name_required" }, 400);
        if (!Number.isFinite(traffic) || traffic < 0 || traffic > 1000000) return json({ error: "invalid_traffic_limit" }, 400);
        if (!Number.isInteger(devices) || devices < 1 || devices > 100) return json({ error: "invalid_device_limit" }, 400);
        const userId = id();
        const now = new Date().toISOString();
        const expires = body.expires_at ? new Date(body.expires_at).toISOString() : null;
        await env.DB.prepare(`INSERT INTO users
          (id,name,email,status,traffic_limit_gb,traffic_used_bytes,expires_at,device_limit,created_at,updated_at)
          VALUES(?,?,?,'active',?,0,?,?,?,?)`)
          .bind(userId, name, email || null, traffic, expires, devices, now, now).run();
        await env.DB.prepare("INSERT INTO audit_log (id, action, target_id, created_at) VALUES (?, 'user.create', ?, ?)")
          .bind(id(), userId, now).run();
        const row = await env.DB.prepare("SELECT * FROM users WHERE id = ?").bind(userId).first();
        return json({ user: cleanUser(row) }, 201);
      }
      const match = url.pathname.match(/^\/api\/users\/([0-9a-f-]+)$/i);
      if (match && request.method === "GET") {
        const row = await env.DB.prepare("SELECT * FROM users WHERE id = ?").bind(match[1]).first();
        return row ? json({ user: cleanUser(row) }) : json({ error: "not_found" }, 404);
      }
      if (match && request.method === "PATCH") {
        const current = await env.DB.prepare("SELECT * FROM users WHERE id = ?").bind(match[1]).first();
        if (!current) return json({ error: "not_found" }, 404);
        const body = await request.json();
        const allowedStatus = ["active", "disabled", "expired"];
        const name = body.name === undefined ? current.name : String(body.name).trim().slice(0,100);
        const email = body.email === undefined ? current.email : (String(body.email).trim().slice(0,254) || null);
        const status = body.status === undefined ? current.status : String(body.status);
        const traffic = body.traffic_limit_gb === undefined ? current.traffic_limit_gb : Number(body.traffic_limit_gb);
        const devices = body.device_limit === undefined ? current.device_limit : Number(body.device_limit);
        const expires = body.expires_at === undefined ? current.expires_at : (body.expires_at ? new Date(body.expires_at).toISOString() : null);
        if (!name || !allowedStatus.includes(status) || !Number.isFinite(traffic) || traffic < 0 || traffic > 1000000 || !Number.isInteger(devices) || devices < 1 || devices > 100)
          return json({ error: "invalid_user_fields" }, 400);
        const now = new Date().toISOString();
        await env.DB.prepare(`UPDATE users SET name=?, email=?, status=?, traffic_limit_gb=?, device_limit=?, expires_at=?, updated_at=? WHERE id=?`)
          .bind(name,email,status,traffic,devices,expires,now,match[1]).run();
        await env.DB.prepare("INSERT INTO audit_log (id, action, target_id, created_at) VALUES (?, 'user.update', ?, ?)")
          .bind(id(),match[1],now).run();
        return json({ user: cleanUser(await env.DB.prepare("SELECT * FROM users WHERE id=?").bind(match[1]).first()) });
      }
      if (match && request.method === "DELETE") {
        const result = await env.DB.prepare("DELETE FROM users WHERE id = ?").bind(match[1]).run();
        return result.meta.changes ? json({ ok: true }) : json({ error: "not_found" }, 404);
      }
      if (url.pathname === "/api/subscriptions" && request.method === "GET") {
        const userId = url.searchParams.get("user_id");
        if (userId) {
          const { results } = await env.DB.prepare(
            "SELECT id,user_id,protocol,label,connection_uri,enabled,created_at FROM subscriptions WHERE user_id = ? ORDER BY created_at DESC LIMIT 500"
          ).bind(userId).all();
          return json({ subscriptions: results });
        }
        const { results } = await env.DB.prepare(
          "SELECT id,user_id,protocol,label,connection_uri,enabled,created_at FROM subscriptions ORDER BY created_at DESC LIMIT 500"
        ).all();
        return json({ subscriptions: results });
      }
      if (url.pathname === "/api/subscriptions" && request.method === "POST") {
        const body = await request.json();
        const userId = String(body.user_id || "");
        const protocol = String(body.protocol || "").toLowerCase();
        const label = String(body.label || "").trim().slice(0,100);
        const connectionUri = body.connection_uri ? String(body.connection_uri).trim().slice(0,4000) : null;
        if (!userId || !["vless","vmess","trojan","shadowsocks"].includes(protocol) || !label)
          return json({ error: "invalid_subscription_fields" }, 400);
        const user = await env.DB.prepare("SELECT id FROM users WHERE id=?").bind(userId).first();
        if (!user) return json({ error: "user_not_found" }, 404);
        if (connectionUri && !/^(vless|vmess|trojan|ss):\/\//i.test(connectionUri))
          return json({ error: "invalid_connection_uri" }, 400);
        const subId = id();
        const now = new Date().toISOString();
        await env.DB.prepare("INSERT INTO subscriptions (id,user_id,protocol,label,connection_uri,enabled,created_at) VALUES (?,?,?,?,?,1,?)")
          .bind(subId,userId,protocol,label,connectionUri,now).run();
        await env.DB.prepare("INSERT INTO audit_log (id, action, target_id, created_at) VALUES (?, 'subscription.create', ?, ?)")
          .bind(id(),subId,now).run();
        return json({ subscription: { id: subId,user_id:userId,protocol,label,connection_uri:connectionUri,enabled:1,created_at:now } }, 201);
      }
      const subMatch = url.pathname.match(/^\/api\/subscriptions\/([0-9a-f-]+)$/i);
      if (subMatch && request.method === "PATCH") {
        const current = await env.DB.prepare("SELECT * FROM subscriptions WHERE id=?").bind(subMatch[1]).first();
        if (!current) return json({ error: "not_found" }, 404);
        const body = await request.json();
        const enabled = body.enabled === undefined ? current.enabled : (body.enabled === true || body.enabled === 1 ? 1 : (body.enabled === false || body.enabled === 0 ? 0 : -1));
        const label = body.label === undefined ? current.label : String(body.label).trim().slice(0,100);
        if (![0,1].includes(enabled) || !label) return json({ error: "invalid_subscription_fields" }, 400);
        await env.DB.prepare("UPDATE subscriptions SET enabled=?, label=? WHERE id=?").bind(enabled,label,subMatch[1]).run();
        const row = await env.DB.prepare("SELECT id,user_id,protocol,label,connection_uri,enabled,created_at FROM subscriptions WHERE id=?").bind(subMatch[1]).first();
        return json({ subscription: row });
      }
      if (subMatch && request.method === "DELETE") {
        const result = await env.DB.prepare("DELETE FROM subscriptions WHERE id=?").bind(subMatch[1]).run();
        return result.meta.changes ? json({ ok: true }) : json({ error: "not_found" }, 404);
      }
      if (url.pathname === "/api/audit" && request.method === "GET") {
        const { results } = await env.DB.prepare("SELECT * FROM audit_log ORDER BY created_at DESC LIMIT 100").all();
        return json({ events: results });
      }
      return json({ error: "not_found" }, 404);
    } catch (error) {
      return json({ error: "request_failed", detail: env.ENVIRONMENT === "development" ? String(error) : undefined }, 500);
    }
  }
};
