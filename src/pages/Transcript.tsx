import React, { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { Button } from '../components/Button';
import { ArrowLeft, Printer, Download, CheckCircle, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { ref, onValue } from 'firebase/database';
import { determineClass, calculateCumulativeGPA, calculateGPA, getEffectiveGPV } from '../utils/grades';
import type { UserProfile, GPARecord, Course } from '../types';

export const Transcript: React.FC = () => {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [groupedRecords, setGroupedRecords] = useState<GPARecord[]>([]);
    const [finalGPA, setFinalGPA] = useState('0.00');
    const [totalCredits, setTotalCredits] = useState(0);

    useEffect(() => {
        if (!currentUser) return;

        const profileRef = ref(db, `users/${currentUser.uid}/profile`);
        onValue(profileRef, (snapshot) => {
            setProfile(snapshot.val());
        });

        const recordsRef = ref(db, `users/${currentUser.uid}/gpa_records`);
        onValue(recordsRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const loadedRecords: GPARecord[] = Object.values(data);

                // Sort by Year then Semester
                loadedRecords.sort((a, b) => {
                    if (a.year !== b.year) return Number(a.year) - Number(b.year);
                    return Number(a.semester) - Number(b.semester);
                });

                setGroupedRecords(loadedRecords);

                // Section 19: Calculate credit-weighted Cumulative GPA
                const stats = calculateCumulativeGPA(loadedRecords);
                setFinalGPA(stats.cgpa);
                setTotalCredits(stats.totalCredits);
            } else {
                setGroupedRecords([]);
                setFinalGPA('0.00');
                setTotalCredits(0);
            }
        });

    }, [currentUser]);

    const handlePrint = () => {
        window.print();
    };

    if (!profile) return <Layout><div className="p-4 text-center">Loading transcript...</div></Layout>;

    // Collect all courses for Degree Class evaluation
    const allCourses: Course[] = [];
    groupedRecords.forEach(rec => {
        if (rec.courses && Array.isArray(rec.courses)) {
            allCourses.push(...rec.courses);
        }
    });

    const finalClass = determineClass(parseFloat(finalGPA), profile.duration || 4, allCourses);

    return (
        <Layout>
            <div className="no-print mb-4 flex-center" style={{ justifyContent: 'space-between' }}>
                <Button variant="secondary" onClick={() => navigate('/dashboard')}>
                    <ArrowLeft size={16} className="mr-2" /> Back to Dashboard
                </Button>
                <div className="flex-center gap-2">
                    <Button variant="secondary" onClick={handlePrint}>
                        <Printer size={16} className="mr-2" /> Print
                    </Button>
                    <Button onClick={handlePrint}>
                        <Download size={16} className="mr-2" /> Download PDF
                    </Button>
                </div>
            </div>

            <div className="card transcript-container" style={{ padding: '3rem', maxWidth: '900px', margin: '0 auto', fontFamily: 'Times New Roman, serif' }}>

                {/* Header */}
                <div className="text-center mb-8" style={{ borderBottom: '2px solid var(--text-main)', paddingBottom: '1rem' }}>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>{profile.university || 'HORIZON CAMPUS'}</h1>
                    <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>OFFICIAL ACADEMIC TRANSCRIPT</p>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Undergraduate Degree By-Laws (UGC Circular No. 901)</p>
                </div>

                {/* Student Details */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                    <div>
                        <p><strong>Name:</strong> {profile.name}</p>
                        <p><strong>Student ID:</strong> {profile.indexNo}</p>
                        <p><strong>Date of Birth:</strong> {profile.dob}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <p><strong>Degree:</strong> {profile.degree}</p>
                        <p><strong>Duration:</strong> {profile.startDate} - {profile.endDate}</p>
                        <p><strong>Date Issued:</strong> {new Date().toLocaleDateString()}</p>
                    </div>
                </div>

                {/* Grades Table */}
                <div style={{ marginBottom: '2rem' }}>
                    {groupedRecords.length === 0 ? (
                        <p className="text-center text-muted">No academic records found.</p>
                    ) : (
                        <div>
                            {groupedRecords.map((sem, index) => {
                                const semCredits = sem.courses?.reduce((acc, c) => acc + (Number(c.credits) || 0), 0) || 0;
                                const semGPA = calculateGPA(sem.courses || []);
                                return (
                                    <div key={index} style={{ marginBottom: '2rem' }}>
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            borderBottom: '1px solid var(--border)',
                                            paddingBottom: '0.5rem',
                                            marginBottom: '1rem',
                                            fontFamily: 'sans-serif'
                                        }}>
                                            <h3 style={{ margin: 0, fontWeight: 700 }}>
                                                Year {sem.year} - Semester {sem.semester}
                                            </h3>
                                            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                                Credits: <strong>{semCredits}</strong> | Semester GPA: <strong style={{ color: 'var(--primary)' }}>{semGPA}</strong>
                                            </span>
                                        </div>
                                        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1rem', tableLayout: 'fixed' }}>
                                            <colgroup>
                                                <col style={{ width: '45%' }} />
                                                <col style={{ width: '15%' }} />
                                                <col style={{ width: '15%' }} />
                                                <col style={{ width: '15%' }} />
                                                <col style={{ width: '10%' }} />
                                            </colgroup>
                                            <thead>
                                                <tr style={{ background: 'var(--surface-hover)', textAlign: 'left', borderBottom: '2px solid var(--border)' }}>
                                                    <th style={{ padding: '0.75rem', border: '1px solid var(--border)' }}>Course Name / Code</th>
                                                    <th style={{ padding: '0.75rem', border: '1px solid var(--border)', textAlign: 'center' }}>Credits</th>
                                                    <th style={{ padding: '0.75rem', border: '1px solid var(--border)', textAlign: 'center' }}>Grade</th>
                                                    <th style={{ padding: '0.75rem', border: '1px solid var(--border)', textAlign: 'center' }}>GPA</th>
                                                    <th style={{ padding: '0.75rem', border: '1px solid var(--border)', textAlign: 'center' }}>Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {sem.courses?.map((course: Course, idx: number) => {
                                                    const gpv = getEffectiveGPV(course.grade, course.isRepeat);
                                                    const isPass = gpv >= 1.70; // C- is minimum pass
                                                    return (
                                                        <tr key={idx}>
                                                            <td style={{ padding: '0.6rem 0.75rem', border: '1px solid var(--border)', wordWrap: 'break-word' }}>
                                                                {course.name}
                                                                {course.isRepeat && (
                                                                    <span style={{ color: '#f59e0b', fontSize: '0.8rem', marginLeft: '0.5rem' }}>
                                                                        (Repeat)
                                                                    </span>
                                                                )}
                                                            </td>
                                                            <td style={{ padding: '0.6rem 0.75rem', border: '1px solid var(--border)', textAlign: 'center' }}>{course.credits}</td>
                                                            <td style={{ padding: '0.6rem 0.75rem', border: '1px solid var(--border)', textAlign: 'center', fontWeight: 'bold' }}>{course.grade}</td>
                                                            <td style={{ padding: '0.6rem 0.75rem', border: '1px solid var(--border)', textAlign: 'center' }}>{gpv.toFixed(2)}</td>
                                                            <td style={{ padding: '0.6rem 0.75rem', border: '1px solid var(--border)', textAlign: 'center' }}>
                                                                {isPass ? (
                                                                    <span style={{ color: '#16a34a', display: 'inline-flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.8rem' }}>
                                                                        <CheckCircle size={14} /> Pass
                                                                    </span>
                                                                ) : (
                                                                    <span style={{ color: '#dc2626', display: 'inline-flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.8rem' }} title="Must be at least C- to graduate">
                                                                        <AlertCircle size={14} /> Repeat
                                                                    </span>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Final Summary */}
                <div style={{ borderTop: '2px solid var(--text-main)', paddingTop: '2rem', marginTop: '3rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                        <div>
                            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Final Academic Standing</h2>
                            <p>Total Credits Earned: <strong>{totalCredits}</strong></p>
                            <p>Final Cumulative GPA (Credit-Weighted): <strong>{finalGPA}</strong></p>
                            <p>Class / Award: <strong>{finalClass}</strong></p>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                                * Computed in accordance with Horizon Campus BIT (Hons.) in NMC By-Laws (Section 19 & 21).
                            </p>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ width: '180px', borderBottom: '1px solid var(--text-main)', marginBottom: '0.5rem' }}></div>
                            <p style={{ fontSize: '0.9rem' }}>Registrar / Authorized Signature</p>
                        </div>
                    </div>
                </div>

            </div>

            <style>{`
        @media print {
            .no-print, nav {
                display: none !important;
            }
            .transcript-container {
                box-shadow: none !important;
                border: none !important;
                width: 100% !important;
                max-width: 100% !important;
                margin: 0 !important;
                padding: 0 !important;
                background: white !important;
                color: black !important;
            }
            .transcript-container * {
                border-color: #ddd !important;
            }
            .transcript-container h1, .transcript-container h2, .transcript-container h3 {
                color: black !important;
            }
            body {
                background: white !important;
                color: black !important;
            }
            tr {
               background: transparent !important;
            }
        }
      `}</style>
        </Layout>
    );
};
