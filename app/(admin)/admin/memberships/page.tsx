"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type LastImportInfo = {
  importTag: string;
  created: number;
  skipped: number;
  at: string; // ISO
};

export default function AdminMembershipsPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [updates, setUpdates] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [lastImport, setLastImport] = useState<LastImportInfo | null>(null);

  const lower = (v: any) => String(v ?? "").toLowerCase();

  async function loadAll() {
    setLoading(true);
    try {
      const [appsRes, membersRes] = await Promise.all([
        fetch("/api/admin/memberships"),
        fetch("/api/admin/members"),
      ]);

      const apps = await appsRes.json();
      const mems = await membersRes.json();

      const newApps = apps.filter((r: any) => !r.isUpdateRequest);
      const updateReqs = apps.filter(
        (r: any) => r.isUpdateRequest === true && r.status === "pending"
      );

      setApplications(newApps);
      setUpdates(updateReqs);
      setMembers(Array.isArray(mems) ? mems : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // Load last import info for Undo button
    const saved = localStorage.getItem("ecrmi_lastImport");
    if (saved) {
      try {
        setLastImport(JSON.parse(saved));
      } catch {}
    }

    loadAll();
  }, []);

  const filteredApps = applications.filter(
    (app) =>
      lower(app.fullName).includes(lower(search)) ||
      lower(app.email).includes(lower(search))
  );

  const filteredMembers = members.filter(
    (m) =>
      lower(m.fullName).includes(lower(search)) ||
      lower(m.email).includes(lower(search)) ||
      lower(m.certificateId).includes(lower(search))
  );

  if (loading) return <p>Loading...</p>;

  return (
    <div className="space-y-10">
      {/* SEARCH */}
      <input
        className="input"
        placeholder="Search name or email..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* MEMBERSHIP APPLICATION RECORDS */}
      <div>
        <h1 className="text-2xl font-bold mb-4">Membership Records</h1>

        <Link
          href="/api/admin/memberships/export"
          className="btn btn-outline mb-4 inline-block"
        >
          Export CSV
        </Link>

        <div className="bg-white border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4 text-left">Name</th>
                <th className="p-4 text-left">Email</th>
                <th className="p-4 text-left">Membership</th>
                <th className="p-4 text-left">Status</th>
                <th className="p-4 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredApps.map((app) => (
                <tr key={app._id} className="border-b">
                  <td className="p-4">{app.fullName || "—"}</td>
                  <td className="p-4">{app.email || "—"}</td>
                  <td className="p-4">{app.requestedMembershipType || "—"}</td>
                  <td className="p-4 capitalize">{app.status || "—"}</td>
                  <td className="p-4">
                    <Link
                      href={`/admin/memberships/${app._id}`}
                      className="text-blue-600 underline"
                    >
                      Review
                    </Link>
                  </td>
                </tr>
              ))}
              {filteredApps.length === 0 && (
                <tr>
                  <td className="p-4 text-gray-500" colSpan={5}>
                    No records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* UPDATE REQUESTS */}
      <div>
        <h1 className="text-2xl font-bold mb-4">Pending Update Requests</h1>

        <div className="bg-white border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4 text-left">Name</th>
                <th className="p-4 text-left">Email</th>
                <th className="p-4 text-left">Membership</th>
                <th className="p-4 text-left">Status</th>
                <th className="p-4 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {updates.map((app) => (
                <tr key={app._id} className="border-b bg-yellow-50">
                  <td className="p-4">{app.fullName || "—"}</td>
                  <td className="p-4">{app.email || "—"}</td>
                  <td className="p-4">{app.requestedMembershipType || "—"}</td>
                  <td className="p-4 capitalize">{app.status || "—"}</td>
                  <td className="p-4">
                    <Link
                      href={`/admin/memberships/${app._id}`}
                      className="text-blue-600 underline"
                    >
                      Review Update
                    </Link>
                  </td>
                </tr>
              ))}
              {updates.length === 0 && (
                <tr>
                  <td className="p-4 text-gray-500" colSpan={5}>
                    No pending update requests.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CSV UPLOAD + UNDO LAST IMPORT */}
      <div className="bg-white border rounded-xl p-6 space-y-3">
        <h3 className="font-semibold mb-2">Bulk Upload Existing Members</h3>

        <input
          type="file"
          accept=".csv"
          onChange={async (e) => {
            if (!e.target.files?.[0]) return;

            const formData = new FormData();
            formData.append("file", e.target.files[0]);

            const res = await fetch("/api/admin/memberships/bulk-upload", {
              method: "POST",
              body: formData,
            });

            const data = await res.json();

            if (!res.ok) {
              alert(data?.error || "Upload failed");
              return;
            }

            const info: LastImportInfo = {
              importTag: String(data.importTag || ""),
              created: Number(data.created || 0),
              skipped: Number(data.skipped || 0),
              at: new Date().toISOString(),
            };

            localStorage.setItem("ecrmi_lastImport", JSON.stringify(info));
            setLastImport(info);

            alert(`Upload complete.\nCreated: ${info.created}\nSkipped: ${info.skipped}`);

            await loadAll();
            e.currentTarget.value = "";
          }}
        />

        {lastImport && (
          <div className="text-sm text-slate-600 space-y-2">
            <p>
              <strong>Last CSV import:</strong>{" "}
              {new Date(lastImport.at).toLocaleString()} —{" "}
              <strong>{lastImport.created}</strong> imported
            </p>

            <button
              className="btn btn-outline"
              onClick={async () => {
                const ok = confirm(
                  `Undo last CSV import?\n\nThis will delete ${lastImport.created} imported record(s).`
                );
                if (!ok) return;

                const res = await fetch("/api/admin/memberships/bulk-delete", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ importTag: lastImport.importTag }),
                });

                const data = await res.json();

                if (!res.ok) {
                  alert(data?.error || "Undo failed");
                  return;
                }

                alert(`Deleted ${data.deleted} record(s).`);

                localStorage.removeItem("ecrmi_lastImport");
                setLastImport(null);

                await loadAll();
              }}
            >
              Undo Last CSV Import
            </button>
          </div>
        )}
      </div>

      {/* MEMBERS LIST (new) */}
      <div>
        <h1 className="text-2xl font-bold mb-4">
          Members (from Members collection)
        </h1>

        <div className="bg-white border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4 text-left">Name</th>
                <th className="p-4 text-left">Email</th>
                <th className="p-4 text-left">Membership</th>
                <th className="p-4 text-left">Certificate ID</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map((m) => (
                <tr key={m._id} className="border-b">
                  <td className="p-4">{m.fullName || "—"}</td>
                  <td className="p-4">{m.email || "—"}</td>
                  <td className="p-4">{m.membershipType || "—"}</td>
                  <td className="p-4">{m.certificateId || m.memberId || "—"}</td>
                </tr>
              ))}

              {filteredMembers.length === 0 && (
                <tr>
                  <td className="p-4 text-gray-500" colSpan={4}>
                    No members found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}