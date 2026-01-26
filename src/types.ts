export interface Course {
    id: number;
    name: string;
    credits: number;
    grade: string;
}

export interface GPARecord {
    id: string;
    year: string | number;
    semester: string | number;
    courses: Course[];
    gpa: number;
    timestamp: number;
    credits?: number; // Calculated field
}

export interface UserProfile {
    name: string;
    email: string;
    indexNo: string;
    dob: string;
    university: string;
    degree: string;
    startDate: string;
    endDate: string;
    duration: number;
    totalCredits: number;
}
