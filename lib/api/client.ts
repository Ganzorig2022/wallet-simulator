// lib/api/client.ts
import axios from "axios";
import { Buffer } from "buffer";
import { useConfigStore } from "../stores/config";

// IMPORTANT for React Native
global.Buffer = global.Buffer || Buffer;

export interface ApiResult<T = any> {
	isSuccess: boolean;
	success?: T;
	error?: any;
}

export async function postRequest<T = any>(
	urlPath: string,
	data: any
): Promise<ApiResult<T>> {
	try {
		const { baseUrl } = useConfigStore.getState();

		if (!baseUrl) {
			console.error("❌ No baseUrl found in config store");
			return { isSuccess: false, error: "BASE_URL_MISSING" };
		}

		// --- 🔥 BASE URL must be: https://domain/WebServiceQPayBank.asmx ---
		const serviceUrl = `${baseUrl}/WebServiceQPayBank.asmx`;

		// --- 🔥 Must prepend slash to path ---
		const safePath = urlPath.startsWith("/") ? urlPath : `/${urlPath}`;

		const fullUrl = `${serviceUrl}${safePath}`;

		// --- 🔥 BASIC AUTH (exact same as Flutter) ---
		const username = "test_bank";

		// Flutter uses:
		// DEV/SANDBOX: 1234
		// PROD2: 1234kjsdfhKJDfskdjf
		// We use env to choose
		const password =
			useConfigStore.getState().environment === "prod2"
				? "1234kjsdfhKJDfskdjf"
				: "1234";

		console.log("🗂️ ENVIRONMENT:", useConfigStore.getState().environment);
		console.log("🔑 BASIC:\n", username, password);

		const token = Buffer.from(`${username}:${password}`).toString("base64");
		const authorization = `Basic ${token}`;

		console.log("🌐 POST:\n", fullUrl);
		console.log("📦 Payload:\n", JSON.stringify(data));

		const response = await axios.post<T>(fullUrl, data, {
			headers: {
				"Content-Type": "application/json",
				Authorization: authorization,
				"Accept-Language": "mn", // matches Flutter
			},
		});

		console.log("📦 Response:\n", JSON.stringify(response));

		return {
			isSuccess: true,
			success: (response.data as any) ?? null,
		};
	} catch (error: any) {
		console.error("❌ API ERROR:\n", error.response?.data || error.message);
		return {
			isSuccess: false,
			error,
		};
	}
}
