import React, {
  useCallback, useEffect, useRef, useState,
} from 'react';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { loadPdfDocument } from '@/utils/loadPdfDocument';

const cn = (...c) => c.filter(Boolean).join(' ');

/**
 * Read-only PDF preview via pdf.js canvas (avoids Chrome iframe unload violations).
 * @param {string|Blob} source — blob URL, http URL, or Blob
 */
export default function PdfCanvasPreview({
  source,
  className = '',
  height = 400,
  showPager = true,
  scale: scaleProp = 1.25,
}) {
  const canvasRef   = useRef(null);
  const pdfRef      = useRef(null);
  const renderRef   = useRef(null);
  const mountedRef  = useRef(true);

  const [page, setPage]       = useState(1);
  const [total, setTotal]     = useState(1);
  const [state, setState]     = useState('idle');
  const [error, setError]     = useState('');

  const cancelRender = useCallback(() => {
    if (renderRef.current) {
      try { renderRef.current.cancel(); } catch { /* ignore */ }
      renderRef.current = null;
    }
  }, []);

  const destroyPdf = useCallback(() => {
    cancelRender();
    if (pdfRef.current) {
      try { pdfRef.current.destroy(); } catch { /* ignore */ }
      pdfRef.current = null;
    }
  }, [cancelRender]);

  const renderPage = useCallback(async (doc, pageNum) => {
    const canvas = canvasRef.current;
    if (!doc || !canvas) return;

    const pdfPage = await doc.getPage(pageNum);
    const viewport = pdfPage.getViewport({ scale: scaleProp });
    const ctx = canvas.getContext('2d');

    canvas.width  = viewport.width;
    canvas.height = viewport.height;

    cancelRender();
    renderRef.current = pdfPage.render({ canvasContext: ctx, viewport });
    await renderRef.current.promise;
  }, [scaleProp, cancelRender]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      destroyPdf();
    };
  }, [destroyPdf]);

  useEffect(() => {
    if (!source) {
      setState('idle');
      return undefined;
    }

    let cancelled = false;

    (async () => {
      destroyPdf();
      setState('loading');
      setError('');
      setPage(1);

      try {
        const doc = await loadPdfDocument(source);
        if (cancelled || !mountedRef.current) {
          try { doc.destroy(); } catch { /* ignore */ }
          return;
        }

        pdfRef.current = doc;
        setTotal(doc.numPages);
        await renderPage(doc, 1);
        if (!cancelled && mountedRef.current) setState('ready');
      } catch (e) {
        if (!cancelled && mountedRef.current) {
          setError(e?.message || 'Could not load PDF.');
          setState('error');
        }
      }
    })();

    return () => { cancelled = true; };
  }, [source, destroyPdf, renderPage]);

  useEffect(() => {
    if (state !== 'ready' || !pdfRef.current) return undefined;
    let cancelled = false;

    (async () => {
      try {
        await renderPage(pdfRef.current, page);
      } catch (e) {
        if (!cancelled && mountedRef.current) {
          setError(e?.message || 'Could not render page.');
          setState('error');
        }
      }
    })();

    return () => { cancelled = true; };
  }, [page, state, renderPage]);

  return (
    <div className={cn('flex flex-col', className)}>
      {showPager && total > 1 && state === 'ready' && (
        <div className="flex items-center justify-center gap-3 py-2 px-2
                        border-b border-slate-200 dark:border-slate-700
                        bg-slate-50 dark:bg-slate-900/80 shrink-0">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}
            className="p-1.5 rounded-lg disabled:opacity-30 hover:bg-slate-200 dark:hover:bg-slate-700"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-medium text-slate-500 tabular-nums">
            Page {page} of {total}
          </span>
          <button
            type="button"
            disabled={page >= total}
            onClick={() => setPage(p => Math.min(total, p + 1))}
            className="p-1.5 rounded-lg disabled:opacity-30 hover:bg-slate-200 dark:hover:bg-slate-700"
            aria-label="Next page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      <div
        className="relative overflow-auto bg-slate-100 dark:bg-slate-950 flex justify-center"
        style={{ minHeight: height, maxHeight: height }}
      >
        {state === 'loading' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-7 h-7 text-[#28ABDF] animate-spin" />
            <p className="text-xs text-slate-500">Loading PDF…</p>
          </div>
        )}
        {state === 'error' && (
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <p className="text-sm text-red-500 text-center">{error}</p>
          </div>
        )}
        <canvas
          ref={canvasRef}
          className={cn(
            'block max-w-full shadow-sm',
            state !== 'ready' && 'invisible',
          )}
        />
      </div>
    </div>
  );
}
