import type { SelectOption } from "@/components/ui/searchable-select";

export { COUNTRY_OPTIONS } from "@/data/countries";

export const TIMEZONE_OPTIONS: SelectOption[] = [
  { value: "America/Los_Angeles", label: "(UTC-08:00) Pacific Time" },
  { value: "America/Denver", label: "(UTC-07:00) Mountain Time" },
  { value: "America/Chicago", label: "(UTC-06:00) Central Time" },
  { value: "America/New_York", label: "(UTC-05:00) Eastern Time" },
  { value: "America/Sao_Paulo", label: "(UTC-03:00) São Paulo" },
  { value: "Europe/London", label: "(UTC+00:00) London, Lisbon" },
  { value: "Europe/Paris", label: "(UTC+01:00) Berlin, Paris, Madrid" },
  { value: "Africa/Cairo", label: "(UTC+02:00) Cairo, Kyiv" },
  { value: "Europe/Istanbul", label: "(UTC+03:00) Istanbul, Moscow" },
  { value: "Asia/Dubai", label: "(UTC+04:00) Dubai" },
  { value: "Asia/Kolkata", label: "(UTC+05:30) India" },
  { value: "Asia/Singapore", label: "(UTC+08:00) Singapore, Beijing" },
  { value: "Asia/Tokyo", label: "(UTC+09:00) Tokyo, Seoul" },
  { value: "Australia/Sydney", label: "(UTC+10:00) Sydney" },
];

export function timezoneOptionsForValue(current?: string): SelectOption[] {
  if (!current || TIMEZONE_OPTIONS.some((option) => option.value === current)) {
    return TIMEZONE_OPTIONS;
  }

  return [{ value: current, label: current }, ...TIMEZONE_OPTIONS];
}
