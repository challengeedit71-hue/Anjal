export interface DriveFileSummary {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  modifiedTime: string;
  iconLink?: string;
  webViewLink?: string;
  thumbnailLink?: string;
  shared?: boolean;
}

// 1. List user's files from Google Drive
export async function listDriveFiles(
  accessToken: string,
  query: string = '',
  pageSize: number = 20
): Promise<DriveFileSummary[]> {
  const url = new URL('https://www.googleapis.com/drive/v3/files');
  url.searchParams.set('pageSize', pageSize.toString());
  url.searchParams.set(
    'fields',
    'files(id, name, mimeType, size, modifiedTime, iconLink, webViewLink, thumbnailLink, shared, trashed)'
  );
  url.searchParams.set('orderBy', 'modifiedTime desc');

  const baseQuery = 'trashed = false';
  const fullQuery = query.trim()
    ? `${baseQuery} and (name contains '${query.replace(/'/g, "\\'")}' or fullText contains '${query.replace(/'/g, "\\'")}')`
    : baseQuery;

  url.searchParams.set('q', fullQuery);

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Google Drive API returned status ${res.status}`);
  }

  const data = await res.json();
  return (data.files || []).map((f: any) => ({
    id: f.id,
    name: f.name || 'Untitled',
    mimeType: f.mimeType || 'application/octet-stream',
    size: f.size ? formatBytes(parseInt(f.size, 10)) : undefined,
    modifiedTime: f.modifiedTime || '',
    iconLink: f.iconLink,
    webViewLink: f.webViewLink,
    thumbnailLink: f.thumbnailLink,
    shared: !!f.shared,
  }));
}

// Format bytes into readable string
function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// 2. Create a new text or note file in Google Drive
export async function createDriveTextFile(
  accessToken: string,
  params: { name: string; content: string }
): Promise<DriveFileSummary> {
  const metadata = {
    name: params.name,
    mimeType: 'text/plain',
  };

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    'Content-Type: text/plain; charset=UTF-8\r\n\r\n' +
    params.content +
    closeDelimiter;

  const res = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,modifiedTime,webViewLink',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body: multipartRequestBody,
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to create file in Drive (${res.status})`);
  }

  const data = await res.json();
  return {
    id: data.id,
    name: data.name,
    mimeType: data.mimeType,
    modifiedTime: data.modifiedTime,
    webViewLink: data.webViewLink,
  };
}

// 3. Move a file to Drive Trash
export async function trashDriveFile(
  accessToken: string,
  fileId: string
): Promise<void> {
  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ trashed: true }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to trash Drive file (${res.status})`);
  }
}
