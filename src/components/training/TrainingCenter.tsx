import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AIClassifier } from './AIClassifier';
import { Play, Clock, Users, X, Scan } from 'lucide-react';

interface TrainingVideo {
  id: string;
  title: string;
  description: string;
  duration: string;
  category: 'cleaning' | 'safety' | 'segregation';
  thumbnail: string;
  videoUrl: string;
  viewers: number;
}

const trainingVideos: TrainingVideo[] = [
  {
    id: '1',
    title: 'Proper Waste Segregation Techniques',
    description: 'Learn how to correctly separate organic, plastic, paper, and hazardous waste for better recycling.',
    duration: '8:45',
    category: 'segregation',
    thumbnail: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=400&h=300&fit=crop',
    videoUrl: 'https://www.youtube.com/embed/6jQ7y_qQYUA',
    viewers: 1250
  },
  {
    id: '2',
    title: 'Safety Protocols for Waste Handling',
    description: 'Essential safety measures and protective equipment for handling different types of waste materials.',
    duration: '12:30',
    category: 'safety',
  thumbnail: '/images/safety.png',
    videoUrl: 'https://www.youtube.com/embed/hhVK3IS9q2A',
    viewers: 890
  },
  {
    id: '3',
    title: 'Effective Cleaning Methods',
    description: 'Best practices for cleaning waste containers, collection areas, and maintaining hygiene.',
    duration: '6:15',
    category: 'cleaning',
    thumbnail: '/images/3.jpeg',
    videoUrl: 'https://www.youtube.com/embed/kzZzD8cxmJ4',
    viewers: 2100
  },
  {
    id: '4',
    title: 'Advanced Waste Sorting',
    description: 'Advanced techniques for identifying and sorting complex waste materials and recyclables.',
    duration: '15:20',
    category: 'segregation',
    thumbnail: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=400&h=300&fit=crop',
    videoUrl: 'https://www.youtube.com/embed/iBjFx2NhJpM',
    viewers: 675
  },
  {
    id: '5',
    title: 'Personal Protective Equipment Guide',
    description: 'Complete guide on selecting, using, and maintaining PPE for waste management workers.',
    duration: '10:45',
    category: 'safety',
    thumbnail: '/images/44.jpeg',
    videoUrl: 'https://www.youtube.com/embed/Hyph_DZa_GQ',
    viewers: 1450
  },
  {
    id: '6',
    title: 'Sanitization and Disinfection',
    description: 'Proper sanitization techniques for waste collection vehicles and equipment.',
    duration: '9:30',
    category: 'cleaning',
    thumbnail: 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=400&h=300&fit=crop',
    videoUrl: 'https://www.youtube.com/embed/kzZzD8cxmJ4',
    viewers: 980
  }
];

export const TrainingCenter = () => {
  const [selectedVideo, setSelectedVideo] = useState<TrainingVideo | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showScanner, setShowScanner] = useState(false);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'cleaning': return 'bg-blue-100 text-blue-800';
      case 'safety': return 'bg-red-100 text-red-800';
      case 'segregation': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredVideos = selectedCategory === 'all' 
    ? trainingVideos 
    : trainingVideos.filter(video => video.category === selectedCategory);

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Training Center</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Access training videos and smart waste classification tools
        </p>
      </div>

      <div className="text-center mb-8">
        <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-xl p-6 mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-2">🤖 AI-Powered Classification</h3>
          <p className="text-gray-600 mb-4">Upload waste images for instant AI identification</p>
          <Button
            onClick={() => setShowScanner(true)}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            size="lg"
          >
            <Scan className="mr-2 h-6 w-6" />
            Try AI Waste Classifier
          </Button>
        </div>
      </div>

      <div className="flex justify-center space-x-4 mb-8">
        <Button
          variant={selectedCategory === 'all' ? 'default' : 'outline'}
          onClick={() => setSelectedCategory('all')}
        >
          All Videos
        </Button>
        <Button
          variant={selectedCategory === 'cleaning' ? 'default' : 'outline'}
          onClick={() => setSelectedCategory('cleaning')}
        >
          Cleaning
        </Button>
        <Button
          variant={selectedCategory === 'safety' ? 'default' : 'outline'}
          onClick={() => setSelectedCategory('safety')}
        >
          Safety
        </Button>
        <Button
          variant={selectedCategory === 'segregation' ? 'default' : 'outline'}
          onClick={() => setSelectedCategory('segregation')}
        >
          Segregation
        </Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVideos.map((video) => (
          <Card key={video.id} className="group hover:shadow-lg transition-all duration-300 cursor-pointer">
            <CardHeader className="p-0">
              <div className="relative">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="lg"
                    className="bg-white text-black hover:bg-gray-100"
                    onClick={() => setSelectedVideo(video)}
                  >
                    <Play className="h-6 w-6 mr-2" />
                    Play Video
                  </Button>
                </div>
                <Badge className={`absolute top-2 right-2 ${getCategoryColor(video.category)}`}>
                  {video.category}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <CardTitle className="text-lg mb-2 line-clamp-2">{video.title}</CardTitle>
              <CardDescription className="text-sm text-gray-600 mb-4 line-clamp-3">
                {video.description}
              </CardDescription>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {video.duration}
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    {video.viewers}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedVideo && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-xl font-semibold">{selectedVideo.title}</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedVideo(null)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="aspect-video">
              <iframe
                src={selectedVideo.videoUrl}
                title={selectedVideo.title}
                className="w-full h-full"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
            </div>
            <div className="p-4">
              <p className="text-gray-600 mb-4">{selectedVideo.description}</p>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <Badge className={getCategoryColor(selectedVideo.category)}>
                  {selectedVideo.category}
                </Badge>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {selectedVideo.duration}
                </div>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  {selectedVideo.viewers} viewers
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showScanner && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">AI Waste Classifier</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowScanner(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="p-6">
              <AIClassifier />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};