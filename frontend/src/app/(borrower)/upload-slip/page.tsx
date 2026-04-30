"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useLoan } from "@/hooks/useLoan";

const maxSize = 5 * 1024 * 1024;

const isAllowedType = (file: File): boolean => {
  const allowed = ["application/pdf", "image/jpg", "image/jpeg", "image/png"];
  return allowed.includes(file.type);
};

export default function UploadSlipPage(): JSX.Element {
  const router = useRouter();
  const loan = useLoan();

  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const details = useMemo(() => {
    if (!file) return null;
    const kb = Math.round((file.size / 1024) * 10) / 10;
    return `${file.name} (${kb} KB)`;
  }, [file]);

  const validate = (f: File): string | null => {
    if (!isAllowedType(f)) {
      return "Only PDF, JPG, JPEG, PNG files are allowed";
    }
    if (f.size > maxSize) {
      return "Max file size is 5MB";
    }
    return null;
  };

  const onPick = (f: File | null) => {
    if (!f) {
      setFile(null);
      return;
    }
    const msg = validate(f);
    if (msg) {
      setError(msg);
      setFile(null);
      return;
    }
    setError(null);
    setFile(f);
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    onPick(f ?? null);
  };

  const onSubmit = async () => {
    if (!file) {
      setError("Please select a file");
      return;
    }
    setError(null);
    try {
      await loan.uploadSlip(file);
      router.replace("/loan-config");
    } catch {
      setError("Upload failed");
    }
  };

  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-4 sm:p-6 lg:p-8 shadow-sm">
      <div className="mb-4 sm:mb-6">
        <h1 className="font-h3 text-h3 sm:font-h2 sm:text-h2 text-on-surface flex items-center gap-2 sm:gap-3">
          <span
            className="material-symbols-outlined text-primary text-lg sm:text-xl"
            style={{ fontVariationSettings: '"FILL" 1' }}
          >
            upload_file
          </span>
          Upload Salary Slip
        </h1>
        <p className="mt-1 sm:mt-2 font-body-sm sm:font-body-md text-body-sm sm:text-body-md text-on-surface-variant">
          Upload your salary slip to proceed
        </p>
      </div>

      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        className="flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-outline-variant bg-surface-container px-3 py-8 sm:px-4 sm:py-10 text-center"
      >
        <span
          className="material-symbols-outlined text-primary mb-3 text-2xl sm:text-3xl"
          style={{ fontVariationSettings: '"FILL" 0' }}
        >
          cloud_upload
        </span>
        <div className="font-label-sm sm:font-label-md text-label-sm sm:text-label-md text-on-surface">
          Drag and drop your file here
        </div>
        <div className="mt-1 font-body-xs sm:font-body-sm text-body-xs sm:text-body-sm text-on-surface-variant">
          PDF/JPG/PNG up to 5MB
        </div>
        <label className="mt-4 sm:mt-5">
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            className="hidden"
            onChange={(e) => onPick(e.target.files?.[0] ?? null)}
          />
          <span className="inline-flex cursor-pointer items-center justify-center rounded-lg bg-surface-container-lowest text-primary border border-outline-variant hover:bg-surface-container hover:text-on-surface px-3 py-2 sm:px-4 font-label-sm sm:font-label-md text-label-sm sm:text-label-md transition-colors">
            Choose File
          </span>
        </label>
      </div>

      {details ? (
        <div className="mt-3 sm:mt-4 bg-primary-container text-on-primary-container border-l-4 border-primary p-3 rounded-r">
          <div className="flex items-start gap-2">
            <span
              className="material-symbols-outlined mt-0.5 text-sm"
              style={{ fontVariationSettings: '"FILL" 1' }}
            >
              check_circle
            </span>
            <span className="font-body-sm text-body-sm">{details}</span>
          </div>
        </div>
      ) : null}
      {error ? (
        <div className="mt-3 sm:mt-4 bg-error-container text-on-error-container border-l-4 border-error p-3 rounded-r">
          <div className="flex items-start gap-2">
            <span
              className="material-symbols-outlined mt-0.5 text-sm"
              style={{ fontVariationSettings: '"FILL" 1' }}
            >
              error
            </span>
            <span className="font-body-sm text-body-sm">{error}</span>
          </div>
        </div>
      ) : null}

      <div className="mt-4 sm:mt-6 flex flex-col gap-2 sm:gap-3 lg:flex-row lg:items-center lg:justify-end">
        <Button
          variant="secondary"
          type="button"
          onClick={() => router.replace("/personal-details")}
        >
          Back
        </Button>
        <Button type="button" onClick={onSubmit} isLoading={loan.isLoading}>
          Upload and Continue
        </Button>
      </div>
    </div>
  );
}
