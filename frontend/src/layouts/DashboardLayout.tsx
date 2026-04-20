import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard,
    FileText,
    Upload,
    Settings,
    LogOut,
    ShieldCheck,
    Activity
} from 'lucide-react';
import { cn } from '../utils/cn';

export const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const getLinks = () => {
        const common = [
            { icon: LayoutDashboard, label: 'Overview', href: `/${user?.role}` },
        ];

        if (user?.role === 'patient') {
            return [...common, { icon: FileText, label: 'My Claims', href: '/patient/claims' }];
        }
        if (user?.role === 'hospital') {
            return [...common, { icon: Upload, label: 'Submit Claim', href: '/hospital/submit' }];
        }
        if (user?.role === 'insurance') {
            return [...common, { icon: ShieldCheck, label: 'Review Claims', href: '/insurance/reviews' }];
        }
        return common;
    };

    const links = getLinks();

    return (
        <div className="flex min-h-screen bg-background relative overflow-hidden">
            {/* Background Ambience */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[20%] left-[50%] w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px]" />
            </div>

            {/* Sidebar */}
            <aside className="w-64 fixed inset-y-0 left-0 z-50 border-r border-white/5 bg-surface/50 backdrop-blur-xl flex flex-col">
                <div className="h-16 flex items-center px-6 border-b border-white/5">
                    <div className="flex items-center gap-2 text-white font-bold text-lg">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/25">
                            <Activity size={18} />
                        </div>
                        Medical AI
                    </div>
                </div>

                <div className="flex-1 py-6 px-3 space-y-1">
                    {links.map((link) => {
                        const Icon = link.icon;
                        const isActive = location.pathname === link.href;
                        return (
                            <Link
                                key={link.href}
                                to={link.href}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                                    isActive
                                        ? "bg-primary/10 text-primary"
                                        : "text-gray-400 hover:text-white hover:bg-white/5"
                                )}
                            >
                                <Icon size={18} />
                                {link.label}
                            </Link>
                        );
                    })}
                </div>

                <div className="p-4 border-t border-white/5">
                    <div className="flex items-center gap-3 px-3 py-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-gray-700 to-gray-600 flex items-center justify-center text-xs font-bold text-white">
                            {user?.name?.[0] || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                            <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                        <LogOut size={18} />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-64 relative z-10">
                <div className="p-8 max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
};
