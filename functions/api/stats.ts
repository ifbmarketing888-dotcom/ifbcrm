export async function onRequestGet(context) {
  const { env } = context;

  const leadsCount = await env.DB.prepare("SELECT COUNT(*) as count FROM customers").first("count");
  const pipelineValue = await env.DB.prepare("SELECT SUM(value) as sum FROM deals").first("sum") || 0;
  const pendingTasks = await env.DB.prepare("SELECT COUNT(*) as count FROM tasks WHERE status != 'done'").first("count");

  return new Response(JSON.stringify({
    leads: leadsCount,
    pipelineValue: pipelineValue,
    pendingTasks: pendingTasks
  }), {
    headers: { "Content-Type": "application/json" }
  });
}
