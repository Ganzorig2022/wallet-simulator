import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	View
} from "react-native";

import { SimpleDropdown } from "../../components/simple-dropdown";
import BANKS from "../../lib/constants/banks";
import { useConfigStore } from "../../lib/stores/config";

export default function ConfigScreen() {
	const router = useRouter();

	const { bankCode, langCode, saveConfig, initiateConfig } = useConfigStore();

	const [formBankCode, setFormBankCode] = useState("");
	const [formLangCode, setFormLangCode] = useState("MON");
	const [error, setError] = useState("");

	// Build dropdown options: "050000 · Хаан банк"
	const bankOptions = useMemo(() => {
		return Object.entries(BANKS).map(([code, names]) => {
			const n: any = names;
			const label = n?.MON || n?.ENG || String(code);
			return `${code} · ${label}`;
		});
	}, []);

	// Map selected bank code → matching dropdown label
	const selectedBankLabel = useMemo(() => {
		if (!formBankCode) return "";
		return bankOptions.find((opt) => opt.startsWith(formBankCode)) ?? "";
	}, [formBankCode, bankOptions]);

	// Load initial config into form
	useEffect(() => {
		setFormBankCode(bankCode ?? "");
		setFormLangCode(langCode ?? "MON");
	}, [bankCode, langCode]);

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
			lang_code: formLangCode.trim(),
		});

		alert("Амжилттай хадгалагдлаа");

		await initiateConfig();
		router.canGoBack();
	};

	return (
		<View style={styles.screen}>
			{/* HEADER AREA */}
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

				{/* Placeholder to center the title */}
				<View style={{ width: 40 }} />
			</View>

			{/* SCROLL CONTENT */}
			<ScrollView
				style={styles.container}
				contentContainerStyle={{ paddingBottom: 40 }}
				keyboardShouldPersistTaps="handled">
				{/* BANK CODE DROPDOWN */}
				<View style={styles.fieldContainer}>
					<SimpleDropdown
						label="BANK CODE"
						value={selectedBankLabel}
						options={bankOptions}
						onChange={(option) => {
							const code = option.split(" ")[0];
							setFormBankCode(code);
							if (error) setError("");
						}}
					/>
				</View>

				{/* LANG CODE */}
				<View style={styles.fieldContainer}>
					<Text style={styles.label}>LANG CODE</Text>
					<TextInput
						value={formLangCode}
						onChangeText={setFormLangCode}
						style={styles.input}
						placeholder="MON / ENG"
						placeholderTextColor="#9CA3AF"
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
		paddingTop: 80,
		paddingHorizontal: 24,
		backgroundColor: "#FFFFFF",
	},

	// Back button
	backButton: {
		position: "absolute",
		top: 40,
		left: 16,
		padding: 8,
		borderRadius: 50,
		backgroundColor: "#F4F5F7",
		zIndex: 10,
	},

	title: {
		fontSize: 20,
		fontWeight: "700",
		marginBottom: 28,
		textAlign: "center",
		color: "#111827",
	},

	fieldContainer: {
		marginBottom: 18,
	},

	label: {
		marginBottom: 6,
		fontSize: 13,
		color: "#6B7280",
	},

	input: {
		borderWidth: 1,
		borderColor: "#D1D5DB",
		borderRadius: 8,
		paddingHorizontal: 12,
		paddingVertical: 10,
		fontSize: 15,
		backgroundColor: "#FFFFFF",
		color: "#111827",
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
