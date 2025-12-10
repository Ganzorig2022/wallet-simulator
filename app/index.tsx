import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import {
	ActivityIndicator,
	FlatList,
	Pressable,
	RefreshControl,
	StyleSheet,
	Text,
	View,
} from "react-native";
import { CustomButton } from "../components/custom-button";
import { PaymentItem } from "../components/payment-item";
import { SimpleDropdown } from "../components/simple-dropdown";
import { useConfigStore } from "../lib/stores/config";
import { usePaymentStore } from "../lib/stores/payment";

const ENV_TITLE_MAP: Record<string, string> = {
	dev: "QPay Dev Simulator",
	sandbox: "QPay Sandbox Simulator",
	prod2: "QPay Prod2 Simulator",
};

export default function HomeScreen() {
	const router = useRouter();
	const { environment, bankCodeRequired, setEnvironment } = useConfigStore(
		(s) => s
	);
	const { items, isLoading, isLoadingMore, refresh, loadInitial, loadMore } =
		usePaymentStore();

	useEffect(() => {
		if (!bankCodeRequired) loadInitial();
	}, [bankCodeRequired]);

	// ───────────────────────────────────────────────
	// BANK CODE REQUIRED SCREEN
	// ───────────────────────────────────────────────
	if (bankCodeRequired) {
		return (
			<View style={styles.centerScreen}>
				<Text style={styles.warningText}>
					Та тохиргоо хэсгээс BANK CODE тохируулах шаардлагатай!
				</Text>

				<CustomButton
					text="Тохируулах"
					onPress={() => router.push("/config")}
					style={{ width: 180, marginTop: 12 }}
				/>
			</View>
		);
	}

	console.log("BASE URL:", useConfigStore.getState().baseUrl);
	// ───────────────────────────────────────────────
	// MAIN UI — CLEAN, PROFESSIONAL LOOK
	// ───────────────────────────────────────────────
	return (
		<View style={styles.container}>
			{/* HEADER */}
			<View style={styles.header}>
				<Text style={styles.headerTitle}>
					{ENV_TITLE_MAP[environment] || "QPay Simulator"}
				</Text>

				<Pressable
					onPress={() => router.push("/config")}
					style={styles.settingsButton}>
					<Text style={styles.settingsIcon}>⚙️</Text>
				</Pressable>
			</View>

			<View style={{ alignItems: "center", marginTop: 8 }}>
				<SimpleDropdown
					label="Environment"
					value={environment}
					options={["dev", "sandbox", "prod2"]}
					onChange={(env) => setEnvironment(env as any)}
				/>
			</View>

			{/* TRANSACTION LIST */}
			<FlatList
				data={items}
				keyExtractor={(_, i) => `payment-${i}`}
				renderItem={({ item }) => (
					<View style={styles.cardWrapper}>
						<PaymentItem
							payment={item}
							onPress={() =>
								router.push({
									pathname: "/payment/[id]",
									params: {
										id: item.paymentId ?? "",
										payment: JSON.stringify(item),
									},
								})
							}
						/>
					</View>
				)}
				refreshControl={
					<RefreshControl
						refreshing={isLoading}
						onRefresh={refresh}
					/>
				}
				ListEmptyComponent={
					!isLoading ? (
						<View style={styles.emptyState}>
							<Text style={styles.emptyText}>
								Гүйлгээ олдсонгүй
							</Text>

							<Pressable
								onPress={refresh}
								style={{ marginTop: 8 }}>
								<Text style={styles.refreshLink}>
									Дахин ачаалах
								</Text>
							</Pressable>
						</View>
					) : null
				}
				onEndReachedThreshold={0.3}
				onEndReached={() => {
					if (!isLoading && !isLoadingMore) loadMore();
				}}
				ListFooterComponent={
					isLoadingMore ? (
						<View style={styles.footerLoading}>
							<ActivityIndicator size="small" />
						</View>
					) : null
				}
				contentContainerStyle={{ paddingTop: 8, paddingBottom: 90 }}
			/>

			{/* FAB */}
			<Pressable
				onPress={() => router.push("/qr")}
				style={styles.fab}>
				<Text style={styles.fabIcon}>📷</Text>
			</Pressable>
		</View>
	);
}

// ───────────────────────────────────────────────
// STYLES
// ───────────────────────────────────────────────

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#F5F7FA",
	},

	// BANK CODE MISSING SCREEN
	centerScreen: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		paddingHorizontal: 24,
		backgroundColor: "#FFFFFF",
	},
	warningText: {
		fontSize: 17,
		color: "#D9822B",
		textAlign: "center",
		fontWeight: "500",
		marginBottom: 12,
	},

	// HEADER
	header: {
		width: "100%",
		paddingHorizontal: 20,
		paddingVertical: 16,
		backgroundColor: "#FFFFFF",
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		borderBottomWidth: 1,
		borderColor: "#E5E7EB",
	},
	headerTitle: {
		fontSize: 20,
		fontWeight: "700",
		color: "#111827",
	},
	settingsButton: {
		padding: 6,
	},
	settingsIcon: {
		fontSize: 22,
	},

	// LIST CARD WRAPPER
	cardWrapper: {
		backgroundColor: "#FFFFFF",
		marginHorizontal: 16,
		marginBottom: 10,
		paddingVertical: 4,
		borderRadius: 12,
		shadowColor: "#000",
		shadowOpacity: 0.06,
		shadowOffset: { width: 0, height: 3 },
		shadowRadius: 6,
		elevation: 2,
	},

	// EMPTY STATE
	emptyState: {
		alignItems: "center",
		marginTop: 80,
	},
	emptyText: {
		fontSize: 16,
		color: "#6B7280",
	},
	refreshLink: {
		fontSize: 14,
		color: "#007AFF",
	},

	// FOOTER LOAD MORE
	footerLoading: {
		paddingVertical: 16,
	},

	// FAB
	fab: {
		position: "absolute",
		right: 20,
		bottom: 24,
		width: 60,
		height: 60,
		borderRadius: 30,
		backgroundColor: "#007AFF",
		justifyContent: "center",
		alignItems: "center",
		shadowColor: "#000",
		shadowOpacity: 0.2,
		shadowOffset: { width: 0, height: 5 },
		shadowRadius: 6,
		elevation: 5,
	},
	fabIcon: {
		fontSize: 26,
		color: "#FFFFFF",
	},
});
