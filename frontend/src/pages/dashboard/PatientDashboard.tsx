import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { FileText, Activity, AlertCircle, Plus, MapPin, Search, Navigation } from 'lucide-react';
import { useGeolocation } from '../../hooks/useGeolocation';

export const PatientDashboard = () => {
    const [claims, setClaims] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);
    const navigate = useNavigate();

    const [nearbyHospitals, setNearbyHospitals] = React.useState<any[]>([]);
    const [searchQuery, setSearchQuery] = React.useState('');
    const { location, getLocation, loading: loadingLocation } = useGeolocation();

    React.useEffect(() => {
        fetchClaims();
    }, []);

    React.useEffect(() => {
        if (location) {
            fetchNearbyHospitals();
        }
    }, [location]); // Re-fetch when location is acquired

    const handleFindNearby = () => {
        if (!location) {
            getLocation(); // This will trigger the effect above once location is set
        } else {
            fetchNearbyHospitals(); // If already have location, just fetch/refresh
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

    const fetchClaims = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:8000/api/claims/history/patient', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setClaims(data);
            }
        } catch (error) {
            console.error("Failed to fetch claims", error);
        } finally {
            setLoading(false);
        }
    };

    // Calculate stats
    const totalClaims = claims.length;
    const totalCovered = claims
        .filter(c => c.status === 'Approved')
        .reduce((acc, curr) => acc + (curr.amount_billed || 0), 0);
    const pendingCount = claims.filter(c => c.status === 'Pending').length;

    return (
        <div className="space-y-8 animate-enter">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Patient Dashboard</h1>
                    <p className="text-gray-400">Welcome back, View your medical claims history</p>
                </div>
                <Button icon={<Plus size={18} />} onClick={() => navigate('/patient/submit')}>New Claim</Button>
            </div>

            {/* Stats Row */}
            <div className="grid md:grid-cols-3 gap-6">
                <Card variant="glass" className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500">
                            <FileText size={24} />
                        </div>
                        {/* <span className="text-sm font-medium text-green-400">+12%</span> */}
                    </div>
                    <h3 className="text-3xl font-bold mb-1">{totalClaims}</h3>
                    <p className="text-sm text-gray-400">Total Claims</p>
                </Card>

                <Card variant="glass" className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 rounded-xl bg-purple-500/10 text-purple-500">
                            <Activity size={24} />
                        </div>
                        <span className="text-sm font-medium text-green-400">Active</span>
                    </div>
                    <h3 className="text-3xl font-bold mb-1">₹{totalCovered.toLocaleString()}</h3>
                    <p className="text-sm text-gray-400">Total Approved Amount</p>
                </Card>

                <Card variant="glass" className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 rounded-xl bg-orange-500/10 text-orange-500">
                            <AlertCircle size={24} />
                        </div>
                        <span className="text-sm font-medium text-gray-500">{pendingCount} Pending</span>
                    </div>
                    <h3 className="text-3xl font-bold mb-1">{pendingCount}</h3>
                    <p className="text-sm text-gray-400">Pending Review</p>
                </Card>
            </div>

            {/* Claims Table */}
            <Card className="overflow-hidden bg-surface border border-white/5">
                <div className="p-6 border-b border-white/5">
                    <h3 className="font-bold text-lg">Recent Claims</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-white/5 text-gray-400">
                            <tr>
                                <th className="px-6 py-4 font-medium">Claim ID</th>
                                <th className="px-6 py-4 font-medium">Date</th>
                                <th className="px-6 py-4 font-medium">Hospital</th>
                                <th className="px-6 py-4 font-medium">Amount</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr><td colSpan={6} className="text-center py-4 text-gray-500">Loading claims...</td></tr>
                            ) : claims.length === 0 ? (
                                <tr><td colSpan={6} className="text-center py-4 text-gray-500">No claims found.</td></tr>
                            ) : (
                                claims.map((claim) => (
                                    <tr key={claim.claim_id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4 font-medium">{claim.claim_id}</td>
                                        <td className="px-6 py-4 text-gray-400">{new Date(claim.created_at).toLocaleDateString()}</td>
                                        <td className="px-6 py-4">{claim.hospital_id}</td>
                                        <td className="px-6 py-4">₹{claim.amount_billed}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${claim.status === 'Approved' ? 'bg-green-500/10 text-green-500' :
                                                claim.status === 'Rejected' ? 'bg-red-500/10 text-red-500' : 'bg-yellow-500/10 text-yellow-500'
                                                }`}>
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

            {/* Nearby Hospitals Section */}
            <div className="mt-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <MapPin className="text-red-500" /> Nearby Hospitals
                    </h3>
                    <div className="flex gap-2">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search (e.g. Cardiac)"
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

                <div className="grid md:grid-cols-2 gap-4">
                    {nearbyHospitals.length === 0 ? (
                        <div className="col-span-2 text-center py-8 text-gray-500 border border-dashed border-white/10 rounded-xl">
                            {location ? "No hospitals found matching your criteria." : "Click 'Find Nearby' to locate hospitals near you."}
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
