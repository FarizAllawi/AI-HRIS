export type EmploymentStatus =
  | "active"
  | "on_leave"
  | "terminated"
  | "probation"
  | "inactive";

export interface EmployeeRecord {
  id: string; // Employee ID or code
  fullName: string;
  jobTitle: string;
  department: string;
  location: string;
  status: EmploymentStatus;
  dateOfHire: string; // ISO date string
  managerName?: string;
  contactEmail?: string;
  contactPhone?: string;
  // Nice-to-have fields
  workSchedule?: "full_time" | "part_time" | "remote" | "contract";
  lastReviewDate?: string; // ISO date string
  employmentType?: "permanent" | "contract" | "intern";
  skills?: string[];
  probationStatus?: "active" | "completed" | "n/a";
  birthday?: string; // ISO date string
  notes?: string;
}

export interface EmployeeTableHandlers {
  onView?: (employee: EmployeeRecord) => void;
  onEdit?: (employee: EmployeeRecord) => void;
  onTerminate?: (employee: EmployeeRecord) => void;
}


