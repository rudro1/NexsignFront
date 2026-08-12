import React, { useEffect, useState } from 'react';
import { Loader2, Download, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import PdfCanvasPreview from '@/components/pdf/PdfCanvasPreview';

/**
 * In-app PDF preview (signed document + audit page).
 * loadBlob: async () => Blob
 */
export default function SignedPdfPreviewModal({
  open,
  onClose,
  title = 'Signed document',
  subtitle = '',
  loadBlob,
  downloadName = 'signed-document.pdf',
}) {
  const [pdfUrl, setPdfUrl]   = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [blob, setBlob]       = useState(null);

  useEffect(() => {
    if (!open || !loadBlob) return undefined;

    let cancelled = false;
    let objectUrl = '';

    setLoading(true);
    setError('');
    setPdfUrl('');
    setBlob(null);

    loadBlob()
      .then((data) => {
        if (cancelled) return;
        objectUrl = URL.createObjectURL(data);
        setBlob(data);
        setPdfUrl(objectUrl);
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e?.message || 'Could not load PDF preview.');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [open, loadBlob]);

  const handleDownload = () => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = downloadName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose?.()}>
      <DialogContent className="max-w-4xl w-[95vw] h-[90vh] p-0 gap-0 overflow-hidden flex flex-col">
        <DialogHeader className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <DialogTitle className="text-base font-bold truncate">{title}</DialogTitle>
              {subtitle && (
                <DialogDescription className="text-xs mt-0.5 truncate">
                  {subtitle}
                </DialogDescription>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleDownload}
                disabled={!blob || loading}
                className="h-8 rounded-lg gap-1.5 text-xs"
              >
                <Download className="w-3.5 h-3.5" />
                Download
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8 rounded-lg"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 min-h-0 bg-slate-100 dark:bg-slate-950 relative">
          {loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 text-[#28ABDF] animate-spin" />
              <p className="text-sm text-slate-500">Loading signed PDF…</p>
            </div>
          )}
          {!loading && error && (
            <div className="absolute inset-0 flex items-center justify-center p-6">
              <p className="text-sm text-red-500 text-center max-w-md">{error}</p>
            </div>
          )}
          {!loading && !error && pdfUrl && (
            <PdfCanvasPreview
              source={pdfUrl}
              height={560}
              showPager
              className="h-full"
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
