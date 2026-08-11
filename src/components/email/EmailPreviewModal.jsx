import React from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, Pencil } from 'lucide-react';

export default function EmailPreviewModal({
  open,
  onClose,
  subject = '',
  html = '',
  loading = false,
  recipientLabel = '',
  onEdit,
  editLabel = 'Edit email',
}) {
  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose?.(); }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col p-0 rounded-2xl">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <DialogTitle className="text-base font-bold">Email Preview</DialogTitle>
          <DialogDescription className="text-xs text-slate-500 space-y-1">
            {recipientLabel && (
              <span className="block">Recipient: {recipientLabel}</span>
            )}
            {subject && (
              <span className="block font-medium text-slate-700 dark:text-slate-300">
                Subject: {subject}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto bg-slate-100 dark:bg-slate-950 p-4 min-h-[320px]">
          {loading ? (
            <div className="flex items-center justify-center h-64 text-slate-400 gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              Loading preview…
            </div>
          ) : html ? (
            <iframe
              title="Email preview"
              srcDoc={html}
              className="w-full min-h-[480px] bg-white rounded-lg border border-slate-200 shadow-sm"
              sandbox=""
            />
          ) : (
            <p className="text-center text-sm text-slate-400 py-16">
              No preview available.
            </p>
          )}
        </div>

        {(onEdit || onClose) && (
          <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex gap-2 shrink-0">
            {onEdit && (
              <Button
                type="button"
                variant="outline"
                onClick={() => { onClose?.(); onEdit(); }}
                className="flex-1 rounded-xl gap-1.5 h-10"
                disabled={loading}
              >
                <Pencil className="w-3.5 h-3.5" />
                {editLabel}
              </Button>
            )}
            <Button
              type="button"
              variant={onEdit ? 'default' : 'outline'}
              onClick={onClose}
              className={`${onEdit ? 'flex-1' : 'w-full'} rounded-xl h-10`}
            >
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
