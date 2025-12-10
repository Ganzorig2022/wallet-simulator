export interface Payment {
	invoiceId?: string | null;
	paymentId?: string | null;
	paymentStatus?: string | null;
	paymentName?: string | null;
	currencyCode?: string | null;
	paymentAmount?: number | string | null;
	description?: string | null;
	paymentDate?: string | null;
	colorCode?: string | null;
	objectType?: string | null;
	objectId?: string | null;
}

export function mapPaymentFromApi(json: any): Payment {
	return {
		invoiceId: json.invoice_id ?? null,
		paymentId: json.payment_id ?? null,
		paymentStatus: json.payment_status ?? null,
		paymentName: json.payment_name ?? null,
		currencyCode: json.currency_code ?? null,
		paymentAmount: json.payment_amount ?? null,
		description: json.description ?? null,
		paymentDate: json.payment_date ?? null,
		colorCode: json.color_code ?? null,
		objectType: json.object_type ?? null,
		objectId: json.object_id ?? null,
	};
}
