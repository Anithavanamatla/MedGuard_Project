import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, AlertCircle, User } from 'lucide-react';

export const Login = () => {
    const [formData, setFormData] = useState({ username: '', password: '', role: 'patient' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch('http://localhost:8000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                const data = await response.json();
                login(data.access_token, data.user);
                navigate(`/${formData.role}`);
            } else {
                setError('Invalid credentials. Please try again.');
            }
        } catch (err) {
            setError('Failed to connect to server.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[80vh] px-4">
            <Card variant="glass" className="w-full max-w-md p-8 animate-enter">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold mb-2">Welcome Back</h2>
                    <p className="text-gray-400">Sign in to access your dashboard</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 flex items-center gap-3 text-sm">
                        <AlertCircle size={18} />
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-3 gap-2 mb-6 p-1 bg-white/5 rounded-xl">
                        {['patient', 'hospital', 'insurance'].map((role) => (
                            <button
                                key={role}
                                type="button"
                                onClick={() => setFormData({ ...formData, role })}
                                className={`py-2 text-sm font-medium rounded-lg capitalize transition-all duration-200 ${formData.role === role
                                    ? 'bg-primary text-white'
                                    : 'text-gray-400 hover:text-white'
                                    }`}
                            >
                                {role}
                            </button>
                        ))}
                    </div>

                    <Input
                        label={formData.role === 'patient' ? "Patient ID" : "Username / Email"}
                        type="text"
                        placeholder={formData.role === 'patient' ? "PT-2024-001" : "username"}
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        icon={formData.role === 'patient' ? <User size={18} /> : <Mail size={18} />}
                        required
                    />

                    <div className="space-y-1">
                        <Input
                            label="Password"
                            type="password"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            icon={<Lock size={18} />}
                            required
                        />
                        <div className="text-right">
                            <Link to="/forgot-password" className="text-xs text-primary hover:text-primary-light">
                                Forgot password?
                            </Link>
                        </div>
                    </div>

                    <Button type="submit" className="w-full" size="lg" isLoading={loading}>
                        Sign In
                    </Button>

                    <div className="text-center text-sm text-gray-400 mt-6">
                        Don't have an account?{' '}
                        <Link to="/signup" className="text-primary font-medium hover:text-primary-light transition-colors">
                            Create Account
                        </Link>
                    </div>
                </form>
            </Card>
        </div>
    );
};
