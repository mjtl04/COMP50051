
export class DateValidation {
    static dayDifference(start: Date, end: Date): number {
        const startDate = new Date(start);
        const endDate = new Date(end);

        const diff = endDate.getTime() - startDate.getTime();
        return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
    }

    static isInPast(date: Date): boolean {
        return date < new Date();
    }

    static format(date: Date): string {
        return date.toISOString().split("T")[0]
    }

    static getFinancialYearRange() {
        const today = new Date();
        const year = today.getFullYear();

        const start =
            today.getMonth() + 1 >= 4
                ? new Date(year, 3, 1)
                : new Date(year - 1, 3, 1);

        const end =
            today.getMonth() + 1 >= 4
                ? new Date(year + 1, 2, 31)
                : new Date(year, 2, 31);

        return { start, end };
    }
}