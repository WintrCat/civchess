export function formatDate(date: Date | string) {
    try {
        return new Date(date).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric"
        });
    } catch {
        return "Unknown";
    }
}