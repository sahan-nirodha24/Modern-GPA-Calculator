import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Trash2, Plus, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { GRADE_POINTS, calculateGPA } from '../utils/grades';

interface CourseNode {
    id: number;
    name: string;
    credits: number;
    grade: string;
}

import { db } from '../firebase';
import { ref, onValue, set, get } from 'firebase/database';
import { useAuth } from '../context/AuthContext';

export const AddGPA: React.FC = () => {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [loading, setLoading] = useState(false);

    const [courses, setCourses] = useState<CourseNode[]>([
        { id: 1, name: '', credits: 3, grade: 'A' }
    ]);
    const [semester, setSemester] = useState('1');
    const [year, setYear] = useState('1');
    const [maxDuration, setMaxDuration] = useState(4);

    useEffect(() => {
        if (!currentUser) return;
        const durationRef = ref(db, `users/${currentUser.uid}/profile/duration`);
        onValue(durationRef, (snapshot) => {
            const val = snapshot.val();
            if (val) {
                setMaxDuration(Number(val));
            }
        });
    }, [currentUser]);

    // Fetch existing data when Year or Semester changes
    useEffect(() => {
        if (!currentUser) return;

        const recordKey = `Y${year}S${semester}`;
        const recordRef = ref(db, `users/${currentUser.uid}/gpa_records/${recordKey}`);

        get(recordRef).then((snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                if (data.courses) {
                    setCourses(data.courses);
                }
            } else {
                // Reset to default if no record exists
                setCourses([{ id: Date.now(), name: '', credits: 3, grade: 'A' }]);
            }
        }).catch((err) => console.error("Error fetching record:", err));

    }, [currentUser, year, semester]);

    const addCourse = () => {
        setCourses([...courses, { id: Date.now(), name: '', credits: 3, grade: 'A' }]);
    };

    const removeCourse = (id: number) => {
        if (courses.length > 1) {
            setCourses(courses.filter(c => c.id !== id));
        }
    };

    const updateCourse = (id: number, field: keyof CourseNode, value: string | number) => {
        setCourses(courses.map(c => c.id === id ? { ...c, [field]: value } : c));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!currentUser) return;
        setLoading(true);

        const gpa = calculateGPA(courses);

        const record = {
            id: `Y${year}S${semester}`, // Add handy ID
            year,
            semester,
            courses,
            gpa: parseFloat(gpa as string),
            timestamp: Date.now()
        };

        try {
            // Use deterministic key to overwrite/update existing record
            const recordKey = `Y${year}S${semester}`;
            const recordsRef = ref(db, `users/${currentUser.uid}/gpa_records/${recordKey}`);
            await set(recordsRef, record);

            alert(`Saved! GPA: ${gpa}`);
            navigate('/dashboard');
        } catch (error: any) {
            console.error(error);
            alert("Failed to save: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const years = Array.from({ length: maxDuration }, (_, i) => i + 1);

    return (
        <Layout>
            <div className="mb-4">
                <Button variant="secondary" onClick={() => navigate('/dashboard')} style={{ paddingLeft: '0.5rem', paddingRight: '1rem' }}>
                    <ArrowLeft size={16} className="mr-2" /> Back
                </Button>
            </div>

            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <Card title="Add New GPA Record">
                    <form onSubmit={handleSubmit}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                            <div className="form-group">
                                <label className="label">Academic Year</label>
                                <select className="input" value={year} onChange={e => setYear(e.target.value)}>
                                    {years.map(y => <option key={y} value={y}>Year {y}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="label">Semester</label>
                                <select className="input" value={semester} onChange={e => setSemester(e.target.value)}>
                                    {[1, 2].map(s => <option key={s} value={s}>Semester {s}</option>)}
                                </select>
                            </div>
                        </div>

                        <h4 className="font-bold mb-2">Courses</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                            {courses.map((course, index) => (
                                <div key={course.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '1rem', alignItems: 'end' }}>
                                    <Input
                                        label={index === 0 ? "Course Name" : ""}
                                        placeholder="e.g. Data Structures"
                                        value={course.name}
                                        onChange={e => updateCourse(course.id, 'name', e.target.value)}
                                        required
                                    />
                                    <div className="form-group">
                                        {index === 0 && <label className="label">Credits</label>}
                                        <input
                                            type="number"
                                            className="input"
                                            min="1"
                                            max="20"
                                            value={course.credits}
                                            onChange={e => updateCourse(course.id, 'credits', Number(e.target.value))}
                                        />
                                    </div>
                                    <div className="form-group">
                                        {index === 0 && <label className="label">Grade</label>}
                                        <select
                                            className="input"
                                            value={course.grade}
                                            onChange={e => updateCourse(course.id, 'grade', e.target.value)}
                                        >
                                            {Object.keys(GRADE_POINTS).map(g => <option key={g} value={g}>{g}</option>)}
                                        </select>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="danger"
                                        onClick={() => removeCourse(course.id)}
                                        style={{ marginBottom: '2px', padding: '0.75rem' }}
                                        disabled={courses.length === 1}
                                    >
                                        <Trash2 size={18} color={courses.length === 1 ? 'gray' : 'red'} />
                                    </Button>
                                </div>
                            ))}
                        </div>

                        <Button type="button" variant="secondary" onClick={addCourse} className="mb-4" fullWidth>
                            <Plus size={18} className="mr-2" /> Add Another Course
                        </Button>

                        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', marginTop: '1rem' }}>
                            <Button type="submit" fullWidth isLoading={loading}>Calculate & Save</Button>
                        </div>
                    </form>
                </Card>
            </div>
        </Layout>
    );
};
