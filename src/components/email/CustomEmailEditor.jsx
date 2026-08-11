import React, { useState, useCallback, useRef } from 'react';
import { Mail, Eye, Loader2, Info } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import EmailPreviewModal from '@/components/email/EmailPreviewModal';
import { toast } from 'sonner';

export const EMAIL_TOKEN_HELP = [
  { token: '{{signerName}}',     desc: 'Recipient name' },
  { token: '{{documentTitle}}', desc: 'Document title' },
  { token: '{{signingLink}}',   desc: 'Unique signing URL' },
  { token: '{{companyName}}',   desc: 'Your company' },
  { token: '{{senderName}}',     desc: 'Sender name' },
  { token: '{{partyNumber}}',   desc: 'Signer # (sequential)' },
  { token: '{{totalParties}}', desc: 'Total signers' },
];

const DEFAULT_SEQUENTIAL_BODY = `Dear {{signerName}},

Please review and sign "{{documentTitle}}" at your earliest convenience.

You can sign securely here:
{{signingLink}}

If you have questions, contact {{senderName}}.

Thank you.`;

const DEFAULT_TEMPLATE_BODY = `Dear {{signerName}},

You are requested to sign "{{documentTitle}}" for {{companyName}}.

Open your secure signing page:
{{signingLink}}

Thank you for your prompt attention.`;

/**
 * @param {'sequential'|'template'} variant
 * @param previewFn async ({ subject, body, ...ctx }) => { data: { subject, html } }
 */
export default function CustomEmailEditor({
  variant = 'sequential',
  useCustom,
  onUseCustomChange,
  subject,
  onSubjectChange,
  body,
  onBodyChange,
  previewContext = {},
  previewFn,
  className = '',
  editorRef,
}) {
  const bodyRef = useRef(null);
  const textareaRef = editorRef || bodyRef;
  const [previewOpen, setPreviewOpen]   = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewSubject, setPreviewSubject] = useState('');
  const [previewHtml, setPreviewHtml]     = useState('');

  const loadDefault = () => {
    onUseCustomChange(true);
    onBodyChange(variant === 'template' ? DEFAULT_TEMPLATE_BODY : DEFAULT_SEQUENTIAL_BODY);
    if (!subject) onSubjectChange('Please sign "{{documentTitle}}"');
  };

  const handlePreview = useCallback(async () => {
    if (!previewFn) {
      toast.error('Preview not available.');
      return;
    }
    setPreviewOpen(true);
    setPreviewLoading(true);
    try {
      const res = await previewFn({
        useCustomEmailBody: useCustom,
        customEmailSubject: subject,
        customEmailBody:    body,
        ...previewContext,
      });
      setPreviewSubject(res.data?.subject || subject);
      setPreviewHtml(res.data?.html || '');
    } catch (err) {
      toast.error(err?.message || 'Preview failed.');
      setPreviewOpen(false);
    } finally {
      setPreviewLoading(false);
    }
  }, [previewFn, useCustom, subject, body, previewContext]);

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between gap-2">
        <Label className="text-xs font-semibold flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
          <Mail className="w-3.5 h-3.5" /> Email content
        </Label>
        <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-500">
          <input
            type="checkbox"
            checked={useCustom}
            onChange={e => onUseCustomChange(e.target.checked)}
            className="rounded border-slate-300"
          />
          Write custom email body
        </label>
      </div>

      {useCustom ? (
        <div className="space-y-3 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/40">
          <div className="space-y-1.5">
            <Label className="text-[11px] text-slate-500">Email subject (optional)</Label>
            <Input
              value={subject}
              onChange={e => onSubjectChange(e.target.value)}
              placeholder='Please sign "{{documentTitle}}"'
              className="h-9 text-xs rounded-xl"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-[11px] text-slate-500">Email body</Label>
            <textarea
              ref={textareaRef}
              value={body}
              onChange={e => onBodyChange(e.target.value)}
              rows={10}
              placeholder="Write your full email here. Include {{signingLink}} where you want the button/link."
              className="w-full rounded-xl border border-slate-200 dark:border-slate-600
                         bg-white dark:bg-slate-900 text-sm px-3 py-2 resize-y font-mono
                         leading-relaxed min-h-[180px]"
            />
          </div>

          <div className="flex flex-wrap gap-1.5">
            {EMAIL_TOKEN_HELP.map(({ token, desc }) => (
              <button
                key={token}
                type="button"
                title={desc}
                onClick={() => onBodyChange(`${body}${body ? '\n' : ''}${token}`)}
                className="text-[10px] px-2 py-0.5 rounded-md bg-white dark:bg-slate-800
                           border border-slate-200 dark:border-slate-600 text-sky-700
                           hover:bg-sky-50 font-mono"
              >
                {token}
              </button>
            ))}
          </div>

          <div className="flex items-start gap-2 text-[10px] text-slate-500">
            <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <p>
              Plain text or HTML. Use <code className="text-sky-600">{'{{signingLink}}'}</code> for the
              signing URL — if omitted, NexSign adds a sign button automatically.
            </p>
          </div>

          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" onClick={loadDefault}
              className="h-8 text-xs rounded-lg">
              Load sample
            </Button>
            {previewFn && (
              <Button type="button" variant="outline" size="sm" onClick={handlePreview}
                className="h-8 text-xs rounded-lg gap-1">
                <Eye className="w-3.5 h-3.5" /> Preview email
              </Button>
            )}
          </div>
        </div>
      ) : (
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Using NexSign&apos;s professional default email. Enable custom body to write the full message yourself.
        </p>
      )}

      <EmailPreviewModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        subject={previewSubject}
        html={previewHtml}
        loading={previewLoading}
        recipientLabel="Sample recipient"
        onEdit={() => {
          if (!useCustom) onUseCustomChange(true);
          setTimeout(() => textareaRef.current?.focus(), 100);
        }}
        editLabel="Edit email content"
      />
    </div>
  );
}
