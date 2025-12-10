export type DateRange = {
	startDate: Date;
	endDate: Date;
};

export function formatDateYMD(date: Date): string {
	const year = date.getFullYear();
	const month = `${date.getMonth() + 1}`.padStart(2, "0");
	const day = `${date.getDate()}`.padStart(2, "0");
	return `${year}-${month}-${day}`; // matches typical yyyy-MM-dd
}
