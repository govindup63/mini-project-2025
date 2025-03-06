'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Sun, Droplets } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { SolarData } from '../types';

export default function LocationForm() {
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<SolarData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const response = await fetch(`/api/getData?location=${encodeURIComponent(location)}`);
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error);
      }

      setData(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-2">
          <Input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Enter location (e.g., Bengaluru, Chennai)"
            className="flex-1"
            disabled={loading}
          />
          <Button type="submit" disabled={loading}>
            <Search className="w-4 h-4 mr-2" />
            Search
          </Button>
        </div>
      </form>

      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-8 text-center"
        >
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Fetching data...</p>
        </motion.div>
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8"
        >
          <Card className="p-4 bg-destructive/10 text-destructive">
            <p>{error}</p>
          </Card>
        </motion.div>
      )}

      {data && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 space-y-4"
        >
          <Card className="p-6">
            <div className="grid gap-4">
              <div className="flex items-center gap-3">
                <Sun className="w-5 h-5 text-yellow-500" />
                <h3 className="text-lg font-semibold">Solar Radiation Data</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="font-medium">{data.location}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Average Radiation</p>
                  <p className="font-medium">{data.average.toFixed(2)} W/m²</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="grid gap-4">
              <div className="flex items-center gap-3">
                <Droplets className="w-5 h-5 text-blue-500" />
                <h3 className="text-lg font-semibold">Recommended Fluid</h3>
              </div>
              <p className="text-3xl font-bold text-primary">{data.fluid}</p>
              <p className="text-sm text-muted-foreground">
                Based on the average solar radiation at your location, we recommend using{' '}
                {data.fluid} as the working fluid for your Organic Rankine Cycle system.
              </p>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
}