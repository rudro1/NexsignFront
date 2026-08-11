import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Loader2, CheckCircle2, Shield, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { publicGet } from '@/api/apiClient';

const BASE = (
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api'
).replace(/\/$/, '');

export default function TemplateCampaignApprover() {
  const { token } = useParams();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [data, setData] = useState(null);
  const [note, setNote] = useState('');

  useEffect(() => {
    if (!token) return;
    publicGet(`/template-campaigns/approve/validate/${token}`)
      .then(res => setData(res.data))
      .catch(err => toast.error(err.message || 'Invalid approval link'))
      .finally(() => setLoading(false));
  }, [token]);

  const handleApprove = async () => {
    setSubmitting(true);
    try {
      const res = await fetch(`${BASE}/template-campaigns/approve/${token}`, {
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

  const { approver, campaign } = data;
  const pdfUrl = `${BASE}/template-campaigns/pdf/${token}`;

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
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center">
          <div className="w-12 h-12 bg-[#28ABDF]/10 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Shield className="w-6 h-6 text-[#28ABDF]" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">Approval Required</h1>
          <p className="text-sm text-slate-500 mt-1">
            Step {campaign.stepNumber} of {campaign.totalSteps} · {approver.name}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
          <div className="flex items-start gap-3 mb-4">
            <FileText className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-800">{campaign.title}</p>
              <p className="text-xs text-slate-500 mt-1">{campaign.companyName}</p>
              {campaign.isLast && (
                <p className="text-xs text-emerald-600 mt-2 font-medium">
                  You are the final approver — {campaign.employeeCount} employees will receive signing links after you approve.
                </p>
              )}
            </div>
          </div>

          <iframe
            title="Document preview"
            src={`${pdfUrl}#toolbar=0`}
            className="w-full h-96 rounded-xl border border-slate-200 bg-slate-100"
          />

          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Optional comment…"
            rows={2}
            className="w-full mt-4 rounded-xl border border-slate-200 text-sm px-3 py-2 resize-none"
          />

          <Button
            onClick={handleApprove}
            disabled={submitting}
            className="w-full mt-4 h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 gap-2"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            Approve &amp; Continue
          </Button>
        </div>

        <p className="text-center text-[10px] text-slate-400">Powered by NexSign</p>
      </div>
    </div>
  );
}
