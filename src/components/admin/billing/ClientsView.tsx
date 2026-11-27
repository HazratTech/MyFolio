"use client";

import React, { useState } from "react";
import {
  Plus,
  Users,
  Globe,
  Building2,
  Edit3,
  Trash2,
  X,
  Loader2,
  Mail,
} from "lucide-react";
import type { ClientRecord } from "./types";

interface ClientsViewProps {
  clients: ClientRecord[];
  onRefresh: () => void;
}

export default function ClientsView({ clients, onRefresh }: ClientsViewProps) {
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [legalName, setLegalName] = useState("");
  const [clientType, setClientType] = useState<"Company" | "Individual">(
    "Company"
  );
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState("United States");
  const [address, setAddress] = useState("");
  const [taxId, setTaxId] = useState("");
  const [discordHandle, setDiscordHandle] = useState("");
  const [agreementReference, setAgreementReference] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const openAdd = () => {
    setEditingId(null);
    setLegalName("");
    setClientType("Company");
    setEmail("");
    setCountry("United States");
    setAddress("");
    setTaxId("");
    setDiscordHandle("");
    setAgreementReference("");
    setNotes("");
    setShowModal(true);
  };

  const openEdit = (c: ClientRecord) => {
    setEditingId(c._id);
    setLegalName(c.legalName);
    setClientType(c.clientType || "Company");
    setEmail(c.email || "");
    setCountry(c.country);
    setAddress(c.address || "");
    setTaxId(c.taxId || "");
    setDiscordHandle(c.discordHandle || "");
    setAgreementReference(c.agreementReference || "");
    setNotes(c.notes || "");
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const isForeign =
        country.trim().toLowerCase() !== "india" &&
        country.trim().toLowerCase() !== "in";

      const payload = {
        legalName,
        clientType,
        email,
        country,
        address,
        taxId,
        discordHandle,
        agreementReference,
        notes,
        isForeign,
      };
      const res = await fetch(
        editingId
          ? `/api/admin/billing/clients/${editingId}`
          : "/api/admin/billing/clients",
        {
          method: editingId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json();
      if (data.success) {
        setShowModal(false);
        onRefresh();
      } else {
        alert(data.error || "Failed to save client");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (c: ClientRecord) => {
    if (!confirm(`Delete client ${c.legalName}?`)) return;
    const res = await fetch(`/api/admin/billing/clients/${c._id}`, {
      method: "DELETE",
    });
    const data = await res.json();
    if (data.success) onRefresh();
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200/90 bg-white p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            Clients Directory
          </h2>
          <p className="text-xs text-slate-500">
            Manage billing entities, countries (for automatic Export LUT
            classification), and contact handles.
          </p>
        </div>
        <button
          onClick={openAdd}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Client
        </button>
      </div>

      {clients.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
          <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-medium text-slate-700">
            No clients saved yet
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Add your first international or domestic client to issue invoices.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clients.map((c) => (
            <div
              key={c._id}
              className="rounded-xl border border-slate-200/90 bg-white p-5 flex flex-col justify-between shadow-[0_1px_2px_rgba(15,23,42,0.03)]"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                      {c.clientType === "Company" ? (
                        <Building2 className="w-4 h-4" />
                      ) : (
                        <Users className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900 leading-snug">
                        {c.legalName}
                      </h3>
                      <p className="text-xs text-slate-500">{c.country}</p>
                    </div>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                      c.isForeign
                        ? "bg-blue-50 text-blue-700 border-blue-200"
                        : "bg-slate-100 text-slate-700 border-slate-200"
                    }`}
                  >
                    <Globe className="w-2.5 h-2.5" />
                    {c.isForeign ? "Foreign Export" : "Domestic"}
                  </span>
                </div>

                {c.email && (
                  <p className="text-xs text-slate-600 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    {c.email}
                  </p>
                )}
                {c.address && (
                  <p className="text-xs text-slate-500 line-clamp-2">
                    {c.address}
                  </p>
                )}
                {c.discordHandle && (
                  <p className="text-xs font-mono text-slate-600">
                    Discord/TG: {c.discordHandle}
                  </p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-mono">
                  {c.taxId ? `Tax ID: ${c.taxId}` : c.clientType}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEdit(c)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(c)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-semibold text-slate-900">
                {editingId ? "Edit Client Profile" : "Add Client"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Legal / Client Name
                  </label>
                  <input
                    type="text"
                    required
                    value={legalName}
                    onChange={(e) => setLegalName(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Type
                  </label>
                  <select
                    value={clientType}
                    onChange={(e) =>
                      setClientType(e.target.value as "Company" | "Individual")
                    }
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white text-slate-900"
                  >
                    <option value="Company">Company</option>
                    <option value="Individual">Individual</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Billing Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="accounts@client.com"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    required
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="United States, UK, India..."
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Billing Address
                </label>
                <textarea
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white text-slate-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Tax ID / EIN / VAT (Optional)
                  </label>
                  <input
                    type="text"
                    value={taxId}
                    onChange={(e) => setTaxId(e.target.value)}
                    className="w-full px-3 py-2 text-sm font-mono rounded-lg border border-slate-200 bg-white text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Discord / Telegram Handle
                  </label>
                  <input
                    type="text"
                    value={discordHandle}
                    onChange={(e) => setDiscordHandle(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Agreement / Contract Link (Optional)
                </label>
                <input
                  type="text"
                  value={agreementReference}
                  onChange={(e) => setAgreementReference(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white text-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold disabled:opacity-60"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {editingId ? "Update Client" : "Save Client"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
