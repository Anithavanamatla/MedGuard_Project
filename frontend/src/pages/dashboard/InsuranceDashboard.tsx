import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Activity, FileText, MapPin, Search, Navigation } from 'lucide-react';
import { useGeolocation } from '../../hooks/useGeolocation';
import { Link } from 'react-router-dom';

export const InsuranceDashboard = () => {
    const [claims, setClaims] = useState<any[]>([]);

    useEffect(() => {
        fetchClaims();
    }, []);

    const fetchClaims = async () => {
        try {
            const token = localStorage.getItem('token');
            // Fetch ALL claims to show both pending and history
            const res = await fetch('http://localhost:8000/api/claims/', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setClaims(data);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const pendingClaims = claims.filter(c => c.status === 'Pending' || c.status === 'Submitted');
    const recentHistory = claims.filter(c => c.status !== 'Pending' && c.status !== 'Submitted');

    const [nearbyHospitals, setNearbyHospitals] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const { location, getLocation, loading: loadingLocation } = useGeolocation();

    useEffect(() => {
        if (location) {
            fetchNearbyHospitals();
        }
    }, [location]);

    const handleFindNearby = () => {
        if (!location) {
            getLocation();
        } else {
            fetchNearbyHospitals();
        }
    };

    const fetchNearbyHospitals = async () => {
        if (!location) return;
        try {
            let url = 'http://localhost:8000/api/locations/nearby/hospitals';
            let body: any = location;

            if (searchQuery) {
                url = 'http://localhost:8000/api/locations/search';
                body = { ...location, query: `${searchQuery} hospital` };
            }

            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            if (res.ok) {
                setNearbyHospitals(await res.json());
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="space-y-8 animate-enter">
            <div>
                <h1 className="text-2xl font-bold">Insurance Claims Review</h1>
                <p className="text-gray-400">AI-Assisted fraud detection and claims processing</p>
            </div>

            {/* Stats - Placeholder for now, can be calculated from claims later */}
            <div className="grid md:grid-cols-4 gap-6">
                <Card className="p-4 bg-blue-500/10 border-blue-500/20">
                    <div className="flex items-center gap-3 mb-2">
                        <Activity className="text-blue-400" size={20} />
                        <span className="text-sm font-medium text-blue-400">Pending Review</span>
                    </div>
                    <p className="text-2xl font-bold">{pendingClaims.length}</p>
                </Card>
            </div>

            <h3 className="text-lg font-bold mt-8">Items Requiring Review</h3>
            <div className="grid gap-4">
                {pendingClaims.length === 0 ? (
                    <div className="text-center py-10 text-gray-500">
                        No pending claims to review.
                    </div>
                ) : (
                    pendingClaims.map((claim) => (
                        <Card key={claim.claim_id} className="flex flex-col md:flex-row items-center gap-6 p-6">
                            <div className="w-16 h-16 rounded-xl bg-white/5 flex items-center justify-center text-gray-400 shrink-0">
                                <FileText size={32} />
                            </div>

                            <div className="flex-1 space-y-2 text-center md:text-left">
                                <div className="flex flex-col md:flex-row md:items-center gap-2">
                                    <h4 className="text-lg font-bold">Claim #{claim.claim_id}</h4>
                                    <span className="inline-block px-2 py-0.5 rounded text-xs font-bold bg-yellow-500/20 text-yellow-500">
                                        {claim.status}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-400">
                                    Patient: <span className="text-white">{claim.patient_name}</span> &bull;
                                    Hospital: <span className="text-white">{claim.hospital_id}</span> &bull;
                                    Amount: <span className="text-white font-medium">₹{claim.amount_billed}</span>
                                </p>
                                <p className="text-xs text-gray-400 bg-white/5 border border-white/10 p-2 rounded max-w-xl">
                                    Diagnosis: {claim.diagnosis}
                                </p>
                            </div>

                            <div className="flex items-center gap-3 w-full md:w-auto">
                                <Link to={`/claims/${claim.claim_id}`}>
                                    <Button size="sm" className="flex-1 md:flex-none">
                                        Analyze with AI
                                    </Button>
                                </Link>
                                <Button variant="outline" size="sm" className="flex-1 md:flex-none" onClick={() => window.open(`http://localhost:8000/api/ipfs/${claim.ipfs_cid}/download`, '_blank')}>
                                    View Report
                                </Button>
                            </div>
                        </Card>
                    ))
                )}

            </div>

            {/* Recent History Table */}
            <div className="mt-8">
                <h3 className="text-lg font-bold mb-4">Recent Processed Claims</h3>
                <Card className="overflow-hidden bg-surface border border-white/5">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-white/5 text-gray-400">
                                <tr>
                                    <th className="px-6 py-4 font-medium">Claim ID</th>
                                    <th className="px-6 py-4 font-medium">Patient</th>
                                    <th className="px-6 py-4 font-medium">Amount</th>
                                    <th className="px-6 py-4 font-medium">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {recentHistory.length === 0 ? (
                                    <tr><td colSpan={5} className="text-center py-8 text-gray-500">No processed claims yet.</td></tr>
                                ) : (
                                    recentHistory.map((claim) => (
                                        <tr key={claim.claim_id} className="hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-4 font-medium">{claim.claim_id}</td>
                                            <td className="px-6 py-4">{claim.patient_name}</td>
                                            <td className="px-6 py-4">₹{claim.amount_billed}</td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${claim.status === 'Approved' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                                    {claim.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>

            {/* Nearby Partner Hospitals */}
            <div className="mt-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                        <MapPin className="text-red-500" /> Nearby Partner Hospitals
                    </h3>
                    <div className="flex gap-2">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search Hospital..."
                                className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 pl-10 text-sm focus:outline-none focus:border-primary w-64"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                        </div>
                        <Button
                            onClick={handleFindNearby}
                            disabled={loadingLocation}
                            className="whitespace-nowrap"
                        >
                            {loadingLocation ? 'Locating...' : 'Find Nearby'}
                        </Button>
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    {nearbyHospitals.length === 0 ? (
                        <div className="col-span-3 text-center py-8 text-gray-500 border border-dashed border-white/10 rounded-xl">
                            {location ? "No hospitals found." : "Click 'Find Nearby' to locate partner hospitals."}
                        </div>
                    ) : (
                        nearbyHospitals.map((hospital: any) => (
                            <Card key={hospital.place_id} className="p-4 hover:bg-white/5 transition-colors group">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="font-bold text-lg">{hospital.name}</h4>
                                        <p className="text-sm text-gray-400 mb-2">{hospital.address}</p>
                                        <div className="flex items-center gap-4 text-sm">
                                            <span className="text-yellow-500">★ {hospital.rating}</span>
                                        </div>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&origin=${location?.lat},${location?.lng}&destination_place_id=${hospital.place_id}`, '_blank')}
                                    >
                                        <Navigation size={14} className="mr-2" /> Navigate
                                    </Button>
                                </div>
                            </Card>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};
