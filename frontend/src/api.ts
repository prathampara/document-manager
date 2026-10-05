export interface DocumentMeta {
  id: number;
  name: string;
  contentType: string;
  size: number;
  uploadedAt: string;
}

async function check(res: Response): Promise<Response> {
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error ?? `Request failed (${res.status})`);
  }
  return res;
}

export const listDocuments = async (): Promise<DocumentMeta[]> =>
  (await check(await fetch("/api/documents"))).json();

export async function uploadDocument(file: File): Promise<DocumentMeta> {
  const form = new FormData();
  form.append("file", file);
  return (await check(await fetch("/api/documents", { method: "POST", body: form }))).json();
}

export const deleteDocument = async (id: number): Promise<void> => {
  await check(await fetch(`/api/documents/${id}`, { method: "DELETE" }));
};

export const contentUrl = (id: number, download = false) =>
  `/api/documents/${id}/content${download ? "?download=true" : ""}`;
