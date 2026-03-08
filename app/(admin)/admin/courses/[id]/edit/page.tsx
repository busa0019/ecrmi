"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

function isValidUrl(u: string) {
  try {
    new URL(u);
    return true;
  } catch {
    return false;
  }
}

export default function EditCoursePage() {
  const router = useRouter();
  const params = useParams();

  const id =
    typeof params.id === "string"
      ? params.id
      : Array.isArray(params.id)
      ? params.id[0]
      : "";

  const [initialLoading, setInitialLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [durationMinutes, setDurationMinutes] = useState(30);
  const [passMark, setPassMark] = useState(70);

  const [primaryMaterialUrl, setPrimaryMaterialUrl] = useState("");
  const [materialLinkInput, setMaterialLinkInput] = useState("");
  const [materialUrls, setMaterialUrls] = useState<string[]>([]);

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  /* ================= CLOUDINARY UPLOAD (same as create) ================= */
  async function uploadFile(file: File) {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    if (!cloudName) throw new Error("Missing NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "ecrmi_unsigned");

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
      { method: "POST", body: formData }
    );

    const data = await res.json();

    if (!res.ok) throw new Error(data?.error?.message || "Upload failed");
    if (!data.secure_url) throw new Error("Upload failed");

    return data.secure_url as string;
  }

  function addLink() {
    setError("");
    const link = materialLinkInput.trim();
    if (!link) return;

    if (!isValidUrl(link)) {
      setError("Please enter a valid URL (including https://)");
      return;
    }

    setMaterialUrls((prev) => (prev.includes(link) ? prev : [...prev, link]));
    setMaterialLinkInput("");
  }

  function removeMaterial(url: string) {
    setMaterialUrls((prev) => prev.filter((u) => u !== url));
    if (primaryMaterialUrl === url) setPrimaryMaterialUrl("");
  }

  /* ================= LOAD EXISTING COURSE ================= */
  useEffect(() => {
    if (!id) return;

    (async () => {
      setInitialLoading(true);
      const res = await fetch(`/api/admin/courses/${id}`, { cache: "no-store" as any });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data?.error || "Failed to load course");
        setInitialLoading(false);
        return;
      }

      setTitle(data.title || "");
      setDescription(data.description || "");
      setDurationMinutes(Number(data.durationMinutes ?? 30));
      setPassMark(Number(data.passMark ?? 70));
      setPrimaryMaterialUrl(data.pdfUrl || "");
      setMaterialUrls(Array.isArray(data.materialUrls) ? data.materialUrls : []);

      setInitialLoading(false);
    })();
  }, [id]);

  /* ================= SAVE ================= */
  async function save() {
    setError("");
    setSaving(true);

    const res = await fetch(`/api/admin/courses/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description,
        durationMinutes,
        passMark,
        pdfUrl: primaryMaterialUrl,
        materialUrls,
      }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      setSaving(false);
      setError(data?.error || "Failed to update course");
      return;
    }

    router.push("/admin/courses");
    router.refresh();
  }

  if (initialLoading) {
    return (
      <div className="max-w-3xl mx-auto w-full bg-white border rounded-xl p-6 sm:p-8 mt-4 sm:mt-8">
        <p className="text-sm text-slate-600">Loading course...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto w-full bg-white border rounded-xl p-6 sm:p-8 space-y-6 shadow-sm mt-4 sm:mt-8">
      <h1 className="text-2xl font-bold tracking-tight">Edit Course</h1>

      <input
        className="w-full border rounded-lg px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-teal-500/60 focus:border-teal-500 transition"
        placeholder="Course title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <textarea
        className="w-full border rounded-lg px-3 py-2 text-sm sm:text-base min-h-[120px] resize-y focus:outline-none focus:ring-2 focus:ring-teal-500/60 focus:border-teal-500 transition"
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">
            Duration (minutes)
          </label>
          <input
            type="number"
            min={1}
            className="w-full border rounded-lg px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-teal-500/60 focus:border-teal-500 transition"
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(Number(e.target.value))}
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">
            Pass Mark (%)
          </label>
          <input
            type="number"
            min={0}
            max={100}
            className="w-full border rounded-lg px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-teal-500/60 focus:border-teal-500 transition"
            value={passMark}
            onChange={(e) => setPassMark(Number(e.target.value))}
          />
        </div>
      </div>

      <div className="border rounded-xl p-4 space-y-4 bg-slate-50">
        <h2 className="font-semibold text-slate-800">Course Materials (optional)</h2>

        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">
            Primary Material URL (optional)
          </label>
          <input
            className="w-full border rounded-lg px-3 py-2 text-sm sm:text-base bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/60 focus:border-teal-500 transition"
            value={primaryMaterialUrl}
            onChange={(e) => setPrimaryMaterialUrl(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">
            Add Material Link
          </label>
          <div className="flex gap-2">
            <input
              className="flex-1 border rounded-lg px-3 py-2 text-sm sm:text-base bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/60 focus:border-teal-500 transition"
              placeholder="https://..."
              value={materialLinkInput}
              onChange={(e) => setMaterialLinkInput(e.target.value)}
            />
            <button type="button" onClick={addLink} className="btn btn-outline">
              Add
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">
            Upload PDF/ZIP (multiple allowed)
          </label>
          <input
            type="file"
            multiple
            accept=".pdf,.zip"
            className="input w-full bg-white"
            disabled={uploading}
            onChange={async (e) => {
              const input = e.currentTarget;
              const files = Array.from(input.files || []);
              if (!files.length) return;

              setError("");
              setUploading(true);
              try {
                const urls = await Promise.all(files.map(uploadFile));
                setMaterialUrls((prev) => [...prev, ...urls]);
              } catch (err: any) {
                setError(err?.message || "Upload failed");
              } finally {
                setUploading(false);
                input.value = "";
              }
            }}
          />
        </div>

        {materialUrls.length > 0 && (
          <div className="bg-white border rounded-lg p-3 space-y-2">
            <p className="text-sm font-medium">Added materials: {materialUrls.length}</p>

            <ul className="space-y-2">
              {materialUrls.map((url, idx) => (
                <li key={url + idx} className="flex items-center justify-between gap-3">
                  <a
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-blue-600 underline truncate"
                  >
                    {url}
                  </a>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={() => setPrimaryMaterialUrl(url)}
                      title="Set as primary"
                    >
                      Set Primary
                    </button>

                    <button
                      type="button"
                      className="text-sm text-red-600 hover:underline"
                      onClick={() => removeMaterial(url)}
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>

      <div className="flex flex-col-reverse sm:flex-row gap-3 sm:items-center">
        <button
          onClick={save}
          disabled={saving || uploading}
          className="w-full sm:w-auto bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>

        <button
          onClick={() => router.push("/admin/courses")}
          className="w-full sm:w-auto border px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}