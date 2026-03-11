export async function onRequestGet(context) {
  const { env } = context;
  const { results } = await env.DB.prepare("SELECT * FROM leads ORDER BY created_at DESC").all();
  return new Response(JSON.stringify(results), { headers: { "Content-Type": "application/json" } });
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const { first_name, last_name, email, company, status, score } = await request.json();
  const id = crypto.randomUUID();

  await env.DB.prepare("INSERT INTO leads (id, first_name, last_name, email, company, status, score) VALUES (?, ?, ?, ?, ?, ?, ?)")
    .bind(id, first_name, last_name, email, company, status || 'lead', score || 0)
    .run();

  return new Response(JSON.stringify({ id, first_name, last_name, email, company, status, score }), { status: 201 });
}
