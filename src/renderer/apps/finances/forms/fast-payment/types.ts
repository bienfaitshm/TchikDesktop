export type StudentInfo = {
  userId: string;
  lastName: string;
  middleName?: string | null;
  firstName?: string | null;
  username: string;
  fullName: string;
  gender: string;
  role: string;
  birthDate: string;
  birthPlace: string;
  schoolId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
};

export type ClassroomInfo = {
  classId: string;
  identifier: string;
  shortIdentifier: string;
  section: string;
  optionId: string;
  schoolId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
};

export type EnrollmentOption = {
  enrollmentId: string;
  classroomId: string;
  status: string;
  isNewStudent: boolean;
  isProDeo: boolean;
  studentCode: string;
  studentId: string;
  schoolId: string;
  yearId: string;
  createdAt: string;
  updatedAt: string;
  value?: string;
  label?: string;
  student: StudentInfo;
  classroom: ClassroomInfo;
  yearName: string;
};

export type FeeScheduleItem = {
  value: string;
  label: string;
  scheduleId: string;
  installmentName: string;
  feeTypeId: string;
  assignmentId: string;
  enrollmentId: string;
  feeConfigId: string;
  amountPaid: number;
  totalAmount: number;
  currency: string;
  status: string;
  isCustomized: boolean;
};

export type FeeTypeItem = {
  value: string;
  label: string;
  feeTypeId: string;
  name: string;
  walletId: string;
  schoolId: string;
  yearId: string;
  schedules: FeeScheduleItem[];
};

export type StudentPaymentOverviewResponse = {
  enrollment: EnrollmentOption;
  payments: FeeTypeItem[];
};

export type FastPaymentFormProps = {
  schoolId: string;
  yearId: string;
  currencyOptions?: { value: string; label: string }[];
  paymentMethodOptions?: { value: string; label: string }[];
  onSubmit: (data: any) => void;
  formId?: string;
};
