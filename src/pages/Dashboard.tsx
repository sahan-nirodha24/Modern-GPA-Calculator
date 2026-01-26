import React, { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Plus, BookOpen, Award, TrendingUp, Calendar } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { ref, onValue } from 'firebase/database';

import type { UserProfile, GPARecord, Course } from '../types.ts';

export const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { currentUser } = useAuth();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [records, setRecords] = useState<GPARecord[]>([]);

    const [showLoginSuccess, setShowLoginSuccess] = useState(false);

    // Stats
    const [currentGPA, setCurrentGPA] = useState('0.00');
    const [totalCredits, setTotalCredits] = useState(0);
    const [maxCredits, setMaxCredits] = useState(120);
    const [progress, setProgress] = useState(0);
    const [chartData, setChartData] = useState<{ year: string; gpa: number }[]>([]);

    useEffect(() => {
        if (location.state?.loginSuccess) {
            setShowLoginSuccess(true);
            // Clear the state so it doesn't show again on refresh if possible, 
            // though react-router state persists. We'll just rely on the timer.
            const timer = setTimeout(() => setShowLoginSuccess(false), 3000);

            // Clean up state (optional, but good for UX)
            window.history.replaceState({}, document.title);

            return () => clearTimeout(timer);
        }
    }, [location]);

    useEffect(() => {
        if (!currentUser) return;
        // ... rest of effect

        const profileRef = ref(db, `users/${currentUser.uid}/profile`);
        onValue(profileRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                setProfile(data);
                setMaxCredits(data.totalCredits || 120);
            }
        });

        const recordsRef = ref(db, `users/${currentUser.uid}/gpa_records`);
        onValue(recordsRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const loadedRecords: GPARecord[] = Object.values(data);
                // Sort by timestamp descending (newest first)
                loadedRecords.sort((a, b) => b.timestamp - a.timestamp);
                setRecords(loadedRecords);

                // Calculate Stats
                // let totalPoints = 0; // Unused for now
                let credits = 0;
                let gpaBySem: { year: string; gpa: number }[] = []; // Simple implementation, can be improved

                loadedRecords.forEach((rec) => {
                    /* In a real app we'd recalculate everything accurately, 
                       here we just sum up averages for demo or parse */
                    // This part requires proper calculation logic reuse
                    // For now, let's just assume records have pre-calculated GPA or we calculate weighted avg

                    rec.courses.forEach((c: Course) => {
                        // We need point values here which we might not have stored directly or need to lookup
                        // Simplified: assuming we stored enough info or just aggregating credits
                        credits += c.credits;
                    });

                    gpaBySem.push({ year: `Y${rec.year}S${rec.semester}`, gpa: rec.gpa });
                });

                // Weighted Average GPA Calculation would go here
                // Mocking current GPA update based on last record for simplicity in this step
                if (loadedRecords.length > 0) {
                    // logic to calc cumulative gpa
                    const cumulativeGPA = (loadedRecords.reduce((acc, curr) => acc + curr.gpa, 0) / loadedRecords.length).toFixed(2);
                    setCurrentGPA(cumulativeGPA);
                }

                setTotalCredits(credits);
                setProgress(Math.min(100, Math.round((credits / maxCredits) * 100)));
                setChartData(gpaBySem);
            }
        });

    }, [currentUser, maxCredits]);

    return (
        <Layout>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    {showLoginSuccess && (
                        <div style={{
                            marginBottom: '1rem',
                            padding: '0.75rem 1rem',
                            background: '#dcfce7',
                            color: '#166534',
                            borderRadius: '8px',
                            border: '1px solid #bbf7d0',
                            fontWeight: 'bold',
                            display: 'inline-block'
                        }}>
                            Login Successful! Welcome back.
                        </div>
                    )}
                    <h1 className="text-xl font-bold">Student Dashboard</h1>
                    <p className="text-muted">Welcome back {profile?.name}, check your progress</p>
                </div>
                <div className="flex-center gap-2">
                    <Button variant="secondary" onClick={() => navigate('/transcript')}>
                        <BookOpen size={18} style={{ marginRight: '0.5rem' }} /> Transcript
                    </Button>
                    <Button onClick={() => navigate('/gpa/add')}>
                        <Plus size={18} style={{ marginRight: '0.5rem' }} /> Add New GPA
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <StatCard
                    icon={<Award size={28} />}
                    title="Current GPA"
                    value={currentGPA}
                    gradient="linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)"
                />
                <StatCard
                    icon={<BookOpen size={28} />}
                    title="Total Credits"
                    value={`${totalCredits} / ${maxCredits}`}
                    gradient="linear-gradient(135deg, #10b981 0%, #059669 100%)"
                />
                <StatCard
                    icon={<TrendingUp size={28} />}
                    title="Progress"
                    value={`${progress}%`}
                    gradient="linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
                />
                <StatCard
                    icon={<Calendar size={28} />}
                    title="Graduation"
                    value={profile?.duration ? new Date(profile.endDate).getFullYear() : '2026'}
                    gradient="linear-gradient(135deg, #64748b 0%, #475569 100%)"
                />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '1.5rem' }}>
                <Card title="GPA Progression">
                    <div style={{ height: '300px', width: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData.length > 0 ? chartData : [{ year: 'Start', gpa: 0 }]} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
                                <defs>
                                    <linearGradient id="colorGpa" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                                <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
                                <YAxis domain={[0, 4]} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
                                <Tooltip
                                    contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                                    labelStyle={{ color: 'var(--text-muted)', marginBottom: '0.25rem' }}
                                />
                                <Area type="monotone" dataKey="gpa" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorGpa)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card title="Recent Courses">
                    {records.length === 0 ? (
                        <p className="text-muted">No recent courses added yet.</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {/* Show courses from the most recent semester record */}
                            {records[0].courses.slice(0, 4).map((course: Course, idx: number) => (
                                <div key={idx} style={{
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    padding: '1rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px',
                                    transition: 'transform 0.2s', cursor: 'default'
                                }}
                                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div className="flex-center" style={{
                                            width: '36px', height: '36px', borderRadius: '8px',
                                            background: course.grade.startsWith('A') ? '#dcfce7' : '#e0e7ff',
                                            color: course.grade.startsWith('A') ? '#166534' : '#4338ca',
                                            fontWeight: 'bold', fontSize: '0.9rem'
                                        }}>
                                            {course.grade}
                                        </div>
                                        <div>
                                            <p className="font-medium">{course.name}</p>
                                            <p className="text-sm text-muted">{course.credits} Credits</p>
                                        </div>
                                    </div>
                                    <div style={{
                                        padding: '0.25rem 0.75rem', borderRadius: '20px',
                                        background: 'var(--surface-hover)',
                                        color: 'var(--text-muted)',
                                        fontSize: '0.75rem', fontWeight: '500'
                                    }}>
                                        Completed
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    <div className="mt-4">
                        <Button variant="secondary" fullWidth onClick={() => navigate('/gpa/history')}>View Full History</Button>
                    </div>
                </Card>
            </div>
        </Layout>
    );
};

const StatCard = ({ icon, title, value, gradient }: any) => (
    <Card className="flex-center" style={{
        justifyContent: 'flex-start',
        gap: '1.25rem',
        background: gradient || 'var(--surface)',
        color: gradient ? 'white' : 'var(--text-main)',
        border: 'none',
        position: 'relative',
        overflow: 'hidden'
    }}>
        {/* Background Overlay Pattern */}
        <div style={{
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
            background: 'linear-gradient(45deg, rgba(255,255,255,0.1) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.1) 75%, transparent 75%, transparent)',
            backgroundSize: '20px 20px', opacity: 0.1
        }}></div>

        <div className="flex-center" style={{
            width: '56px', height: '56px', borderRadius: '16px',
            background: 'rgba(255, 255, 255, 0.2)',
            color: 'white',
            backdropFilter: 'blur(4px)',
            zIndex: 1
        }}>
            {icon}
        </div>
        <div style={{ zIndex: 1 }}>
            <p style={{ fontSize: '0.875rem', opacity: 0.9, marginBottom: '0.25rem' }}>{title}</p>
            <h2 className="text-xl font-bold" style={{ fontSize: '1.75rem' }}>{value}</h2>
        </div>
    </Card>
);
