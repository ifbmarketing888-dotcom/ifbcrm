export async function onRequestGet(context) {
  const { env } = context;
  try {
    const { results } = await env.DB.prepare("SELECT * FROM customers").all();
    return new Response(JSON.stringify(results), { headers: { "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const { first_name, last_name, email, company, status, score } = await request.json();
  const id = crypto.randomUUID();

  await env.DB.prepare("INSERT INTO customers (id, first_name, last_name, email, company, status, score) VALUES (?, ?, ?, ?, ?, ?, ?)")
    .bind(id, first_name, last_name, email, company, status || 'lead', score || 0)
    .run();

  return new Response(JSON.stringify({ id, first_name, last_name, email, company, status, score }), { status: 201 });
}
