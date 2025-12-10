import uuid from "react-native-uuid";
import { create } from "zustand";
import { getValue, saveValue } from "../utils/storage";

// ENV TYPES
export type EnvType = "dev" | "sandbox" | "prod2";

export const ENV_URL_MAP: Record<EnvType, string> = {
	dev: "https://dev-bankapp.qpay.mn",
	sandbox: "https://bankapp-sandbox.qpay.mn",
	prod2: "https://bankapp2.qpay.mn",
};

// STORE TYPE
type ConfigState = {
	bankCodeRequired: boolean;
	bankCode: string | null;
	langCode: string | null;
	customerCode: string | null;

	environment: EnvType;
	baseUrl: string;

	isInitializing: boolean;

	initiateConfig: () => Promise<void>;
	saveConfig: (values: {
		bank_code: string;
		lang_code: string;
	}) => Promise<void>;
	setEnvironment: (env: EnvType) => Promise<void>;

	getConfig: () => { bank_code: string | null; lang_code: string | null };
};

// STORE IMPLEMENTATION
export const useConfigStore = create<ConfigState>((set, get) => ({
	bankCodeRequired: true,
	bankCode: null,
	langCode: null,
	customerCode: null,

	environment: "dev",
	baseUrl: ENV_URL_MAP.dev,

	isInitializing: false,

	// INIT CONFIG
	initiateConfig: async () => {
		set({ isInitializing: true });

		const storedEnv = await getValue("ENVIRONMENT");
		const environment = (storedEnv as EnvType) || "dev";
		const baseUrl = ENV_URL_MAP[environment];

		const bankCode = await getValue("BANK_CODE");
		const langCode = await getValue("LANG_CODE");
		let customerCode = await getValue("CUSTOMER_CODE");

		const bankCodeRequired = !bankCode || bankCode.length === 0;

		let effectiveLang = langCode;
		if (!effectiveLang) {
			effectiveLang = "MON";
			await saveValue("LANG_CODE", effectiveLang);
		}

		if (!customerCode) {
			customerCode = String(uuid.v4());
			await saveValue("CUSTOMER_CODE", customerCode);
		}

		set({
			bankCodeRequired,
			bankCode,
			langCode: effectiveLang,
			customerCode,
			environment,
			baseUrl,
			isInitializing: false,
		});
	},

	// UPDATE ENVIRONMENT
	setEnvironment: async (env: EnvType) => {
		const baseUrl = ENV_URL_MAP[env];
		await saveValue("ENVIRONMENT", env);

		set({ environment: env, baseUrl });
	},

	// SAVE CONFIG
	saveConfig: async ({ bank_code, lang_code }) => {
		await saveValue("BANK_CODE", bank_code);
		await saveValue("LANG_CODE", lang_code);

		await get().initiateConfig();
	},

	// RETURN JUST BANK_CODE + LANG_CODE
	getConfig: () => {
		const s = get();
		return {
			bank_code: s.bankCode,
			lang_code: s.langCode,
		};
	},
}));
