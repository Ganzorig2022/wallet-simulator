import Ionicons from "@expo/vector-icons/Ionicons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
	Alert,
	KeyboardAvoidingView,
	Platform,
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	View,
} from "react-native";
import { CustomButton } from "../../components/custom-button";
import { createBankAction } from "../../lib/api/payment";
import { useConfigStore } from "../../lib/stores/config";

export default function PaymentScreen() {
	const router = useRouter();
	const { bankCode, customerCode } = useConfigStore();
	const params = useLocalSearchParams<{
		invoice?: string;
		qrCode?: string;
	}>();

	// ---------------------------------------------
	// PARSE INVOICE
	// ---------------------------------------------
	const invoice = useMemo(() => {
		try {
			return params.invoice ? JSON.parse(params.invoice) : null;
		} catch {
			return null;
		}
	}, [params.invoice]);

	if (!invoice) {
		return (
			<View style={styles.center}>
				<Text>Инвойсын мэдээлэл олдсонгүй.</Text>
			</View>
		);
	}

	const paymentLine = Array.isArray(invoice.payment_line)
		? invoice.payment_line[0]
		: null;

	// ---------------------------------------------
	// FORM STATE
	// ---------------------------------------------
	const [amount, setAmount] = useState(() =>
		formatAmount(String(invoice.amount ?? "0"))
	);
	const description = invoice.description ?? ""; // ALWAYS read-only now

	const additionalFields = Array.isArray(invoice.additional_fields)
		? invoice.additional_fields
		: [];

	const [additionalValues, setAdditionalValues] = useState(() => {
		const obj: Record<string, string> = {};
		for (const f of additionalFields) {
			if (f.field_type) obj[f.field_type] = f.field_value ?? "";
		}
		return obj;
	});

	const [fieldErrors, setFieldErrors] = useState({
		amount: "",
		additional: {} as Record<string, string>,
	});

	const [isSubmitting, setIsSubmitting] = useState(false);
	const amountEditable = invoice.payment_partial_flag === "1";

	// ---------------------------------------------
	// VALIDATION
	// ---------------------------------------------
	const validateForm = () => {
		const errors: any = { amount: "", additional: {} };
		const rawAmount = amount.replace(/,/g, "").trim();

		if (!rawAmount || Number(rawAmount) <= 0) {
			errors.amount = "Заавал оруулна уу";
		}

		for (const f of additionalFields) {
			const key = f.field_type;
			const value = (additionalValues[key] ?? "").trim();

			if (f.required === "1" && !value) {
				errors.additional[key] = f.place_holder || "Заавал оруулна уу";
				continue;
			}

			if (f.check_required === "1" && f.expression && value) {
				try {
					const re = new RegExp(f.expression);
					if (!re.test(value)) {
						errors.additional[key] =
							f.place_holder || "Буруу формат";
					}
				} catch {}
			}
		}

		setFieldErrors(errors);
		return (
			!errors.amount && !Object.values(errors.additional).some(Boolean)
		);
	};

	// ---------------------------------------------
	// PAYMENT FLOW (NO PIN)
	// ---------------------------------------------
	const handleSubmitPayment = async () => {
		if (!validateForm()) return;

		if (!bankCode || !customerCode) {
			Alert.alert(
				"Алдаа",
				"BANK_CODE эсвэл CUSTOMER_CODE тохируулаагүй байна."
			);
			return;
		}

		const rawAmount = amount.replace(/,/g, "").trim();
		const linkedItems = Array.isArray(invoice.linked_items)
			? invoice.linked_items
			: [];
		const linkedItem =
			linkedItems.find((li: any) => li.selected === "1") ??
			linkedItems[0] ??
			null;

		const baseData = {
			object_type: linkedItem?.object_type,
			object_id: linkedItem?.object_id,
			amount: rawAmount,
			description,
			additional_fields: Object.entries(additionalValues).map(
				([field_type, field_value]) => ({
					field_type,
					field_value,
				})
			),
		};

		setIsSubmitting(true);

		try {
			// STEP 1 — create
			const type1Payload = {
				type: "1",
				bank_code: bankCode,
				bank_verification_code: "",
				customer_code: customerCode,
				json_data: {
					transaction_bank_code: bankCode,
					transaction_type: "PRCH",
					lang_code: "MON",
					qPay_QRcode: "",
					...baseData,
				},
			};

			let actionResult = await createBankAction(type1Payload);
			if (!actionResult) {
				Alert.alert("Алдаа", "Гүйлгээ эхлүүлэхэд алдаа гарлаа.");
				return;
			}

			// Flutter compatibility formatting
			actionResult.payment_line = (actionResult.payment_line || []).map(
				(line: any) => ({
					...line,
					bank_transaction_id: "1",
					bank_transaction_date: "2021-04-17 01:01:01",
					exchange_rate: "1",
					status_code: "0",
					status_msg: "",
				})
			);

			actionResult.charge_line = (actionResult.charge_line || []).map(
				(line: any) => ({ ...line, status_code: "0", status_msg: "" })
			);

			// STEP 2 — confirm
			const type2Payload = {
				type: "2",
				bank_code: bankCode,
				bank_verification_code: "",
				customer_code: customerCode,
				json_data: {
					lang_code: "MON",
					...actionResult,
					status_code: "0",
					status_msg: "",
				},
			};

			const confirmResult = await createBankAction(type2Payload);

			if (confirmResult) {
				Alert.alert("Амжилттай", "Гүйлгээ амжилттай хийгдлээ.", [
					{ text: "OK", onPress: () => router.push("/") },
				]);
			} else {
				Alert.alert("Алдаа", "Гүйлгээг баталгаажуулахад алдаа гарлаа.");
			}
		} catch (err) {
			console.error("❌ Payment error:", err);
			Alert.alert("Алдаа", "Гүйлгээ хийх үед алдаа гарлаа.");
		} finally {
			setIsSubmitting(false);
		}
	};

	// ---------------------------------------------
	// RENDER
	// ---------------------------------------------
	return (
		<KeyboardAvoidingView
			style={{ flex: 1 }}
			behavior={Platform.OS === "ios" ? "padding" : undefined}>
			<View style={styles.container}>
				{/* ───────────────────── Toki Header ───────────────────── */}
				<View style={styles.tokiHeader}>
					<Pressable
						onPress={() => router.back()}
						style={styles.backButton}>
						<Ionicons
							name="chevron-back"
							size={22}
							color="#111827"
						/>
					</Pressable>
					<Text style={styles.tokiTitle}>Төлбөрийн мэдээлэл</Text>
				</View>

				<ScrollView contentContainerStyle={styles.content}>
					<View style={styles.amountCard}>
						<Text style={styles.amountLabel}>Төлөх дүн</Text>
						<Text style={styles.amountValue}>
							{amount} {invoice.currency_code ?? "MNT"}
						</Text>
					</View>
					{/* RECEIVER INFO */}
					<View style={styles.card}>
						<Text style={styles.sectionTitle}>Хүлээн авагч</Text>
						<Field
							label="Банк"
							value={paymentLine?.bank_name}
						/>
						<Field
							label="Дансны дугаар"
							value={paymentLine?.account_number}
						/>
						<Field
							label="Нэр"
							value={paymentLine?.account_name}
						/>
					</View>

					{/* PAYMENT INFO */}
					<View style={styles.card}>
						<Text style={styles.sectionTitle}>
							Гүйлгээний мэдээлэл
						</Text>

						<Input
							label="Дүн"
							value={amount}
							editable={amountEditable}
							keyboardType="numeric"
							onChangeText={(t) => setAmount(formatAmount(t))}
							error={fieldErrors.amount}
							suffix={invoice.currency_code ?? "MNT"}
						/>

						<Input
							label="Гүйлгээний утга"
							value={description}
							editable={false}
						/>
					</View>

					{/* ADDITIONAL FIELDS */}
					{additionalFields.length > 0 && (
						<View style={styles.card}>
							<Text style={styles.sectionTitle}>
								Нэмэлт талбарууд
							</Text>

							{additionalFields.map((f: any) => {
								const key = f.field_type;
								const val = additionalValues[key] ?? "";
								return (
									<Input
										key={key}
										label={f.field_name ?? key}
										value={val}
										editable={true}
										placeholder={f.place_holder}
										keyboardType={
											f.value_type === "2"
												? "numeric"
												: f.value_type === "3"
												? "email-address"
												: "default"
										}
										onChangeText={(t: any) =>
											setAdditionalValues((p) => ({
												...p,
												[key]: t,
											}))
										}
										error={fieldErrors.additional[key]}
									/>
								);
							})}
						</View>
					)}
				</ScrollView>

				{/* FOOTER BUTTON */}
				<View style={styles.footer}>
					<CustomButton
						text={invoice.payment_button_text ?? "Гүйлгээ хийх"}
						onPress={handleSubmitPayment}
						loading={isSubmitting}
					/>
				</View>
			</View>
		</KeyboardAvoidingView>
	);
}

