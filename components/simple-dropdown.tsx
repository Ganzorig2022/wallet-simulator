import React, { useState } from "react";
import {
	FlatList,
	Modal,
	Pressable,
	StyleSheet,
	Text,
	View,
} from "react-native";

export function SimpleDropdown({
	label,
	value,
	options,
	onChange,
}: {
	label?: string;
	value: string;
	options: string[];
	onChange: (v: string) => void;
}) {
	const [open, setOpen] = useState(false);

	return (
		<View style={{ width: "100%" }}>
			{label ? <Text style={styles.label}>{label}</Text> : null}

			<Pressable
				onPress={() => setOpen(true)}
				style={styles.inputBox}>
				<Text style={styles.inputText}>{value || "Сонгох..."}</Text>
			</Pressable>

			{/* FULL-SCREEN CLOSABLE DROPDOWN */}
			<Modal
				visible={open}
				transparent
				animationType="fade">
				{/* BACKDROP — captures outside press */}
				<Pressable
					style={styles.backdrop}
					onPress={() => setOpen(false)}
				/>

				{/* DROPDOWN CONTAINER */}
				<View style={styles.dropdown}>
					<FlatList
						data={options}
						keyExtractor={(item, i) => `${item}-${i}`}
						renderItem={({ item }) => (
							<Pressable
								style={styles.option}
								onPress={() => {
									onChange(item);
									setOpen(false);
								}}>
								<Text style={styles.optionText}>{item}</Text>
							</Pressable>
						)}
					/>
				</View>
			</Modal>
		</View>
	);
}

const styles = StyleSheet.create({
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

	inputText: {
		fontSize: 15,
		color: "#111827",
	},

	// FULLSCREEN BACKDROP
	backdrop: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: "rgba(0,0,0,0.15)",
	},

	// ACTUAL DROPDOWN BOX
	dropdown: {
		position: "absolute",
		top: 150, // adjust if needed
		left: 20,
		right: 20,
		maxHeight: 350,
		backgroundColor: "#FFFFFF",
		borderRadius: 12,
		paddingVertical: 8,
		shadowColor: "#000",
		shadowOpacity: 0.15,
		shadowRadius: 10,
		elevation: 5,
	},

	option: {
		paddingVertical: 12,
		paddingHorizontal: 14,
	},

	optionText: {
		fontSize: 15,
		color: "#111827",
	},
});
