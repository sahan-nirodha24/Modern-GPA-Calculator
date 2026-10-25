import type { Course, GPARecord } from '../types';

export const GRADE_POINTS: Record<string, number> = {
    'A+': 4.00,
    'A': 4.00,
    'A-': 3.70,
    'B+': 3.30,
    'B': 3.00,
    'B-': 2.70,
    'C+': 2.30,
    'C': 2.00,
    'C-': 1.70, // Minimum passing grade (>= 35%)
    'D+': 1.30,
    'D': 1.00,
    'F': 0.00
};

/**
 * Calculate GPA for a list of courses in a semester.
 * Returns formatted 2 decimal places string or "0.00" if no credits.
 */
export const calculateGPA = (courses: { credits: number; grade: string }[]): string => {
    let totalPoints = 0;
    let totalCredits = 0;

    courses.forEach(course => {
        const points = GRADE_POINTS[course.grade] ?? 0;
        totalPoints += points * course.credits;
        totalCredits += course.credits;
    });

    return totalCredits === 0 ? "0.00" : (totalPoints / totalCredits).toFixed(2);
};

/**
 * Section 19: Cumulative GPA (CGPA / FGPA)
 * Credit-weighted arithmetic mean across ALL registered courses across all semesters.
 */
export const calculateCumulativeGPA = (records: GPARecord[]): {
    cgpa: string;
    totalCredits: number;
    hasUnclearedModules: boolean;
    unclearedCount: number;
} => {
    let totalWeightedPoints = 0;
    let totalCredits = 0;
    let unclearedCount = 0;

    records.forEach(rec => {
        if (rec.courses && Array.isArray(rec.courses) && rec.courses.length > 0) {
            rec.courses.forEach(c => {
                const cred = Number(c.credits) || 0;
                const points = GRADE_POINTS[c.grade] ?? 0;
                totalWeightedPoints += cred * points;
                totalCredits += cred;

                // Section 20(g): Passing requirement is at least C- (1.70)
                if (GRADE_POINTS[c.grade] !== undefined && GRADE_POINTS[c.grade] < 1.70) {
                    unclearedCount++;
                }
            });
        } else {
            // Fallback for older records
            const cred = Number(rec.credits) || 0;
            totalWeightedPoints += cred * (Number(rec.gpa) || 0);
            totalCredits += cred;
        }
    });

    const cgpa = totalCredits === 0 ? "0.00" : (totalWeightedPoints / totalCredits).toFixed(2);
    return {
        cgpa,
        totalCredits,
        hasUnclearedModules: unclearedCount > 0,
        unclearedCount
    };
};

/**
 * Section 21: Award of Classes (First Class, Second Upper, Second Lower, Pass)
 * Takes into account Section 20(g) requiring all course modules to be >= 'C-'.
 */
export const determineClass = (gpa: number, duration: number, allCourses?: Course[]): string => {
    // Check if there are uncleared modules below C-
    if (allCourses && allCourses.length > 0) {
        const hasFailed = allCourses.some(c => (GRADE_POINTS[c.grade] ?? 0) < 1.70);
        if (hasFailed) {
            return "Pending (Modules below C-)";
        }
    }

    const isHonours = duration >= 4;
    const suffix = isHonours ? " (Honours)" : "";

    if (gpa >= 3.70) return `First Class${suffix}`;
    if (gpa >= 3.30) return `Second Class (Upper Division)${suffix}`;
    if (gpa >= 3.00) return `Second Class (Lower Division)${suffix}`;
    if (gpa >= 2.00) return "Pass";

    return "Fail";
};
