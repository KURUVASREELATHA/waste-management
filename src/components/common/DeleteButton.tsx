import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';

interface DeleteButtonProps {
  itemId: string;
  itemType: 'waste' | 'report' | 'product';
  itemName?: string;
  onDeleteSuccess?: () => void;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'destructive' | 'outline' | 'ghost';
  className?: string;
}

export const DeleteButton = ({ 
  itemId, 
  itemType, 
  itemName = 'item',
  onDeleteSuccess,
  size = 'sm',
  variant = 'destructive',
  className = ''
}: DeleteButtonProps) => {
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  const getEndpoint = () => {
    switch (itemType) {
      case 'waste':
        return `/waste/${itemId}`;
      case 'report':
        return `/reports/${itemId}`;
      case 'product':
        return `/products/${itemId}`;
      default:
        throw new Error(`Unknown item type: ${itemType}`);
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(`Are you sure you want to delete this ${itemName}? This action cannot be undone.`);
    if (!confirmed) return;

    setIsDeleting(true);
    
    try {
      console.log(`Deleting ${itemType} with ID:`, itemId);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('You must be logged in to delete items');
      }

      const endpoint = getEndpoint();
      console.log(`Making DELETE request to: ${endpoint}`);
      
      await api.delete(endpoint);
      
      toast({
        title: "✅ Deleted Successfully",
        description: `${itemName} has been deleted.`,
      });

      if (onDeleteSuccess) {
        onDeleteSuccess();
      }
      
    } catch (error: any) {
      console.error(`Delete ${itemType} error:`, error);
      
      let errorMessage = 'Failed to delete item';
      
      if (error.message.includes('No token')) {
        errorMessage = 'Please log in again to delete items';
      } else if (error.message.includes('Network')) {
        errorMessage = 'Network error. Please check your connection.';
      } else if (error.message.includes('not found')) {
        errorMessage = 'Item not found or already deleted';
      } else if (error.message.includes('not authorized')) {
        errorMessage = 'You are not authorized to delete this item';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "❌ Delete Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Button
      size={size}
      variant={variant}
      onClick={handleDelete}
      disabled={isDeleting}
      className={className}
    >
      {isDeleting ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Trash2 className="h-4 w-4" />
      )}
      {isDeleting ? 'Deleting...' : 'Delete'}
    </Button>
  );
};