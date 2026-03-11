export async function onRequestGet(context) {
  const { env } = context;
  const { results } = await env.DB.prepare("SELECT * FROM tasks ORDER BY due_date ASC").all();
  return new Response(JSON.stringify(results), { headers: { "Content-Type": "application/json" } });
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const { title, status, priority, due_date } = await request.json();
  const id = crypto.randomUUID();

  await env.DB.prepare("INSERT INTO tasks (id, title, status, priority, due_date) VALUES (?, ?, ?, ?, ?)")
    .bind(id, title, status || 'todo', priority || 'medium', due_date)
    .run();

  return new Response(JSON.stringify({ id, title, status }), { status: 201 });
}
