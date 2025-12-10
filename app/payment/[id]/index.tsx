import { useLocalSearchParams } from "expo-router";
import React, { useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { mapPaymentFromApi, Payment } from "../../../lib/models/payment";

export default function PaymentDetailScreen() {
	const params = useLocalSearchParams();

	/**
	 * Expected params coming from:
	 * router.push({
	 *   pathname: "/payment/[id]",
	 *   params: { id: paymentId, objectId: objectId, ...full payment? }
	 * })
	 *
	 * BUT we will design it so the Home screen passes the FULL payment object
	 * serialized into JSON for accuracy.
	 */

	const rawPayment = params.payment ?? "{}";

	const payment: Payment = useMemo(() => {
		try {
			const parsed = JSON.parse(rawPayment as string);
			return mapPaymentFromApi(parsed);
		} catch {
			return {};
		}
	}, [rawPayment]);

	return (
		<ScrollView style={styles.container}>
			<Text style={styles.title}>Гүйлгээний дэлгэрэнгүй</Text>

			<DetailRow
				label="Төлбөрийн нэр"
				value={payment.paymentName}
			/>
			<DetailRow
				label="Дүн"
				value={`${payment.paymentAmount ?? "-"} ${
					payment.currencyCode ?? ""
				}`}
			/>
			<DetailRow
				label="Төлбөрийн төлөв"
				value={payment.paymentStatus}
			/>
			<DetailRow
				label="Гүйлгээний утга"
				value={payment.description}
			/>
			<DetailRow
				label="Огноо"
				value={payment.paymentDate}
			/>
			<DetailRow
				label="Төлбөрийн ID"
				value={payment.paymentId}
			/>
			<DetailRow
				label="Нэхэмжлэх ID"
				value={payment.invoiceId}
			/>
			<DetailRow
				label="Object Type"
				value={payment.objectType}
			/>
			<DetailRow
				label="Object ID"
				value={payment.objectId}
			/>

			{payment.colorCode ? (
				<View style={styles.colorRow}>
					<Text style={styles.label}>Төлөвийн өнгө</Text>
					<View
						style={[
							styles.colorBox,
							{
								backgroundColor: `#${payment.colorCode.replace(
									"#",
									""
								)}`,
							},
						]}
					/>
				</View>
			) : null}

			<View style={{ height: 40 }} />
		</ScrollView>
	);
}

function DetailRow({ label, value }: { label: string; value?: any }) {
	return (
		<View style={styles.row}>
			<Text style={styles.label}>{label}</Text>
			<Text style={styles.value}>{value ?? "-"}</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		padding: 24,
		backgroundColor: "#FFFFFF",
		flex: 1,
	},
	title: {
		fontSize: 20,
		fontWeight: "700",
		marginBottom: 24,
		textAlign: "left",
	},
	row: {
		marginBottom: 16,
	},
	label: {
		fontSize: 13,
		color: "#777777",
		marginBottom: 4,
	},
	value: {
		fontSize: 16,
		color: "#222222",
	},
	colorRow: {
		marginTop: 12,
		flexDirection: "row",
		alignItems: "center",
	},
	colorBox: {
		width: 22,
		height: 22,
		borderRadius: 4,
		marginLeft: 12,
		borderWidth: 1,
		borderColor: "#DDD",
	},
});
