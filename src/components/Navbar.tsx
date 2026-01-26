import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, LogOut, User, Sun, Moon } from 'lucide-react';
import { Button } from './Button';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { db } from '../firebase';
import { ref, onValue } from 'firebase/database';

export const Navbar: React.FC = () => {
    const navigate = useNavigate();
    const { currentUser, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const [name, setName] = useState('Student');
    const [showName, setShowName] = useState(false);

    useEffect(() => {
        if (currentUser) {
            const profileRef = ref(db, `users/${currentUser.uid}/profile`);
            onValue(profileRef, (snapshot) => {
                const data = snapshot.val();
                if (data) {
                    if (data.name) setName(data.name);
                } else {
                    // Fallback to email or display name if DB profile missing
                    setName(currentUser.displayName || currentUser.email?.split('@')[0] || 'User');
                }
            });
        }
    }, [currentUser]);

    const handleLogout = async () => {
        await logout();
        navigate('/login', { state: { logoutSuccess: true } });
    };

    // Helper for avatar logic (consistent with Profile)
    const getInitials = (name: string) => {
        if (!name || name === 'Student' || name === 'User') return 'S';
        // If name is just one word, take first 2 chars or just 1?
        // Let's stick to standard initials logic: First Letter of each word, max 2
        const parts = name.split(' ');
        if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
        return (parts[0][0] + parts[1][0]).toUpperCase();
    };

    return (
        <nav style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
            <div className="container" style={{ height: '4rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Link to="/dashboard" className="flex-center gap-2" style={{ textDecoration: 'none', color: 'var(--primary)' }}>
                    <GraduationCap size={28} />
                    <span className="text-xl font-bold">GPA Calculator</span>
                </Link>

                <div className="flex-center gap-4" style={{ position: 'relative' }}>
                    <div
                        className="flex-center"
                        onClick={toggleTheme}
                        style={{
                            cursor: 'pointer',
                            color: 'var(--text-main)',
                            padding: '0.5rem',
                            borderRadius: '50%',
                            transition: 'background 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-hover)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
                    >
                        {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                    </div>

                    <div
                        className="flex-center"
                        style={{
                            width: '40px', height: '40px',
                            borderRadius: '50%',
                            background: 'var(--primary-light)',
                            color: 'var(--primary)',
                            cursor: 'pointer',
                            fontSize: '1rem', // Adjusted for up to 2 chars
                            fontWeight: 'bold',
                            border: '1px solid var(--primary-light)'
                        }}
                        onClick={() => setShowName(!showName)}
                    >
                        {getInitials(name)}
                    </div>

                    {showName && (
                        <div style={{
                            position: 'absolute',
                            top: '50px',
                            right: '0',
                            background: 'var(--surface)',
                            border: '1px solid var(--border)',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                            padding: '1rem',
                            minWidth: '200px',
                            zIndex: 100
                        }}>
                            <div style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                                <p className="text-sm text-muted">Signed in as</p>
                                <p className="font-bold">{name}</p>
                            </div>

                            <Button
                                variant="secondary"
                                onClick={() => { setShowName(false); navigate('/profile'); }}
                                fullWidth
                                style={{ justifyContent: 'flex-start', marginBottom: '0.5rem' }}
                            >
                                <User size={16} className="mr-2" /> Manage Profile
                            </Button>

                            <Button variant="secondary" onClick={handleLogout} fullWidth style={{ justifyContent: 'flex-start' }}>
                                <LogOut size={16} className="mr-2" /> Logout
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};
