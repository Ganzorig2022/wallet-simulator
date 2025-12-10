import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

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
		<View style={styles.container}>
			<Text style={styles.label}>{label}</Text>

			<Pressable
				style={styles.selector}
				onPress={() => setOpen((prev) => !prev)}>
				<Text style={styles.selectorText}>{value}</Text>
				<Text style={styles.chevron}>▾</Text>
			</Pressable>

			{open && (
				<View style={styles.menu}>
					{options.map((opt) => (
						<Pressable
							key={opt}
							style={styles.option}
							onPress={() => {
								setOpen(false);
								onChange(opt);
							}}>
							<Text style={styles.optionText}>{opt}</Text>
						</Pressable>
					))}
				</View>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	container: { width: "90%", marginBottom: 16 },
	label: { fontSize: 14, color: "#555", marginBottom: 6, marginLeft: 4 },
	selector: {
		height: 44,
		borderWidth: 1,
		borderColor: "#ccc",
		borderRadius: 8,
		paddingHorizontal: 12,
		backgroundColor: "#fff",
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	selectorText: { fontSize: 16 },
	chevron: { fontSize: 16, color: "#555" },
	menu: {
		marginTop: 4,
		borderWidth: 1,
		borderColor: "#ddd",
		borderRadius: 8,
		backgroundColor: "#fff",
		overflow: "hidden",
	},
	option: {
		paddingVertical: 10,
		paddingHorizontal: 14,
	},
	optionText: { fontSize: 16 },
});
