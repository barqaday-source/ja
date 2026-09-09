from pathlib import Path
import re

root = Path(__file__).resolve().parents[1]
current = root / "apps/merchant-panel/app/create-ad.tsx"
original = Path('/tmp/jabilak-original/apps/merchant-panel/app/create-ad.tsx')
current_lines = current.read_text().splitlines()
original_lines = original.read_text().splitlines()
# Keep the modified file through step 4, then restore the original step 5/6 JSX structure.
text = '\n'.join(current_lines[:116] + original_lines[117:]) + '\n'
text = text.replace('setPaymentMethod("مصرف الرافدين")', 'setPaymentMethod("الدفع النقدي فقط")')
text = text.replace('هكذا سيظهر إعلانك للمستخدمين داخل موجز جَايَبْلَك.', 'هكذا سيظهر إعلانك للمستخدمين داخل موجز تاجر.')
text = text.replace('الدفع يتم خارج التطبيق عبر إحدى المحافظ المعتمدة، ثم ارفع معلومات الدفع والإيصال لتراجعه الإدارة.', 'الدفع نقداً فقط عند الاستلام أو مباشرةً مع إدارة المتجر، ولا نربط التطبيق بأي بنك أو محفظة إلكترونية.')
text = text.replace('اختر محفظة خارجية لإكمال طلبك ثم أرسل معلومات الدفع للمراجعة.', 'اختر الدفع النقدي فقط لإكمال طلبك، وسيتم تأكيده عند الاستلام أو مباشرةً مع إدارة المتجر.')
text = text.replace('أرسلت معلومات الدفع للمراجعة', 'أكّدت الدفع النقدي للمراجعة')
text = text.replace('تأكيد نجاح الدفع', 'تأكيد الدفع النقدي')
text = text.replace('الدفع خارج التطبيق · لا نطلب إدخال بيانات البطاقة أو تحويل مباشر داخل جَايَبْلَك', 'الدفع نقداً فقط · لا نطلب إدخال بيانات البطاقة أو أي تحويل بنكي داخل تاجر')
text = text.replace('إرسال تفاصيل الدفع عبر WhatsApp', 'التواصل مع الإدارة عبر WhatsApp')
text = text.replace('رفع صورة إيصال التحويل', 'إضافة ملاحظة الدفع النقدي')
# Remove the restored external-account details block.
text = re.sub(r'\{isPromotional && <View style=\{\[styles\.bankDetails.*?</View>\}', '', text, count=1, flags=re.S)
text = text.replace('<View style={[styles.bankNote, { backgroundColor: `${colors.primary}10`, borderColor: `${colors.primary}30` }]}><MaterialIcons name="account-balance" size={19} color={colors.primary} /><Text style={[styles.bankNoteText, { color: colors.foreground }]}>{isPromotional ? "الدفع نقداً فقط عند الاستلام أو مباشرةً مع إدارة المتجر، ولا نربط التطبيق بأي بنك أو محفظة إلكترونية." : "اختر الدفع النقدي فقط لإكمال طلبك، وسيتم تأكيده عند الاستلام أو مباشرةً مع إدارة المتجر."}</Text></View>', '<View style={[styles.cashNotice, { backgroundColor: `${colors.primary}10`, borderColor: `${colors.primary}30` }]}><MaterialIcons name="payments" size={19} color={colors.primary} /><Text style={[styles.bankNoteText, { color: colors.foreground }]}>{isPromotional ? "الدفع نقداً فقط عند الاستلام أو مباشرةً مع إدارة المتجر، ولا نربط التطبيق بأي بنك أو محفظة إلكترونية." : "اختر الدفع النقدي فقط لإكمال طلبك، وسيتم تأكيده عند الاستلام أو مباشرةً مع إدارة المتجر."}</Text></View>')
current.write_text(text)
print('Repaired create-ad JSX and restored steps 5-6 with cash-only copy.')
