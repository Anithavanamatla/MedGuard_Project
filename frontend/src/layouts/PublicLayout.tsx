import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Activity } from 'lucide-react';

export const PublicLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const location = useLocation();
    const isAuthPage = location.pathname.includes('/login') || location.pathname.includes('/signup');

    return (
        <div className="min-h-screen flex flex-col relative overflow-hidden">
            {/* Background Ambience */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] animate-float" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-secondary/20 rounded-full blur-[100px] animate-float animation-delay-200" />
            </div>

            {!isAuthPage && (
                <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-background/80 backdrop-blur-md">
                    <div className="container-custom h-16 flex items-center justify-between">
                        <Link to="/" className="flex items-center gap-2 group">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white shadow-lg shadow-primary/25 group-hover:shadow-primary/40 transition-all duration-300">
                                <Activity size={20} />
                            </div>
                            <span className="font-bold text-xl tracking-tight">Medical AI</span>
                        </Link>

                        <div className="flex items-center gap-4">
                            <Link to="/login">
                                <Button variant="ghost" size="sm">Log In</Button>
                            </Link>
                            <Link to="/signup">
                                <Button size="sm">Get Started</Button>
                            </Link>
                        </div>
                    </div>
                </nav>
            )}

            <main className="flex-1 relative z-10 pt-16">
                {children}
            </main>

            {!isAuthPage && (
                <footer className="border-t border-white/5 bg-background/50 backdrop-blur-sm py-8 relative z-10">
                    <div className="container-custom text-center text-gray-500 text-sm">
                        <p>&copy; {new Date().getFullYear()} Medical AI Platform. Enterprise Grade Healthcare Solutions.</p>
                    </div>
                </footer>
            )}
        </div>
    );
};
