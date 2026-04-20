import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { Upload, FileText, X, MapPin, Navigation, Search } from 'lucide-react';
import { useGeolocation } from '../../hooks/useGeolocation';

export const HospitalDashboard = () => {
    const { user } = useAuth();
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [ipfsCid, setIpfsCid] = useState('');
    const [recentClaims, setRecentClaims] = useState<any[]>([]);

    const [nearbyInsurance, setNearbyInsurance] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const { location, getLocation, loading: loadingLocation } = useGeolocation();

    React.useEffect(() => {
        if (location) {
            fetchNearbyInsurance();
        }
    }, [location]);

    const handleFindNearby = () => {
        if (!location) {
            getLocation();
        } else {
            fetchNearbyInsurance();
        }
    };

    const fetchNearbyInsurance = async () => {
        if (!location) return;
        try {
            let url = 'http://localhost:8000/api/locations/nearby/insurance';
            let body: any = location;

            if (searchQuery) {
                url = 'http://localhost:8000/api/locations/search';
                body = { ...location, query: `${searchQuery} insurance` };
            }

            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            if (res.ok) {
                setNearbyInsurance(await res.json());
            }
        } catch (err) {
            console.error(err);
        }
    };

    React.useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:8000/api/claims/history/hospital', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setRecentClaims(data);
            }
        } catch (err) {
            console.error("Failed to fetch history", err);
        }
    };

    // Form State
    const [formData, setFormData] = useState({
        patientId: '',
        patientName: '',
        age: '',
        gender: 'Male',
        diagnosis: '', // Diagnosis Name
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
            console.log("Uploaded to IPFS:", result.cid);
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
                patient_id: formData.patientId,
                patient_name: formData.patientName,
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
                alert("Claim submitted successfully to Blockchain!");
                // Reset form
                setFormData({
                    patientId: '', patientName: '', age: '', gender: 'Male',
                    diagnosis: '', treatment: '', amountBilled: '', daysInHospital: ''
                });
                setFile(null);
                setIpfsCid('');
                fetchHistory(); // Refresh list
            } else {
                alert("Failed to submit claim");
            }
        } catch (error) {
            console.error("Submission error", error);
            alert("Error submitting claim");
        }
    };

    return (
        <div className="space-y-8 animate-enter">
            <div>
                <h1 className="text-2xl font-bold">Hospital Dashboard</h1>
                <p className="text-gray-400">Submit new insurance claims and manage patient records</p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                {/* Submission Form */}
                <Card variant="glass" className="space-y-6">
                    <div>
                        <h3 className="text-lg font-bold mb-4">Submit New Claim</h3>
                        <div className="grid md:grid-cols-2 gap-4">
                            <Input
                                label="Patient ID"
                                placeholder="PT-2024-XXX"
                                value={formData.patientId}
                                onChange={e => setFormData({ ...formData, patientId: e.target.value })}
                            />
                            <Input
                                label="Patient Name"
                                placeholder="Full Name"
                                value={formData.patientName}
                                onChange={e => setFormData({ ...formData, patientName: e.target.value })}
                            />
                        </div>

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
                                label="Treatment"
                                placeholder="e.g. Antivirals, Oxygen Therapy"
                                value={formData.treatment}
                                onChange={e => setFormData({ ...formData, treatment: e.target.value })}
                            />
                        </div>

                        <div className="grid md:grid-cols-2 gap-4 mt-4">
                            <Input
                                label="Treatment Cost (₹)"
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
                                    <p className="text-xs text-gray-500 mt-2">PDF, JPG, PNG up to 10MB</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <Button className="w-full" size="lg" onClick={handleSubmit} disabled={!ipfsCid || uploading}>
                        {uploading ? 'Uploading to IPFS...' : 'Submit Claim for Review'}
                    </Button>
                </Card>

                {/* Nearby Insurance Partners */}
                <Card variant="glass" className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold flex items-center gap-2">
                            <MapPin className="text-blue-500" /> Nearby Insurance
                        </h3>
                        <Button size="sm" onClick={handleFindNearby} disabled={loadingLocation}>
                            {loadingLocation ? 'Locating...' : 'Find New'}
                        </Button>
                    </div>

                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search Insurance..."
                            className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 pl-10 text-sm focus:outline-none focus:border-primary w-full"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                    </div>

                    {nearbyInsurance.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-4">
                            {location ? "No insurance partners found." : "Click 'Find New' to locate partners."}
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {nearbyInsurance.map((ins: any) => (
                                <div key={ins.place_id} className="p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors group">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="font-bold text-sm">{ins.name}</h4>
                                            <p className="text-xs text-gray-400">{ins.address}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-xs text-yellow-500">★ {ins.rating}</span>
                                            </div>
                                        </div>
                                        <a
                                            href={`https://www.google.com/maps/dir/?api=1&origin=${location?.lat},${location?.lng}&destination_place_id=${ins.place_id}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="opacity-0 group-hover:opacity-100 p-2 hover:bg-white/10 rounded-full transition-all"
                                            title="Navigate"
                                        >
                                            <Navigation size={14} />
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>

                {/* Stats / Recent */}
                <div className="space-y-6">
                    <Card className="bg-gradient-to-br from-primary/20 to-secondary/20 border-white/10">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-white/10 rounded-lg">
                                <Upload className="text-white" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold">Fast-Track Upload</h3>
                                <p className="text-sm text-gray-300 mt-1">
                                    Our new IPFS integration ensures medical records are immutable and securely shared with insurers instantly.
                                </p>
                            </div>
                        </div>
                    </Card>

                    <Card>
                        <h3 className="font-bold mb-4">Recent Submissions</h3>
                        <div className="space-y-4">
                            {recentClaims.length === 0 ? (
                                <div className="text-center py-8 text-gray-500 text-sm">
                                    Submit a claim to see it here.
                                </div>
                            ) : (
                                recentClaims.map((claim) => (
                                    <div key={claim.claim_id} className="p-3 bg-white/5 rounded-lg flex items-center justify-between">
                                        <div>
                                            <p className="font-bold text-sm">{claim.patient_name} ({claim.patient_id})</p>
                                            <p className="text-xs text-gray-400">ID: {claim.claim_id}</p>
                                        </div>
                                        <div className="text-right">
                                            <span className={`text-xs px-2 py-1 rounded-full ${claim.status === 'Approved' ? 'bg-green-500/20 text-green-500' :
                                                claim.status === 'Rejected' ? 'bg-red-500/20 text-red-500' : 'bg-yellow-500/20 text-yellow-500'
                                                }`}>
                                                {claim.status}
                                            </span>
                                            <p className="text-xs text-gray-400 mt-1">₹{claim.amount_billed}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};
