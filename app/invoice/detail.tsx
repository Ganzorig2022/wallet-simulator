import { useLocalSearchParams } from "expo-router";
import React, { useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { WebView } from "react-native-webview";

export default function InvoiceDetailScreen() {
	const params = useLocalSearchParams();

	const invoice = useMemo(() => {
		try {
			return JSON.parse(params.invoice as string);
		} catch {
			return {};
		}
	}, [params.invoice]);

	const htmlData = invoice.html_data ?? "";

	return (
		<ScrollView style={styles.container}>
			<Text style={styles.title}>Нэхэмжлэх дэлгэрэнгүй</Text>

			<DetailRow
				label="Нэхэмжлэхийн дугаар"
				value={invoice.invoice_no}
			/>
			<DetailRow
				label="Нэхэмжлэгч нэр"
				value={invoice.merchant_name}
			/>
			<DetailRow
				label="Гүйлгээний утга"
				value={invoice.payment_description}
			/>
			<DetailRow
				label="Дүн"
				value={invoice.amount}
			/>
			<DetailRow
				label="Валют"
				value={invoice.currency_code}
			/>
			<DetailRow
				label="QR Object ID"
				value={invoice.object_id}
			/>
			<DetailRow
				label="Хугацаа"
				value={invoice.expire_date}
			/>
			<DetailRow
				label="Төлөв"
				value={invoice.status_text}
			/>

			{/* If backend returns HTML (many Mongolian bank QR invoices do) */}
			{htmlData ? (
				<View style={styles.webviewContainer}>
					<Text style={styles.subTitle}>Дэлгэрэнгүй мэдээлэл</Text>
					<WebView
						source={{ html: htmlData }}
						style={styles.webview}
						originWhitelist={["*"]}
						injectedJavaScript={`
              const elements = document.getElementsByTagName('*');
              for (let i = 0; i < elements.length; i++) {
                elements[i].style.fontFamily = 'sans-serif';
              }
              true;
            `}
					/>
				</View>
			) : null}

			<View style={{ height: 50 }} />
		</ScrollView>
	);
}

function DetailRow({ label, value }: { label: string; value: any }) {
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
	},
	subTitle: {
		marginBottom: 12,
		marginTop: 16,
		fontSize: 16,
		fontWeight: "600",
	},
	row: {
		marginBottom: 16,
	},
	label: {
		fontSize: 13,
		color: "#777",
		marginBottom: 4,
	},
	value: {
		fontSize: 16,
		color: "#222",
	},
	webviewContainer: {
		height: 300,
		borderWidth: 1,
		borderColor: "#DDD",
		borderRadius: 8,
		overflow: "hidden",
		marginTop: 12,
	},
	webview: {
		flex: 1,
		backgroundColor: "#FFFFFF",
	},
});
