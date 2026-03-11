export async function onRequestPost(context) {
  const { request, env } = context;
  const { email, password } = await request.json();

  if (!email || !password) {
    return new Response(JSON.stringify({ error: "Email and password required" }), { status: 400 });
  }

  // 匹配您的数据库字段: password_hash
  const user = await env.DB.prepare("SELECT id, email, name, role FROM users WHERE email = ? AND (password_hash = ? OR password_hash IS NULL)")
    .bind(email, password)
    .first();

  if (!user) {
    return new Response(JSON.stringify({ error: "Invalid credentials" }), { status: 401 });
  }

  return new Response(JSON.stringify(user), {
    headers: { "Content-Type": "application/json" }
  });
}
