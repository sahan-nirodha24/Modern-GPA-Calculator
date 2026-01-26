import React, { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { ArrowLeft, Save, User, BookOpen, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { ref, onValue, update } from 'firebase/database';

export const Profile: React.FC = () => {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        indexNo: '',
        university: '',
        degree: '',
        dob: '',
        startDate: '',
        endDate: '',
        duration: 4,
        totalCredits: 120
    });

    useEffect(() => {
        if (!currentUser) return;
        const profileRef = ref(db, `users/${currentUser.uid}/profile`);
        onValue(profileRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const { photoURL, ...rest } = data;
                setFormData(prev => ({
                    ...prev,
                    ...rest
                }));
            }
        }, { onlyOnce: true });
    }, [currentUser]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser) return;

        setLoading(true);
        try {
            await update(ref(db, `users/${currentUser.uid}/profile`), formData);
            alert("Profile updated successfully!");
        } catch (error: any) {
            console.error(error);
            alert("Failed to update profile: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const getInitials = (name: string) => {
        if (!name) return 'S';
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <Layout>
            <div className="mb-4 flex-center" style={{ justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Button variant="secondary" onClick={() => navigate('/dashboard')} style={{ padding: '0.5rem' }}>
                        <ArrowLeft size={18} />
                    </Button>
                    <h1 className="text-xl font-bold">My Profile</h1>
                </div>
            </div>

            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <Card style={{ padding: 0, overflow: 'hidden' }}>
                    {/* Banner Section */}
                    <div style={{
                        height: '140px',
                        background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%)',
                        position: 'relative'
                    }}></div>

                    <div style={{ padding: '0 2rem 2rem' }}>
                        {/* Avatar Section - Negative Margin to overlap banner */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            marginTop: '-60px',
                            marginBottom: '1.5rem',
                            position: 'relative',
                            zIndex: 10
                        }}>
                            <div className="flex-center" style={{
                                width: '120px', height: '120px',
                                borderRadius: '50%',
                                background: 'var(--surface)',
                                color: 'var(--primary)',
                                border: '4px solid var(--surface)',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                fontSize: '2.5rem',
                                fontWeight: 'bold'
                            }}>
                                {getInitials(formData.name)}
                            </div>
                        </div>

                        <div className="text-center mb-8">
                            <h2 className="text-xl font-bold">{formData.name || 'Student'}</h2>
                            <p className="text-muted">{currentUser?.email}</p>
                        </div>

                        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                            {/* Personal Information Section */}
                            <div>
                                <h3 className="text-lg font-bold mb-4 flex-center" style={{ justifyContent: 'flex-start', gap: '0.5rem' }}>
                                    <User size={20} className="text-primary" style={{ color: 'var(--primary)' }} />
                                    Personal Information
                                </h3>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                    <Input
                                        label="Full Name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="John Doe"
                                        required
                                    />
                                    <Input
                                        label="Index Number"
                                        name="indexNo"
                                        value={formData.indexNo}
                                        onChange={handleChange}
                                        placeholder="e.g. STU-2023-001"
                                        required
                                    />
                                    <Input
                                        label="Date of Birth"
                                        type="date"
                                        name="dob"
                                        value={formData.dob}
                                        onChange={handleChange}
                                        required
                                    />
                                    <Input
                                        label="Email (Read Only)"
                                        value={currentUser?.email || ''}
                                        disabled
                                        className="text-muted"
                                        style={{ background: 'var(--surface-hover)', cursor: 'not-allowed' }}
                                    />
                                </div>
                            </div>

                            {/* Academic Details Section */}
                            <div>
                                <h3 className="text-lg font-bold mb-4 flex-center" style={{ justifyContent: 'flex-start', gap: '0.5rem' }}>
                                    <BookOpen size={20} style={{ color: 'var(--primary)' }} />
                                    Academic Details
                                </h3>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                    <Input
                                        label="University Name"
                                        name="university"
                                        value={formData.university}
                                        onChange={handleChange}
                                        placeholder="University of Excellence"
                                        required
                                    />
                                    <Input
                                        label="Degree Program"
                                        name="degree"
                                        value={formData.degree}
                                        onChange={handleChange}
                                        placeholder="BSc Computer Science"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Program Duration Section */}
                            <div>
                                <h3 className="text-lg font-bold mb-4 flex-center" style={{ justifyContent: 'flex-start', gap: '0.5rem' }}>
                                    <Calendar size={20} style={{ color: 'var(--primary)' }} />
                                    Program Duration
                                </h3>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <Input label="Start Date" type="date" name="startDate" value={formData.startDate} onChange={handleChange} required />
                                        <Input label="End Date" type="date" name="endDate" value={formData.endDate} onChange={handleChange} required />
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <Input label="Duration (Years)" type="number" name="duration" value={formData.duration} onChange={handleChange} min="1" max="6" />
                                        <Input label="Total Credits" type="number" name="totalCredits" value={formData.totalCredits} onChange={handleChange} placeholder="120" />
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-border flex-center" style={{ justifyContent: 'flex-end' }}>
                                <Button
                                    type="submit"
                                    isLoading={loading}
                                    style={{
                                        background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)',
                                        minWidth: '200px'
                                    }}
                                >
                                    <Save size={18} className="mr-2" /> Save Changes
                                </Button>
                            </div>
                        </form>
                    </div>
                </Card>
            </div>
        </Layout>
    );
};
