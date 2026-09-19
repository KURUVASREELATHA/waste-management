import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, Upload } from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface WasteUploadFormProps {
  onUploadSuccess: () => void;
}

export const WasteUploadForm = ({ onUploadSuccess }: WasteUploadFormProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: '',
    weight: '',
    location: '',
    description: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.type || !formData.weight) {
      toast({
        title: "Missing Information",
        description: "Please select waste type and enter weight",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const wasteData = {
        type: formData.type,
        weight: parseFloat(formData.weight),
        location: formData.location || 'Not specified',
        description: formData.description || ''
      };
      
      console.log('Uploading waste data:', wasteData);
      
      const response = await api.post('/waste', wasteData);
      
      console.log('Waste upload response:', response);
      
      toast({
        title: "✅ Waste Uploaded!",
        description: `Your ${formData.type} waste (${formData.weight}kg) has been recorded successfully. Generate verification code from waste history when ready for collection.`,
      });

      setFormData({ type: '', weight: '', location: '', description: '' });
      onUploadSuccess();
    } catch (error) {
      console.error('Waste upload error:', error);
      toast({
        title: "❌ Upload Failed",
        description: error instanceof Error ? error.message : "Failed to upload waste data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Trash2 className="h-5 w-5 text-primary" />
          <span>Upload Waste Data</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Waste Type</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select waste type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="organic">Organic</SelectItem>
                  <SelectItem value="plastic">Plastic</SelectItem>
                  <SelectItem value="paper">Paper</SelectItem>
                  <SelectItem value="metal">Metal</SelectItem>
                  <SelectItem value="glass">Glass</SelectItem>
                  <SelectItem value="mixed">Mixed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Weight (kg)</Label>
              <Input
                type="number"
                step="0.1"
                placeholder="0.0"
                value={formData.weight}
                onChange={(e) => setFormData({...formData, weight: e.target.value})}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Location (Optional)</Label>
            <Input
              placeholder="Where is this waste located?"
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <Label>Description (Optional)</Label>
            <Textarea
              placeholder="Additional details about the waste..."
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            <Upload className="mr-2 h-4 w-4" />
            {loading ? 'Uploading...' : 'Upload Waste Data'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};