export async function onRequestGet(context) {
  const { env } = context;
  const { results } = await env.DB.prepare("SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC").all();
  return new Response(JSON.stringify(results), { headers: { "Content-Type": "application/json" } });
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const { name, email, password, role } = await request.json();
  const id = crypto.randomUUID();

  await env.DB.prepare("INSERT INTO users (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)")
    .bind(id, name, email, password, role)
    .run();

  return new Response(JSON.stringify({ id, name, email, role }), { status: 201 });
}
