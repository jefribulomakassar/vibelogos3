import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function GET(req: NextRequest) {
  const fileId = req.nextUrl.searchParams.get('id');
  if (!fileId) return new NextResponse('Missing id', { status: 400 });

  try {
    const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON!);
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/drive.readonly'],
    });
    const drive = google.drive({ version: 'v3', auth });

    const res = await drive.files.get(
      { fileId, alt: 'media' },
      { responseType: 'stream' }
    );

    const contentType = (res.headers as Record<string, string>)['content-type'] ?? 'image/jpeg';

    const chunks: Buffer[] = [];
    await new Promise<void>((resolve, reject) => {
      (res.data as NodeJS.ReadableStream).on('data', (chunk: Buffer) => chunks.push(chunk));
      (res.data as NodeJS.ReadableStream).on('end', resolve);
      (res.data as NodeJS.ReadableStream).on('error', reject);
    });

    const buffer = Buffer.concat(chunks);

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch (err) {
    console.error('Drive proxy error:', err);
    return new NextResponse('Error fetching file', { status: 500 });
  }
}
