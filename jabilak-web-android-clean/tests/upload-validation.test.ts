import { describe, expect, it } from "vitest";
import { MAX_POST_PHOTOS, MAX_REEL_VIDEO_BYTES, validateMediaSelection, validateUpload } from "../lib/data/upload-validation";

describe("validateUpload", () => {
  it("accepts an allowed image", () => {
    expect(validateUpload({ kind: "image", name: "logo.png", mimeType: "image/png", sizeBytes: 1200 })).toEqual({ valid: true, extension: "png" });
  });

  it("rejects an unsupported type", () => {
    expect(validateUpload({ kind: "image", mimeType: "image/svg+xml", sizeBytes: 1200 })).toMatchObject({ valid: false, code: "invalid_type" });
  });

  it("rejects an oversized video", () => {
    expect(validateUpload({ kind: "video", mimeType: "video/mp4", sizeBytes: 81 * 1024 * 1024 })).toMatchObject({ valid: false, code: "invalid_size" });
  });

  it("rejects unsafe file names", () => {
    expect(validateUpload({ kind: "document", name: "../../secret.pdf", mimeType: "application/pdf", sizeBytes: 1000 })).toMatchObject({ valid: false, code: "invalid_name" });
  });
});

describe("validateMediaSelection", () => {
  const photo = { kind: "photo" as const, sizeBytes: 1024 };
  const video = { kind: "video" as const, sizeBytes: 5 * 1024 * 1024 };

  it("accepts up to ten photos for a post", () => {
    expect(validateMediaSelection("post", Array.from({ length: MAX_POST_PHOTOS - 1 }, () => photo), [photo])).toEqual({ valid: true });
  });

  it("blocks the eleventh photo with the exact Arabic limit message", () => {
    expect(validateMediaSelection("post", Array.from({ length: MAX_POST_PHOTOS }, () => photo), [photo])).toMatchObject({ valid: false, code: "photo_limit", message: "وصلت للحد الأقصى (10 صور فقط للمنشور الواحد)" });
  });

  it("allows only one reel video and enforces 10MB", () => {
    expect(validateMediaSelection("video", [], [video])).toEqual({ valid: true });
    expect(validateMediaSelection("video", [], [{ kind: "video", sizeBytes: MAX_REEL_VIDEO_BYTES + 1 }])).toMatchObject({ valid: false, code: "video_size" });
    expect(validateMediaSelection("video", [video], [video])).toMatchObject({ valid: false, code: "video_limit" });
  });

  it("does not mix a video with post photos", () => {
    expect(validateMediaSelection("post", [photo], [video])).toMatchObject({ valid: false, code: "video_limit" });
  });
});
