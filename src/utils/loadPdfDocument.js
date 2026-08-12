import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.js?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorkerUrl;

function openPdfFromData(data) {
  return pdfjsLib.getDocument({
    data,
    cMapPacked: true,
  }).promise;
}

/**
 * Load PDF from File/Blob (local preview) or URL (HTTP range requests when supported).
 */
export async function loadPdfDocument(source, { onProgress, timeoutMs = 35_000 } = {}) {
  if (!source) throw new Error('PDF source is missing');

  if (source instanceof Blob) {
    const data = await source.arrayBuffer();
    onProgress?.({ loaded: data.byteLength, total: data.byteLength });
    return openPdfFromData(data);
  }

  const url = String(source);
  const loadingTask = pdfjsLib.getDocument({
    url,
    cMapPacked:   true,
    disableRange: false,
    withCredentials: false,
  });

  if (onProgress) {
    loadingTask.onProgress = onProgress;
  }

  const timer = setTimeout(() => {
    try { loadingTask.destroy(); } catch { /* ignore */ }
  }, timeoutMs);

  try {
    return await loadingTask.promise;
  } catch (err) {
    if (err?.name === 'AbortError') throw new Error('PDF_TIMEOUT');
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

export { pdfjsLib };
