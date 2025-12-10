// app/qr.tsx
import { CameraView, useCameraPermissions } from "expo-camera";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, View } from "react-native";
import { decryptQrRequest } from "../../lib/api/payment";

export default function QrScannerScreen() {
	const router = useRouter();
	const [permission, requestPermission] = useCameraPermissions();

	const [scanned, setScanned] = useState(false);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (!permission?.granted) requestPermission();
	}, [permission]);

	// useEffect(() => {
	// 	const mockQr =
	// 		"000201010211153127940496279404960002171000016465204821153034965802MN5904Test6011Ulaanbaatar62250721fIOQtKzreQsgpxMV3qqx36304305D";

	// 	const timer = setTimeout(() => {
	// 		handleQr(mockQr);
	// 	}, 300);

	// 	return () => clearTimeout(timer);
	// }, []);

	const handleQr = async (qrValue: string) => {
		if (scanned) return;
		setScanned(true);
		setLoading(true);

		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

		try {
			const invoice = await decryptQrRequest(qrValue);

			// Check for business error
			if (invoice?.error) {
				Alert.alert("Алдаа", invoice.message ?? "QR код буруу байна.");
				setScanned(false);
				setLoading(false);
				return;
			}

			if (!invoice) {
				Alert.alert("Алдаа", "QR код тайлахад алдаа гарлаа.");
				setScanned(false);
				setLoading(false);
				return;
			}

			// Navigate to PrePayment equivalent
			router.push({
				pathname: "/pre-payment",
				params: {
					invoice: JSON.stringify(invoice),
					qrCode: qrValue,
				},
			});
		} catch (err: any) {
			Alert.alert(
				"Алдаа",
				err.result_msg ?? "QR код тайлахад алдаа гарлаа."
			);
			setScanned(false);
		}

		setLoading(false);
	};

	if (!permission?.granted) {
		return (
			<View style={styles.center}>
				<Text>Камер ашиглах зөвшөөрөл шаардлагатай.</Text>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			{loading && (
				<View style={styles.loadingOverlay}>
					<ActivityIndicator
						size="large"
						color="#FFFFFF"
					/>
					<Text style={{ color: "#FFFFFF", marginTop: 12 }}>
						Уншиж байна...
					</Text>
				</View>
			)}

			<CameraView
				style={styles.camera}
				onBarcodeScanned={(data) => handleQr(data.data)}
				barcodeScannerSettings={{
					barcodeTypes: ["qr"],
				}}
			/>

			<View style={styles.overlayTextBox}>
				<Text style={styles.overlayText}>
					QR кодыг хүрээний дотор байрлуулна уу
				</Text>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1 },
	camera: { flex: 1 },
	center: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
	},
	loadingOverlay: {
		position: "absolute",
		top: 0,
		bottom: 0,
		left: 0,
		right: 0,
		backgroundColor: "rgba(0,0,0,0.55)",
		zIndex: 99,
		alignItems: "center",
		justifyContent: "center",
	},
	overlayTextBox: {
		position: "absolute",
		bottom: 60,
		width: "100%",
		alignItems: "center",
	},
	overlayText: {
		backgroundColor: "rgba(0,0,0,0.6)",
		color: "#FFFFFF",
		paddingHorizontal: 16,
		paddingVertical: 10,
		borderRadius: 8,
		fontSize: 14,
	},
});
