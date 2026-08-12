import React, { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { Loader2, X, Users, RefreshCw, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { documentApi } from '@/api/apiClient';
import CustomEmailEditor from '@/components/email/CustomEmailEditor';

const PARTY_COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444',
  '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16',
];

function requiredPartyCount(doc) {
  const fromFields = (doc?.fields || []).map(f => Number(f.partyIndex ?? 0) + 1);
  const fromParties = doc?.parties?.length || 0;
  return Math.max(1, fromParties, ...(fromFields.length ? fromFields : [0]));
}

export default function ReuseDocumentModal({ document: sourceDoc, open, onClose, onSuccess }) {
  const slotCount = requiredPartyCount(sourceDoc);

  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [useCustomEmailBody, setUseCustomEmailBody] = useState(false);
  const [customEmailBody, setCustomEmailBody] = useState('');
  const [customEmailSubject, setCustomEmailSubject] = useState('');
  const [parties, setParties] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((v || '').trim());

  useEffect(() => {
    if (!open || !sourceDoc) return;
    setTitle(`${sourceDoc.title || 'Document'} — ${new Date().toLocaleDateString()}`);
    setMessage(sourceDoc.message || '');
    setUseCustomEmailBody(!!sourceDoc.useCustomEmailBody);
    setCustomEmailBody(sourceDoc.customEmailBody || '');
    setCustomEmailSubject(sourceDoc.customEmailSubject || '');
    setParties(
      Array.from({ length: slotCount }, (_, i) => ({
        name: '',
        email: '',
        designation: sourceDoc.parties?.[i]?.designation || '',
        color: sourceDoc.parties?.[i]?.color || PARTY_COLORS[i % PARTY_COLORS.length],
      })),
    );
  }, [open, sourceDoc, slotCount]);

  const updateParty = (idx, key, value) => {
    setParties(prev => prev.map((p, i) => (i === idx ? { ...p, [key]: value } : p)));
  };

  const handleSubmit = useCallback(async () => {
    if (!sourceDoc?._id) return;

    const cleaned = parties.map((p, i) => ({
      name:        p.name.trim(),
      email:       p.email.trim().toLowerCase(),
      designation: p.designation.trim(),
      color:       p.color || PARTY_COLORS[i % PARTY_COLORS.length],
    }));

    if (cleaned.some(p => !p.name || !p.email)) {
      toast.error('Every signer needs a name and email.');
      return;
    }
    if (cleaned.some(p => !isValidEmail(p.email))) {
      toast.error('One or more email addresses are invalid.');
      return;
    }
    const emails = cleaned.map(p => p.email);
    if (new Set(emails).size !== emails.length) {
      toast.error('Each signer must have a unique email.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await documentApi.reuseDocument(sourceDoc._id, {
        title:              title.trim() || sourceDoc.title,
        parties:            cleaned,
        ccList:             sourceDoc.ccList || [],
        message:            message.trim(),
        useCustomEmailBody,
        customEmailBody,
        customEmailSubject,
      });
      toast.success(res.data?.message || 'Document sent for signing.');
      onSuccess?.(res.data?.document);
      onClose();
    } catch (err) {
      toast.error(err?.message || 'Reuse failed.');
    } finally {
      setSubmitting(false);
    }
  }, [
    sourceDoc, parties, title, message, useCustomEmailBody,
    customEmailBody, customEmailSubject, onClose, onSuccess,
  ]);

  if (!sourceDoc) return null;

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-[#28ABDF]" />
            Reuse document
          </DialogTitle>
          <DialogDescription>
            Send the same PDF and field layout to new signers. Party 1 will receive the signing email immediately.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label className="text-xs">Document title</Label>
            <Input value={title} onChange={e => setTitle(e.target.value)} className="h-9" />
          </div>

          <div className="space-y-2">
            <Label className="text-xs flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              Signers ({slotCount} required)
            </Label>
            {parties.map((party, i) => (
              <div
                key={i}
                className="rounded-xl border border-slate-200 dark:border-slate-700 p-3 space-y-2"
              >
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                  Party {i + 1}
                  {i === 0 && (
                    <span className="ml-2 text-[#28ABDF] normal-case font-semibold">
                      — receives email first
                    </span>
                  )}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="Full name"
                    value={party.name}
                    onChange={e => updateParty(i, 'name', e.target.value)}
                    className="h-9 text-sm"
                  />
                  <Input
                    placeholder="Email"
                    type="email"
                    value={party.email}
                    onChange={e => updateParty(i, 'email', e.target.value)}
                    className="h-9 text-sm"
                  />
                </div>
                <Input
                  placeholder="Designation (optional)"
                  value={party.designation}
                  onChange={e => updateParty(i, 'designation', e.target.value)}
                  className="h-9 text-sm"
                />
              </div>
            ))}
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Message to signers (optional)</Label>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              rows={2}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700
                         bg-white dark:bg-slate-900 px-3 py-2 text-sm resize-none"
              placeholder="Optional note included in the signing email"
            />
          </div>

          <CustomEmailEditor
            variant="sequential"
            useCustom={useCustomEmailBody}
            onUseCustomChange={setUseCustomEmailBody}
            subject={customEmailSubject}
            onSubjectChange={setCustomEmailSubject}
            body={customEmailBody}
            onBodyChange={setCustomEmailBody}
            previewFn={documentApi.previewSigningEmail}
            previewContext={{
              documentTitle: title.trim() || sourceDoc.title,
              companyName:   sourceDoc.companyName,
              companyLogo:   sourceDoc.companyLogo,
              emailHeaderColor: sourceDoc.emailHeaderColor,
              signerName:    parties[0]?.name || 'Signer Name',
              partyNumber:   1,
              totalParties:  parties.length,
              message:       useCustomEmailBody ? '' : message.trim(),
            }}
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="bg-[#28ABDF] hover:bg-[#1e9acc] text-white gap-2"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            Send to new signers
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
