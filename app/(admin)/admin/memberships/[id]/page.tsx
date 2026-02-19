"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

const MEMBERSHIP_TYPES = [
  "Affiliate Member",
  "Associate Member",
  "Technical Member",
  "Professional Fellowship",
  "Professional Membership",
  "Honorary Fellowship",
];

export default function AdminMembershipReviewPage() {
  const { id } = useParams<{ id: string }>();

  const [app, setApp] = useState<any>(null);
  const [finalType, setFinalType] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/memberships/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setApp(data);

        const typeFromDb =
          data.approvedMembershipType || data.requestedMembershipType || "";

        // Ensure select value always matches one of the options
        setFinalType(MEMBERSHIP_TYPES.includes(typeFromDb) ? typeFromDb : "");

        setAdminNotes(data.adminNotes || "");
        setLoading(false);
      });
  }, [id]);

  async function approve() {
    setSaving(true);

    await fetch(`/api/admin/memberships/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: "approved",
        approvedMembershipType: finalType,
        adminNotes,
      }),
    });

    // Only generate certificate for new applications
    if (!app.isUpdateRequest) {
      await fetch(`/api/admin/memberships/${id}/certificate`, {
        method: "POST",
      });
    }

    // ✅ update UI immediately (so Status/Approved Type changes without refresh)
    setApp((prev: any) => ({
      ...prev,
      status: "approved",
      approvedMembershipType: finalType,
      adminNotes,
    }));

    setSaving(false);
    alert("Approved successfully");
  }

  async function reject() {
    setSaving(true);

    await fetch(`/api/admin/memberships/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: "rejected",
        adminNotes,
      }),
    });

    // ✅ update UI immediately
    setApp((prev: any) => ({
      ...prev,
      status: "rejected",
      adminNotes,
    }));

    setSaving(false);
    alert("Rejected successfully");
  }

  if (loading) return <p>Loading…</p>;
  if (!app) return <p>Not found</p>;

  return (
    <div className="max-w-4xl space-y-8">
      {/* HEADER */}
      <h1 className="text-2xl font-bold">
        {app.isUpdateRequest
          ? "Update Request Review"
          : "Membership Application Review"}
      </h1>

      {/* APPLICANT INFO */}
      <div className="bg-white border rounded-xl p-6 space-y-2">
        <p>
          <strong>Name:</strong> {app.fullName}
        </p>
        <p>
          <strong>Email:</strong> {app.email}
        </p>

        {/* Requested should NEVER change */}
        <p>
          <strong>Requested Type:</strong> {app.requestedMembershipType}
        </p>

        {/* ✅ show what admin approved/selected */}
        <p>
          <strong>Approved Type:</strong> {app.approvedMembershipType || "—"}
        </p>

        <p>
          <strong>Status:</strong> {app.status}
        </p>

        {app.isUpdateRequest && (
          <p className="text-yellow-600 font-semibold">
            This is an UPDATE request
          </p>
        )}
      </div>

      {/* DOCUMENTS */}
      <div className="bg-white border rounded-xl p-6 space-y-4">
        <h2 className="font-semibold">Submitted Documents</h2>

        {app.cvUrl && (
          <a
            href={`${app.cvUrl}?fl_attachment=false`}
            target="_blank"
            rel="noreferrer"
            className="text-blue-600 underline block"
          >
            View CV
          </a>
        )}

        {app.certificatesUrl?.map((url: string, i: number) => (
          <a
            key={i}
            href={`${url}?fl_attachment=false`}
            target="_blank"
            rel="noreferrer"
            className="text-blue-600 underline block"
          >
            View Certificate {i + 1}
          </a>
        ))}

        {app.paymentReceiptUrl && (
          <a
            href={`${app.paymentReceiptUrl}?fl_attachment=false`}
            target="_blank"
            rel="noreferrer"
            className="text-blue-600 underline block"
          >
            View Payment Receipt
          </a>
        )}

        {/* ZIP DOWNLOAD */}
        <div className="pt-4">
          <a
            href={`/api/admin/memberships/${app._id}/documents`}
            className="btn btn-outline"
          >
            Download All Documents (ZIP)
          </a>
        </div>
      </div>

      {/* APPROVAL CHECKLIST */}
      <div className="bg-slate-50 border rounded-lg p-4 space-y-2">
        <h3 className="font-semibold">Approval Checklist</h3>

        <label className="flex items-center gap-2">
          <input type="checkbox" checked={!!app.cvUrl} readOnly />
          CV reviewed
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={app.certificatesUrl?.length > 0}
            readOnly
          />
          Certificates reviewed
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={!!app.paymentReceiptUrl}
            readOnly
          />
          Payment receipt reviewed
        </label>
      </div>

      {/* FINAL DECISION */}
      <div className="bg-white border rounded-xl p-6 space-y-4">
        <select
          className="input w-full"
          value={finalType}
          onChange={(e) => setFinalType(e.target.value)}
        >
          <option value="" disabled>
            Select membership type
          </option>

          {MEMBERSHIP_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        <textarea
          className="input w-full h-24"
          placeholder="Admin notes"
          value={adminNotes}
          onChange={(e) => setAdminNotes(e.target.value)}
        />

        <div className="flex gap-4">
          <button
            onClick={approve}
            disabled={saving}
            className="btn btn-primary"
          >
            Approve
          </button>

          <button
            onClick={reject}
            disabled={saving}
            className="btn btn-outline"
          >
            Reject
          </button>
        </div>
      </div>
    </div>
  );
}