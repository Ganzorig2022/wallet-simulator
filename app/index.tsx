import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { SimpleDropdown } from "../components/simple-dropdown";
import BANKS from "../lib/constants/banks";
import { useConfigStore } from "../lib/stores/config";
import { usePaymentStore } from "../lib/stores/payment";

const ENV_TITLE_MAP: Record<string, string> = {
	dev: "Dev",
	sandbox: "Sandbox",
	prod2: "Prod 2",
};

export default function HomeScreen() {
	const router = useRouter();

	const {
		environment,
		bankCodeRequired,
		bankCode,
		saveConfig,
		initiateConfig,
		setEnvironment,
	} = useConfigStore();

	const { loadInitial } = usePaymentStore();

	const [bankInput, setBankInput] = useState("");
	const [setupError, setSetupError] = useState("");
	const envLabel = ENV_TITLE_MAP[environment] ?? "";
	// BANK OPTIONS
	const bankOptions = useMemo(() => {
		return Object.entries(BANKS).map(([code, names]) => {
			const nm: any = names;
			return `${code} · ${nm.MON || nm.ENG}`;
		});
	}, []);

	const selectedBankOption = useMemo(() => {
		if (!bankInput) return "";
		return bankOptions.find((o) => o.startsWith(bankInput)) ?? "";
	}, [bankInput, bankOptions]);

	useEffect(() => {
		setBankInput(bankCode ?? "");
	}, [bankCode]);

	useEffect(() => {
		if (!bankCodeRequired) loadInitial();
	}, [bankCodeRequired]);

	// INITIAL CONFIG SCREEN
	if (bankCodeRequired) {
		return (
			<ScrollView style={styles.setupContainer}>
				<Text style={styles.setupTitle}>Анхны тохиргоо</Text>

				<View style={styles.setupCard}>
					<SimpleDropdown
						label="BANK CODE сонгох"
						value={selectedBankOption}
						options={bankOptions}
						onChange={(opt) => {
							setBankInput(opt.split(" ")[0]);
							if (setupError) setSetupError("");
						}}
					/>

					{setupError ? (
						<Text style={styles.setupError}>{setupError}</Text>
					) : null}

					<Pressable
						style={styles.saveButton}
						onPress={async () => {
							if (!bankInput.trim()) {
								setSetupError("BANK CODE шаардлагатай!");
								return;
							}

							await saveConfig({
								bank_code: bankInput.trim(),
								lang_code: "MON",
							});
							await initiateConfig();
						}}>
						<Text style={styles.saveButtonText}>Хадгалах</Text>
					</Pressable>
				</View>
			</ScrollView>
		);
	}

	// MAIN UI
	return (
		<View style={styles.container}>
			{/* HEADER */}
			<View style={styles.header}>
				<Text style={styles.headerTitle}>
					QPay{" "}
					<Text style={styles.headerTitle}>
						QPay Simulator ({envLabel})
					</Text>
				</Text>

				<Pressable
					onPress={() => router.push("/config")}
					style={styles.headerIcon}>
					<Ionicons
						name="settings-outline"
						size={22}
						color="#111"
					/>
				</Pressable>
			</View>

			{/* ENV SELECT */}
			<View style={styles.block}>
				<Text style={styles.blockLabel}>Орчин сонгох</Text>
				<SimpleDropdown
					value={environment}
					options={["dev", "sandbox", "prod2"]}
					onChange={(env) => setEnvironment(env as any)}
				/>
			</View>

			{/* BANK INFO */}
			<View style={styles.block}>
				<Text style={styles.blockLabel}>Bank</Text>
				<Text style={styles.blockValue}>
					{/* @ts-ignore */}
					{bankCode} — {BANKS[bankCode as any]?.MON || "Unknown"}
				</Text>
			</View>

			{/* ACTIONS */}
			<View style={styles.block}>
				<Pressable
					style={styles.qrButton}
					onPress={() => router.push("/qr")}>
					<Ionicons
						name="qr-code-outline"
						size={26}
						color="#FFF"
					/>
					<Text style={styles.qrButtonText}>QR уншуулах</Text>
				</Pressable>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: "#F8F9FB", paddingHorizontal: 18 },

	header: {
		paddingTop: 55,
		paddingBottom: 16,
		flexDirection: "row",
		justifyContent: "space-between",
	},
	headerTitle: { fontSize: 22, fontWeight: "700", color: "#111" },
	headerIcon: { padding: 8 },

	block: {
		marginTop: 20,
		backgroundColor: "#FFF",
		padding: 16,
		borderRadius: 14,
		shadowColor: "#000",
		shadowOpacity: 0.06,
		shadowRadius: 8,
		elevation: 2,
	},
	blockLabel: {
		fontSize: 13,
		fontWeight: "600",
		color: "#6B7280",
		marginBottom: 8,
	},
	blockValue: {
		fontSize: 16,
		fontWeight: "600",
		color: "#111",
	},

	qrButton: {
		flexDirection: "row",
		gap: 10,
		backgroundColor: "#2563EB",
		paddingVertical: 14,
		borderRadius: 10,
		justifyContent: "center",
		alignItems: "center",
	},
	qrButtonText: {
		color: "#FFF",
		fontWeight: "600",
		fontSize: 16,
	},

	// Initial config
	setupContainer: {
		flexGrow: 1,
		paddingTop: 80,
		paddingHorizontal: 24,
		paddingBottom: 40,
		backgroundColor: "#FFF",
	},
	setupTitle: {
		fontSize: 22,
		fontWeight: "700",
		textAlign: "center",
		marginBottom: 26,
	},
	setupCard: {
		padding: 20,
		borderRadius: 16,
		backgroundColor: "#FFF",
		elevation: 3,
	},
	setupError: { color: "#DC2626", marginTop: 6 },
	saveButton: {
		marginTop: 20,
		backgroundColor: "#2563EB",
		paddingVertical: 12,
		borderRadius: 10,
		alignItems: "center",
	},
	saveButtonText: { color: "#FFF", fontWeight: "600", fontSize: 15 },
});
