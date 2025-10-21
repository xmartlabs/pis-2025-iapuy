/* eslint-disable check-file/folder-naming-convention */
import fs from 'node:fs'
import path from 'node:path'

type Params = { params: { path?: string[] } }

function contentTypeFromExt(ext: string) {
  switch (ext.toLowerCase()) {
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg'
    case '.png':
      return 'image/png'
    case '.gif':
      return 'image/gif'
    case '.webp':
      return 'image/webp'
    case '.svg':
      return 'image/svg+xml'
    case '.ico':
      return 'image/x-icon'
    case '.pdf':
      return 'application/pdf'
    case '.txt':
      return 'text/plain; charset=utf-8'
    default:
      return 'application/octet-stream'
  }
}

export async function GET(_req: Request, { params }: Params) {
  const segments = params?.path ?? []
  if (segments.length === 0) {
    return new Response('Not found', { status: 404 })
  }

  // Prevent path traversal
  const safeSegments = segments.filter(s => !s.includes('..'))
  const filePath = path.join(process.cwd(), 'public', 'interventionsPictures', ...safeSegments)

  try {
    const stat = await fs.promises.stat(filePath)
    if (!stat.isFile()) return new Response('Not found', { status: 404 })

    const data = await fs.promises.readFile(filePath)
    const ext = path.extname(filePath)
    const contentType = contentTypeFromExt(ext)

    // Ensure body is a Uint8Array to satisfy Response typing
    const body = data instanceof Uint8Array ? data : new Uint8Array(data)
    return new Response(body, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': String(stat.size),
        'Cache-Control': 'public, max-age=0, must-revalidate'
      }
    })
  } catch {
    return new Response('Not found', { status: 404 })
  }
}

