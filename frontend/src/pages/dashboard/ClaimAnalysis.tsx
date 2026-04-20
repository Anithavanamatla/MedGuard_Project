import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Shield, CheckCircle, XCircle, Activity, ArrowLeft } from 'lucide-react';

export const ClaimAnalysis = () => {
    const { claimId } = useParams();
    const navigate = useNavigate();
    const [claim, setClaim] = useState<any>(null);
    const [analysis, setAnalysis] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchClaimDetails();
    }, [claimId]);

    const fetchClaimDetails = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`http://localhost:8000/api/claims/${claimId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setClaim(data);
                // If already analyzed (risk_level is NOT Pending), set it
                // We check risk_level because is_fraud defaults to False on creation
                if (data.risk_level && data.risk_level !== 'Pending') {
                    setAnalysis({
                        is_fraud: data.fraud_prediction,
                        risk_level: data.risk_level,
                        estimated_cost: data.estimated_cost
                    });
                }
            }
        } catch (err) {
            console.error(err);
        }
    };

    const runAnalysis = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`http://localhost:8000/api/claims/${claimId}/analyze`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                const data = await res.json();
                setAnalysis({
                    is_fraud: data.fraud_analysis.is_fraud,
                    risk_level: data.cost_risk_analysis.risk_level,
                    estimated_cost: data.cost_risk_analysis.estimated_cost
                });
                fetchClaimDetails(); // Refresh to update status if needed
            } else {
                alert("Analysis connection failed");
            }
        } catch (err) {
            console.error(err);
            alert("Error running analysis");
        } finally {
            setLoading(false);
        }
    };

    const handleDecision = async (decision: string) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`http://localhost:8000/api/claims/${claimId}/decide`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    claim_id: claimId,
                    decision: decision
                })
            });
            if (res.ok) {
                // Show better feedback - maybe use a toast in future, for now alert is requested to be visible
                // But user complained "doesnshwoing any repsone"
                // Let's add a small delay or clearer message
                alert(`SUCCESS! Claim has been ${decision.toUpperCase()}.\n\nThe patient's dashboard will be updated immediately.`);
                navigate('/insurance');
            }
        } catch (err) {
            console.error(err);
        }
    };

    if (!claim) return <div className="p-8 text-center text-gray-400">Loading claim details...</div>;

    return (
        <div className="space-y-8 animate-enter max-w-5xl mx-auto">
            <Button variant="outline" onClick={() => navigate('/insurance')} className="gap-2">
                <ArrowLeft size={16} /> Back to Dashboard
            </Button>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Claim Details */}
                <div className="space-y-6">
                    <Card>
                        <h2 className="text-xl font-bold mb-4">Claim Details</h2>
                        <div className="space-y-4">
                            <div className="p-3 bg-white/5 rounded-lg">
                                <label className="text-sm text-gray-400">Patient Name</label>
                                <p className="font-medium text-lg">{claim.patient_name}</p>
                            </div>
                            <div className="p-3 bg-white/5 rounded-lg">
                                <label className="text-sm text-gray-400">Diagnosis</label>
                                <p className="font-medium">{claim.diagnosis}</p>
                            </div>
                            <div className="p-3 bg-white/5 rounded-lg">
                                <label className="text-sm text-gray-400">Treatment</label>
                                <p className="font-medium">{claim.treatment}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 bg-white/5 rounded-lg">
                                    <label className="text-sm text-gray-400">Amount Billed</label>
                                    <p className="font-medium text-lg">₹{claim.amount_billed}</p>
                                </div>
                                <div className="p-3 bg-white/5 rounded-lg">
                                    <label className="text-sm text-gray-400">Hospital Stay</label>
                                    <p className="font-medium">{claim.days_in_hospital} Days</p>
                                </div>
                            </div>

                            <Button className="w-full gap-2" variant="outline" onClick={() => window.open(`http://localhost:8000/api/ipfs/${claim.ipfs_cid}/download`, '_blank')}>
                                View Original Report (IPFS)
                            </Button>
                        </div>
                    </Card>
                </div>

                {/* AI Analysis Section */}
                <div className="space-y-6">
                    <Card className={`border-l-4 ${analysis?.is_fraud ? 'border-l-red-500' : 'border-l-blue-500'}`}>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Shield className="text-primary" /> AI Analysis
                            </h2>
                            {analysis && (
                                <span className={`px-3 py-1 rounded-full text-sm font-bold ${analysis.is_fraud ? 'bg-red-500/20 text-red-500' : 'bg-green-500/20 text-green-500'
                                    }`}>
                                    {analysis.is_fraud ? 'POSSIBLE FRAUD' : 'PASSED CHECKS'}
                                </span>
                            )}
                        </div>

                        {!analysis ? (
                            <div className="text-center py-8">
                                <Activity className="mx-auto text-gray-600 mb-4" size={48} />
                                <p className="text-gray-400 mb-6">Run our ML models to detect fraud and estimate costs.</p>
                                <Button size="lg" onClick={runAnalysis} isLoading={loading} className="w-full">
                                    Run AI Analysis
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-6 animate-enter">
                                {/* Fraud Check */}
                                <div className={`p-4 rounded-xl ${analysis.is_fraud ? 'bg-red-500/10' : 'bg-green-500/10'}`}>
                                    <h3 className="font-bold mb-2">Fraud Detection Model</h3>
                                    <p className="text-sm opacity-80">
                                        {analysis.is_fraud
                                            ? "The model detected anomalies in this claim inconsistent with historical patterns."
                                            : "No fraud patterns detected. Claim aligns with standard procedures."}
                                    </p>
                                </div>

                                {/* Cost Estimation */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-3 bg-white/5 rounded-lg">
                                        <label className="text-sm text-gray-400">Predicted Cost</label>
                                        <p className="font-bold text-lg">₹{Math.round(analysis.estimated_cost)}</p>
                                    </div>
                                    <div className="p-3 bg-white/5 rounded-lg">
                                        <label className="text-sm text-gray-400">Risk Level</label>
                                        <p className={`font-bold ${analysis.risk_level === 'High' ? 'text-red-400' :
                                            analysis.risk_level === 'Medium' ? 'text-yellow-400' : 'text-green-400'
                                            }`}>
                                            {analysis.risk_level} Risk
                                        </p>
                                    </div>
                                </div>

                                {/* Decision Actions */}
                                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                                    <Button variant="danger" onClick={() => handleDecision('Rejected')}>
                                        <XCircle className="mr-2" size={18} /> Reject Claim
                                    </Button>
                                    <Button className="bg-green-600 hover:bg-green-700" onClick={() => handleDecision('Approved')}>
                                        <CheckCircle className="mr-2" size={18} /> Approve
                                    </Button>
                                </div>
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </div>
    );
};
