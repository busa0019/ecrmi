"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

function isValidUrl(u: string) {
  try {
    new URL(u);
    return true;
  } catch {
    return false;
  }
}

export default function CreateCoursePage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [durationMinutes, setDurationMinutes] = useState(30);
  const [passMark, setPassMark] = useState(70);

  // materials
  const [primaryMaterialUrl, setPrimaryMaterialUrl] = useState(""); // saved to pdfUrl (optional)
  const [materialLinkInput, setMaterialLinkInput] = useState("");
  const [materialUrls, setMaterialUrls] = useState<string[]>([]);

  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  /* ================= CLOUDINARY UPLOAD (same as membership) ================= */
  async function uploadFile(file: File) {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

    if (!cloudName) {
      throw new Error("Missing NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME");
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "ecrmi_unsigned");

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
      { method: "POST", body: formData }
    );

    const data = await res.json();

    if (!res.ok) {
      console.error("Cloudinary upload failed:", data);
      throw new Error(data?.error?.message || "Upload failed");
    }

    if (!data.secure_url) {
      console.error("Cloudinary response missing secure_url:", data);
      throw new Error("Upload failed");
    }

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

  async function submit() {
    setError("");
    setLoading(true);

    const res = await fetch("/api/admin/courses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description,
        durationMinutes,
        passMark,

        pdfUrl: primaryMaterialUrl, // optional
        materialUrls, // list (uploads + pasted links)
      }),
    });

    if (!res.ok) {
      setLoading(false);
      alert("Failed to create course");
      return;
    }

    router.push("/admin/courses");
    router.refresh();
  }

  return (
    <div className="max-w-3xl mx-auto w-full bg-white border rounded-xl p-6 sm:p-8 space-y-6 shadow-sm mt-4 sm:mt-8">
      <h1 className="text-2xl font-bold tracking-tight">Create New Course</h1>

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

      {/* Duration + Pass mark with labels */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">
            Duration (minutes)
          </label>
          <input
            type="number"
            min={1}
            className="w-full border rounded-lg px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-teal-500/60 focus:border-teal-500 transition"
            placeholder="e.g. 30"
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(Number(e.target.value))}
          />
          <p className="text-xs text-slate-500">
            Estimated time allowed for the assessment.
          </p>
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
            placeholder="e.g. 70"
            value={passMark}
            onChange={(e) => setPassMark(Number(e.target.value))}
          />
          <p className="text-xs text-slate-500">
            Minimum score required to pass (0–100).
          </p>
        </div>
      </div>

      {/* MATERIALS */}
      <div className="border rounded-xl p-4 space-y-4 bg-slate-50">
        <h2 className="font-semibold text-slate-800">Course Materials (optional)</h2>

        {/* Primary material url (optional) */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">
            Primary Material URL (optional)
          </label>
          <input
            className="w-full border rounded-lg px-3 py-2 text-sm sm:text-base bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/60 focus:border-teal-500 transition"
            placeholder="Paste a link or select one from the list below"
            value={primaryMaterialUrl}
            onChange={(e) => setPrimaryMaterialUrl(e.target.value)}
          />
          <p className="text-xs text-slate-500">
            This can be the main PDF/ZIP link you want to reference first.
          </p>
        </div>

        {/* Add link */}
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
            <button
              type="button"
              onClick={addLink}
              className="btn btn-outline"
            >
              Add
            </button>
          </div>
        </div>

        {/* Upload */}
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
          <p className="text-xs text-slate-500">
            Accepted: PDF, ZIP. Files are uploaded to Cloudinary.
          </p>
        </div>

        {/* Materials list */}
        {materialUrls.length > 0 && (
          <div className="bg-white border rounded-lg p-3 space-y-2">
            <p className="text-sm font-medium">
              Added materials: {materialUrls.length}
            </p>

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
          onClick={submit}
          disabled={loading || uploading}
          className="w-full sm:w-auto bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          {loading ? "Creating..." : "Create Course"}
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