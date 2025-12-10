import React from "react";
import {
	ActivityIndicator,
	Pressable,
	StyleSheet,
	Text,
	ViewStyle,
} from "react-native";

type Props = {
	text: string;
	onPress: () => void;
	style?: ViewStyle;
	loading?: boolean;
	disabled?: boolean;
};

export function CustomButton({
	text,
	onPress,
	style,
	loading = false,
	disabled = false,
}: Props) {
	const isDisabled = loading || disabled;

	return (
		<Pressable
			onPress={isDisabled ? undefined : onPress}
			style={({ pressed }) => [
				styles.button,
				style,
				isDisabled && styles.buttonDisabled,
				pressed && !isDisabled ? styles.buttonPressed : null,
			]}>
			{loading ? (
				<ActivityIndicator color="#FFFFFF" />
			) : (
				<Text style={styles.text}>{text}</Text>
			)}
		</Pressable>
	);
}

const styles = StyleSheet.create({
	button: {
		backgroundColor: "#007AFF",
		paddingVertical: 12,
		paddingHorizontal: 18,
		borderRadius: 10,
		alignItems: "center",
		justifyContent: "center",
	},
	buttonPressed: {
		opacity: 0.7,
	},
	buttonDisabled: {
		opacity: 0.5,
	},
	text: {
		color: "#FFFFFF",
		fontWeight: "600",
		fontSize: 15,
	},
});