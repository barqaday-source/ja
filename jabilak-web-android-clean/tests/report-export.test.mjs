import * as XLSX from "xlsx";
import { describe, expect, it } from "vitest";

describe("report export workbook", () => {
  it("creates a valid XLSX workbook with report rows", () => {
    const rows = [["الفترة", "هذا الشهر"], ["إجمالي المبيعات", 12850000], ["الأرباح", 4320000]];
    const sheet = XLSX.utils.aoa_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, sheet, "التقرير");
    const base64 = XLSX.write(workbook, { bookType: "xlsx", type: "base64" });
    const bytes = Uint8Array.from(Buffer.from(base64, "base64"));
    expect(bytes.slice(0, 2)[0]).toBe(80);
    expect(bytes.slice(0, 2)[1]).toBe(75);
    expect(bytes.byteLength).toBeGreaterThan(500);
  });
});
