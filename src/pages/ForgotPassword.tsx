import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Mail, ArrowLeft } from 'lucide-react';

import authBg from '../assets/auth-bg.png';

export const ForgotPassword: React.FC = () => {
    const [sent, setSent] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            setSent(true);
        }, 1500);
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
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
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
                <Link to="/login" className="flex-center gap-2 text-muted mb-6" style={{ justifyContent: 'flex-start', fontSize: '0.875rem', fontWeight: '500' }}>
                    <ArrowLeft size={16} />
                    Back to Login
                </Link>

                <div className="text-center mb-6">
                    <div className="flex-center" style={{
                        width: '64px', height: '64px', borderRadius: '50%',
                        background: 'var(--primary-light)', color: 'var(--primary)',
                        margin: '0 auto 1rem'
                    }}>
                        <Mail size={32} />
                    </div>
                    <h1 className="text-2xl font-bold mb-2">Forgot Password?</h1>
                    <p className="text-muted">No worries, we'll send you reset instructions.</p>
                </div>

                {!sent ? (
                    <form onSubmit={handleSubmit}>
                        <Input
                            label="Email Address"
                            type="email"
                            placeholder="Enter your email"
                            required
                            leftIcon={<Mail size={18} />}
                        />
                        <Button
                            type="submit"
                            fullWidth
                            isLoading={loading}
                            className="mt-4"
                            style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)' }}
                        >
                            Send Reset Link
                        </Button>
                    </form>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center p-4 bg-green-50 rounded"
                        style={{ background: '#DCFCE7', color: '#166534', borderRadius: 'var(--radius-md)', padding: '1.5rem' }}
                    >
                        <p className="font-bold text-lg mb-2">Check your email!</p>
                        <p className="text-sm">We've sent a password reset link to your inbox.</p>
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
};
