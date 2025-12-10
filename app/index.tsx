import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	View,
} from "react-native";

import { SimpleDropdown } from "../components/simple-dropdown";
import BANKS from "../lib/constants/banks";
import { useConfigStore } from "../lib/stores/config";
import { usePaymentStore } from "../lib/stores/payment";

const ENV_TITLE_MAP: Record<string, string> = {
	dev: "Environment: Dev",
	sandbox: "Environment: Sandbox",
	prod2: "Environment: Prod2",
};

export default function HomeScreen() {
	const router = useRouter();

	const {
		environment,
		bankCodeRequired,
		bankCode,
		langCode,
		saveConfig,
		initiateConfig,
		setEnvironment,
		resetConfig, // still available if you want a “clear simulator” button later
	} = useConfigStore();

	const { refresh, loadInitial } = usePaymentStore();

	// --------------------------------------------
	// LOCAL FORM STATE (INLINE CONFIG)
	// --------------------------------------------
	const [bankInput, setBankInput] = useState("");
	const [langInput, setLangInput] = useState("MON");
	const [setupError, setSetupError] = useState("");

	// Build BANK dropdown options from BANKS constant
	const bankOptions = useMemo(() => {
		return Object.entries(BANKS).map(([code, names]) => {
			// names.MON might be undefined for some; fallback to ENG
			const labelSource: any = names;
			const displayName =
				labelSource?.MON || labelSource?.ENG || String(code);
			return `${code} · ${displayName}`;
		});
	}, []);

	// Currently selected option string for dropdown
	const selectedBankOption = useMemo(() => {
		if (!bankInput) return "";
		const codeString = String(bankInput);
		const match = bankOptions.find((opt) => opt.startsWith(codeString));
		return match ?? "";
	}, [bankInput, bankOptions]);

	useEffect(() => {
		setBankInput(bankCode ?? "");
		setLangInput(langCode ?? "MON");
	}, [bankCode, langCode]);

	useEffect(() => {
		if (!bankCodeRequired) loadInitial();
	}, [bankCodeRequired]);

	// --------------------------------------------
	// SAVE LOGIC (INLINE CONFIG)
	// --------------------------------------------
	const handleInlineSave = async () => {
		setSetupError("");

		if (!bankInput.trim()) {
			setSetupError("BANK CODE шаардлагатай!");
			return;
		}

		await saveConfig({
			bank_code: bankInput.trim(),
			lang_code: langInput.trim(),
		});

		alert("Амжилттай хадгалагдлаа");

		await initiateConfig();
	};

	// --------------------------------------------
	// INLINE CONFIG UI (WHEN BANK CODE IS MISSING)
	// --------------------------------------------
	if (bankCodeRequired) {
		return (
			<ScrollView style={styles.setupScrollContainer}>
				<Text style={styles.setupTitle}>Анхны тохиргоо</Text>

				<View style={styles.setupCard}>
					{/* BANK CODE DROPDOWN (from BANKS constant) */}
					<SimpleDropdown
						label="BANK CODE сонгох"
						value={selectedBankOption}
						options={bankOptions}
						onChange={(option) => {
							// option pattern: "050000 · Khanbank"
							const code = option.split(" ")[0];
							setBankInput(code);
							if (setupError) setSetupError("");
						}}
					/>

					{/* LANG CODE INPUT */}
					<Text style={[styles.inputLabel, { marginTop: 18 }]}>
						LANG CODE
					</Text>
					<TextInput
						value={langInput}
						onChangeText={setLangInput}
						style={styles.setupInput}
						placeholder="MON / ENG"
						placeholderTextColor="#9CA3AF"
					/>

					{setupError ? (
						<Text style={styles.setupError}>{setupError}</Text>
					) : null}

					<Pressable
						style={styles.setupButton}
						onPress={handleInlineSave}>
						<Text style={styles.setupButtonText}>Хадгалах</Text>
					</Pressable>
				</View>
			</ScrollView>
		);
	}

	// --------------------------------------------
	// MAIN UI
	// --------------------------------------------
	return (
		<View style={styles.container}>
			{/* HEADER */}
			<View style={styles.modernHeader}>
				<View>
					<Text style={styles.appTitle}>QPay Simulator</Text>
					<View style={styles.envBadge}>
						<Text style={styles.envBadgeText}>
							{ENV_TITLE_MAP[environment]}
						</Text>
					</View>
				</View>

				<Pressable
					onPress={() => router.push("/config")}
					style={styles.settingsButton}>
					<Ionicons
						name="settings-outline"
						size={22}
						color="#111827"
					/>
				</Pressable>
			</View>

			{/* ENV DROPDOWN */}
			<View style={styles.envDropdownWrapper}>
				<SimpleDropdown
					label="Орчин сонгох"
					value={environment}
					options={["dev", "sandbox", "prod2"]}
					onChange={(env) => setEnvironment(env as any)}
				/>
			</View>

			{/* FAB */}
			<Pressable
				onPress={() => router.push("/qr")}
				style={styles.fab}>
				<Ionicons
					name="qr-code-outline"
					size={30}
					color="#FFFFFF"
				/>
			</Pressable>
		</View>
	);
}

