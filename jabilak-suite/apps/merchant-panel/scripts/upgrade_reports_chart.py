from pathlib import Path

path = Path('/home/ubuntu/tajer-mobile/app/reports.tsx')
text = path.read_text()
start = text.index('function ChartCard(')
end = text.index('function SectionTitle(', start)
replacement = '''function ChartCard({ data, colors, period }: { data: ReportData; colors: ReturnType<typeof useColors>; period: Period }) {
  const [selectedIndex, setSelectedIndex] = useState(data.chart.length - 1);
  const width = 720;
  const height = 260;
  const padLeft = 54;
  const padRight = 18;
  const padTop = 24;
  const padBottom = 36;
  const maxValue = Math.max(...data.chart, 1);
  const gridMax = Math.ceil(maxValue / 10) * 10 || 10;
  const plotWidth = width - padLeft - padRight;
  const plotHeight = height - padTop - padBottom;
  const xFor = (index: number) => padLeft + (index * plotWidth) / Math.max(1, data.chart.length - 1);
  const yFor = (value: number) => padTop + plotHeight - (value / gridMax) * plotHeight;
  const points = data.chart.map((value, index) => `${xFor(index)},${yFor(value)}`).join(' ');
  const selectedValue = data.chart[selectedIndex] ?? 0;
  const selectedLabel = data.labels[selectedIndex] ?? period;
  const levels = [0, 0.25, 0.5, 0.75, 1];

  return <View style={[styles.chartCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
    <View style={styles.chartHeader}><View style={[styles.chartLegend, { backgroundColor: `${colors.primary}15` }]}><View style={[styles.legendDot, { backgroundColor: colors.primary }]} /><Text style={[styles.legendText, { color: colors.primary }]}>المبيعات</Text></View><View style={styles.chartTitleWrap}><Text style={[styles.chartTitle, { color: colors.foreground }]}>المبيعات حسب الوقت</Text><Text style={[styles.chartPeriod, { color: colors.muted }]}>{period}</Text></View></View>
    <View style={[styles.chartSelected, { backgroundColor: `${colors.primary}12` }]}><Text style={[styles.chartSelectedValue, { color: colors.primary }]}>{selectedValue} وحدة</Text><Text style={[styles.chartSelectedLabel, { color: colors.muted }]}>{selectedLabel}</Text></View>
    <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
      {levels.map((level) => { const y = yFor(gridMax * level); return <Line key={`grid-${level}`} x1={padLeft} y1={y} x2={width - padRight} y2={y} stroke={colors.border} strokeWidth="1" strokeDasharray={level === 0 ? undefined : "4 5"} />; })}
      {levels.map((level) => { const y = yFor(gridMax * level); return <SvgText key={`y-${level}`} x={padLeft - 10} y={y + 3} fill={colors.muted} fontSize="9" textAnchor="end">{Math.round(gridMax * level)}</SvgText>; })}
      <Polyline points={points} fill="none" stroke={colors.primary} strokeWidth="4" strokeLinejoin="round" strokeLinecap="round" />
      {data.chart.map((value, index) => <Circle key={`${value}-${index}`} cx={xFor(index)} cy={yFor(value)} r={selectedIndex === index ? 7 : 5} fill={colors.surface} stroke={colors.primary} strokeWidth={selectedIndex === index ? 3 : 2} onPress={() => setSelectedIndex(index)} />)}
      {data.labels.map((label, index) => <SvgText key={`${label}-${index}`} x={xFor(index)} y={height - 10} fill={colors.muted} fontSize="9" textAnchor="middle">{label}</SvgText>)}
    </Svg>
  </View>;
}
'''
path.write_text(text[:start] + replacement + text[end:])
