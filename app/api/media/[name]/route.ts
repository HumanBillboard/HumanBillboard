// Deprecated media streaming route kept as stub to avoid 404 noise.
// Static assets now served from /public/media. Remove this directory later.
export async function GET() {
  return new Response("Media route deprecated. Use /media/* static paths.", { status: 410 })
}
