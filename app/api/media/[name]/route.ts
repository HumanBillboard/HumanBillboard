import { NextRequest } from "next/server"
import { createReadStream, statSync, existsSync } from "fs"
import { Readable } from "stream"
import path from "path"

export const runtime = "nodejs"

function getFilePath(name: string) {
  const safe = path.basename(name)
  return path.join(process.cwd(), "media", safe)
}

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest, { params }: { params: { name: string } }) {
  const name = params.name
  const filePath = getFilePath(name)

  if (!existsSync(filePath)) {
    return new Response("Not found", { status: 404 })
  }

  const stat = statSync(filePath)
  const fileSize = stat.size
  const range = req.headers.get("range")

  // Basic content type; adjust if you add non-mp4 later
  const contentType = "video/mp4"

  if (range) {
    const match = /bytes=(\d+)-(\d+)?/.exec(range)
    const start = match ? parseInt(match[1], 10) : 0
    const end = match && match[2] ? parseInt(match[2], 10) : fileSize - 1
    const chunkSize = end - start + 1
    const nodeStream = createReadStream(filePath, { start, end })
    const webStream = Readable.toWeb(nodeStream) as unknown as ReadableStream
    return new Response(webStream, {
      status: 206,
      headers: {
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": String(chunkSize),
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    })
  }

  const nodeStream = createReadStream(filePath)
  const webStream = Readable.toWeb(nodeStream) as unknown as ReadableStream
  return new Response(webStream, {
    headers: {
      "Content-Length": String(fileSize),
      "Content-Type": contentType,
      "Accept-Ranges": "bytes",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  })
}
