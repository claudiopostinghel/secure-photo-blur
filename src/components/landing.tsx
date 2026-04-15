import { useRef, useState } from 'preact/hooks'
import { loadImage } from '../engine/image-loader'
import type { LoadedImage } from '../types'

interface Props {
  onImageLoaded: (img: LoadedImage) => void
}

const ACCEPTED = '.jpg,.jpeg,.png,.webp,.heic,.heif'

export function Landing({ onImageLoaded }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleFile(file: File) {
    setError(null)
    setLoading(true)
    try {
      const img = await loadImage(file)
      onImageLoaded(img)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load image')
    } finally {
      setLoading(false)
    }
  }

  function onInputChange(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (file) handleFile(file)
  }

  function onDrop(e: DragEvent) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer?.files[0]
    if (file && file.type.startsWith('image/')) handleFile(file)
  }

  function onDragOver(e: DragEvent) {
    e.preventDefault()
    setDragging(true)
  }

  function onDragLeave() {
    setDragging(false)
  }

  return (
    <div class="landing">
      <main class="landing-main">
        <h1 class="landing-hero">
          Secure Photo <em>Blur</em>
        </h1>
        <p class="landing-tagline">
          Anonymize faces and sensitive areas — privately, offline, open-source.
        </p>

        <div
          class={`drop-zone${dragging ? ' drop-zone--active' : ''}`}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onClick={() => inputRef.current?.click()}
          role="button"
          tabindex={0}
          aria-label="Select or drop a photo"
          onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED}
            onChange={onInputChange}
            style={{ display: 'none' }}
          />
          {loading ? (
            <div class="drop-zone-loading">
              <div class="spinner" />
              <span>Loading image…</span>
            </div>
          ) : (
            <>
              <svg class="drop-zone-icon" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              <span class="drop-zone-label">Drop a photo here</span>
              <span class="drop-zone-sub">or</span>
              <button class="btn-primary" type="button" onClick={(e) => { e.stopPropagation(); inputRef.current?.click() }}>
                Select Photo
              </button>
              <span class="drop-zone-formats">JPEG · PNG · WebP · HEIC</span>
            </>
          )}
        </div>

        {error && <p class="landing-error">{error}</p>}

        <div class="landing-features">
          <span class="feature-pill">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 8h1a4 4 0 0 1 0 8h-1"/>
              <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/>
              <line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/>
            </svg>
            Works offline
          </span>
          <span class="feature-pill">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            Zero tracking
          </span>
          <span class="feature-pill">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            Metadata stripped
          </span>
        </div>

        <p class="landing-note">
          Photos never leave your device. Processing happens entirely in your browser.
        </p>
      </main>

      <style>{`
        .landing {
          display: flex;
          flex-direction: column;
          height: 100%;
          overflow-y: auto;
        }
        .landing-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: var(--sp-xl) var(--sp-md);
          max-width: 600px;
          margin: 0 auto;
          width: 100%;
          gap: var(--sp-lg);
        }
        .landing-hero {
          font-family: var(--font-serif);
          font-size: clamp(32px, 8vw, 48px);
          font-weight: 700;
          text-align: center;
          line-height: 1.15;
        }
        .landing-hero em {
          font-style: italic;
          font-weight: 400;
          color: var(--accent-light);
        }
        .landing-tagline {
          text-align: center;
          color: var(--text-secondary);
          font-size: 15px;
          line-height: 1.6;
        }
        .drop-zone {
          width: 100%;
          max-width: 480px;
          border: 2px dashed var(--border);
          border-radius: var(--radius);
          padding: var(--sp-xl) var(--sp-lg);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--sp-sm);
          cursor: pointer;
          transition: border-color var(--transition), background var(--transition);
          background: var(--bg-surface);
        }
        .drop-zone:hover,
        .drop-zone--active {
          border-color: var(--accent);
          background: var(--bg-elevated);
        }
        .drop-zone-icon {
          color: var(--text-muted);
          margin-bottom: var(--sp-xs);
        }
        .drop-zone-label {
          font-size: 15px;
          color: var(--text-secondary);
        }
        .drop-zone-sub {
          font-size: 13px;
          color: var(--text-muted);
        }
        .drop-zone-formats {
          font-size: 12px;
          color: var(--text-muted);
          margin-top: var(--sp-xs);
        }
        .drop-zone-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--sp-sm);
          color: var(--text-secondary);
        }
        .landing-error {
          color: var(--accent-light);
          font-size: 13px;
          text-align: center;
        }
        .landing-features {
          display: flex;
          gap: var(--sp-sm);
          flex-wrap: wrap;
          justify-content: center;
        }
        .feature-pill {
          display: inline-flex;
          align-items: center;
          gap: var(--sp-xs);
          padding: var(--sp-sm) var(--sp-md);
          background: var(--bg-surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-pill);
          font-size: 12px;
          color: var(--text-secondary);
        }
        .feature-pill svg { opacity: 0.7; }
        .landing-note {
          font-size: 12px;
          color: var(--text-muted);
          text-align: center;
        }
      `}</style>
    </div>
  )
}
