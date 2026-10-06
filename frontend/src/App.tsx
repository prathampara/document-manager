import { useCallback, useEffect, useRef, useState } from "react";
import { type DocumentMeta, contentUrl, deleteDocument, listDocuments, uploadDocument } from "./api";

const formatSize = (b: number) =>
  b < 1024 ? `${b} B` : b < 1048576 ? `${(b / 1024).toFixed(1)} KB` : `${(b / 1048576).toFixed(1)} MB`;
const canPreview = (t: string) => t.startsWith("image/") || t.startsWith("text/") || t === "application/pdf";
const ext = (n: string) => (n.includes(".") ? n.split(".").pop()!.slice(0, 4).toUpperCase() : "FILE");
const when = (iso: string) => new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });

const GUST = "M0 0C70-16 140 16 210 0S330-14 380 6a16 16 0 1 1-12 20a8 8 0 1 1 8-12";
const WINDS = [
  { y: 150, dur: 26, delay: 3, col: "#D6E4FF", w: 4, s: 1 },
  { y: 300, dur: 34, delay: 14, col: "#FFF0B0", w: 3, s: 1.2 },
  { y: 430, dur: 30, delay: 9, col: "#D6E4FF", w: 5, s: 1.4 },
  { y: 560, dur: 38, delay: 22, col: "#BFD4FF", w: 3, s: 1 },
  { y: 230, dur: 42, delay: 30, col: "#FFF0B0", w: 3, s: 0.8 },
];
const SKY_STARS = [
  { x: 180, y: 130, d: 0 }, { x: 640, y: 80, d: 1.5 }, { x: 980, y: 190, d: 2.5 },
  { x: 1300, y: 330, d: 3 }, { x: 90, y: 420, d: 1 },
];
const CONSTELLATION = [
  { x: 90, y: 100, t: "Upload", d: 1 }, { x: 400, y: 45, t: "Keep", d: 2 },
  { x: 720, y: 95, t: "Cherish", d: 3 }, { x: 1050, y: 40, t: "Create", d: 0.5 },
];

/* Six little paintings; each file gets one by its id */
function Art({ n }: { n: number }) {
  switch (n % 6) {
    case 0:
      return (<>
        <path d="M120 76a8 8 0 0 1 16 0a16 16 0 0 1-32 0a30 30 0 0 1 60 0a46 46 0 0 1-92 0" stroke="#8FB4FF" strokeWidth="5" />
        <circle cx="196" cy="34" r="8" fill="#FFE066" /><circle cx="196" cy="34" r="18" stroke="#FFD84D" opacity=".6" strokeWidth="2" />
      </>);
    case 1:
      return (<>
        <g transform="translate(120 66)" fill="#F7C948">
          <ellipse rx="12" ry="40" /><ellipse rx="12" ry="40" transform="rotate(45)" />
          <ellipse rx="12" ry="40" transform="rotate(90)" /><ellipse rx="12" ry="40" transform="rotate(135)" />
          <circle r="15" fill="#6B3E1E" />
        </g>
        <path d="M120 110V150" stroke="#2E7D4F" strokeWidth="5" />
      </>);
    case 2:
      return (<>
        <path d="M120 148C100 110 128 84 112 52C108 30 120 14 124 2C136 30 152 50 144 84C158 108 146 130 138 148Z" fill="#0B2E26" />
        <path d="M122 20C112 50 134 70 118 100" stroke="#2A8A6E" strokeWidth="3" />
        <circle cx="186" cy="30" r="7" fill="#FFE066" /><circle cx="186" cy="30" r="16" stroke="#FFD84D" opacity=".6" strokeWidth="2" />
      </>);
    case 3:
      return (<>
        <path d="M0 100Q60 80 120 100T240 96" stroke="#B97712" strokeWidth="3" />
        <path d="M30 130q6-24 0-44M80 134q6-24 0-44M130 130q6-24 0-44M180 134q6-24 0-44" stroke="#FFF1A8" strokeWidth="3" />
        <path d="M150 36q6-8 12 0q6-8 12 0M190 22q5-6 10 0q5-6 10 0" stroke="#1A1A3A" strokeWidth="2" />
      </>);
    case 4:
      return (<>
        <path d="M60 70H180L196 110H44Z" fill="#FFD84D" /><rect x="70" y="110" width="100" height="24" fill="#F29A2E" />
        <circle cx="40" cy="30" r="5" fill="#FFF3B0" /><circle cx="210" cy="40" r="5" fill="#FFF3B0" /><circle cx="120" cy="24" r="4" fill="#FFF3B0" />
      </>);
    default:
      return (<>
        <path d="M120 148C112 110 100 90 84 60M120 148C128 110 140 90 158 56M120 148V70" stroke="#2E7D4F" strokeWidth="5" />
        <ellipse cx="84" cy="48" rx="14" ry="26" fill="#6A3FC4" /><ellipse cx="158" cy="44" rx="14" ry="26" fill="#7B4FD6" />
        <ellipse cx="120" cy="56" rx="14" ry="28" fill="#5B34B0" />
      </>);
  }
}

