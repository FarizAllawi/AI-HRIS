import {Media} from "@/types/media";

export interface User {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    emailVerifiedAt: string | null;
    twoFactorEnabled?: boolean;
    role: 'hrms-user' | 'user';
    applicant?: Applicant;
    employee?: Employee;
    createdAt: string;
}

export interface Applicant {
    id: string;
    email: string;
    phone: string;
    portfolioLink: string;
    resumeMediaId: string;
    userId: string;
    resume?: Media
}
export interface Employee {
    id: string;
    email: string;
    phone: string;
    portfolioLink: string;
    resumeMediaId: string;
    userId: string;
    resume?: Media
}
