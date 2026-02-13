"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function AdminMembershipsPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [updates, setUpdates] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/memberships")
      .then((res) => res.json())
      .then((res) => {
        const newApps = res.filter(
          (r: any) => !r.isUpdateRequest
        );

        const updateReqs = res.filter(
          (r: any) =>
            r.isUpdateRequest === true &&
            r.status === "pending"
        );

        setApplications(newApps);
        setUpdates(updateReqs);
        setLoading(false);
      });
  }, []);

  const filteredApps = applications.filter(
    (app) =>
      app.fullName
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      app.email
        .toLowerCase()
        .includes(search.toLowerCase())
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

      {/* MEMBERSHIP RECORDS */}
      <div>
        <h1 className="text-2xl font-bold mb-4">
          Membership Records
        </h1>

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
                  <td className="p-4">{app.fullName}</td>
                  <td className="p-4">{app.email}</td>
                  <td className="p-4">
                    {app.requestedMembershipType}
                  </td>
                  <td className="p-4 capitalize">
                    {app.status}
                  </td>
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
            </tbody>
          </table>
        </div>
      </div>

      {/* UPDATE REQUESTS */}
      <div>
        <h1 className="text-2xl font-bold mb-4">
          Pending Update Requests
        </h1>

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
                  <td className="p-4">{app.fullName}</td>
                  <td className="p-4">{app.email}</td>
                  <td className="p-4">
                    {app.requestedMembershipType}
                  </td>
                  <td className="p-4 capitalize">
                    {app.status}
                  </td>
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
            </tbody>
          </table>
        </div>
      </div>

      {/* CSV UPLOAD RESTORED */}
      <div className="bg-white border rounded-xl p-6">
        <h3 className="font-semibold mb-2">
          Bulk Upload Existing Members
        </h3>

        <input
          type="file"
          accept=".csv"
          onChange={async (e) => {
            if (!e.target.files?.[0]) return;
            const formData = new FormData();
            formData.append("file", e.target.files[0]);

            await fetch("/api/admin/memberships/bulk-upload", {
              method: "POST",
              body: formData,
            });

            alert("Upload complete");
            location.reload();
          }}
        />
      </div>

    </div>
  );
}