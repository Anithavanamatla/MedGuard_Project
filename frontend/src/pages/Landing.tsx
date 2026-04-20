import React, { useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Activity, ShieldCheck, Zap, ArrowRight, BarChart } from 'lucide-react';
import { Link } from 'react-router-dom';

export const LandingPage = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    return (
        <div className="flex flex-col items-center">
            {/* Hero Section */}
            <section className="w-full py-20 lg:py-32 flex flex-col items-center text-center px-4">
                <div className={`transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-md">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        <span className="text-xs font-medium text-gray-300 tracking-wide uppercase">AI-Powered Healthcare v1.0</span>
                    </div>

                    <h1 className="text-5xl lg:text-7xl font-bold mb-6 tracking-tight max-w-4xl mx-auto">
                        The Future of <br className="hidden lg:block" />
                        <span className="text-gradient-primary">Intelligent Insurance</span>
                    </h1>

                    <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
                        Enterprise-grade fraud detection and cost estimation powered by advanced machine learning models and blockchain security.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/login">
                            <Button size="lg" className="min-w-[160px]">
                                Get Started
                                <ArrowRight size={18} />
                            </Button>
                        </Link>
                        <Link to="/about">
                            <Button variant="secondary" size="lg" className="min-w-[160px]">
                                Learn More
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="w-full py-20 px-4">
                <div className="container-custom">
                    <div className="grid md:grid-cols-3 gap-8">
                        <Card variant="glass" className="group" hover>
                            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 mb-6 group-hover:scale-110 transition-transform duration-300">
                                <ShieldCheck size={28} />
                            </div>
                            <h3 className="text-xl font-bold mb-3">Fraud Detection</h3>
                            <p className="text-gray-400 leading-relaxed mb-6">
                                Advanced SVM algorithms analyze claim patterns to detect anomalies with 93.74% accuracy.
                            </p>
                            <div className="flex items-center gap-2 text-sm font-medium text-blue-400">
                                <span>Accuracy Rate</span>
                                <div className="h-px bg-blue-500/20 flex-1"></div>
                                <span className="text-white">93.74%</span>
                            </div>
                        </Card>

                        <Card variant="glass" className="group" hover>
                            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500 mb-6 group-hover:scale-110 transition-transform duration-300">
                                <BarChart size={28} />
                            </div>
                            <h3 className="text-xl font-bold mb-3">Cost Analysis</h3>
                            <p className="text-gray-400 leading-relaxed mb-6">
                                Random Forest models predict treatment costs and identify pricing discrepancies instantly.
                            </p>
                            <div className="flex items-center gap-2 text-sm font-medium text-purple-400">
                                <span>R² Score</span>
                                <div className="h-px bg-purple-500/20 flex-1"></div>
                                <span className="text-white">0.95</span>
                            </div>
                        </Card>

                        <Card variant="glass" className="group" hover>
                            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-500 mb-6 group-hover:scale-110 transition-transform duration-300">
                                <Zap size={28} />
                            </div>
                            <h3 className="text-xl font-bold mb-3">Real-time Processing</h3>
                            <p className="text-gray-400 leading-relaxed mb-6">
                                Instant claim verification and approval workflows powered by decentralized storage.
                            </p>
                            <div className="flex items-center gap-2 text-sm font-medium text-cyan-400">
                                <span>Uptime</span>
                                <div className="h-px bg-cyan-500/20 flex-1"></div>
                                <span className="text-white">99.9%</span>
                            </div>
                        </Card>
                    </div>
                </div>
            </section>
        </div>
    );
};
