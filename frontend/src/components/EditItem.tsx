import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import type { Item } from '../types/Item';
import type { CustomAttribute } from '../types/api-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Trash2, Plus, ArrowLeft, Save } from 'lucide-react';
import { getApiUrl, getAssetUrl } from '../lib/config';

const EditItem: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [item, setItem] = useState<Partial<Item>>({});
  const [customAttributes, setCustomAttributes] = useState<CustomAttribute[]>([]);
  const [newImage, setNewImage] = useState<File | null>(null);
  const [newImageUrl, setNewImageUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const response = await axios.get(getApiUrl(`/items/${id}`));
        setItem(response.data);
        if (response.data.custom_attributes) {
          setCustomAttributes(Object.entries(response.data.custom_attributes).map(([key, value]) => ({ 
            key, 
            value: typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean' 
              ? value 
              : String(value)
          })));
        }
      } catch (error) {
        console.error('Error fetching item:', error);
      }
    };
    fetchItem();
  }, [id]);

  const handleFileChange = (file: File | null) => {
    if (file) {
      setNewImage(file);
      setNewImageUrl(URL.createObjectURL(file));
    } else {
      setNewImage(null);
      setNewImageUrl(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setItem(prev => ({ ...prev, [name]: value }));
  };

  const handleAttributeChange = (index: number, field: 'key' | 'value', value: string) => {
    const newAttributes = [...customAttributes];
    newAttributes[index][field] = value;
    setCustomAttributes(newAttributes);
  };

  const addAttribute = () => {
    setCustomAttributes([...customAttributes, { key: '', value: '' }]);
  };

  const removeAttribute = (index: number) => {
    const newAttributes = customAttributes.filter((_, i) => i !== index);
    setCustomAttributes(newAttributes);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    
    let imageUrl = item.image_url;

    if (newImage) {
      const formData = new FormData();
      formData.append('file', newImage);
      try {
        const response = await axios.post(getApiUrl('/upload/'), formData);
        imageUrl = response.data.image_url;
      } catch (error) {
        console.error('Error uploading new image:', error);
        setIsSubmitting(false);
        return;
      }
    }

    const attributesObject = customAttributes.reduce((acc, attr) => {
      if (attr.key) acc[attr.key] = attr.value;
      return acc;
    }, {} as Record<string, any>);

    try {
      const updatedItem = { ...item, image_url: imageUrl, custom_attributes: attributesObject };
      await axios.put(getApiUrl(`/items/${id}`), updatedItem);
      navigate(`/item/${id}`);
    } catch (error) {
      console.error('Error updating item:', error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 max-w-2xl">
      <div className="mb-4 sm:mb-6">
        <Button variant="outline" asChild className="h-12 sm:h-10">
          <Link to={`/item/${id}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Item
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Edit Item</CardTitle>
          <CardDescription>
            Update the item information and custom attributes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  value={item.name || ''}
                  onChange={handleChange}
                  placeholder="Enter item name"
                  required
                  className="h-12 sm:h-10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  name="category"
                  type="text"
                  value={item.category || ''}
                  onChange={handleChange}
                  placeholder="Enter category"
                  required
                  className="h-12 sm:h-10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  name="quantity"
                  type="number"
                  value={item.quantity || ''}
                  onChange={handleChange}
                  placeholder="Enter quantity"
                  required
                  className="h-12 sm:h-10"
                />
              </div>
            </div>

            {/* Image Upload */}
            <div className="space-y-4">
              <Label>Item Image</Label>
              <div className="flex flex-col sm:flex-row items-start gap-4">
                {item.image_url && !newImageUrl && (
                  <div className="w-32 h-32 rounded-lg overflow-hidden border">
                    <img 
                      src={getAssetUrl(item.image_url!)} 
                      alt="Current item" 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                )}
                {newImageUrl && (
                  <div className="w-32 h-32 rounded-lg overflow-hidden border">
                    <img 
                      src={newImageUrl} 
                      alt="New item preview" 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                )}
                <div 
                  onDrop={handleDrop} 
                  onDragOver={handleDragOver} 
                  className="relative flex-1 min-h-32 border-2 border-dashed border-border rounded-lg flex items-center justify-center text-muted-foreground text-center p-4 hover:border-primary/50 transition-colors"
                >
                  <input 
                    type="file" 
                    className="absolute w-full h-full opacity-0 cursor-pointer" 
                    onChange={(e) => e.target.files && handleFileChange(e.target.files[0])} 
                    accept="image/*" 
                  />
                  <div className="text-sm">
                    Drag & drop a new image here, or click to select a file.
                  </div>
                </div>
              </div>
            </div>

            {/* Custom Attributes */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Custom Attributes</Label>
                <Button type="button" onClick={addAttribute} variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Attribute
                </Button>
              </div>
              
              {customAttributes.length > 0 ? (
                <div className="space-y-3">
                  {customAttributes.map((attr, index) => (
                    <div key={index} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      <Input
                        type="text"
                        placeholder="Attribute Name"
                        value={attr.key}
                        onChange={(e) => handleAttributeChange(index, 'key', e.target.value)}
                        className="flex-1 h-12 sm:h-10"
                      />
                      <Input
                        type="text"
                        placeholder="Value"
                        value={String(attr.value)}
                        onChange={(e) => handleAttributeChange(index, 'value', e.target.value)}
                        className="flex-1 h-12 sm:h-10"
                      />
                      <Button 
                        type="button" 
                        onClick={() => removeAttribute(index)} 
                        variant="destructive" 
                        size="sm"
                        className="h-12 sm:h-10 sm:w-auto"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  No custom attributes. Click "Add Attribute" to add some.
                </div>
              )}
            </div>

            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full h-12 sm:h-10" 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Save className="h-4 w-4 mr-2 animate-pulse" />
                  Saving Changes...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditItem;