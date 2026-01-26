import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { GraduationCap, User, Mail, Hash, Calendar, Lock, School, BookOpen, Clock, Award } from 'lucide-react';

import authBg from '../assets/auth-bg.png';

import { createUserWithEmailAndPassword } from 'firebase/auth';
import { ref, set } from 'firebase/database';
import { auth, db } from '../firebase';

export const Signup: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    // Form States
    const [formData, setFormData] = useState({
        name: '', email: '', password: '', confirmPassword: '',
        indexNo: '', dob: '', university: '', degree: '',
        startDate: '', endDate: '', duration: 1, totalCredits: 1
    });

    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match!");
            return;
        }

        setLoading(true);
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
            const user = userCredential.user;

            // Save user profile to Realtime Database
            await set(ref(db, 'users/' + user.uid + '/profile'), {
                name: formData.name,
                email: formData.email,
                indexNo: formData.indexNo,
                dob: formData.dob,
                university: formData.university,
                degree: formData.degree,
                startDate: formData.startDate,
                endDate: formData.endDate,
                duration: formData.duration,
                totalCredits: formData.totalCredits
            });

            navigate('/dashboard');
        } catch (error: any) {
            console.error(error);
            if (error.code === 'auth/email-already-in-use') {
                setError("This email is already registered. Please login instead.");
            } else if (error.code === 'auth/weak-password') {
                setError("Password should be at least 6 characters.");
            } else {
                setError(error.message);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleClear = () => {
        setFormData({
            name: '', email: '', password: '', confirmPassword: '',
            indexNo: '', dob: '', university: '', degree: '',
            startDate: '', endDate: '', duration: 1, totalCredits: 1
        });
        setError('');
    };

    return (
        <div className="flex-center" style={{
            minHeight: '100vh',
            padding: '2rem 0',
            backgroundImage: `url(${authBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
        }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card"
                style={{
                    width: '100%',
                    maxWidth: '600px',
                    padding: '2.5rem',
                    background: 'var(--surface)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid var(--border)',
                    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.2)'
                }}
            >
                <div className="text-center mb-6">
                    <div className="flex-center" style={{
                        color: 'var(--primary)',
                        marginBottom: '1rem',
                        background: 'var(--primary-light)',
                        width: '64px',
                        height: '64px',
                        borderRadius: '50%',
                        margin: '0 auto 1rem'
                    }}>
                        <GraduationCap size={32} />
                    </div>
                    <h1 className="text-2xl font-bold mb-2">Create Account</h1>
                    <p className="text-muted">Start tracking your academic success today</p>
                    {error && (
                        <div style={{
                            marginTop: '1rem',
                            padding: '0.75rem',
                            background: '#fee2e2',
                            color: '#dc2626',
                            borderRadius: '6px',
                            border: '1px solid #fecaca',
                            fontSize: '0.875rem',
                            fontWeight: 'bold',
                            textAlign: 'left'
                        }}>
                            {error}
                        </div>
                    )}
                </div>

                <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <Input label="Full Name" name="name" value={formData.name} onChange={handleChange} placeholder="Full Name" required leftIcon={<User size={18} />} />
                        <Input label="Index Number" name="indexNo" value={formData.indexNo} onChange={handleChange} placeholder="Index No" required leftIcon={<Hash size={18} />} />
                    </div>

                    <Input label="Email Address" type="email" name="email" value={formData.email} onChange={handleChange} placeholder="email@example.com" required leftIcon={<Mail size={18} />} />

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <Input label="Password" type="password" name="password" value={formData.password} onChange={handleChange} placeholder="******" required leftIcon={<Lock size={18} />} />
                        <Input label="Confirm Password" type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="******" required leftIcon={<Lock size={18} />} />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <Input label="Date of Birth" type="date" name="dob" value={formData.dob} onChange={handleChange} required leftIcon={<Calendar size={18} />} />
                        <Input label="University" name="university" value={formData.university} onChange={handleChange} placeholder="University" required leftIcon={<School size={18} />} />
                    </div>

                    <Input label="Degree Program" name="degree" value={formData.degree} onChange={handleChange} placeholder="Degree Name" required leftIcon={<BookOpen size={18} />} />

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <Input label="Start Date" type="date" name="startDate" value={formData.startDate} onChange={handleChange} required leftIcon={<Calendar size={18} />} />
                        <Input label="End Date" type="date" name="endDate" value={formData.endDate} onChange={handleChange} required leftIcon={<Calendar size={18} />} />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <Input label="Duration (Yrs)" type="number" name="duration" value={formData.duration} onChange={handleChange} min="1" max="6" leftIcon={<Clock size={18} />} />
                        <Input label="Credits" type="number" name="totalCredits" value={formData.totalCredits} onChange={handleChange} placeholder="1" leftIcon={<Award size={18} />} />
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                        {error && (
                            <Button type="button" variant="secondary" onClick={handleClear} fullWidth>
                                Clear
                            </Button>
                        )}
                        <Button
                            type="submit"
                            fullWidth
                            isLoading={loading}
                            style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)' }}
                        >
                            Create Account
                        </Button>
                    </div>
                </form>

                <div className="text-center mt-6 pt-6 border-t border-border">
                    <span className="text-muted text-sm">Already have an account? </span>
                    <Link to="/login" className="text-sm font-bold text-primary">
                        Login
                    </Link>
                </div>
            </motion.div>
        </div>
    );
};
