import { useCallback, useEffect, useRef, useState } from "react";
import { type DocumentMeta, contentUrl, deleteDocument, listDocuments, uploadDocument } from "./api";

const formatSize = (b: number) =>
  b < 1024 ? `${b} B` : b < 1048576 ? `${(b / 1024).toFixed(1)} KB` : `${(b / 1048576).toFixed(1)} MB`;

const canPreview = (t: string) => t.startsWith("image/") || t.startsWith("text/") || t === "application/pdf";

export default function App() {
  const [docs, setDocs] = useState<DocumentMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewing, setViewing] = useState<DocumentMeta | null>(null);
  const input = useRef<HTMLInputElement>(null);

  const refresh = useCallback(async () => {
    try {
      setDocs(await listDocuments());
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    try {
      for (const f of Array.from(files)) await uploadDocument(f);
      await refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  }

  async function remove(d: DocumentMeta) {
    if (!window.confirm(`Delete "${d.name}"? This can't be undone.`)) return;
    try {
      await deleteDocument(d.id);
      setDocs((prev) => prev.filter((x) => x.id !== d.id));
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <main>
      <header>
        <h1>Documents</h1>
        <p>{docs.length} stored in PostgreSQL</p>
      </header>

      <div
        className={`drop ${dragging ? "over" : ""}`}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); upload(e.dataTransfer.files); }}
      >
        <span>{busy ? "Uploading…" : "Drop files here or"}</span>
        <button disabled={busy} onClick={() => input.current?.click()}>Choose files</button>
        <input ref={input} type="file" multiple hidden onChange={(e) => upload(e.target.files)} />
        <small>Up to 10 MB each</small>
      </div>

      {error && <div className="error" role="alert">{error}</div>}

      {loading ? (
        <p className="muted">Loading documents…</p>
      ) : docs.length === 0 ? (
        <p className="muted">No documents yet. Upload your first file above.</p>
      ) : (
        <ul className="list">
          {docs.map((d) => (
            <li key={d.id}>
              <div className="meta">
                <strong>{d.name}</strong>
                <span>{formatSize(d.size)} · {new Date(d.uploadedAt).toLocaleString()}</span>
              </div>
              <div className="actions">
                {canPreview(d.contentType)
                  ? <button onClick={() => setViewing(d)}>View</button>
                  : <a className="btn" href={contentUrl(d.id, true)}>Download</a>}
                <button className="danger" onClick={() => remove(d)}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {viewing && (
        <div className="overlay" onClick={() => setViewing(null)}>
          <div className="viewer" role="dialog" aria-label={viewing.name} onClick={(e) => e.stopPropagation()}>
            <div className="bar">
              <strong>{viewing.name}</strong>
              <span>
                <a className="btn" href={contentUrl(viewing.id, true)}>Download</a>
                <button onClick={() => setViewing(null)}>Close</button>
              </span>
            </div>
            {viewing.contentType.startsWith("image/")
              ? <img src={contentUrl(viewing.id)} alt={viewing.name} />
              : <iframe src={contentUrl(viewing.id)} title={viewing.name} />}
          </div>
        </div>
      )}
    </main>
  );
}
