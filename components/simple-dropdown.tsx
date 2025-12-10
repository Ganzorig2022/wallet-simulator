import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

export function SimpleDropdown({
	label,
	value,
	options,
	onChange,
}: {
	label: string;
	value: string;
	options: string[];
	onChange: (val: string) => void;
}) {
	const [open, setOpen] = useState(false);

	return (
		<View style={styles.wrapper}>
			{label ? <Text style={styles.label}>{label}</Text> : null}

			<Pressable
				style={styles.inputBox}
				onPress={() => setOpen(!open)}>
				<Text style={styles.valueText}>{value || "Сонгох..."}</Text>
			</Pressable>

			{open && (
				<View style={styles.dropdownPanel}>
					{/* 🔥 ONLY THIS AREA SCROLLS */}
					<ScrollView
						style={styles.scrollArea}
						nestedScrollEnabled
						showsVerticalScrollIndicator>
						{options.map((opt, i) => (
							<Pressable
								key={i}
								style={styles.optionRow}
								onPress={() => {
									onChange(opt);
									setOpen(false);
								}}>
								<Text style={styles.optionText}>{opt}</Text>
							</Pressable>
						))}
					</ScrollView>
				</View>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	wrapper: {
		width: "100%",
		marginBottom: 20,
	},
	label: {
		fontSize: 13,
		color: "#6B7280",
		marginBottom: 6,
	},
	inputBox: {
		borderWidth: 1,
		borderColor: "#D1D5DB",
		borderRadius: 8,
		paddingVertical: 12,
		paddingHorizontal: 12,
		backgroundColor: "#FFFFFF",
	},
	valueText: {
		fontSize: 15,
		color: "#111827",
	},

	dropdownPanel: {
		marginTop: 6,
		maxHeight: 240, // 🔥 Control scroll area height
		borderWidth: 1,
		borderColor: "#D1D5DB",
		borderRadius: 8,
		backgroundColor: "#FFFFFF",
		overflow: "hidden", // important
		elevation: 4,
	},

	scrollArea: {
		maxHeight: 240,
	},

	optionRow: {
		paddingVertical: 12,
		paddingHorizontal: 12,
		borderBottomWidth: 1,
		borderColor: "#F3F4F6",
	},
	optionText: {
		fontSize: 15,
		color: "#111827",
	},
});
