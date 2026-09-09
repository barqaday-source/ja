from pathlib import Path

p = Path('/home/ubuntu/work/jabilak/apps/merchant-panel/app/create-ad.tsx')
lines = p.read_text().splitlines()
start = next(i for i, line in enumerate(lines) if '    {step === 6 &&' in line)
end = next(i for i, line in enumerate(lines[start:], start) if line.startswith('    <View style={styles.footerActions}'))
step = '''    {step === 6 && <View style={styles.stack}>
      <View style={[styles.paymentSummary, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.summaryTitle, { color: colors.foreground }]}>ملخص الحملة</Text>
        <SummaryRow label="نوع الإعلان" value={adType} colors={colors} />
        <SummaryRow label="الجمهور" value={`${province} · ${district}`} colors={colors} />
        <SummaryRow label="الميزانية اليومية" value={isPromotional ? "5,000 د.ع / 3 أيام" : `${budgetNumber.toLocaleString("en-US")} د.ع`} colors={colors} />
        <SummaryRow label="مدة الحملة" value={`${duration} ${duration === 1 ? "يوم" : "أيام"}`} colors={colors} />
        <SummaryRow label="وسيلة الدفع" value="الدفع النقدي فقط" colors={colors} />
        <View style={[styles.totalRow, { borderTopColor: colors.border }]}><Text style={[styles.totalLabel, { color: colors.foreground }]}>الإجمالي</Text><Text style={[styles.totalValue, { color: colors.primary }]}>{isPromotional ? formatPromotionalAmount(promoPlan) : `${totalBudget.toLocaleString("en-US")} د.ع`}</Text></View>
      </View>
      <View style={[styles.approvalBox, { backgroundColor: `${colors.warning}12`, borderColor: `${colors.warning}40` }]}><MaterialIcons name="info-outline" size={20} color={colors.warning} /><Text style={[styles.approvalText, { color: colors.foreground }]}>سيبقى الإعلان قيد المراجعة ولن يتم نشره قبل تأكيد الدفع النقدي والموافقة المطلوبة.</Text></View>
      <View style={[styles.cashNotice, { backgroundColor: `${colors.primary}10`, borderColor: `${colors.primary}30` }]}><MaterialIcons name="payments" size={19} color={colors.primary} /><Text style={[styles.bankNoteText, { color: colors.foreground }]}>الدفع نقداً فقط عند الاستلام أو مباشرةً مع إدارة المتجر، ولا نربط التطبيق بأي بنك أو محفظة إلكترونية.</Text></View>
      <View style={styles.consentRow}><Switch value={consent} onValueChange={setConsent} trackColor={{ false: colors.border, true: `${colors.primary}70` }} thumbColor={consent ? colors.primary : colors.muted} /><Text style={[styles.consentText, { color: colors.foreground }]}>أوافق على مراجعة الإعلان وسياسة الدفع والنشر.</Text></View>
      <Pressable onPress={() => setPaymentConfirmed((value) => !value)} style={({ pressed }) => [styles.paymentConfirm, { backgroundColor: paymentConfirmed ? `${colors.success}13` : colors.surface, borderColor: paymentConfirmed ? colors.success : colors.border, opacity: pressed ? 0.72 : 1 }]}><MaterialIcons name={paymentConfirmed ? "check-circle" : "radio-button-unchecked"} size={20} color={paymentConfirmed ? colors.success : colors.muted} /><View style={styles.paymentConfirmCopy}><Text style={[styles.paymentConfirmTitle, { color: colors.foreground }]}>{paymentConfirmed ? "أكّدت الدفع النقدي للمراجعة" : "تأكيد الدفع النقدي"}</Text><Text style={[styles.paymentConfirmHint, { color: colors.muted }]}>الدفع نقداً فقط · لا نطلب إدخال بيانات البطاقة أو أي تحويل بنكي داخل تاجر</Text></View></Pressable>
      {isPromotional && <Pressable onPress={openWhatsApp} style={({ pressed }) => [styles.whatsappAction, { borderColor: colors.success, backgroundColor: `${colors.success}12`, opacity: pressed ? 0.72 : 1 }]}><MaterialIcons name="chat" size={19} color={colors.success} /><Text style={[styles.whatsappActionText, { color: colors.success }]}>التواصل مع الإدارة عبر WhatsApp</Text></Pressable>}
      {isPromotional && <Pressable onPress={() => void pickReceipt()} style={({ pressed }) => [styles.receiptAction, { borderColor: colors.primary, backgroundColor: receiptUri ? `${colors.success}12` : colors.surface, opacity: pressed ? 0.72 : 1 }]}><MaterialIcons name={receiptUri ? "check-circle" : "receipt-long"} size={19} color={receiptUri ? colors.success : colors.primary} /><Text style={[styles.receiptActionText, { color: receiptUri ? colors.success : colors.primary }]}>{receiptUri ? "تمت إضافة ملاحظة الدفع للمراجعة" : "إضافة ملاحظة الدفع النقدي"}</Text></Pressable>}
      {receiptStatus && <Text style={[styles.receiptStatus, { color: colors.primary }]}>{receiptStatus}</Text>}
      {campaignStatus && <View style={[styles.statusBox, { backgroundColor: `${colors.primary}13` }]}><MaterialIcons name="schedule" size={18} color={colors.primary} /><Text style={[styles.statusText, { color: colors.primary }]}>{campaignStatus}</Text></View>}
    </View>}'''.splitlines()
p.write_text('\n'.join(lines[:start] + step + lines[end:]) + '\n')
print('Rewrote step 6 as valid cash-only JSX.')
