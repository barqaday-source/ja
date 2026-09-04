export type UploadKind = "image" | "video" | "document";

export type UploadValidationInput = {
  kind: UploadKind;
  name?: string;
  mimeType?: string;
  sizeBytes: number;
};

export type UploadValidationResult =
  | { valid: true; extension: string }
  | { valid: false; code: "missing_type" | "invalid_type" | "invalid_size" | "invalid_name"; message: string };

const RULES: Record<UploadKind, { mimeTypes: readonly string[]; maxBytes: number; label: string }> = {
  image: { mimeTypes: ["image/jpeg", "image/png", "image/webp"], maxBytes: 8 * 1024 * 1024, label: "الصورة" },
  video: { mimeTypes: ["video/mp4", "video/quicktime", "video/webm"], maxBytes: 80 * 1024 * 1024, label: "الفيديو" },
  document: { mimeTypes: ["application/pdf"], maxBytes: 12 * 1024 * 1024, label: "المستند" },
};

const SAFE_FILE_NAME = /^[\p{L}\p{N}._-]+$/u;

export function validateUpload(input: UploadValidationInput): UploadValidationResult {
  const rule = RULES[input.kind];
  const mimeType = input.mimeType?.trim().toLowerCase();

  if (!mimeType) return { valid: false, code: "missing_type", message: `تعذر تحديد نوع ${rule.label}.` };
  if (!rule.mimeTypes.includes(mimeType)) return { valid: false, code: "invalid_type", message: `نوع ${rule.label} غير مسموح.` };
  if (!Number.isFinite(input.sizeBytes) || input.sizeBytes <= 0 || input.sizeBytes > rule.maxBytes) {
    return { valid: false, code: "invalid_size", message: `حجم ${rule.label} يتجاوز الحد المسموح.` };
  }
  if (input.name && !SAFE_FILE_NAME.test(input.name)) {
    return { valid: false, code: "invalid_name", message: "اسم الملف يحتوي رموزاً غير مسموحة." };
  }

  const extension = mimeType.split("/")[1] === "quicktime" ? "mov" : mimeType.split("/")[1];
  return { valid: true, extension };
}

export const uploadRules = RULES;

export type PublishKind = "product" | "post" | "video";
export type MediaAssetKind = "photo" | "video";
export type MediaAssetInput = { kind: MediaAssetKind; sizeBytes?: number };
export type MediaSelectionValidation =
  | { valid: true }
  | { valid: false; code: "photo_limit" | "video_limit" | "video_size"; message: string };

export const MAX_POST_PHOTOS = 10;
export const MAX_REEL_VIDEO_BYTES = 10 * 1024 * 1024;

export function validateMediaSelection(
  publishKind: PublishKind,
  current: readonly MediaAssetInput[],
  incoming: readonly MediaAssetInput[],
): MediaSelectionValidation {
  if (!incoming.length) return { valid: true };

  const all = [...current, ...incoming];
  const videos = all.filter((asset) => asset.kind === "video");
  const photos = all.filter((asset) => asset.kind === "photo");

  if (videos.some((asset) => asset.sizeBytes !== undefined && asset.sizeBytes > MAX_REEL_VIDEO_BYTES)) {
    return { valid: false, code: "video_size", message: "حجم فيديو الريلز يجب ألا يتجاوز 10MB." };
  }

  if (publishKind === "video") {
    if (videos.length > 1 || photos.length > 0) {
      return { valid: false, code: "video_limit", message: "يمكن إضافة فيديو واحد فقط للريلز." };
    }
    return { valid: true };
  }

  if (videos.length > 0 && (videos.length > 1 || photos.length > 0)) {
    return { valid: false, code: "video_limit", message: "المنتج أو المنشور يقبل 10 صور أو فيديو واحد فقط." };
  }
  if (photos.length > MAX_POST_PHOTOS) {
    return { valid: false, code: "photo_limit", message: "وصلت للحد الأقصى (10 صور فقط للمنشور الواحد)" };
  }
  return { valid: true };
}
