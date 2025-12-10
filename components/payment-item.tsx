import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Payment } from "../lib/models/payment";

type Props = {
	payment: Payment;
	onPress: () => void;
};

export function PaymentItem({ payment, onPress }: Props) {
	const amount = payment.paymentAmount ?? "-";
	const statusColor = (() => {
		const code = payment.colorCode?.replace("#", "");
		if (!code) return "#000000";
		return `#${code}`;
	})();

	return (
		<Pressable
			style={styles.container}
			onPress={onPress}>
			<View style={styles.left}>
				<Text style={styles.title}>{payment.paymentName ?? "-"}</Text>
				<Text style={styles.amount}>
					Дүн: {amount} {payment.currencyCode ?? ""}
				</Text>
				<Text
					style={styles.description}
					numberOfLines={2}>
					Гүйлгээний утга: {payment.description ?? ""}
				</Text>
			</View>
			<View style={styles.right}>
				<Text style={styles.date}>{payment.paymentDate ?? ""}</Text>
				<Text
					style={[styles.status, { color: statusColor }]}
					numberOfLines={1}>
					{payment.paymentStatus ?? ""}
				</Text>
			</View>
		</Pressable>
	);
}

const styles = StyleSheet.create({
	container: {
		paddingHorizontal: 24,
		paddingVertical: 8,
		flexDirection: "row",
		borderBottomWidth: StyleSheet.hairlineWidth,
		borderBottomColor: "#E0E0E0",
	},
	left: {
		flex: 1,
		paddingRight: 8,
	},
	right: {
		alignItems: "flex-end",
		justifyContent: "center",
		width: 100,
	},
	title: {
		fontWeight: "600",
		fontSize: 14,
	},
	amount: {
		marginTop: 4,
		fontSize: 13,
	},
	description: {
		marginTop: 4,
		fontSize: 12,
		color: "#666666",
	},
	date: {
		fontSize: 12,
	},
	status: {
		marginTop: 6,
		fontSize: 12,
	},
});
