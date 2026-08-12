import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Loader2, CheckCircle2, Shield, FileText, Crown, ExternalLink, Users,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { publicGet, publicApiUrl } from '@/api/apiClient';

function fmtDate(d) {
  if (!d) return '';
  try {
    return new Date(d).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch {
    return '';
  }
}

export default function TemplateCampaignApprover() {
  const { token } = useParams();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [data, setData] = useState(null);
  const [note, setNote] = useState('');
  const [reviewed, setReviewed] = useState(false);

  useEffect(() => {
    if (!token) return;
    publicGet(`/template-campaigns/approve/validate/${token}`)
      .then(res => setData(res.data))
      .catch(err => toast.error(err.message || 'Invalid approval link'))
      .finally(() => setLoading(false));
  }, [token]);

  const handleApprove = async () => {
    if (!reviewed) {
      toast.error('Please review the signed PDF above before approving.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(publicApiUrl(`/template-campaigns/approve/${token}`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        credentials: 'omit',
        body: JSON.stringify({ approved: true, note: note.trim() }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Approval failed');
      setDone(true);
      toast.success(json.message || 'Approved!');
    } catch (err) {
      toast.error(err.message || 'Could not approve');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-[#28ABDF]" />
      </div>
    );
  }

  if (!data?.success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
        <p className="text-slate-600">This approval link is invalid or expired.</p>
      </div>
    );
  }

  const { approver, campaign, pdfUrl } = data;
  const previewUrl = pdfUrl || publicApiUrl(`/template-campaigns/pdf/${token}`);

  if (done) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-slate-50 to-emerald-50">
        <CheckCircle2 className="w-16 h-16 text-emerald-500 mb-4" />
        <h1 className="text-xl font-bold text-slate-800">Thank you, {approver.name}</h1>
        <p className="text-sm text-slate-500 mt-2 text-center max-w-md">
          Your approval has been recorded.
          {campaign.isLast
            ? ' Employee signing links are being sent now.'
            : ' The next approver has been notified.'}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <div className="w-12 h-12 bg-[#28ABDF]/10 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Shield className="w-6 h-6 text-[#28ABDF]" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">Review &amp; Approve</h1>
          <p className="text-sm text-slate-500 mt-1">
            Step {campaign.stepNumber} of {campaign.totalSteps} · {approver.name}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-4">
          <div className="flex items-start gap-3">
            <FileText className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-800">{campaign.title}</p>
              {campaign.companyName && (
                <p className="text-xs text-slate-500 mt-1">{campaign.companyName}</p>
              )}
            </div>
          </div>

          {campaign.bossSignature?.signedAt && (
            <div className="flex items-start gap-3 rounded-xl bg-sky-50 border border-sky-100 px-4 py-3">
              <Crown className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold text-sky-900">Authoriser signed</p>
                <p className="text-sky-700/80 text-xs mt-0.5">
                  {campaign.bossSignature.name || 'Authoriser'}
                  {campaign.bossSignature.signedAt
                    ? ` · ${fmtDate(campaign.bossSignature.signedAt)}`
                    : ''}
                </p>
                <p className="text-xs text-sky-600/70 mt-1">
                  The PDF below includes the authoriser&apos;s signature and assigned fields.
                  Review it fully before approving.
                </p>
              </div>
            </div>
          )}

          {campaign.previousApprovers?.length > 0 && (
            <div className="text-xs text-slate-500">
              Previously approved by:{' '}
              {campaign.previousApprovers.map(a => a.name).join(', ')}
            </div>
          )}

          {campaign.isLast && (
            <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">
              <Users className="w-3.5 h-3.5 shrink-0" />
              Final approver — {campaign.employeeCount} employees will receive signing links after you approve.
            </div>
          )}

          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Signed document preview
            </p>
            <a
              href={previewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-[#28ABDF] hover:underline"
            >
              Open full PDF <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <iframe
            title="Signed document preview"
            src={`${previewUrl}#toolbar=1&navpanes=0`}
            className="w-full h-[min(70vh,720px)] rounded-xl border border-slate-200 bg-slate-100"
            onLoad={() => setReviewed(true)}
          />

          <label className="flex items-start gap-2 text-sm text-slate-600 cursor-pointer">
            <input
              type="checkbox"
              checked={reviewed}
              onChange={e => setReviewed(e.target.checked)}
              className="mt-1 rounded border-slate-300"
            />
            <span>
              I have reviewed the authoriser-signed PDF and confirm the details are correct.
            </span>
          </label>

          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Optional approval comment…"
            rows={2}
            className="w-full rounded-xl border border-slate-200 text-sm px-3 py-2 resize-none"
          />

          <Button
            onClick={handleApprove}
            disabled={submitting || !reviewed}
            className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 gap-2 disabled:opacity-50"
          >
            {submitting
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <CheckCircle2 className="w-4 h-4" />}
            Approve &amp; Continue
          </Button>
        </div>

        <p className="text-center text-[10px] text-slate-400">Powered by NexSign</p>
      </div>
    </div>
  );
}
