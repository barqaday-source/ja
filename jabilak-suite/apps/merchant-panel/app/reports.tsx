import { useState } from "react";
import { Alert, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import * as FileSystem from "expo-file-system/legacy";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import * as XLSX from "xlsx";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import Svg, { Circle, Defs, Line, LinearGradient, Path, Polyline, Rect, Stop, Text as SvgText } from "react-native-svg";

import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";

type Period = "اليوم" | "هذا الأسبوع" | "هذا الشهر" | "هذه السنة" | "فترة مخصصة";
type ExportFormat = "pdf" | "xlsx" | "sheets";
type ReportData = {
  sales: number;
  orders: number;
  customers: number;
  views: number;
  products: number;
  profit: number;
  chart: number[];
  labels: string[];
  topProduct: string;
  topProductSales: number;
  lowProduct: string;
  lowProductSales: number;
  lowStock: string;
  lowStockCount: number;
  newCustomers: number;
  repeatCustomers: number;
  purchaseRate: number;
  adViews: number;
  clicks: number;
  conversions: number;
  adSpend: number;
  campaign: string;
};

const PALETTE = { aero: "#81B7EC", plummy: "#655B77", plumIsland: "#443C50", riverStyx: "#1A1821" };
const PERIODS: Period[] = ["اليوم", "هذا الأسبوع", "هذا الشهر", "هذه السنة", "فترة مخصصة"];

// Local report snapshots keep the UI dynamic until the analytics source is connected.
const REPORTS: Record<Period, ReportData> = {
  "اليوم": { sales: 485000, orders: 12, customers: 8, views: 1240, products: 86, profit: 162000, chart: [18, 34, 27, 45, 52, 66, 60], labels: ["8ص", "10ص", "12م", "2م", "4م", "6م", "8م"], topProduct: "قميص كلاسيك", topProductSales: 34, lowProduct: "حزام جلدي", lowProductSales: 2, lowStock: "جاكيت رسمي", lowStockCount: 4, newCustomers: 8, repeatCustomers: 5, purchaseRate: 42, adViews: 3200, clicks: 184, conversions: 28, adSpend: 45000, campaign: "تشكيلة الشتاء" },
  "هذا الأسبوع": { sales: 3240000, orders: 74, customers: 48, views: 8420, products: 86, profit: 1090000, chart: [30, 48, 42, 60, 54, 76, 88], labels: ["السبت", "الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"], topProduct: "قميص كلاسيك", topProductSales: 182, lowProduct: "حزام جلدي", lowProductSales: 13, lowStock: "جاكيت رسمي", lowStockCount: 4, newCustomers: 48, repeatCustomers: 31, purchaseRate: 38, adViews: 21400, clicks: 1240, conversions: 176, adSpend: 180000, campaign: "أناقتك تبدأ من هنا" },
  "هذا الشهر": { sales: 12850000, orders: 286, customers: 172, views: 38400, products: 86, profit: 4320000, chart: [44, 59, 48, 72, 64, 84, 76, 96], labels: ["1", "5", "10", "15", "20", "25", "28", "30"], topProduct: "قميص كلاسيك", topProductSales: 684, lowProduct: "حزام جلدي", lowProductSales: 45, lowStock: "جاكيت رسمي", lowStockCount: 4, newCustomers: 172, repeatCustomers: 94, purchaseRate: 44, adViews: 98400, clicks: 6130, conversions: 892, adSpend: 620000, campaign: "عروض نهاية الموسم" },
  "هذه السنة": { sales: 146800000, orders: 3620, customers: 1840, views: 480000, products: 86, profit: 49200000, chart: [22, 35, 44, 38, 57, 66, 76, 91], labels: ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس"], topProduct: "قميص كلاسيك", topProductSales: 3420, lowProduct: "حزام جلدي", lowProductSales: 214, lowStock: "جاكيت رسمي", lowStockCount: 4, newCustomers: 1840, repeatCustomers: 1120, purchaseRate: 47, adViews: 1240000, clicks: 78400, conversions: 11240, adSpend: 8200000, campaign: "حملة العلامة التجارية" },
  "فترة مخصصة": { sales: 6280000, orders: 132, customers: 86, views: 17600, products: 86, profit: 2110000, chart: [28, 51, 45, 68, 59, 79, 72], labels: ["اليوم 1", "اليوم 5", "اليوم 10", "اليوم 15", "اليوم 20", "اليوم 25", "اليوم 30"], topProduct: "قميص كلاسيك", topProductSales: 330, lowProduct: "حزام جلدي", lowProductSales: 21, lowStock: "جاكيت رسمي", lowStockCount: 4, newCustomers: 86, repeatCustomers: 48, purchaseRate: 41, adViews: 48200, clicks: 2960, conversions: 412, adSpend: 310000, campaign: "حملة مخصصة" },
};

const formatPrice = (value: number) => `${value.toLocaleString("en-US")} د.ع`;
const formatNumber = (value: number) => value.toLocaleString("en-US");

export default function ReportsScreen() {
  const colors = useColors();
  const router = useRouter();
  const [period, setPeriod] = useState<Period>("هذا الشهر");
  const [reportModal, setReportModal] = useState(false);
  const [exportModal, setExportModal] = useState(false);
  const [exporting, setExporting] = useState<ExportFormat | null>(null);
  const data = REPORTS[period];

  const reportRows = () => [
    ["الفترة", period], ["إجمالي المبيعات", data.sales], ["الأرباح", data.profit], ["عدد الطلبات", data.orders],
    ["عدد العملاء", data.customers], ["عدد المشاهدات", data.views], ["عدد المنتجات", data.products], ["معدل الشراء %", data.purchaseRate],
    ["مشاهدات الإعلانات", data.adViews], ["نقرات الإعلانات", data.clicks], ["تحويلات الإعلانات", data.conversions], ["الإنفاق الإعلاني", data.adSpend],
    ["الأكثر مبيعاً", data.topProduct], ["الأقل مبيعاً", data.lowProduct], ["المنتج الذي أوشك على النفاد", data.lowStock], ["الحملة", data.campaign],
  ] as [string, string | number][];

  const downloadWebFile = (bytes: BlobPart, mime: string, filename: string) => {
    const url = URL.createObjectURL(new Blob([bytes], { type: mime }));
    const anchor = document.createElement("a"); anchor.href = url; anchor.download = filename; anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const exportExcel = async () => {
    const sheet = XLSX.utils.aoa_to_sheet([["تقرير تاجر - شركة الأناقة"], ["الفترة", period], [], ...reportRows()]);
    sheet["!cols"] = [{ wch: 30 }, { wch: 28 }];
    const workbook = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(workbook, sheet, "التقرير");
    const base64 = XLSX.write(workbook, { bookType: "xlsx", type: "base64" });
    if (Platform.OS === "web") {
      const bytes = Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));
      downloadWebFile(bytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", `jabilak-report-${Date.now()}.xlsx`);
      return;
    }
    const path = `${FileSystem.cacheDirectory}jabilak-report-${Date.now()}.xlsx`;
    await FileSystem.writeAsStringAsync(path, base64, { encoding: FileSystem.EncodingType.Base64 });
    await Sharing.shareAsync(path, { mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", dialogTitle: `تقرير ${period}` });
  };

  const exportGoogleSheets = async () => {
    const csv = "\\uFEFF" + reportRows().map(([label, value]) => `${JSON.stringify(label)},${JSON.stringify(value)}`).join("\\n");
    if (Platform.OS === "web") { downloadWebFile(csv, "text/csv;charset=utf-8", `jabilak-report-${Date.now()}.csv`); return; }
    const path = `${FileSystem.cacheDirectory}jabilak-report-${Date.now()}.csv`;
    await FileSystem.writeAsStringAsync(path, csv, { encoding: FileSystem.EncodingType.UTF8 });
    await Sharing.shareAsync(path, { mimeType: "text/csv", dialogTitle: "استيراد التقرير إلى Google Sheets" });
  };

  const exportPdf = async () => {
    const rows = reportRows().map(([label, value]) => `<tr><td>${label}</td><td>${value}</td></tr>`).join("");
    const html = `<!doctype html><html dir="rtl"><head><meta charset="utf-8"><style>body{font-family:Arial,sans-serif;color:#111827;padding:32px}h1{color:#111827;margin-bottom:4px}p{color:#4b5563}table{border-collapse:collapse;width:100%;margin-top:24px}td{border:1px solid #d1d5db;padding:12px;text-align:right}td:first-child{font-weight:700;background:#f4f5f7;width:42%}header{border-bottom:4px solid #C26243;padding-bottom:16px}</style></head><body><header><h1>تقرير تاجر</h1><p>المتجر · ${period}</p></header><table>${rows}</table></body></html>`;
    if (Platform.OS === "web") {
      const printWindow = window.open("", "_blank", "width=900,height=700");
      if (!printWindow) throw new Error("popup-blocked");
      printWindow.document.write(html); printWindow.document.close(); printWindow.focus();
      setTimeout(() => printWindow.print(), 250);
      return;
    }
    const result = await Print.printToFileAsync({ html });
    if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(result.uri, { mimeType: "application/pdf", dialogTitle: `تقرير ${period}` });
  };

  const exportReport = async (format: ExportFormat) => {
    setExporting(format);
    try { if (format === "pdf") await exportPdf(); else if (format === "xlsx") await exportExcel(); else await exportGoogleSheets(); setExportModal(false); Alert.alert("تم التصدير", format === "sheets" ? "تم إنشاء ملف CSV متوافق مع Google Sheets." : `تم إنشاء ملف ${format.toUpperCase()} بنجاح.`); }
    catch { Alert.alert("تعذر التصدير", "تحقق من السماح بالتنزيل أو المشاركة وحاول مرة أخرى."); }
    finally { setExporting(null); }
  };

  return <ScreenContainer edges={["top", "left", "right"]}><ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
    <View style={styles.header}><Pressable onPress={() => router.back()} style={({ pressed }) => [styles.iconButton, { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.65 : 1 }]}><MaterialIcons name="arrow-forward" size={20} color={colors.foreground} /></Pressable><View style={styles.headerCopy}><Text style={[styles.kicker, { color: colors.primary }]}>أداء الشركة</Text><Text style={[styles.title, { color: colors.foreground }]}>التقارير</Text><Text style={[styles.subtitle, { color: colors.muted }]}>تابع نمو تجارتك من مكان واحد</Text></View><View style={[styles.headerIcon, { backgroundColor: colors.primary }]}><MaterialIcons name="analytics" size={20} color="#FFFFFF" /></View></View>
    <View style={[styles.periodCard, { backgroundColor: colors.surface, borderColor: colors.border }]}><View style={styles.periodHeader}><Text style={[styles.periodTitle, { color: colors.foreground }]}>الفترة الزمنية</Text><Text style={[styles.periodValue, { color: colors.primary }]}>{period}</Text></View><View style={styles.periodRow}>{PERIODS.map((option) => <Pressable key={option} onPress={() => setPeriod(option)} style={({ pressed }) => [styles.periodChip, { backgroundColor: period === option ? colors.primary : colors.background, borderColor: period === option ? colors.primary : colors.border, opacity: pressed ? 0.72 : 1 }]}><Text style={[styles.periodText, { color: period === option ? "#FFFFFF" : colors.foreground }]}>{option}</Text></Pressable>)}</View></View>
    <View style={styles.metricsGrid}><MetricCard label="إجمالي المبيعات" value={formatPrice(data.sales)} icon="payments" accent={colors.primary} colors={colors} large /><MetricCard label="الأرباح" value={formatPrice(data.profit)} icon="trending-up" accent={colors.success} colors={colors} large /><MetricCard label="الطلبات" value={formatNumber(data.orders)} icon="shopping-bag" accent={PALETTE.plummy} colors={colors} /><MetricCard label="العملاء" value={formatNumber(data.customers)} icon="groups" accent={PALETTE.aero} colors={colors} /><MetricCard label="المشاهدات" value={formatNumber(data.views)} icon="visibility" accent={PALETTE.plummy} colors={colors} /><MetricCard label="المنتجات" value={formatNumber(data.products)} icon="inventory-2" accent={PALETTE.plumIsland} colors={colors} /></View>
    <ChartCard data={data} colors={colors} period={period} />
    <SectionTitle title="أداء المنتجات" subtitle="تعرف على المنتجات التي تقود مبيعاتك" icon="inventory-2" colors={colors} />
    <View style={[styles.insightCard, { backgroundColor: colors.surface, borderColor: colors.border }]}><InsightRow label="الأكثر مبيعاً" value={data.topProduct} meta={`${formatNumber(data.topProductSales)} مبيعة`} icon="north" accent={colors.success} colors={colors} /><InsightRow label="الأقل مبيعاً" value={data.lowProduct} meta={`${formatNumber(data.lowProductSales)} مبيعة`} icon="south" accent={colors.warning} colors={colors} /><InsightRow label="أوشك على النفاد" value={data.lowStock} meta={`${data.lowStockCount} قطع متبقية`} icon="warning-amber" accent={colors.error} colors={colors} /></View>
    <SectionTitle title="العملاء" subtitle="نظرة سريعة على سلوك عملائك" icon="groups" colors={colors} />
    <View style={styles.smallGrid}><MiniStat label="عملاء جدد" value={formatNumber(data.newCustomers)} meta={`في ${period}`} icon="person-add-alt" accent={colors.primary} colors={colors} /><MiniStat label="عملاء متكررون" value={formatNumber(data.repeatCustomers)} meta="عادوا للشراء" icon="repeat" accent={PALETTE.plummy} colors={colors} /><MiniStat label="معدل الشراء" value={`${data.purchaseRate}%`} meta="من المشاهدات" icon="percent" accent={colors.success} colors={colors} /></View>
    <SectionTitle title="الإعلانات" subtitle="أداء الحملات المدفوعة" icon="campaign" colors={colors} />
    <View style={[styles.adCard, { backgroundColor: PALETTE.plumIsland }]}><View style={styles.adCardHead}><View style={[styles.adStatus, { backgroundColor: `${colors.success}20` }]}><View style={[styles.adDot, { backgroundColor: colors.success }]} /><Text style={[styles.adStatusText, { color: colors.success }]}>نشطة</Text></View><View style={styles.adName}><Text style={styles.adTitle}>{data.campaign}</Text><Text style={styles.adSubtitle}>أفضل حملة خلال {period}</Text></View><View style={[styles.adIcon, { backgroundColor: `${colors.primary}25` }]}><MaterialIcons name="campaign" size={19} color={colors.primary} /></View></View><View style={styles.adStats}><AdStat label="المشاهدات" value={formatNumber(data.adViews)} colors={colors} /><AdStat label="النقرات" value={formatNumber(data.clicks)} colors={colors} /><AdStat label="التحويلات" value={formatNumber(data.conversions)} colors={colors} /><AdStat label="الإنفاق" value={formatPrice(data.adSpend)} colors={colors} /></View></View>
    <View style={styles.reportActions}><Pressable onPress={() => setExportModal(true)} style={({ pressed }) => [styles.textAction, { opacity: pressed ? 0.55 : 1 }]}><Text style={[styles.exportText, { color: colors.muted }]}>تصدير التقرير</Text></Pressable><Pressable onPress={() => setReportModal(true)} style={({ pressed }) => [styles.textAction, { opacity: pressed ? 0.55 : 1 }]}><Text style={[styles.viewText, { color: colors.primary }]}>عرض التقرير</Text></Pressable></View>
    <Text style={[styles.footerNote, { color: colors.muted }]}>الأرقام المعروضة من بيانات تجريبية محلية · قابلة للربط بمصدر التحليلات الحقيقي</Text>
  </ScrollView><Modal visible={reportModal} transparent animationType="slide" onRequestClose={() => setReportModal(false)}><Pressable style={styles.modalBackdrop} onPress={() => setReportModal(false)}><Pressable onPress={(event) => event.stopPropagation()} style={[styles.modalCard, { backgroundColor: colors.surface }]}><View style={styles.modalHandle} /><Text style={[styles.modalTitle, { color: colors.foreground }]}>تقرير {period}</Text><Text style={[styles.modalSubtitle, { color: colors.muted }]}>المتجر</Text><View style={styles.modalRows}><ReportRow label="إجمالي المبيعات" value={formatPrice(data.sales)} colors={colors} /><ReportRow label="الأرباح" value={formatPrice(data.profit)} colors={colors} /><ReportRow label="عدد الطلبات" value={formatNumber(data.orders)} colors={colors} /><ReportRow label="عدد العملاء" value={formatNumber(data.customers)} colors={colors} /><ReportRow label="أداء الحملة" value={data.campaign} colors={colors} /></View><Pressable onPress={() => { setReportModal(false); setExportModal(true); }} style={({ pressed }) => [styles.modalButton, { backgroundColor: colors.primary, opacity: pressed ? 0.75 : 1 }]}><Text style={styles.modalButtonText}>تصدير هذا التقرير</Text><MaterialIcons name="file-download" size={17} color="#FFFFFF" /></Pressable></Pressable></Pressable></Modal><Modal visible={exportModal} transparent animationType="slide" onRequestClose={() => !exporting && setExportModal(false)}><Pressable style={styles.modalBackdrop} onPress={() => !exporting && setExportModal(false)}><Pressable onPress={(event) => event.stopPropagation()} style={[styles.modalCard, { backgroundColor: colors.surface }]}><View style={styles.modalHandle} /><Text style={[styles.modalTitle, { color: colors.foreground }]}>تصدير التقرير</Text><Text style={[styles.modalSubtitle, { color: colors.muted }]}>اختر الصيغة المناسبة للفترة: {period}</Text><View style={styles.exportOptions}><ExportOption icon="picture-as-pdf" title="PDF" description="ملف جاهز للطباعة والحفظ" onPress={() => void exportReport("pdf")} active={exporting === "pdf"} colors={colors} /><ExportOption icon="table-view" title="Excel" description="ملف XLSX قابل للتحليل والتعديل" onPress={() => void exportReport("xlsx")} active={exporting === "xlsx"} colors={colors} /><ExportOption icon="cloud-upload" title="Google Sheets" description="CSV منسق للاستيراد إلى Google Sheets" onPress={() => void exportReport("sheets")} active={exporting === "sheets"} colors={colors} /></View><Text style={[styles.exportHint, { color: colors.muted }]}>على الويب: PDF يفتح نافذة الطباعة لاختيار «حفظ كـ PDF». أما Google Sheets فيُنزّل CSV جاهزاً للاستيراد، إلى أن تتم إضافة OAuth للحساب.</Text></Pressable></Pressable></Modal></ScreenContainer>;
}

function ExportOption({ icon, title, description, onPress, active, colors }: { icon: keyof typeof MaterialIcons.glyphMap; title: string; description: string; onPress: () => void; active: boolean; colors: ReturnType<typeof useColors> }) { return <Pressable disabled={active} onPress={onPress} style={({ pressed }) => [styles.exportOption, { borderColor: active ? colors.primary : colors.border, backgroundColor: active ? `${colors.primary}12` : colors.background, opacity: pressed ? 0.72 : active ? 0.72 : 1 }]}><View style={[styles.exportIcon, { backgroundColor: `${colors.primary}18` }]}>{active ? <MaterialIcons name="hourglass-top" size={21} color={colors.primary} /> : <MaterialIcons name={icon} size={21} color={colors.primary} />}</View><View style={styles.exportCopy}><Text style={[styles.exportTitle, { color: colors.foreground }]}>{active ? "جارٍ التجهيز..." : title}</Text><Text style={[styles.exportDescription, { color: colors.muted }]}>{description}</Text></View><MaterialIcons name="chevron-left" size={20} color={colors.muted} /></Pressable>; }

function MetricCard({ label, value, icon, accent, colors, large }: { label: string; value: string; icon: keyof typeof MaterialIcons.glyphMap; accent: string; colors: ReturnType<typeof useColors>; large?: boolean }) { return <View style={[styles.metricCard, large && styles.largeMetric, { backgroundColor: colors.surface, borderColor: colors.border }]}><View style={[styles.metricIcon, { backgroundColor: `${accent}18` }]}><MaterialIcons name={icon} size={18} color={accent} /></View><Text style={[styles.metricValue, large && styles.largeMetricValue, { color: colors.foreground }]}>{value}</Text><Text style={[styles.metricLabel, { color: colors.muted }]}>{label}</Text></View>; }
function ChartCard({ data, colors, period }: { data: ReportData; colors: ReturnType<typeof useColors>; period: Period }) {
  const [selectedIndex, setSelectedIndex] = useState(data.chart.length - 1);
  const width = 760;
  const height = 292;
  const padLeft = 58;
  const padRight = 22;
  const padTop = 30;
  const padBottom = 46;
  const maxValue = Math.max(...data.chart, 1);
  const gridMax = Math.ceil(maxValue / 20) * 20 || 20;
  const plotWidth = width - padLeft - padRight;
  const plotHeight = height - padTop - padBottom;
  const xFor = (index: number) => padLeft + (index * plotWidth) / Math.max(1, data.chart.length - 1);
  const yFor = (value: number) => padTop + plotHeight - (value / gridMax) * plotHeight;
  const points = data.chart.map((value, index) => `${xFor(index)},${yFor(value)}`).join(" ");
  const areaPath = `M ${xFor(0)} ${height - padBottom} L ${data.chart.map((value, index) => `${xFor(index)} ${yFor(value)}`).join(" L ")} L ${xFor(data.chart.length - 1)} ${height - padBottom} Z`;
  const selectedValue = data.chart[selectedIndex] ?? 0;
  const selectedLabel = data.labels[selectedIndex] ?? period;
  const firstValue = data.chart[0] ?? 0;
  const lastValue = data.chart[data.chart.length - 1] ?? 0;
  const trend = firstValue ? Math.round(((lastValue - firstValue) / firstValue) * 100) : 0;
  const levels = [0, 0.25, 0.5, 0.75, 1];

  return <View style={[styles.chartCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
    <View style={styles.chartHeader}>
      <View style={styles.chartSummary}><Text style={[styles.chartSummaryValue, { color: colors.foreground }]}>{selectedValue} <Text style={[styles.chartSummaryUnit, { color: colors.muted }]}>وحدة</Text></Text><View style={styles.chartTrend}><MaterialIcons name={trend >= 0 ? "trending-up" : "trending-down"} size={14} color={colors.primary} /><Text style={[styles.chartTrendText, { color: colors.primary }]}>{trend >= 0 ? "+" : ""}{trend}%</Text></View></View>
      <View style={styles.chartTitleWrap}><Text style={[styles.chartTitle, { color: colors.foreground }]}>المبيعات حسب الوقت</Text><Text style={[styles.chartPeriod, { color: colors.muted }]}>{period} · آخر تحديث الآن</Text></View>
    </View>
    <View style={styles.chartMetaRow}><View style={[styles.chartLegend, { backgroundColor: `${colors.primary}18` }]}><View style={[styles.legendDot, { backgroundColor: colors.primary }]} /><Text style={[styles.legendText, { color: colors.foreground }]}>حجم المبيعات</Text></View><Text style={[styles.chartHint, { color: colors.muted }]}>اضغط على أي نقطة للتفاصيل</Text></View>
    <View style={[styles.chartSelected, { backgroundColor: `${colors.primary}18`, borderColor: `${colors.primary}45` }]}><Text style={[styles.chartSelectedValue, { color: colors.foreground }]}>{selectedValue} وحدة</Text><Text style={[styles.chartSelectedLabel, { color: colors.muted }]}>{selectedLabel}</Text></View>
    <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
      <Defs><LinearGradient id="salesArea" x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor={colors.primary} stopOpacity="0.30" /><Stop offset="1" stopColor={colors.primary} stopOpacity="0.03" /></LinearGradient></Defs>
      <Rect x={padLeft} y={padTop} width={plotWidth} height={plotHeight} rx="14" fill={`${colors.primary}05`} />
      {levels.map((level) => { const y = yFor(gridMax * level); return <Line key={`grid-${level}`} x1={padLeft} y1={y} x2={width - padRight} y2={y} stroke={colors.border} strokeWidth={level === 0 ? "1.4" : "1"} strokeDasharray={level === 0 ? undefined : "3 6"} />; })}
      {levels.map((level) => { const y = yFor(gridMax * level); return <SvgText key={`y-${level}`} x={padLeft - 12} y={y + 3} fill={colors.muted} fontSize="10" fontWeight="600" textAnchor="end">{Math.round(gridMax * level)}</SvgText>; })}
      <SvgText x={padLeft} y={padTop - 12} fill={colors.muted} fontSize="9" textAnchor="start">الوحدات</SvgText>
      <Path d={areaPath} fill="url(#salesArea)" />
      <Line x1={xFor(selectedIndex)} y1={padTop} x2={xFor(selectedIndex)} y2={height - padBottom} stroke={colors.primary} strokeOpacity="0.36" strokeWidth="1.5" strokeDasharray="3 4" />
      <Polyline points={points} fill="none" stroke={colors.primary} strokeWidth="4.5" strokeLinejoin="round" strokeLinecap="round" />
      {data.chart.map((value, index) => <Circle key={`${value}-${index}`} cx={xFor(index)} cy={yFor(value)} r={selectedIndex === index ? 9 : 5.5} fill={selectedIndex === index ? colors.primary : colors.surface} stroke={colors.foreground} strokeOpacity={selectedIndex === index ? "0.18" : "0.28"} strokeWidth={selectedIndex === index ? 3 : 1.8} onPress={() => setSelectedIndex(index)} />)}
      {data.labels.map((label, index) => <SvgText key={`${label}-${index}`} x={xFor(index)} y={height - 17} fill={selectedIndex === index ? colors.foreground : colors.muted} fontSize="10" fontWeight={selectedIndex === index ? "700" : "500"} textAnchor="middle">{label}</SvgText>)}
    </Svg>
  </View>;
}
function SectionTitle({ title, subtitle, icon, colors }: { title: string; subtitle: string; icon: keyof typeof MaterialIcons.glyphMap; colors: ReturnType<typeof useColors> }) { return <View style={styles.sectionHeader}><View style={[styles.sectionIcon, { backgroundColor: `${colors.primary}17` }]}><MaterialIcons name={icon} size={17} color={colors.primary} /></View><View style={styles.sectionCopy}><Text style={[styles.sectionTitle, { color: colors.foreground }]}>{title}</Text><Text style={[styles.sectionSubtitle, { color: colors.muted }]}>{subtitle}</Text></View></View>; }
function InsightRow({ label, value, meta, icon, accent, colors }: { label: string; value: string; meta: string; icon: keyof typeof MaterialIcons.glyphMap; accent: string; colors: ReturnType<typeof useColors> }) { return <View style={[styles.insightRow, { borderBottomColor: colors.border }]}><View style={[styles.insightIcon, { backgroundColor: `${accent}18` }]}><MaterialIcons name={icon} size={17} color={accent} /></View><View style={styles.insightCopy}><Text style={[styles.insightLabel, { color: colors.muted }]}>{label}</Text><Text style={[styles.insightValue, { color: colors.foreground }]}>{value}</Text></View><Text style={[styles.insightMeta, { color: accent }]}>{meta}</Text></View>; }
function MiniStat({ label, value, meta, icon, accent, colors }: { label: string; value: string; meta: string; icon: keyof typeof MaterialIcons.glyphMap; accent: string; colors: ReturnType<typeof useColors> }) { return <View style={[styles.miniStat, { backgroundColor: colors.surface, borderColor: colors.border }]}><View style={[styles.miniIcon, { backgroundColor: `${accent}18` }]}><MaterialIcons name={icon} size={17} color={accent} /></View><Text style={[styles.miniValue, { color: colors.foreground }]}>{value}</Text><Text style={[styles.miniLabel, { color: colors.muted }]}>{label}</Text><Text style={[styles.miniMeta, { color: accent }]}>{meta}</Text></View>; }
function AdStat({ label, value, colors }: { label: string; value: string; colors: ReturnType<typeof useColors> }) { return <View style={styles.adStat}><Text style={styles.adStatValue}>{value}</Text><Text style={styles.adStatLabel}>{label}</Text></View>; }
function ReportRow({ label, value, colors }: { label: string; value: string; colors: ReturnType<typeof useColors> }) { return <View style={[styles.reportRow, { borderBottomColor: colors.border }]}><Text style={[styles.reportValue, { color: colors.foreground }]}>{value}</Text><Text style={[styles.reportLabel, { color: colors.muted }]}>{label}</Text></View>; }

const styles = StyleSheet.create({ content: { padding: 19, paddingBottom: 30 }, header: { flexDirection: "row-reverse", alignItems: "center", gap: 10, marginBottom: 15 }, headerCopy: { flex: 1, alignItems: "flex-end" }, kicker: { fontSize: 10, fontWeight: "900", marginBottom: 2 }, title: { fontSize: 24, fontWeight: "900" }, subtitle: { fontSize: 10, marginTop: 4 }, iconButton: { width: 42, height: 42, borderRadius: 22, borderWidth: 1, alignItems: "center", justifyContent: "center" }, headerIcon: { width: 43, height: 43, borderRadius: 15, alignItems: "center", justifyContent: "center" }, periodCard: { borderWidth: 1, borderRadius: 18, padding: 12, marginBottom: 12 }, periodHeader: { flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }, periodTitle: { fontSize: 12, fontWeight: "900" }, periodValue: { fontSize: 10, fontWeight: "900" }, periodRow: { flexDirection: "row-reverse", flexWrap: "wrap", gap: 6 }, periodChip: { borderWidth: 1, borderRadius: 9, paddingHorizontal: 9, minHeight: 32, alignItems: "center", justifyContent: "center" }, periodText: { fontSize: 9, fontWeight: "800" }, metricsGrid: { flexDirection: "row-reverse", flexWrap: "wrap", gap: 9, marginBottom: 13 }, metricCard: { width: "31.5%", minHeight: 96, borderWidth: 1, borderRadius: 17, padding: 10, alignItems: "flex-end" }, largeMetric: { width: "48.4%", minHeight: 110 }, metricIcon: { width: 30, height: 30, borderRadius: 10, alignItems: "center", justifyContent: "center" }, metricValue: { fontSize: 15, fontWeight: "900", marginTop: 8, textAlign: "right" }, largeMetricValue: { fontSize: 16 }, metricLabel: { fontSize: 9, marginTop: 4, textAlign: "right" }, chartCard: { borderWidth: 1, borderRadius: 19, padding: 13, marginBottom: 18 }, chartHeader: { flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }, chartTitleWrap: { alignItems: "flex-end" }, chartTitle: { fontSize: 16, fontWeight: "900" }, chartPeriod: { fontSize: 9, marginTop: 4 }, chartSummary: { alignItems: "flex-start", gap: 5 }, chartSummaryValue: { fontSize: 18, fontWeight: "900" }, chartSummaryUnit: { fontSize: 9, fontWeight: "700" }, chartTrend: { flexDirection: "row", alignItems: "center", gap: 3 }, chartTrendText: { fontSize: 10, fontWeight: "900" }, chartMetaRow: { flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }, chartHint: { fontSize: 8 }, chartSelected: { alignSelf: "flex-end", minWidth: 118, borderRadius: 12, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 7, marginBottom: 2, alignItems: "flex-end" }, chartSelectedValue: { fontSize: 11, fontWeight: "900" }, chartSelectedLabel: { fontSize: 8, marginTop: 2 }, chartLegend: { flexDirection: "row-reverse", alignItems: "center", gap: 5, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 6 }, legendDot: { width: 7, height: 7, borderRadius: 4 }, legendText: { fontSize: 9, fontWeight: "900" }, sectionHeader: { flexDirection: "row-reverse", alignItems: "center", gap: 9, marginBottom: 9 }, sectionIcon: { width: 32, height: 32, borderRadius: 10, alignItems: "center", justifyContent: "center" }, sectionCopy: { flex: 1, alignItems: "flex-end" }, sectionTitle: { fontSize: 15, fontWeight: "900" }, sectionSubtitle: { fontSize: 9, marginTop: 3, textAlign: "right" }, insightCard: { borderWidth: 1, borderRadius: 18, paddingHorizontal: 12, marginBottom: 18 }, insightRow: { minHeight: 64, borderBottomWidth: 1, flexDirection: "row-reverse", alignItems: "center", gap: 9 }, insightIcon: { width: 34, height: 34, borderRadius: 11, alignItems: "center", justifyContent: "center" }, insightCopy: { flex: 1, alignItems: "flex-end" }, insightLabel: { fontSize: 9 }, insightValue: { fontSize: 11, fontWeight: "900", marginTop: 4 }, insightMeta: { fontSize: 9, fontWeight: "900" }, smallGrid: { flexDirection: "row-reverse", gap: 8, marginBottom: 18 }, miniStat: { flex: 1, minHeight: 125, borderWidth: 1, borderRadius: 17, padding: 10, alignItems: "flex-end" }, miniIcon: { width: 30, height: 30, borderRadius: 10, alignItems: "center", justifyContent: "center" }, miniValue: { fontSize: 17, fontWeight: "900", marginTop: 11 }, miniLabel: { fontSize: 9, marginTop: 5 }, miniMeta: { fontSize: 8, marginTop: 7, textAlign: "right" }, adCard: { borderRadius: 19, padding: 14, marginBottom: 17 }, adCardHead: { flexDirection: "row-reverse", alignItems: "center", gap: 9 }, adName: { flex: 1, alignItems: "flex-end" }, adTitle: { color: "#FFFFFF", fontSize: 13, fontWeight: "900" }, adSubtitle: { color: "#D8D0DC", fontSize: 9, marginTop: 4 }, adIcon: { width: 37, height: 37, borderRadius: 12, alignItems: "center", justifyContent: "center" }, adStatus: { flexDirection: "row-reverse", alignItems: "center", gap: 4, paddingHorizontal: 7, paddingVertical: 5, borderRadius: 8 }, adDot: { width: 5, height: 5, borderRadius: 3 }, adStatusText: { fontSize: 8, fontWeight: "900" }, adStats: { flexDirection: "row-reverse", justifyContent: "space-between", borderTopWidth: 1, borderTopColor: "#5D526C", marginTop: 14, paddingTop: 13 }, adStat: { alignItems: "center", flex: 1 }, adStatValue: { color: "#FFFFFF", fontSize: 11, fontWeight: "900" }, adStatLabel: { color: "#D8D0DC", fontSize: 8, marginTop: 5 }, reportActions: { flexDirection: "row-reverse", justifyContent: "flex-start", gap: 22, paddingHorizontal: 4, paddingVertical: 6, marginTop: 2 }, textAction: { minHeight: 32, justifyContent: "center", paddingHorizontal: 2 }, exportText: { fontSize: 10, fontWeight: "900" }, viewText: { fontSize: 10, fontWeight: "900" }, footerNote: { fontSize: 8, textAlign: "center", marginTop: 12 }, modalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.38)", justifyContent: "flex-end" }, modalCard: { borderTopLeftRadius: 25, borderTopRightRadius: 25, padding: 20, paddingBottom: 28 }, modalHandle: { width: 42, height: 4, borderRadius: 2, backgroundColor: "#C9C3CC", alignSelf: "center", marginBottom: 17 }, modalTitle: { fontSize: 18, fontWeight: "900", textAlign: "right" }, modalSubtitle: { fontSize: 10, textAlign: "right", marginTop: 4, marginBottom: 15 }, modalRows: { marginBottom: 12 }, reportRow: { minHeight: 45, borderBottomWidth: 1, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }, reportLabel: { fontSize: 10 }, reportValue: { maxWidth: "65%", fontSize: 11, fontWeight: "900", textAlign: "left" }, modalButton: { minHeight: 48, borderRadius: 14, flexDirection: "row-reverse", alignItems: "center", justifyContent: "center", gap: 7 }, modalButtonText: { color: "#FFFFFF", fontSize: 11, fontWeight: "900" }, exportOptions: { gap: 9, marginBottom: 12 }, exportOption: { minHeight: 67, borderRadius: 16, borderWidth: 1, padding: 10, flexDirection: "row-reverse", alignItems: "center", gap: 10 }, exportIcon: { width: 39, height: 39, borderRadius: 12, alignItems: "center", justifyContent: "center" }, exportCopy: { flex: 1, alignItems: "flex-end", gap: 3 }, exportTitle: { fontSize: 12, fontWeight: "900" }, exportDescription: { fontSize: 9, textAlign: "right" }, exportHint: { fontSize: 9, lineHeight: 15, textAlign: "right" } });
