import React, { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Loader2, Plus, X, Crown, Users, GitBranch, RefreshCw, Send, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { templateApi } from '@/api/apiClient';
import CustomEmailEditor from '@/components/email/CustomEmailEditor';

export default function ReuseTemplateModal({ template, open, onClose, onSuccess }) {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState(template?.message || '');
  const [useCustomEmailBody, setUseCustomEmailBody] = useState(
    !!template?.signingConfig?.useCustomEmailBody,
  );
  const [customEmailBody, setCustomEmailBody] = useState(
    template?.signingConfig?.customEmailBody || '',
  );
  const [customEmailSubject, setCustomEmailSubject] = useState(
    template?.signingConfig?.customEmailSubject || '',
  );
  const [bossSignMode, setBossSignMode] = useState('reuse');
  const [boss, setBoss] = useState({ name: '', email: '', designation: '' });
  const [employees, setEmployees] = useState([]);
  const [empForm, setEmpForm] = useState({ name: '', email: '', designation: '' });
  const [approvers, setApprovers] = useState([]);
  const [apprForm, setApprForm] = useState({ name: '', email: '', designation: '' });
  const [submitting, setSubmitting] = useState(false);
  const [csvError, setCsvError] = useState('');

  const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((v || '').trim());

  const canReuseBoss = !!template?.bossSignedFileUrl;

  const addEmployee = () => {
    const email = empForm.email.trim().toLowerCase();
    if (!empForm.name.trim() || !email) {
      toast.error('Employee name and email required.');
      return;
    }
    if (employees.some(e => e.email === email)) {
      toast.error('Employee already added.');
      return;
    }
    setEmployees(prev => [...prev, {
      name: empForm.name.trim(),
      email,
      designation: empForm.designation.trim(),
    }]);
    setEmpForm({ name: '', email: '', designation: '' });
  };

  const addApprover = () => {
    const email = apprForm.email.trim().toLowerCase();
    if (!apprForm.name.trim() || !email) {
      toast.error('Approver name and email required.');
      return;
    }
    setApprovers(prev => [...prev, {
      name: apprForm.name.trim(),
      email,
      designation: apprForm.designation.trim(),
    }]);
    setApprForm({ name: '', email: '', designation: '' });
  };

  const handleCsvUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCsvError('');
    try {
      const text = await file.text();
      const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
      if (lines.length < 2) throw new Error('CSV is empty.');
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      const ni = headers.indexOf('name');
      const ei = headers.indexOf('email');
      const di = headers.indexOf('designation');
      if (ni === -1 || ei === -1) throw new Error('CSV must have "name" and "email" columns.');
      const newEmps = lines.slice(1).map(r => {
        const c = r.split(',').map(x => x.trim());
        return {
          name: c[ni] || '',
          email: (c[ei] || '').toLowerCase(),
          designation: di !== -1 ? (c[di] || '') : '',
        };
      }).filter(emp => emp.name && isValidEmail(emp.email));
      if (!newEmps.length) throw new Error('No valid rows in CSV.');
      const existing = new Set(employees.map(x => x.email));
      const fresh = newEmps.filter(x => !existing.has(x.email));
      setEmployees(prev => [...prev, ...fresh]);
      toast.success(`${fresh.length} employee(s) added from CSV`);
    } catch (err) {
      setCsvError(err.message || 'Invalid CSV.');
    } finally {
      e.target.value = '';
    }
  };

  const handleSubmit = useCallback(async () => {
    if (!employees.length) {
      toast.error('Add at least one employee.');
      return;
    }
    if (bossSignMode === 'new' && !boss.email.trim()) {
      toast.error('Boss email is required for new signature.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await templateApi.reuseTemplate(template._id, {
        title:       title.trim() || `${template.title} — ${new Date().toLocaleDateString()}`,
        message:     useCustomEmailBody ? '' : message.trim(),
        useCustomEmailBody,
        customEmailBody:    useCustomEmailBody ? customEmailBody : '',
        customEmailSubject: useCustomEmailBody ? customEmailSubject : '',
        recipients:  employees,
        approvers,
        bossSignMode,
        boss:        bossSignMode === 'new' ? boss : undefined,
      });

      toast.success(res.data?.message || 'Campaign started!');
      onSuccess?.(res.data);
      onClose?.();
    } catch (err) {
      toast.error(err?.message || err?.response?.data?.message || 'Failed to start campaign.');
    } finally {
      setSubmitting(false);
    }
  }, [template, title, message, useCustomEmailBody, customEmailBody, customEmailSubject,
      employees, approvers, bossSignMode, boss, onClose, onSuccess]);

  if (!template) return null;

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose?.(); }}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-[#28ABDF]" />
            Send Template Again
          </DialogTitle>
          <DialogDescription>
            Reuse &ldquo;{template.title}&rdquo; with new employees (type or CSV).
            Boss sign, approvers, and message are all optional.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <div className="space-y-1.5">
            <Label className="text-xs">Campaign name</Label>
            <Input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder={`${template.title} — batch`}
              className="h-10 rounded-xl"
            />
          </div>

          {/* Boss sign mode */}
          <div className="space-y-2">
            <Label className="text-xs flex items-center gap-1">
              <Crown className="w-3.5 h-3.5" /> Authoriser signature
            </Label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={!canReuseBoss}
                onClick={() => setBossSignMode('reuse')}
                className={`p-3 rounded-xl border text-left text-xs transition-all
                  ${bossSignMode === 'reuse'
                    ? 'border-[#28ABDF] bg-sky-50 text-sky-800'
                    : 'border-slate-200 text-slate-600'}
                  ${!canReuseBoss ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <p className="font-semibold">Use previous sign</p>
                <p className="text-[10px] opacity-70 mt-0.5">Skip boss step</p>
              </button>
              <button
                type="button"
                onClick={() => setBossSignMode('new')}
                className={`p-3 rounded-xl border text-left text-xs transition-all
                  ${bossSignMode === 'new'
                    ? 'border-amber-400 bg-amber-50 text-amber-800'
                    : 'border-slate-200 text-slate-600'}`}
              >
                <p className="font-semibold">New boss sign</p>
                <p className="text-[10px] opacity-70 mt-0.5">Email link to sign</p>
              </button>
            </div>
            {bossSignMode === 'new' && (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Input placeholder="Boss name" value={boss.name}
                  onChange={e => setBoss(p => ({ ...p, name: e.target.value }))}
                  className="h-9 text-xs rounded-xl" />
                <Input placeholder="Boss email" type="email" value={boss.email}
                  onChange={e => setBoss(p => ({ ...p, email: e.target.value }))}
                  className="h-9 text-xs rounded-xl" />
              </div>
            )}
          </div>

          {/* Approver chain */}
          <div className="space-y-2">
            <Label className="text-xs flex items-center gap-1">
              <GitBranch className="w-3.5 h-3.5" /> Approval chain (optional)
            </Label>
            <p className="text-[10px] text-slate-400">
              e.g. CEO → Head of HR → HR. Each approves in order; then all employees get mail.
            </p>
            <div className="flex gap-2">
              <Input placeholder="Name" value={apprForm.name}
                onChange={e => setApprForm(p => ({ ...p, name: e.target.value }))}
                className="h-9 text-xs rounded-xl flex-1" />
              <Input placeholder="Email" value={apprForm.email}
                onChange={e => setApprForm(p => ({ ...p, email: e.target.value }))}
                className="h-9 text-xs rounded-xl flex-1" />
              <Button type="button" variant="outline" size="sm" onClick={addApprover}
                className="h-9 px-2 rounded-xl shrink-0">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {approvers.map((a, i) => (
              <div key={i} className="flex items-center gap-2 text-xs bg-slate-50 rounded-lg px-2 py-1.5">
                <span className="font-bold text-slate-400 w-4">{i + 1}.</span>
                <span className="flex-1 truncate">{a.name} · {a.email}</span>
                <button type="button" onClick={() => setApprovers(p => p.filter((_, j) => j !== i))}>
                  <X className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </div>
            ))}
          </div>

          {/* Employees */}
          <div className="space-y-2">
            <Label className="text-xs flex items-center gap-1">
              <Users className="w-3.5 h-3.5" /> Employees
            </Label>
            <label className={`flex items-center gap-3 p-3 rounded-xl border-2 border-dashed cursor-pointer transition-colors
              ${csvError ? 'border-red-300 bg-red-50/50' : 'border-slate-200 hover:border-[#28ABDF] hover:bg-sky-50/30'}`}>
              <FileSpreadsheet className="w-5 h-5 text-slate-400 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-slate-600">Upload CSV</p>
                <p className="text-[10px] text-slate-400">name, email, designation columns</p>
                {csvError && <p className="text-[10px] text-red-500 mt-0.5">{csvError}</p>}
              </div>
              <input type="file" accept=".csv,text/csv" onChange={handleCsvUpload} className="hidden" />
            </label>
            <div className="flex gap-2">
              <Input placeholder="Name" value={empForm.name}
                onChange={e => setEmpForm(p => ({ ...p, name: e.target.value }))}
                className="h-9 text-xs rounded-xl flex-1" />
              <Input placeholder="Email" value={empForm.email}
                onChange={e => setEmpForm(p => ({ ...p, email: e.target.value }))}
                className="h-9 text-xs rounded-xl flex-1" />
              <Button type="button" variant="outline" size="sm" onClick={addEmployee}
                className="h-9 px-2 rounded-xl shrink-0">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {employees.map((e, i) => (
              <div key={i} className="flex items-center gap-2 text-xs bg-slate-50 rounded-lg px-2 py-1.5">
                <span className="flex-1 truncate">{e.name} · {e.email}</span>
                <button type="button" onClick={() => setEmployees(p => p.filter((_, j) => j !== i))}>
                  <X className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </div>
            ))}
          </div>

          <CustomEmailEditor
            variant="template"
            useCustom={useCustomEmailBody}
            onUseCustomChange={setUseCustomEmailBody}
            subject={customEmailSubject}
            onSubjectChange={setCustomEmailSubject}
            body={customEmailBody}
            onBodyChange={setCustomEmailBody}
            previewFn={(data) => templateApi.previewEmployeeEmail(data, template._id)}
            previewContext={{
              documentTitle: title.trim() || template.title,
              companyName:   template.companyName,
              companyLogo:   template.companyLogo,
              emailHeaderColor: template.emailHeaderColor,
              message: useCustomEmailBody ? '' : message.trim(),
            }}
          />

          {!useCustomEmailBody && (
            <div className="space-y-1.5">
              <Label className="text-xs">Optional note (default email)</Label>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                rows={2}
                className="w-full rounded-xl border border-slate-200 text-sm px-3 py-2 resize-none"
                placeholder="Optional note in every employee email…"
              />
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <Button variant="outline" onClick={onClose} disabled={submitting} className="flex-1 rounded-xl">
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting || !employees.length}
            className="flex-1 rounded-xl bg-[#28ABDF] hover:bg-[#2399c8] gap-2">
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Start Campaign
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
