import Ionicons from "@expo/vector-icons/Ionicons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { CustomButton } from "../../components/custom-button";

export default function PrePaymentScreen() {
	const router = useRouter();
	const params = useLocalSearchParams<{
		invoice?: string;
		qrCode?: string;
	}>();

	const invoice = useMemo(() => {
		try {
			return params.invoice ? JSON.parse(params.invoice) : null;
		} catch {
			return null;
		}
	}, [params.invoice]);

	const qrCode = params.qrCode ?? "";

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

	return (
		<View style={styles.container}>
			{/* ───────────────── Toki Header ───────────────── */}
			<View style={styles.tokiHeader}>
				<Pressable
					onPress={() => router.push("/")}
					style={styles.backButton}>
					<Ionicons
						name="chevron-back"
						size={22}
						color="#111827"
					/>
				</Pressable>

				<Text style={styles.tokiTitle}>Төлбөрийн мэдээлэл</Text>
			</View>

			{/* ───────────────── Content ───────────────── */}
			<ScrollView contentContainerStyle={styles.content}>
				{/* Amount Section */}
				<View style={styles.amountCard}>
					<Text style={styles.amountLabel}>Төлөх дүн</Text>
					<Text style={styles.amountValue}>
						{invoice.amount} {invoice.currency_code ?? "MNT"}
					</Text>
				</View>

				{/* Receiver Info */}
				<View style={styles.card}>
					<Text style={styles.cardTitle}>Хүлээн авагч</Text>
					<Row
						label="Банк"
						value={paymentLine?.bank_name}
					/>
					<Row
						label="Дансны дугаар"
						value={paymentLine?.account_number}
					/>
					<Row
						label="Хүлээн авагчийн нэр"
						value={paymentLine?.account_name}
					/>
				</View>

				{/* Description */}
				<View style={styles.card}>
					<Text style={styles.cardTitle}>Гүйлгээний утга</Text>
					<Text style={styles.descriptionText}>
						{invoice.description ?? "-"}
					</Text>
				</View>

				{/* Additional Info */}
				{invoice.html_data ? (
					<View style={styles.card}>
						<Text style={styles.cardTitle}>Нэмэлт мэдээлэл</Text>
						<Text style={styles.htmlText}>{invoice.html_data}</Text>
					</View>
				) : null}
			</ScrollView>

			{/* Footer Button */}
			<View style={styles.footer}>
				<CustomButton
					text={invoice.payment_button_text ?? "Үргэлжлүүлэх"}
					onPress={() =>
						router.push({
							pathname: "/payment",
							params: {
								invoice: JSON.stringify(invoice),
								qrCode,
							},
						})
					}
					style={styles.payButton}
				/>
			</View>
		</View>
	);
}

function Row({ label, value }: { label: string; value?: string }) {
	return (
		<View style={styles.row}>
			<Text style={styles.rowLabel}>{label}</Text>
			<Text style={styles.rowValue}>{value ?? "-"}</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: "#F9FAFB" },

	/* ───────────────── Header ───────────────── */
	tokiHeader: {
		paddingTop: 48,
		paddingBottom: 16,
		backgroundColor: "#FFFFFF",
		borderBottomWidth: 1,
		borderColor: "#E5E7EB",
		alignItems: "center",
		justifyContent: "center",
		position: "relative",
	},
	backButton: {
		position: "absolute",
		left: 12,
		top: 48,
		backgroundColor: "#F3F4F6",
		padding: 6,
		borderRadius: 50,
	},
	tokiTitle: {
		fontSize: 16,
		fontWeight: "600",
		color: "#111827",
	},

	/* ───────────────── Content ───────────────── */
	content: {
		paddingHorizontal: 16,
		paddingTop: 18,
		paddingBottom: 120,
	},

	center: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
	},

	/* Amount Card */
	amountCard: {
		backgroundColor: "#111827",
		borderRadius: 14,
		padding: 20,
		marginBottom: 16,
		alignItems: "center",
	},
	amountLabel: { color: "#9CA3AF", fontSize: 14, marginBottom: 4 },
	amountValue: { color: "#FFFFFF", fontSize: 32, fontWeight: "700" },

	/* Generic Card */
	card: {
		backgroundColor: "#FFFFFF",
		borderRadius: 12,
		padding: 16,
		marginBottom: 16,
		shadowColor: "#000",
		shadowOpacity: 0.06,
		shadowRadius: 6,
		shadowOffset: { width: 0, height: 3 },
		elevation: 2,
	},
	cardTitle: {
		fontSize: 16,
		fontWeight: "600",
		color: "#111827",
		marginBottom: 10,
	},

	row: { marginBottom: 10 },
	rowLabel: { fontSize: 13, color: "#6B7280" },
	rowValue: { fontSize: 15, color: "#111827", marginTop: 2 },

	descriptionText: {
		fontSize: 14,
		color: "#374151",
		marginTop: 6,
	},
	htmlText: {
		fontSize: 13,
		color: "#4B5563",
		marginTop: 4,
	},

	/* Footer */
	footer: {
		paddingHorizontal: 16,
		paddingBottom: 20,
		backgroundColor: "#FFFFFF",
		borderTopWidth: 1,
		borderColor: "#E5E7EB",
	},
	payButton: { marginTop: 8 },
});
