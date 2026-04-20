import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { Upload, FileText, X, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const PatientSubmitClaim = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [ipfsCid, setIpfsCid] = useState('');

    // Form State (Auto-fill patient ID/Name from user if available)
    const [formData, setFormData] = useState({
        // patientId: user?.username || '', // We'll infer this in backend or duplicate it
        // patientName: user?.full_name || '',
        age: '',
        gender: 'Male',
        diagnosis: '',
        treatment: '',
        amountBilled: '',
        daysInHospital: '',
    });

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileUpload(e.dataTransfer.files[0]);
        }
    };

    const handleFileUpload = async (uploadedFile: File) => {
        setFile(uploadedFile);
        setUploading(true);

        const data = new FormData();
        data.append('file', uploadedFile);

        try {
            const response = await fetch('http://localhost:8000/api/ipfs/upload', {
                method: 'POST',
                body: data
            });
            const result = await response.json();
            setIpfsCid(result.cid);
        } catch (error) {
            console.error("IPFS Upload failed", error);
            alert("Failed to upload report to IPFS");
            setFile(null);
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async () => {
        if (!ipfsCid) {
            alert("Please upload a medical report first.");
            return;
        }

        try {
            const payload = {
                // Determine ID/Name. Backend uses logged-in user for patient role submissions usually?
                // The `submit_claim` endpoint in claims.py looks for `claim.patient_id`. 
                // If I am a patient, I should look like the hospital form but hardcode my ID.
                patient_id: user?.username || user?.id || '',
                patient_name: user?.full_name || user?.name || 'Patient',
                age: parseInt(formData.age),
                gender: formData.gender,
                diagnosis: formData.diagnosis,
                treatment: formData.treatment,
                amount_billed: parseFloat(formData.amountBilled),
                days_in_hospital: parseInt(formData.daysInHospital),
                ipfs_cid: ipfsCid
            };

            const response = await fetch('http://localhost:8000/api/claims/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                alert("Claim submitted successfully! Insurance company will review it shortly.");
                navigate('/patient');
            } else {
                alert("Failed to submit claim");
            }
        } catch (error) {
            console.error("Submission error", error);
            alert("Error submitting claim");
        }
    };

    return (
        <div className="space-y-8 animate-enter max-w-4xl mx-auto">
            <Button variant="outline" onClick={() => navigate('/patient')} className="gap-2">
                <ArrowLeft size={16} /> Back to Dashboard
            </Button>

            <Card variant="glass" className="space-y-6">
                <div>
                    <h3 className="text-xl font-bold mb-4">Submit New Medical Claim</h3>
                    <p className="text-gray-400 mb-6">Upload your report and details for insurance review.</p>

                    <div className="grid md:grid-cols-2 gap-4 mt-4">
                        <Input
                            label="Age"
                            type="number"
                            placeholder="e.g. 45"
                            value={formData.age}
                            onChange={e => setFormData({ ...formData, age: e.target.value })}
                        />
                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-gray-400 ml-1">Gender</label>
                            <select
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                                value={formData.gender}
                                onChange={e => setFormData({ ...formData, gender: e.target.value })}
                            >
                                <option value="Male" className="bg-gray-900">Male</option>
                                <option value="Female" className="bg-gray-900">Female</option>
                            </select>
                        </div>
                    </div>

                    <div className="mt-4">
                        <Input
                            label="Diagnosis Name"
                            placeholder="e.g. Viral Pneumonia"
                            value={formData.diagnosis}
                            onChange={e => setFormData({ ...formData, diagnosis: e.target.value })}
                        />
                    </div>

                    <div className="mt-4">
                        <Input
                            label="Treatment / Procedure"
                            placeholder="e.g. Antivirals, Oxygen Therapy"
                            value={formData.treatment}
                            onChange={e => setFormData({ ...formData, treatment: e.target.value })}
                        />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 mt-4">
                        <Input
                            label="Billed Amount (₹)"
                            type="number"
                            placeholder="0.00"
                            value={formData.amountBilled}
                            onChange={e => setFormData({ ...formData, amountBilled: e.target.value })}
                        />
                        <Input
                            label="Days in Hospital"
                            type="number"
                            placeholder="e.g. 5"
                            value={formData.daysInHospital}
                            onChange={e => setFormData({ ...formData, daysInHospital: e.target.value })}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-400">Medical Reports (IPFS Upload)</label>
                    <div
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        onClick={() => document.getElementById('file-upload')?.click()}
                        className={`border-2 border-dashed border-white/10 rounded-xl p-8 text-center hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer ${uploading ? 'opacity-50' : ''}`}
                    >
                        <input
                            type="file"
                            id="file-upload"
                            className="hidden"
                            onChange={(e) => e.target.files && handleFileUpload(e.target.files[0])}
                        />

                        {file ? (
                            <div className="flex items-center justify-center gap-4 bg-white/5 p-4 rounded-lg">
                                <FileText className="text-primary" />
                                <div className="text-left">
                                    <p className="text-sm font-medium">{file.name}</p>
                                    {ipfsCid && <p className="text-xs text-green-400">CID: {ipfsCid.substring(0, 10)}...</p>}
                                </div>
                                <button onClick={(e) => { e.stopPropagation(); setFile(null); setIpfsCid(''); }} className="text-gray-400 hover:text-white">
                                    <X size={18} />
                                </button>
                            </div>
                        ) : (
                            <div className="text-gray-400">
                                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                <p className="text-sm">Drag and drop medical reports here</p>
                            </div>
                        )}
                    </div>
                </div>

                <Button className="w-full" size="lg" onClick={handleSubmit} disabled={!ipfsCid || uploading}>
                    {uploading ? 'Uploading to IPFS...' : 'Submit Claim'}
                </Button>
            </Card>
        </div>
    );
};
