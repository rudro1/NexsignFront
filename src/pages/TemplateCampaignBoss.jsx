import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Loader2, CheckCircle2, Crown } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import SignaturePad from '@/components/signing/SignaturePad';
import BossExtraFields from '@/components/signing/BossExtraFields';
import {
  initSigningFields,
  toFieldValues,
  missingRequiredFields,
} from '@/utils/signingFields';
import { publicGet } from '@/api/apiClient';
import PdfCanvasPreview from '@/components/pdf/PdfCanvasPreview';

const BASE = (
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api'
).replace(/\/$/, '');

export default function TemplateCampaignBoss() {
  const { token } = useParams();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [data, setData] = useState(null);
  const [sigData, setSigData] = useState(null);
  const [bossFields, setBossFields] = useState([]);

  useEffect(() => {
    if (!token) return;
    publicGet(`/template-campaigns/boss/validate/${token}`)
      .then(res => {
        setData(res.data);
        setBossFields(initSigningFields(res.data?.campaign?.fields || []));
      })
      .catch(err => toast.error(err.message || 'Invalid link'))
      .finally(() => setLoading(false));
  }, [token]);

  const handleSign = async () => {
    if (!sigData) {
      toast.error('Please draw your signature.');
      return;
    }
    const extraMissing = missingRequiredFields(
      bossFields.filter(f => f.type !== 'signature' && f.type !== 'initial'),
    );
    if (extraMissing.length) {
      toast.error(`Please complete: ${extraMissing.map(f => f.label || f.type).join(', ')}`);
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${BASE}/template-campaigns/boss/sign/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        credentials: 'omit',
        body: JSON.stringify({
          signatureDataUrl: sigData,
          fieldValues: toFieldValues(
            bossFields.filter(f => f.type !== 'signature' && f.type !== 'initial'),
          ),
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Signing failed');
      setDone(true);
      toast.success(json.message || 'Signed!');
    } catch (err) {
      toast.error(err.message || 'Could not sign');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  if (!data?.success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <p className="text-slate-600">Invalid or expired signing link.</p>
      </div>
    );
  }

  const { campaign } = data;
  const pdfUrl = `${BASE}/template-campaigns/pdf/${token}`;

  if (done) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-amber-50 to-slate-50">
        <CheckCircle2 className="w-16 h-16 text-emerald-500 mb-4" />
        <h1 className="text-xl font-bold">Signature recorded</h1>
        <p className="text-sm text-slate-500 mt-2 text-center max-w-md">
          {campaign.approverCount > 0
            ? 'The approval chain has started. Employees will receive links after all approvers complete.'
            : `Signing links are being sent to ${campaign.employeeCount} employees.`}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-lg mx-auto space-y-6">
        <div className="text-center">
          <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Crown className="w-6 h-6 text-amber-600" />
          </div>
          <h1 className="text-xl font-bold">Authoriser Signature</h1>
          <p className="text-sm text-slate-500 mt-1">{campaign.title}</p>
        </div>

        <PdfCanvasPreview
          source={pdfUrl}
          height={256}
          showPager={false}
          className="rounded-xl border overflow-hidden"
        />

        <div className="bg-white rounded-2xl border p-5 space-y-4">
          <BossExtraFields fields={bossFields} onChange={setBossFields} />
          <p className="text-xs font-semibold text-slate-500 mb-3 uppercase">Your signature</p>
          <SignaturePad onChange={setSigData} height={160} />
          <Button
            onClick={handleSign}
            disabled={submitting || !sigData}
            className="w-full mt-4 h-11 rounded-xl bg-amber-500 hover:bg-amber-600 gap-2"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Crown className="w-4 h-4" />}
            Sign &amp; Authorize
          </Button>
        </div>
      </div>
    </div>
  );
}