// =====================================================
// SUPPORT COMPONENTS
// =====================================================
function Field({ label, value }: { label: string; value?: string }) {
	return (
		<View style={styles.row}>
			<Text style={styles.rowLabel}>{label}</Text>
			<Text style={styles.rowValue}>{value ?? "-"}</Text>
		</View>
	);
}

function Input(props: any) {
	const {
		label,
		value,
		editable,
		onChangeText,
		error,
		keyboardType,
		multiline,
		placeholder,
		suffix,
	} = props;

	return (
		<View style={{ marginBottom: 12 }}>
			<Text style={styles.inputLabel}>{label}</Text>

			<View style={styles.inputWrapper}>
				<TextInput
					value={value}
					editable={editable}
					onChangeText={onChangeText}
					keyboardType={keyboardType}
					multiline={multiline}
					placeholder={placeholder}
					style={[
						styles.input,
						!editable && styles.inputDisabled,
						error && styles.inputErrorBorder,
						multiline && { height: 72, textAlignVertical: "top" },
					]}
				/>

				{suffix && (
					<View style={styles.suffixBox}>
						<Text style={styles.suffixText}>{suffix}</Text>
					</View>
				)}
			</View>

			{error ? <Text style={styles.errorText}>{error}</Text> : null}
		</View>
	);
}

