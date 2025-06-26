import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import type { Item } from '../types/Item';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Edit, Download, ArrowLeft, Trash2 } from 'lucide-react';
import { getApiUrl, getAssetUrl } from '../lib/config';

const ItemDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const response = await axios.get(getApiUrl(`/items/${id}`));
        setItem(response.data);
      } catch (error) {
        console.error('Error fetching item:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [id]);

  const handleDelete = async () => {
    if (!item) return;
    
    setIsDeleting(true);
    try {
      await axios.delete(getApiUrl(`/items/${item.id}`));
      navigate('/');
    } catch (error) {
      console.error('Error deleting item:', error);
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 sm:p-6">
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-muted rounded w-1/4 mb-4"></div>
              <div className="h-8 bg-muted rounded w-1/2 mb-4"></div>
              <div className="h-4 bg-muted rounded w-full mb-2"></div>
              <div className="h-4 bg-muted rounded w-3/4"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="container mx-auto p-4 sm:p-6">
        <Card>
          <CardContent className="p-4 sm:p-6 text-center">
            <p className="text-muted-foreground">Item not found.</p>
            <Button asChild className="mt-4 h-12 sm:h-10">
              <Link to="/">Back to Items</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 max-w-4xl">
      <div className="mb-4 sm:mb-6">
        <Button variant="outline" asChild className="h-12 sm:h-10">
          <Link to="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Items
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="p-4 sm:p-6">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-2xl sm:text-3xl mb-2 break-words">{item.name}</CardTitle>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <Badge variant="secondary">{item.category}</Badge>
                <span className="text-muted-foreground">Quantity: {item.quantity}</span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 lg:flex-shrink-0">
              <Button asChild className="h-12 sm:h-10">
                <Link to={`/item/${id}/edit`}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Item
                </Link>
              </Button>
              {item.qr_code_url && (
                <Button variant="outline" asChild className="h-12 sm:h-10">
                  <a
                    href={getAssetUrl(item.qr_code_url)}
                    download
                  >
                    <Download className="h-4 w-4 mr-2" />
                    QR Code
                  </a>
                </Button>
              )}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="h-12 sm:h-10">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Item
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Item</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete "{item.name}"? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {isDeleting ? 'Deleting...' : 'Delete'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-4 sm:p-6 space-y-6">
          {item.image_url && (
            <div className="rounded-lg overflow-hidden">
              <img 
                src={getAssetUrl(item.image_url)} 
                alt={item.name} 
                className="w-full h-48 sm:h-64 object-cover" 
              />
            </div>
          )}

          {item.custom_attributes && Object.keys(item.custom_attributes).length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Custom Attributes</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {Object.entries(item.custom_attributes).map(([key, value]) => (
                  <div key={key} className="border rounded-lg p-3">
                    <dt className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                      {key}
                    </dt>
                    <dd className="mt-1 text-sm break-words">
                      {String(value)}
                    </dd>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ItemDetails;