function Village() {
  return (
    <svg className="village" viewBox="0 0 1440 380" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <path fill="#16306E" d="M0 200C200 140 380 220 600 170S1000 120 1200 190 1380 170 1440 160V380H0Z" />
      <g fill="#0B1640">
        <rect x="640" y="205" width="60" height="60" /><polygon points="630,205 670,175 710,205" />
        <rect x="720" y="215" width="50" height="50" /><polygon points="715,215 745,190 775,215" />
        <rect x="800" y="170" width="34" height="95" /><polygon points="795,170 817,115 839,170" />
        <rect x="850" y="225" width="60" height="40" /><polygon points="845,225 880,200 915,225" />
      </g>
      <g fill="#FFD84D">
        <rect className="tw" x="655" y="225" width="10" height="14" />
        <rect className="tw" x="735" y="232" width="9" height="12" style={{ animationDelay: "-1s" }} />
        <rect className="tw" x="812" y="190" width="9" height="16" style={{ animationDelay: "-2s" }} />
        <rect className="tw" x="868" y="240" width="10" height="12" style={{ animationDelay: "-1.5s" }} />
      </g>
      <path fill="#07251F" d="M170 380C120 300 175 230 140 150C128 100 160 50 172 0C196 70 236 130 214 210C246 270 224 330 204 380Z" />
      <path d="M172 40C150 100 190 140 160 200" stroke="#1E6B55" strokeWidth="3" fill="none" />
      <path fill="#D99A1E" d="M0 290C240 250 480 310 720 280S1200 250 1440 290V380H0Z" />
      <path fill="#F2BF3B" d="M0 320C260 290 520 340 800 310S1240 290 1440 325V380H0Z" />
      <g className="sway" fill="none" strokeLinecap="round" strokeWidth="3">
        <path stroke="#FFF1A8" d="M100 340q8-18 0-34M220 335q8-18 0-34M340 345q8-18 0-34M470 335q8-18 0-34M600 340q8-18 0-34M730 335q8-18 0-34M860 345q8-18 0-34M990 335q8-18 0-34M1120 340q8-18 0-34M1250 335q8-18 0-34M1370 345q8-18 0-34" />
        <path stroke="#B97712" d="M160 360q8-18 0-34M400 365q8-18 0-34M680 362q8-18 0-34M920 365q8-18 0-34M1180 362q8-18 0-34" />
      </g>
    </svg>
  );
}

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

  const total = docs.reduce((s, d) => s + d.size, 0);

  return (
    <div className="root">
      <div className="paint" />
      <svg className="sky" viewBox="0 0 1440 700" preserveAspectRatio="xMidYMid slice" fill="none" strokeLinecap="round" aria-hidden="true">
        {WINDS.map((w, i) => (
          <g key={i} className="wind" style={{ animationDuration: `${w.dur}s`, animationDelay: `-${w.delay}s` }}>
            <path transform={`translate(0 ${w.y}) scale(${w.s})`} d={GUST} stroke={w.col} strokeWidth={w.w} />
            <path transform={`translate(40 ${w.y + 22}) scale(${w.s * 0.8})`} d={GUST} stroke={w.col} strokeWidth={Math.max(w.w - 2, 2)} opacity=".6" />
          </g>
        ))}
        <path className="sw" d="M300 200a30 30 0 0 1 60 0a60 60 0 0 1-120 0a95 95 0 0 1 190 0a135 135 0 0 1-270 0" stroke="#7FA6FF" strokeWidth="8" opacity=".35" />
        <path className="sw rev" d="M1120 170a24 24 0 0 1 48 0a48 48 0 0 1-96 0a80 80 0 0 1 160 0a112 112 0 0 1-224 0" stroke="#FFD84D" strokeWidth="6" opacity=".3" />
      </svg>
      <div className="stars" />
      <svg className="moon" viewBox="0 0 120 120" aria-hidden="true"><path d="M70 6A56 56 0 1 0 70 114A58 58 0 0 1 70 6Z" fill="#FFD84D" /></svg>
      <svg className="skystars" viewBox="0 0 1440 600" fill="none" aria-hidden="true">
        {SKY_STARS.map((s, i) => (
          <g key={i} transform={`translate(${s.x} ${s.y})`}>
            <g className="pulse" style={{ animationDelay: `-${s.d}s` }}>
              <circle r="5" fill="#FFF3B0" />
              <circle r="13" stroke="#FFD84D" opacity=".7" /><circle r="25" stroke="#FFD84D" opacity=".4" /><circle r="38" stroke="#FFD84D" opacity=".2" />
            </g>
          </g>
        ))}
      </svg>

      <div className="page">
        <nav>
          <div className="brand">
            <svg width="40" height="40" viewBox="0 0 64 64" fill="none" stroke="#FFD84D" strokeWidth="3" strokeLinecap="round" aria-hidden="true">
              <path d="M32 32a4 4 0 0 1 8 0a8 8 0 0 1-16 0a14 14 0 0 1 28 0a20 20 0 0 1-40 0" />
            </svg>
            <span>Starry Atelier</span>
          </div>
          <div className="status"><span className={`dot ${error ? "off" : ""}`} />{error ? "Gallery offline" : "Gallery open"}</div>
        </nav>

        <section className="hero">
          <div>
            <div className="eyebrow">The night gallery of your documents</div>
            <h1>Every file, kept like a <span className="shine">masterpiece.</span></h1>
            <p className="lead">Drop in a document and it hangs in your gallery, safe under the stars and ready whenever you need it.</p>
            <div className="tiles">
              <div className="tile"><b>{String(docs.length).padStart(2, "0")}</b><small>PAINTINGS</small></div>
              <div className="tile"><b>{formatSize(total)}</b><small>KEPT SAFE</small></div>
              <div className="tile"><b>10 MB</b><small>PER FILE</small></div>
            </div>
          </div>

          <div
            className="portal-wrap"
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => { e.preventDefault(); setDragging(false); upload(e.dataTransfer.files); }}
          >
            <svg className="portal-art" viewBox="0 0 800 800" fill="none" strokeLinecap="round" aria-hidden="true">
              <path className="spin" d="M400 400a14 14 0 0 1 28 0a28 28 0 0 1-56 0a56 56 0 0 1 112 0a112 112 0 0 1-224 0a224 224 0 0 1 448 0" stroke="#FFD84D" strokeWidth="4" opacity=".8" />
              <path className="rspin" d="M400 400a20 20 0 0 1 40 0a40 40 0 0 1-80 0a80 80 0 0 1 160 0a160 160 0 0 1-320 0a300 300 0 0 1 600 0" stroke="#7FA6FF" strokeWidth="9" opacity=".5" />
            </svg>
            <div className="chip" style={{ left: "-6%", top: "14%" }}>PDF</div>
            <div className="chip" style={{ right: "-4%", top: "8%", animationDelay: "-1.5s" }}>PNG</div>
            <div className="chip" style={{ right: "-8%", bottom: "20%", animationDelay: "-3s" }}>TXT</div>
            <div className="chip" style={{ left: "2%", bottom: "6%", animationDelay: "-4s" }}>JPG</div>
            <div className={`portal ${dragging ? "over" : ""}`}>
              <div className="ring" />
              <div className="portal-in">
                <svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="#FFD84D" strokeWidth="1.6" aria-hidden="true">
                  <path d="M12 16V4m0 0L7 9m5-5 5 5M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" />
                </svg>
                <div className="portal-title">{busy ? "Painting in progress…" : dragging ? "Release to hang it" : "Hang a new painting"}</div>
                <div className="portal-sub">Drag a file here, or</div>
                <button className="btn go" disabled={busy} onClick={() => input.current?.click()}>Choose files</button>
                <input ref={input} type="file" multiple hidden onChange={(e) => upload(e.target.files)} />
              </div>
            </div>
          </div>
        </section>

        <div className="strip">
          <svg viewBox="0 0 1200 160" fill="none" strokeLinecap="round" aria-hidden="true">
            <defs>
              <linearGradient id="sg" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="-90" y2="-34">
                <stop offset="0" stopColor="#fff" /><stop offset="1" stopColor="#fff" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d="M90 100L400 45L720 95L1050 40" stroke="#FFD84D" strokeWidth="1.5" strokeDasharray="4 7" opacity=".5" />
            {CONSTELLATION.map((c) => (
              <g key={c.t} transform={`translate(${c.x} ${c.y})`}>
                <g className="pulse" style={{ animationDelay: `-${c.d}s` }}>
                  <circle r="6" fill="#FFF3B0" /><circle r="15" stroke="#FFD84D" opacity=".7" /><circle r="28" stroke="#FFD84D" opacity=".35" />
                </g>
                <text className="clabel" y="58" textAnchor="middle">{c.t}</text>
              </g>
            ))}
            <g transform="translate(60 6)"><g className="shoot">
              <line x1="0" y1="0" x2="-90" y2="-34" stroke="url(#sg)" strokeWidth="3" /><circle r="3" fill="#fff" stroke="none" />
            </g></g>
          </svg>
        </div>

        <section>
          <div className="gallery-head"><h2>The Gallery</h2><div className="rule" /></div>
          {error && <div className="error" role="alert">Something went wrong: {error}</div>}
          {loading ? (
            <p className="state pulse-text">Mixing the paints…</p>
          ) : docs.length === 0 ? (
            <p className="state">The gallery is empty. Hang your first painting above.</p>
          ) : (
            <div className="folios">
              {docs.map((d) => (
                <div className="card" key={d.id}>
                  <div className="thumb" data-art={d.id % 6}>
                    <svg viewBox="0 0 240 150" preserveAspectRatio="xMidYMid slice" fill="none" strokeLinecap="round" aria-hidden="true"><Art n={d.id} /></svg>
                    <span className="ext">{ext(d.name)}</span>
                  </div>
                  <div className="name" title={d.name}>{d.name}</div>
                  <div className="meta">{formatSize(d.size)} · {when(d.uploadedAt)}</div>
                  <div className="actions">
                    {canPreview(d.contentType)
                      ? <button className="btn" onClick={() => setViewing(d)}>View</button>
                      : <a className="btn" href={contentUrl(d.id, true)}>Download</a>}
                    <button className="btn del" onClick={() => remove(d)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="quote">Every great work begins as a single brushstroke.</div>
        </section>
      </div>

      <Village />

      {viewing && (
        <div className="overlay" onClick={() => setViewing(null)}>
          <div className="viewer" role="dialog" aria-label={viewing.name} onClick={(e) => e.stopPropagation()}>
            <div className="bar">
              <strong>{viewing.name}</strong>
              <span>
                <a className="btn" href={contentUrl(viewing.id, true)}>Download</a>
                <button className="btn" onClick={() => setViewing(null)}>Close</button>
              </span>
            </div>
            {viewing.contentType.startsWith("image/")
              ? <img src={contentUrl(viewing.id)} alt={viewing.name} />
              : <iframe src={contentUrl(viewing.id)} title={viewing.name} />}
          </div>
        </div>
      )}
    </div>
  );
}