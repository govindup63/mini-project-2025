import { motion } from 'framer-motion';
import { Sun } from 'lucide-react';
import LocationForm from './components/LocationForm';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-secondary">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <Sun className="h-16 w-16 text-yellow-500" />
          </div>
          <h1 className="text-4xl font-bold mb-4">
            Solar ORC Fluid Recommendation Engine
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            This service fetches solar radiation data for your specified location and
            calculates the optimal organic working fluid for an Organic Rankine Cycle
            system based on real-time solar data.
          </p>
        </div>

        <LocationForm />
      </div>
    </main>
  );
}