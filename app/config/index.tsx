import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
	Keyboard,
	Pressable,
	StyleSheet,
	Text,
	TextInput,
	TouchableWithoutFeedback,
	View,
} from "react-native";
import { useConfigStore } from "../../lib/stores/config";

export default function ConfigScreen() {
	const router = useRouter();

	const { bankCode, langCode, saveConfig, initiateConfig } = useConfigStore();

	const [formBankCode, setFormBankCode] = useState("");
	const [formLangCode, setFormLangCode] = useState("");
	const [error, setError] = useState("");

	useEffect(() => {
		setFormBankCode(bankCode ?? "");
		setFormLangCode(langCode ?? "MON");
	}, [bankCode, langCode]);

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
		router.back();
	};

	return (
		<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
			<View style={styles.container}>
				{/* 🔙 TOKI FLOATING BACK BUTTON */}
				<Pressable
					style={styles.backButton}
					onPress={() => router.back()}>
					<Ionicons
						name="chevron-back"
						size={24}
						color="#1A1A1A"
					/>
				</Pressable>

				{/* TITLE */}
				<Text style={styles.title}>Тохиргоо</Text>

				{/* INPUT FIELDS */}
				<View style={styles.fieldContainer}>
					<Text style={styles.label}>BANK CODE</Text>
					<TextInput
						value={formBankCode}
						onChangeText={setFormBankCode}
						style={styles.input}
						placeholder="Жишээ: 1900"
					/>
				</View>

				<View style={styles.fieldContainer}>
					<Text style={styles.label}>LANG CODE</Text>
					<TextInput
						value={formLangCode}
						onChangeText={setFormLangCode}
						style={styles.input}
						placeholder="MON / ENG"
					/>
				</View>

				{error ? <Text style={styles.error}>{error}</Text> : null}

				{/* SAVE BUTTON */}
				<Pressable
					style={styles.button}
					onPress={handleSave}>
					<Text style={styles.buttonText}>Хадгалах</Text>
				</Pressable>
			</View>
		</TouchableWithoutFeedback>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		paddingTop: 80,
		paddingHorizontal: 24,
		backgroundColor: "#FFFFFF",
	},

	// TOKI STYLE BACK BUTTON
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
