import type { SelectOption } from "@/components/ui/searchable-select";

export { COUNTRY_OPTIONS } from "@/data/countries";

export const TIMEZONE_OPTIONS: SelectOption[] = [
  { value: "utc-8", label: "(UTC-08:00) Pacific Time" },
  { value: "utc-7", label: "(UTC-07:00) Mountain Time" },
  { value: "utc-6", label: "(UTC-06:00) Central Time" },
  { value: "utc-5", label: "(UTC-05:00) Eastern Time" },
  { value: "utc-3", label: "(UTC-03:00) São Paulo" },
  { value: "utc+0", label: "(UTC+00:00) London, Lisbon" },
  { value: "utc+1", label: "(UTC+01:00) Berlin, Paris, Madrid" },
  { value: "utc+2", label: "(UTC+02:00) Kyiv, Cairo" },
  { value: "utc+3", label: "(UTC+03:00) Istanbul, Moscow" },
  { value: "utc+4", label: "(UTC+04:00) Dubai" },
  { value: "utc+5:30", label: "(UTC+05:30) India" },
  { value: "utc+8", label: "(UTC+08:00) Singapore, Beijing" },
  { value: "utc+9", label: "(UTC+09:00) Tokyo, Seoul" },
  { value: "utc+10", label: "(UTC+10:00) Sydney" },
];
