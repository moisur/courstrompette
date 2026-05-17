import { Student } from "@/lib/types";

export interface StudentFormValues {
  name: string;
  rate: string;
  phone: string;
  address: string;
  courseDay: string;
  courseHour: string;
}

export const DEFAULT_STUDENT_FORM_VALUES: StudentFormValues = {
  name: "",
  rate: "60",
  phone: "",
  address: "",
  courseDay: "",
  courseHour: "",
};

export const STUDENT_RATE_OPTIONS = [
  { id: "31_5", label: "31,5€", value: "31,5" },
  { id: "35", label: "35€", value: "35" },
  { id: "50", label: "50€", value: "50" },
  { id: "60", label: "60€", value: "60" },
];

export function createStudentFormValues(student?: Partial<Student> | null): StudentFormValues {
  return {
    name: student?.name ?? "",
    rate: student?.rate?.toString() ?? DEFAULT_STUDENT_FORM_VALUES.rate,
    phone: student?.phone ?? "",
    address: student?.address ?? "",
    courseDay: student?.courseDay ?? "",
    courseHour: student?.courseHour ?? "",
  };
}
