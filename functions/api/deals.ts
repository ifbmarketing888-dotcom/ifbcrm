export async function onRequestGet(context) {
  const { env } = context;
  try {
    const { results } = await env.DB.prepare("SELECT * FROM deals").all();
    return new Response(JSON.stringify(results), { headers: { "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const { lead_id, title, value, stage, probability } = await request.json();
  const id = crypto.randomUUID();

  await env.DB.prepare("INSERT INTO deals (id, lead_id, title, value, stage, probability) VALUES (?, ?, ?, ?, ?, ?)")
    .bind(id, lead_id, title, value, stage || 'discovery', probability || 0)
    .run();

  return new Response(JSON.stringify({ id, title, value }), { status: 201 });
}

export async function onRequestPatch(context) {
  const { request, env } = context;
  const { id, stage, value } = await request.json();

  await env.DB.prepare("UPDATE deals SET stage = ?, value = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
    .bind(stage, value, id)
    .run();

  return new Response(JSON.stringify({ success: true }));
}
