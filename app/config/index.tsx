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

	// Zustand store
	const { bankCode, langCode, saveConfig, initiateConfig } = useConfigStore();

	// Local form state
	const [formBankCode, setFormBankCode] = useState("");
	const [formLangCode, setFormLangCode] = useState("");
	const [error, setError] = useState("");

	// load initial values
	useEffect(() => {
		setFormBankCode(bankCode ?? "");
		setFormLangCode(langCode ?? "MON");
	}, [bankCode, langCode]);

	const handleSave = async () => {
		setError("");

		if (!formBankCode || formBankCode.trim().length === 0) {
			setError("BANK CODE шаардлагатай!");
			return;
		}

		await saveConfig({
			bank_code: formBankCode.trim(),
			lang_code: formLangCode.trim(),
		});

		// mimic Flutter: show success message
		alert("Амжилттай хадгалагдлаа");

		// refresh + go back
		await initiateConfig();
		router.canGoBack();
	};

	return (
		<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
			<View style={styles.container}>
				<Text style={styles.title}>Тохиргоо</Text>

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
		padding: 24,
		backgroundColor: "#FFFFFF",
	},
	title: {
		fontSize: 20,
		fontWeight: "700",
		marginBottom: 24,
	},
	fieldContainer: {
		marginBottom: 16,
	},
	label: {
		marginBottom: 6,
		color: "#444444",
		fontSize: 14,
	},
	input: {
		paddingHorizontal: 12,
		paddingVertical: 10,
		borderRadius: 8,
		borderWidth: 1,
		borderColor: "#CCCCCC",
		fontSize: 16,
	},
	error: {
		color: "red",
		marginTop: 4,
		marginBottom: 12,
	},
	button: {
		marginTop: 24,
		backgroundColor: "#007AFF",
		paddingVertical: 12,
		borderRadius: 8,
		alignItems: "center",
	},
	buttonText: {
		color: "#FFFFFF",
		fontWeight: "600",
		fontSize: 16,
	},
});
