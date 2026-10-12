export type DateInput = string | Date | null | undefined;

function formatDateParts(date: Date): string {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}-${month}-${year}`;
}

export function formatDateDMY(dateInput?: DateInput): string {
  if (!dateInput) {
    return "";
  }

  if (dateInput instanceof Date) {
    return Number.isNaN(dateInput.getTime()) ? "" : formatDateParts(dateInput);
  }

  const value = dateInput.trim();
  if (!value) {
    return "";
  }

  if (/^\d{2}-\d{2}-\d{4}$/.test(value)) {
    return value;
  }

  const yearMonthDay = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (yearMonthDay) {
    const [, year, month, day] = yearMonthDay;
    return `${day}-${month}-${year}`;
  }

  const parsedDate = new Date(value);
  return Number.isNaN(parsedDate.getTime()) ? value : formatDateParts(parsedDate);
}