// =====================================================
// UTILS
// =====================================================
function formatAmount(input: string): string {
	const digits = input.replace(/[^\d]/g, "");
	if (!digits) return "";
	return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// =====================================================
// STYLES (MATCH PREPAYMENT)
// =====================================================
const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: "#F9FAFB" },
	center: { flex: 1, alignItems: "center", justifyContent: "center" },

	/* TOKI HEADER */
	tokiHeader: {
		paddingTop: 48,
		paddingBottom: 22,
		backgroundColor: "#FFFFFF",
		borderBottomWidth: 1,
		borderColor: "#E5E7EB",
		alignItems: "center",
		position: "relative",
	},
	backButton: {
		position: "absolute",
		left: 12,
		top: 48,
		padding: 6,
		borderRadius: 50,
		backgroundColor: "#F3F4F6",
	},
	tokiTitle: {
		fontSize: 16,
		fontWeight: "600",
		color: "#111827",
	},
	tokiAmount: {
		marginTop: 12,
		fontSize: 30,
		fontWeight: "700",
		color: "#111827",
	},
	tokiCurrency: {
		fontSize: 16,
		fontWeight: "500",
		color: "#6B7280",
	},
	tokiDescription: {
		marginTop: 6,
		fontSize: 13,
		color: "#6B7280",
		textAlign: "center",
	},

	amountCard: {
		backgroundColor: "#111827",
		borderRadius: 14,
		padding: 20,
		marginBottom: 16,
		alignItems: "center",
	},
	amountLabel: { color: "#9CA3AF", fontSize: 14, marginBottom: 4 },
	amountValue: { color: "#FFFFFF", fontSize: 32, fontWeight: "700" },

	/* CONTENT */
	content: {
		paddingHorizontal: 16,
		paddingTop: 16,
		paddingBottom: 120,
	},

	card: {
		backgroundColor: "#FFFFFF",
		borderRadius: 12,
		padding: 16,
		marginBottom: 16,
		shadowOpacity: 0.06,
		shadowRadius: 6,
		shadowColor: "#000",
		elevation: 2,
	},

	sectionTitle: {
		fontSize: 15,
		fontWeight: "600",
		marginBottom: 10,
		color: "#111827",
	},

	row: { marginBottom: 10 },
	rowLabel: { fontSize: 13, color: "#6B7280" },
	rowValue: { fontSize: 15, color: "#111827", marginTop: 2 },

	footer: {
		paddingHorizontal: 16,
		paddingBottom: 22,
		backgroundColor: "#FFFFFF",
		borderTopWidth: 1,
		borderColor: "#E5E7EB",
	},

	inputLabel: { fontSize: 12, color: "#6B7280", marginBottom: 4 },
	inputWrapper: { flexDirection: "row", alignItems: "center" },

	input: {
		flex: 1,
		borderWidth: 1,
		borderColor: "#D1D5DB",
		borderRadius: 8,
		paddingVertical: 8,
		paddingHorizontal: 10,
		fontSize: 14,
		backgroundColor: "#FFFFFF",
		color: "#111827",
	},
	inputDisabled: {
		backgroundColor: "#F3F4F6",
		color: "#9CA3AF",
	},
	inputErrorBorder: { borderColor: "#DC2626" },
	errorText: {
		color: "#DC2626",
		fontSize: 12,
		marginTop: 2,
	},

	suffixBox: {
		marginLeft: 8,
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 999,
		backgroundColor: "#F3F4F6",
	},
	suffixText: {
		fontSize: 12,
		color: "#4B5563",
	},
});
