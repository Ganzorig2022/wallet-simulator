// lib/api/payment.ts
import { useConfigStore } from "../stores/config";
import { ApiResult, postRequest } from "./client";

// If you want types later, you can refine these.
// For now, keep them flexible.
export type Invoice = any;
export type BankActionPayload = any;

export async function decryptQrRequest(
	qrCode: string
): Promise<Invoice | { error: true; code: string; message: string } | null> {
	try {
		const { bankCode, customerCode } = useConfigStore.getState();

		const payload = {
			type: "01",
			bank_code: bankCode,
			bank_verification_code: "1005",
			customer_code: customerCode,
			json_data: {
				qPay_QRcode: qrCode,
				transaction_bank_code: bankCode,
			},
		};

		const result: ApiResult = await postRequest(
			"/qPay_decryptInfo",
			payload
		);

		console.log("🔍 decryptQrRequest result:\n", result);

		// -------------------------------------------
		// ❌ NETWORK ERROR — result.isSuccess = false
		// -------------------------------------------
		if (!result.isSuccess) {
			// ❌ CASE 1A — SERVER RETURNED HTML (Nginx 404, 502, etc.)
			if (result.error === "SERVER_RETURNED_HTML") {
				return {
					error: true,
					code: "ENDPOINT_HTML_ERROR",
					message: `Сервер алдаатай HTML хуудас буцаалаа. Та орчноо зөв сонгоно уу.`,
				};
			}

			// ❌ CASE 1B — INVALID JSON RESPONSE
			if (result.error === "INVALID_JSON") {
				return {
					error: true,
					code: "INVALID_JSON",
					message: "Серверээс буруу бүтэцтэй өгөгдөл ирлээ.",
				};
			}

			// axios error + QPay error may both exist
			const qpayError = result.error?.response?.data;

			if (qpayError?.result_code) {
				// Return QPay business error
				return {
					error: true,
					code: qpayError.result_code,
					message: qpayError.result_msg ?? "Алдаа гарлаа",
				};
			}

			// Generic network failure
			return {
				error: true,
				code: "NETWORK_ERROR",
				message:
					"Сервертэй холбогдох боломжгүй. Та утасныхаа интернет болон VPN-ээ асаана уу!",
			};
		}

		// -------------------------------------------
		// ✅ QPay returned normal structure
		// -------------------------------------------
		const root = result.success as any;

		// Business-level failure
		if (root?.result_code !== "0") {
			return {
				error: true,
				code: root?.result_code ?? "UNKNOWN",
				message: root?.result_msg ?? "QR боловсруулахад алдаа гарлаа.",
			};
		}

		const map = root?.json_data ?? {};

		if (!map || Object.keys(map).length === 0) {
			return {
				error: true,
				code: "EMPTY_JSON",
				message: "QR мэдээлэл хоосон байна",
			};
		}

		// Success
		return {
			...map,
			html_data: root?.html_data ?? "",
		};
	} catch (err: any) {
		console.error("❌ decryptQrRequest EXCEPTION:", err);

		return {
			error: true,
			code: "EXCEPTION",
			message: "QR уншиж байх үед алдаа гарлаа.",
		};
	}
}

export async function createBankAction(
	data: BankActionPayload
): Promise<any | null> {
	const result: ApiResult = await postRequest("/qPay_bankAction", data);

	if (!result.isSuccess) return null;

	const root = result.success as any;

	if (data.type === "1") {
		if (root && root.json_data && Object.keys(root.json_data).length > 0) {
			return root.json_data;
		}
		return null;
	}

	if (data.type === "2") {
		if (root && root.result_code === "0") {
			return root;
		}
		return null;
	}

	return null;
}