// -------------------------------------------------------
// STYLES — COMBINED TOKI + MODERN FINTECH
// -------------------------------------------------------
const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#F4F5F7",
	},

	// INLINE SETUP

	setupScrollContainer: {
		flexGrow: 1,
		paddingTop: 80,
		paddingHorizontal: 24,
		paddingBottom: 40,
		backgroundColor: "#FFFFFF",
	},
	setupContainer: {
		flex: 1,
		paddingTop: 80,
		paddingHorizontal: 24,
		backgroundColor: "#FFFFFF",
	},
	setupTitle: {
		fontSize: 22,
		fontWeight: "700",
		color: "#111827",
		textAlign: "center",
		marginBottom: 26,
	},
	setupCard: {
		backgroundColor: "#FFFFFF",
		padding: 20,
		borderRadius: 16,
		shadowColor: "#000",
		shadowOpacity: 0.06,
		shadowRadius: 8,
		elevation: 3,
	},
	inputLabel: {
		fontSize: 13,
		color: "#6B7280",
		marginBottom: 6,
	},
	setupInput: {
		borderWidth: 1,
		borderColor: "#D1D5DB",
		borderRadius: 8,
		paddingVertical: 10,
		paddingHorizontal: 12,
		fontSize: 15,
		color: "#111827",
	},
	setupError: {
		color: "#DC2626",
		marginTop: 6,
		fontSize: 13,
	},
	setupButton: {
		marginTop: 20,
		backgroundColor: "#2563EB",
		paddingVertical: 12,
		borderRadius: 10,
		alignItems: "center",
	},
	setupButtonText: {
		color: "#FFFFFF",
		fontWeight: "600",
		fontSize: 15,
	},

	// MAIN HOME UI
	modernHeader: {
		backgroundColor: "#FFFFFF",
		paddingTop: 52,
		paddingHorizontal: 20,
		paddingBottom: 22,
		borderBottomLeftRadius: 22,
		borderBottomRightRadius: 22,
		flexDirection: "row",
		justifyContent: "space-between",
		shadowColor: "#000",
		shadowOpacity: 0.06,
		shadowRadius: 8,
		elevation: 3,
	},
	appTitle: {
		fontSize: 22,
		fontWeight: "700",
		color: "#111827",
	},
	envBadge: {
		marginTop: 6,
		backgroundColor: "#EEF2FF",
		paddingHorizontal: 10,
		paddingVertical: 4,
		borderRadius: 8,
		alignSelf: "flex-start",
	},
	envBadgeText: {
		fontSize: 12,
		color: "#4338CA",
		fontWeight: "600",
	},
	settingsButton: { padding: 8 },

	envDropdownWrapper: {
		marginTop: 16,
		marginLeft: 16,
		marginRight: 16,
		alignItems: "center",
	},

	paymentCard: {
		backgroundColor: "#FFFFFF",
		marginHorizontal: 16,
		marginBottom: 12,
		borderRadius: 14,
		paddingVertical: 6,
		paddingHorizontal: 8,
		shadowColor: "#000",
		shadowOpacity: 0.05,
		shadowRadius: 6,
		elevation: 2,
	},

	footerLoading: { paddingVertical: 20 },

	fab: {
		position: "absolute",
		bottom: 28,
		right: 22,
		width: 62,
		height: 62,
		borderRadius: 31,
		backgroundColor: "#2563EB",
		alignItems: "center",
		justifyContent: "center",
		shadowColor: "#000",
		shadowOpacity: 0.22,
		shadowOffset: { width: 0, height: 4 },
		shadowRadius: 8,
		elevation: 6,
	},
});
