import { google } from 'googleapis';

function getAuth() {
  const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON!);
  return new google.auth.GoogleAuth({
    credentials,
    scopes: [
      'https://www.googleapis.com/auth/spreadsheets.readonly',
      'https://www.googleapis.com/auth/drive.readonly',
    ],
  });
}

export interface LogoItem {
  index: number;
  title: string;
  description: string;
  keywords: string;
  price: number;
  mainCategory: string;
  secondCategories: string;
  logoFileId: string;
  mockups: string; // raw string dari sheet
  logoUrl: string;
  creator: string;
  published: string;
  mockupImages: DriveFile[]; // diisi dari Drive
}

export interface DriveFile {
  id: string;
  name: string;
  thumbnailLink: string;
  webContentLink: string;
}

export async function getLogos(): Promise<LogoItem[]> {
  const auth = getAuth();
  const sheets = google.sheets({ version: 'v4', auth });

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.GOOGLE_SHEET_ID!,
    range: 'Sheet1!A2:L', // skip header row
  });

  const rows = res.data.values ?? [];

  const logos: LogoItem[] = rows
    .filter((row) => row[1]) // skip baris kosong
    .map((row) => ({
      index: Number(row[0]) || 0,
      title: row[1] ?? '',
      description: row[2] ?? '',
      keywords: row[3] ?? '',
      price: Number(row[4]) || 0,
      mainCategory: row[5] ?? '',
      secondCategories: row[6] ?? '',
      logoFileId: row[7] ?? '',
      mockups: row[8] ?? '',
      logoUrl: row[9] ?? '',
      creator: row[10] ?? '',
      published: row[11] ?? '',
      mockupImages: [],
    }));

  return logos;
}

export async function getMockupImages(folderId: string): Promise<DriveFile[]> {
  if (!folderId) return [];

  const auth = getAuth();
  const drive = google.drive({ version: 'v3', auth });

  const res = await drive.files.list({
    q: `'${folderId}' in parents and mimeType contains 'image/' and trashed = false`,
    fields: 'files(id, name, thumbnailLink, webContentLink)',
    orderBy: 'name',
  });

  return (res.data.files ?? []) as DriveFile[];
}

export async function getMockupsByTitle(
  title: string,
  mockupFolderId: string
): Promise<DriveFile[]> {
  if (!mockupFolderId) return [];

  const auth = getAuth();
  const drive = google.drive({ version: 'v3', auth });

  // Cari subfolder dengan nama yang mengandung title logo
  const folderRes = await drive.files.list({
    q: `'${mockupFolderId}' in parents and mimeType = 'application/vnd.google-apps.folder' and name contains '${title.replace(/'/g, "\\'")}' and trashed = false`,
    fields: 'files(id, name)',
  });

  if (folderRes.data.files && folderRes.data.files.length > 0) {
    const subFolderId = folderRes.data.files[0].id!;
    return getMockupImages(subFolderId);
  }

  // Fallback: cari file langsung di mockup folder yg namanya mengandung title
  const fileRes = await drive.files.list({
    q: `'${mockupFolderId}' in parents and mimeType contains 'image/' and name contains '${title.replace(/'/g, "\\'")}' and trashed = false`,
    fields: 'files(id, name, thumbnailLink, webContentLink)',
    orderBy: 'name',
  });

  return (fileRes.data.files ?? []) as DriveFile[];
}

// Proxy URL untuk serve file Drive via Next.js route
export function driveProxyUrl(fileId: string): string {
  return `/api/drive-file?id=${fileId}`;
}
