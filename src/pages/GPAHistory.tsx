import React, { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Trash2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { ref, onValue, remove } from 'firebase/database';

import type { GPARecord } from '../types';

export const GPAHistory: React.FC = () => {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [records, setRecords] = useState<GPARecord[]>([]);

    useEffect(() => {
        if (!currentUser) return;
        const recordsRef = ref(db, `users/${currentUser.uid}/gpa_records`);
        onValue(recordsRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const list: GPARecord[] = Object.entries(data).map(([key, val]: [string, any]) => ({
                    id: key,
                    ...val,
                    credits: val.courses ? val.courses.reduce((acc: number, c: any) => acc + c.credits, 0) : 0
                }));
                // Sort by timestamp desc
                list.sort((a, b) => b.timestamp - a.timestamp);
                setRecords(list);
            } else {
                setRecords([]);
            }
        });
    }, [currentUser]);

    const handleDelete = async (id: string) => {
        if (!currentUser) return;
        if (window.confirm("Are you sure you want to delete this record?")) {
            try {
                await remove(ref(db, `users/${currentUser.uid}/gpa_records/${id}`));
            } catch (error) {
                console.error("Error deleting:", error);
                alert("Failed to delete record.");
            }
        }
    };

    return (
        <Layout>
            <div className="mb-4 flex-center" style={{ justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Button variant="secondary" onClick={() => navigate('/dashboard')} style={{ padding: '0.5rem' }}>
                        <ArrowLeft size={18} />
                    </Button>
                    <h1 className="text-xl font-bold">GPA History</h1>
                </div>
            </div>

            <Card>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                <th className="p-4 font-medium text-muted">Year</th>
                                <th className="p-4 font-medium text-muted">Semester</th>
                                <th className="p-4 font-medium text-muted">Credits</th>
                                <th className="p-4 font-medium text-muted">GPA</th>
                                <th className="p-4 font-medium text-muted" style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {records.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-4 text-center text-muted">No records found.</td>
                                </tr>
                            ) : (
                                records.map((item) => (
                                    <tr key={item.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                        <td className="p-4">Year {item.year}</td>
                                        <td className="p-4">Semester {item.semester}</td>
                                        <td className="p-4">{item.credits}</td>
                                        <td className="p-4">
                                            <span style={{
                                                fontWeight: 'bold',
                                                color: item.gpa >= 3.5 ? 'var(--success)' : 'var(--text-main)'
                                            }}>
                                                {item.gpa.toFixed(2)}
                                            </span>
                                        </td>
                                        <td className="p-4" style={{ textAlign: 'right' }}>
                                            <div className="flex-center" style={{ justifyContent: 'flex-end', gap: '0.5rem' }}>
                                                {/* Edit functionality skipped for now as per minimal requirement, focus on display & delete */}
                                                <Button
                                                    variant="danger"
                                                    style={{ padding: '0.4rem', color: 'var(--error)', borderColor: 'var(--error)' }}
                                                    onClick={() => handleDelete(item.id)}
                                                >
                                                    <Trash2 size={16} />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </Layout>
    );
};
