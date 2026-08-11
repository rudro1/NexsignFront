import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.js?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorkerUrl;

function openPdfData(data) {
  return pdfjsLib.getDocument({
    data,
    cMapPacked: true,
    disableRange: true,
  }).promise;
}

/**
 * Load PDF from File/Blob (instant local preview) or URL string.
 */
export async function loadPdfDocument(source, { onProgress, timeoutMs = 35_000 } = {}) {
  if (!source) throw new Error('PDF source is missing');

  if (source instanceof Blob) {
    const data = await source.arrayBuffer();
    onProgress?.({ loaded: data.byteLength, total: data.byteLength });
    return openPdfData(data);
  }

  const url = String(source);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      credentials: 'omit',
      mode: 'cors',
    });

    if (!res.ok) throw new Error(`PDF fetch failed (${res.status})`);

    const data = await res.arrayBuffer();
    onProgress?.({ loaded: data.byteLength, total: data.byteLength });
    return openPdfData(data);
  } catch (err) {
    if (err?.name === 'AbortError') throw new Error('PDF_TIMEOUT');
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

export { pdfjsLib };
