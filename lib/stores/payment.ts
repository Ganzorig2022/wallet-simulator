import { create } from "zustand";
import { postRequest } from "../api/client";
import { Payment, mapPaymentFromApi } from "../models/payment";
import { DateRange, formatDateYMD } from "../utils/date";
import { getValue } from "../utils/storage";
import { useConfigStore } from "./config";

type PaymentState = {
	items: Payment[];
	isLoading: boolean;
	isLoadingMore: boolean;
	error: string | null;
	pageIndex: number; // 0-based internal
	hasMore: boolean;
	dateRange: DateRange;
	setDateRange: (range: DateRange) => Promise<void>;
	loadInitial: () => Promise<void>;
	loadMore: () => Promise<void>;
	refresh: () => Promise<void>;
};

export const usePaymentStore = create<PaymentState>((set, get) => ({
	items: [],
	isLoading: false,
	isLoadingMore: false,
	error: null,
	pageIndex: 0,
	hasMore: true,
	dateRange: {
		startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
		endDate: new Date(),
	},

	setDateRange: async (range: DateRange) => {
		set({ dateRange: range, pageIndex: 0, hasMore: true });
		await get().loadInitial();
	},

	loadInitial: async () => {
		const { dateRange } = get();

		set({ isLoading: true, error: null, pageIndex: 0 });

		const stateConfig = useConfigStore.getState();
		const bankCode = stateConfig.bankCode ?? (await getValue("BANK_CODE"));
		const customerCode =
			stateConfig.customerCode ?? (await getValue("CUSTOMER_CODE"));
		const langCode = stateConfig.langCode ?? "MON";

		const payload = {
			type: "5",
			bank_code: bankCode,
			bank_verification_code: "1005",
			customer_code: customerCode,
			json_data: {
				lang_code: langCode,
				start_date: formatDateYMD(dateRange.startDate),
				end_date: formatDateYMD(dateRange.endDate),
				page_limit: "20",
				page_number: 1, // ++pageIndex → 1-based
			},
		};

		const result = await postRequest<any>("/qPay_customerAction", payload);

		if (!result.isSuccess) {
			set({
				isLoading: false,
				error: "Failed to load payments.",
				items: [],
				hasMore: false,
			});
			return;
		}

		const jsonData = (result.success as any)?.json_data ?? {};
		const paymentLine = jsonData.payment_line ?? [];

		const mapped = paymentLine.map((p: any) => mapPaymentFromApi(p));

		set({
			items: mapped,
			isLoading: false,
			pageIndex: 1, // after first page
			hasMore: mapped.length >= 20,
			error: null,
		});
	},

	loadMore: async () => {
		const { isLoadingMore, hasMore, pageIndex, dateRange, items } = get();
		if (isLoadingMore || !hasMore) return;

		set({ isLoadingMore: true });

		const stateConfig = useConfigStore.getState();
		const bankCode = stateConfig.bankCode ?? (await getValue("BANK_CODE"));
		const customerCode =
			stateConfig.customerCode ?? (await getValue("CUSTOMER_CODE"));
		const langCode = stateConfig.langCode ?? "MON";

		const nextPage = pageIndex + 1; // 0->1->2... but we send 2,3...

		const payload = {
			type: "5",
			bank_code: bankCode,
			bank_verification_code: "1005",
			customer_code: customerCode,
			json_data: {
				lang_code: langCode,
				start_date: formatDateYMD(dateRange.startDate),
				end_date: formatDateYMD(dateRange.endDate),
				page_limit: "20",
				page_number: nextPage + 0, // pageIndex was 1; nextPage = 2 → backend page 2
			},
		};

		const result = await postRequest<any>("/qPay_customerAction", payload);

		if (!result.isSuccess) {
			set({ isLoadingMore: false });
			return;
		}

		const jsonData = (result.success as any)?.json_data ?? {};
		const paymentLine = jsonData.payment_line ?? [];
		const mapped = paymentLine.map((p: any) => mapPaymentFromApi(p));

		set({
			items: [...items, ...mapped],
			pageIndex: nextPage,
			hasMore: mapped.length >= 20,
			isLoadingMore: false,
		});
	},

	refresh: async () => {
		set({ pageIndex: 0, hasMore: true });
		await get().loadInitial();
	},
}));
