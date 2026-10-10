export interface GmailMessageSummary {
  id: string;
  threadId: string;
  snippet: string;
  subject: string;
  from: string;
  date: string;
  labels: string[];
}

export interface GmailMessageDetail extends GmailMessageSummary {
  bodyText: string;
  to: string;
}

// Decode base64url strings from Gmail API
function decodeBase64Url(str: string): string {
  try {
    const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    return decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
  } catch {
    try {
      return atob(str.replace(/-/g, '+').replace(/_/g, '/'));
    } catch {
      return str;
    }
  }
}

// Extract headers
function getHeader(headers: Array<{ name: string; value: string }>, name: string): string {
  const match = headers.find((h) => h.name.toLowerCase() === name.toLowerCase());
  return match ? match.value : '';
}

// Extract body text recursively from parts
function extractBody(payload: any): string {
  if (!payload) return '';
  if (payload.body && payload.body.data) {
    return decodeBase64Url(payload.body.data);
  }
  if (payload.parts && Array.isArray(payload.parts)) {
    // Look for text/plain first
    const textPart = payload.parts.find((p: any) => p.mimeType === 'text/plain');
    if (textPart && textPart.body && textPart.body.data) {
      return decodeBase64Url(textPart.body.data);
    }
    // Fallback to text/html
    const htmlPart = payload.parts.find((p: any) => p.mimeType === 'text/html');
    if (htmlPart && htmlPart.body && htmlPart.body.data) {
      const html = decodeBase64Url(htmlPart.body.data);
      // Strip html tags for readable view
      return html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    }
    // Recursive check
    for (const part of payload.parts) {
      const res = extractBody(part);
      if (res) return res;
    }
  }
  return '';
}

// 1. List user's messages
export async function listGmailMessages(
  accessToken: string,
  query: string = '',
  maxResults: number = 15
): Promise<GmailMessageSummary[]> {
  const url = new URL('https://gmail.googleapis.com/gmail/v1/users/me/messages');
  url.searchParams.set('maxResults', maxResults.toString());
  if (query.trim()) {
    url.searchParams.set('q', query.trim());
  }

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Gmail API returned status ${res.status}`);
  }

  const data = await res.json();
  const messagesList = data.messages || [];

  // Fetch headers for top messages in parallel
  const details = await Promise.all(
    messagesList.slice(0, 15).map(async (item: { id: string; threadId: string }) => {
      try {
        const msgRes = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${item.id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=Date`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );
        if (!msgRes.ok) return null;
        const msgData = await msgRes.json();
        const headers = msgData.payload?.headers || [];

        return {
          id: msgData.id,
          threadId: msgData.threadId,
          snippet: msgData.snippet || '',
          subject: getHeader(headers, 'Subject') || '(No Subject)',
          from: getHeader(headers, 'From') || 'Unknown Sender',
          date: getHeader(headers, 'Date') || '',
          labels: msgData.labelIds || [],
        };
      } catch {
        return null;
      }
    })
  );

  return details.filter((m): m is GmailMessageSummary => m !== null);
}

// 2. Fetch single message details
export async function getGmailMessageDetail(
  accessToken: string,
  messageId: string
): Promise<GmailMessageDetail> {
  const res = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}?format=full`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to fetch email (${res.status})`);
  }

  const data = await res.json();
  const headers = data.payload?.headers || [];
  const bodyText = extractBody(data.payload) || data.snippet || '(No body content)';

  return {
    id: data.id,
    threadId: data.threadId,
    snippet: data.snippet || '',
    subject: getHeader(headers, 'Subject') || '(No Subject)',
    from: getHeader(headers, 'From') || 'Unknown Sender',
    to: getHeader(headers, 'To') || '',
    date: getHeader(headers, 'Date') || '',
    labels: data.labelIds || [],
    bodyText,
  };
}

// 3. Send an email on behalf of user
export async function sendGmailEmail(
  accessToken: string,
  params: { to: string; subject: string; body: string }
): Promise<any> {
  const utf8Subject = `=?utf-8?B?${btoa(unescape(encodeURIComponent(params.subject)))}?=`;
  const emailLines = [
    `To: ${params.to}`,
    'Content-Type: text/plain; charset=utf-8',
    'MIME-Version: 1.0',
    `Subject: ${utf8Subject}`,
    '',
    params.body,
  ];
  const email = emailLines.join('\r\n');

  // Base64url encode
  const raw = btoa(unescape(encodeURIComponent(email)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ raw }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to send email (${res.status})`);
  }

  return res.json();
}

// 4. Trash an email
export async function trashGmailMessage(
  accessToken: string,
  messageId: string
): Promise<void> {
  const res = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}/trash`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to move message to trash (${res.status})`);
  }
}
