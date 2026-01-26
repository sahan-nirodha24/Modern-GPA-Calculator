export const GRADE_POINTS: Record<string, number> = {
    'A+': 4.00, 'A': 4.00, 'A-': 3.70,
    'B+': 3.30, 'B': 3.00, 'B-': 2.70,
    'C+': 2.30, 'C': 2.00, 'C-': 1.70,
    'D+': 1.30, 'D': 1.00, 'F': 0.00
};

export const calculateGPA = (courses: { credits: number; grade: string }[]) => {
    let totalPoints = 0;
    let totalCredits = 0;

    courses.forEach(course => {
        const points = GRADE_POINTS[course.grade] || 0;
        totalPoints += points * course.credits;
        totalCredits += course.credits;
    });

    return totalCredits === 0 ? 0 : (totalPoints / totalCredits).toFixed(2);
};

export const determineClass = (gpa: number, duration: number): string => {
    // 4 years or more usually implies an Honours degree
    const isHonours = duration >= 4;
    const suffix = isHonours ? " (Honours)" : "";

    if (gpa >= 3.70) return `First Class${suffix}`;
    if (gpa >= 3.30) return `Second Class (Upper Division)${suffix}`;
    if (gpa >= 3.00) return `Second Class (Lower Division)${suffix}`;
    if (gpa >= 2.00) return "Pass";

    return "Fail";
};
