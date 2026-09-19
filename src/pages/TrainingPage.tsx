import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { TrainingCenter } from '@/components/training/TrainingCenter';
import { ArrowLeft, BookOpen } from 'lucide-react';

export const TrainingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link to="/">
            <Button variant="outline" className="flex items-center space-x-2">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Home</span>
            </Button>
          </Link>
          <div className="flex items-center space-x-3">
            <div className="bg-orange-600 p-2 rounded-lg">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">EcoWaste Training Center</h1>
          </div>
        </div>

        {/* Training Content */}
        <TrainingCenter />
      </div>
    </div>
  );
};