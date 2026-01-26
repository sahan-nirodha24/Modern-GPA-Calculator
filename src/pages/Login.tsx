import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { GraduationCap, Mail, Lock } from 'lucide-react';

import authBg from '../assets/auth-bg.png';

import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';

export const Login: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showLogoutSuccess, setShowLogoutSuccess] = useState(false);

    useEffect(() => {
        if (location.state?.logoutSuccess) {
            setShowLogoutSuccess(true);
            const timer = setTimeout(() => setShowLogoutSuccess(false), 3000);
            window.history.replaceState({}, document.title);
            return () => clearTimeout(timer);
        }
    }, [location]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await signInWithEmailAndPassword(auth, email, password);
            navigate('/dashboard', { state: { loginSuccess: true } });
        } catch (error) {
            const err = error as { code?: string; message?: string };
            if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
                setError("Invalid email or password. Please check your credentials.");
            } else if (err.code === 'auth/too-many-requests') {
                setError("Too many failed attempts. Please try again later.");
            } else {
                setError("Failed to login. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleClear = () => {
        setEmail('');
        setPassword('');
        setError('');
    };

    return (
        <div className="flex-center" style={{
            minHeight: '100vh',
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
                    maxWidth: '400px',
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
                    {showLogoutSuccess && (
                        <div style={{
                            marginBottom: '1rem',
                            padding: '0.5rem',
                            background: '#dbeafe',
                            color: '#1e40af',
                            borderRadius: '6px',
                            border: '1px solid #93c5fd',
                            fontSize: '0.875rem',
                            fontWeight: 'bold'
                        }}>
                            Logged out successfully.
                        </div>
                    )}
                    {error && (
                        <div style={{
                            marginBottom: '1rem',
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
                    <h1 className="text-2xl font-bold mb-2">Welcome Back</h1>
                    <p className="text-muted">Sign in to continue to your GPA Dashboard</p>
                </div>

                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <Input
                        label="Email Address"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        required
                        leftIcon={<Mail size={18} />}
                    />
                    <Input
                        label="Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        required
                        leftIcon={<Lock size={18} />}
                    />

                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Link to="/forgot-password" style={{ fontSize: '0.875rem', fontWeight: '500' }}>
                            Forgot Password?
                        </Link>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
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
                            Login
                        </Button>
                    </div>
                </form>

                <div className="text-center mt-6 pt-6 border-t border-border">
                    <span className="text-muted text-sm">Don't have an account? </span>
                    <Link to="/signup" className="text-sm font-bold text-primary">
                        Create an Account
                    </Link>
                </div>
            </motion.div>
        </div>
    );
};
