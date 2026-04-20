import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Lock, AlertCircle, Briefcase } from 'lucide-react';

export const Signup = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'patient',
        specialization: '' // For doctors/hospitals
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await fetch('http://localhost:8000/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: formData.email, // Backend expects username
                    full_name: formData.name, // Backend expects full_name
                    password: formData.password,
                    role: formData.role
                })
            });

            if (response.ok) {
                const data = await response.json();
                login(data.access_token, data.user);
                navigate(`/${formData.role}`);
            } else {
                const errData = await response.json();
                // Handle different error formats safely
                let errorMessage = 'Signup failed';
                if (typeof errData.detail === 'string') {
                    errorMessage = errData.detail;
                } else if (Array.isArray(errData.detail)) {
                    // Extract messages from Pydantic validation errors
                    errorMessage = errData.detail.map((err: any) => err.msg).join(', ');
                } else if (typeof errData.detail === 'object') {
                    errorMessage = JSON.stringify(errData.detail);
                }
                setError(errorMessage);
            }
        } catch (err) {
            setError('Failed to connect to server');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[90vh] px-4 py-8">
            <Card variant="glass" className="w-full max-w-lg p-8 animate-enter">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold mb-2">Create Account</h2>
                    <p className="text-gray-400">Join the future of healthcare</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 flex items-center gap-3 text-sm">
                        <AlertCircle size={18} />
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
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
                        label="Full Name"
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        icon={<User size={18} />}
                        required
                    />

                    <Input
                        label={formData.role === 'patient' ? "Patient ID" : "Email Address"}
                        type={formData.role === 'patient' ? "text" : "email"}
                        placeholder={formData.role === 'patient' ? "PT-2024-001" : "name@example.com"}
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        icon={formData.role === 'patient' ? <User size={18} /> : <Mail size={18} />}
                        required
                        minLength={3}
                    />

                    {(formData.role === 'hospital') && (
                        <Input
                            label="Medical License / ID"
                            placeholder="LIC-12345"
                            icon={<Briefcase size={18} />}
                        />
                    )}

                    <div className="grid md:grid-cols-2 gap-4">
                        <Input
                            label="Password"
                            type="password"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            icon={<Lock size={18} />}
                            required
                            minLength={6}
                        />
                        <Input
                            label="Confirm Password"
                            type="password"
                            placeholder="••••••••"
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            icon={<Lock size={18} />}
                            required
                            minLength={6}
                        />
                    </div>

                    <div className="flex items-start gap-3 mt-4">
                        <div className="mt-1">
                            <input type="checkbox" className="rounded bg-white/5 border-white/10" required />
                        </div>
                        <p className="text-sm text-gray-400">
                            I agree to the <Link to="/terms" className="text-primary hover:underline">Terms of Service</Link> and <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
                        </p>
                    </div>

                    <Button type="submit" className="w-full mt-2" size="lg" isLoading={loading}>
                        Create Account
                    </Button>

                    <div className="text-center text-sm text-gray-400 mt-6">
                        Already have an account?{' '}
                        <Link to="/login" className="text-primary font-medium hover:text-primary-light transition-colors">
                            Sign In
                        </Link>
                    </div>
                </form>
            </Card>
        </div>
    );
};
