import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { SimpleDropdown } from "../../components/simple-dropdown";
import BANKS from "../../lib/constants/banks";
import { useConfigStore } from "../../lib/stores/config";

export default function ConfigScreen() {
	const router = useRouter();
	const { bankCode, saveConfig, initiateConfig } = useConfigStore();

	const [formBankCode, setFormBankCode] = useState("");
	const [error, setError] = useState("");

	// Build "050000 · Хаан банк"
	const bankOptions = useMemo(() => {
		return Object.entries(BANKS).map(([code, names]) => {
			const nm: any = names;
			return `${code} · ${nm.MON || nm.ENG}`;
		});
	}, []);

	// Dropdown selected label
	const selectedBankLabel = useMemo(() => {
		if (!formBankCode) return "";
		return bankOptions.find((o) => o.startsWith(formBankCode)) ?? "";
	}, [formBankCode, bankOptions]);

	// Initial load
	useEffect(() => {
		setFormBankCode(bankCode ?? "");
	}, [bankCode]);

	// -----------------------------
	// SAVE CONFIG
	// -----------------------------
	const handleSave = async () => {
		setError("");

		if (!formBankCode.trim()) {
			setError("BANK CODE шаардлагатай!");
			return;
		}

		await saveConfig({
			bank_code: formBankCode.trim(),
			lang_code: "MON", // Always default now
		});

		alert("Амжилттай хадгалагдлаа");

		await initiateConfig();
		router.back();
	};

	return (
		<View style={styles.screen}>
			{/* HEADER */}
			<View style={styles.header}>
				<Pressable
					style={styles.headerBack}
					onPress={() => router.back()}>
					<Ionicons
						name="chevron-back"
						size={24}
						color="#1A1A1A"
					/>
				</Pressable>

				<Text style={styles.headerTitle}>Тохиргоо</Text>

				{/* Spacer to center the title */}
				<View style={{ width: 40 }} />
			</View>

			{/* CONTENT */}
			<ScrollView
				style={styles.container}
				contentContainerStyle={{ paddingBottom: 40 }}
				keyboardShouldPersistTaps="handled">
				{/* BANK CODE */}
				<View style={styles.fieldContainer}>
					<SimpleDropdown
						label="BANK CODE"
						value={selectedBankLabel}
						options={bankOptions}
						onChange={(opt) => {
							const code = opt.split(" ")[0];
							setFormBankCode(code);
							if (error) setError("");
						}}
					/>
				</View>

				{error ? <Text style={styles.error}>{error}</Text> : null}

				{/* SAVE */}
				<Pressable
					style={styles.button}
					onPress={handleSave}>
					<Text style={styles.buttonText}>Хадгалах</Text>
				</Pressable>
			</ScrollView>
		</View>
	);
}

const styles = StyleSheet.create({
	screen: {
		flex: 1,
		backgroundColor: "#FFFFFF",
	},

	header: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingTop: 50,
		paddingHorizontal: 16,
		paddingBottom: 14,
		backgroundColor: "#FFFFFF",
		borderBottomWidth: 1,
		borderColor: "#F3F4F6",
	},

	headerBack: {
		padding: 6,
		borderRadius: 50,
		backgroundColor: "#F4F5F7",
	},

	headerTitle: {
		fontSize: 20,
		fontWeight: "700",
		color: "#111827",
		textAlign: "center",
		flex: 1,
	},

	container: {
		flex: 1,
		paddingTop: 40,
		paddingHorizontal: 24,
		backgroundColor: "#FFFFFF",
	},

	fieldContainer: {
		marginBottom: 18,
	},

	error: {
		color: "#DC2626",
		marginTop: 4,
		marginBottom: 12,
		fontSize: 13,
	},

	button: {
		marginTop: 20,
		backgroundColor: "#2563EB",
		paddingVertical: 12,
		borderRadius: 10,
		alignItems: "center",
	},

	buttonText: {
		color: "#FFFFFF",
		fontWeight: "600",
		fontSize: 15,
	},
});
