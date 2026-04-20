import { useState, useCallback } from 'react';

export const useGeolocation = () => {
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const getLocation = useCallback(() => {
        setLoading(true);
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser');
            setLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                });
                setLoading(false);
            },
            (err) => {
                setError(err.message);
                setLoading(false);
                console.error("Geolocation error:", err);
            }
        );
    }, []);

    return { location, error, loading, getLocation };
};
