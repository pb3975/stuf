import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
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
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, Camera, Loader2, CheckCircle, AlertCircle, Sparkles, ImageIcon } from 'lucide-react';
import CameraCapture from './CameraCapture';
import { getApiUrl } from '../lib/config';

interface SmartAddResponse {
  success: boolean;
  confidence: number;
  suggestions?: {
    name: string;
    category: string;
    quantity: number;
    custom_attributes: Record<string, any>;
    similar_items?: Array<{
      id: number;
      name: string;
      quantity: number;
      category: string;
    }>;
  };
  error_message?: string;
}

const AddItemForm: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [quantity, setQuantity] = useState<number | ''>('');
  const [image, setImage] = useState<File | null>(null);
  const [customAttributes, setCustomAttributes] = useState<{ key: string, value: string }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // SmartAdd states
  const [smartAddFiles, setSmartAddFiles] = useState<File[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<SmartAddResponse | null>(null);
  const [showSmartAdd, setShowSmartAdd] = useState(false);

  // Check if user is on mobile device
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                   window.innerWidth <= 768;

  const handleSmartAddFilesSelected = (files: FileList | null) => {
    if (files) {
      const fileArray = Array.from(files);
      const imageFiles = fileArray.filter(file => file.type.startsWith('image/'));
      setSmartAddFiles(imageFiles.slice(0, 3)); // Max 3 photos
      setAnalysisResult(null);
    }
  };

  const handleRegularImageSelected = (files: FileList | null) => {
    if (files && files[0]) {
      setImage(files[0]);
    }
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleSmartAddAnalyze = async () => {
    if (smartAddFiles.length === 0) return;

    setIsAnalyzing(true);
    try {
      console.log('🤖 Starting SmartAdd analysis...');
      
      // Convert files to base64
      const base64Photos = await Promise.all(
        smartAddFiles.map(file => convertToBase64(file))
      );
      console.log(`📸 Converted ${base64Photos.length} photos to base64`);

      // Send to backend for analysis
      const apiUrl = getApiUrl('/smart-add/');
      console.log('🌐 Sending SmartAdd request to:', apiUrl);
      
      const response = await axios.post<SmartAddResponse>(apiUrl, {
        photos: base64Photos
      });

      console.log('✅ SmartAdd analysis successful:', response.data);
      setAnalysisResult(response.data);
    } catch (error) {
      console.error('❌ SmartAdd analysis failed:', error);
      
      if (error instanceof Error) {
        console.error('Error message:', error.message);
      }
      // Check if it's an axios error
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as any;
        if (axiosError.response) {
          console.error('SmartAdd Response status:', axiosError.response.status);
          console.error('SmartAdd Response data:', axiosError.response.data);
        } else if (axiosError.request) {
          console.error('SmartAdd No response received:', axiosError.request);
        }
      }
      
      setAnalysisResult({
        success: false,
        confidence: 0,
        error_message: 'Failed to connect to SmartAdd service'
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleUseSuggestions = () => {
    if (analysisResult?.success && analysisResult.suggestions) {
      const suggestions = analysisResult.suggestions;
      
      // Apply suggestions to form
      setName(suggestions.name);
      setCategory(suggestions.category);
      setQuantity(suggestions.quantity);
      
      // Set the first photo as the main image
      if (smartAddFiles.length > 0) {
        setImage(smartAddFiles[0]);
      }
      
      // Convert custom attributes to form format
      const newAttributes = Object.entries(suggestions.custom_attributes).map(([key, value]) => ({
        key,
        value: String(value)
      }));
      setCustomAttributes(newAttributes);
      
      // Hide SmartAdd section
      setShowSmartAdd(false);
      setSmartAddFiles([]);
      setAnalysisResult(null);
    }
  };

  const handleIncrementExisting = async (itemId: number, incrementBy: number) => {
    try {
      // Use the new increment endpoint
      await axios.post(getApiUrl(`/items/${itemId}/increment?increment_by=${incrementBy}`));
      
      // Navigate back to the main page
      navigate('/');
    } catch (error) {
      console.error('Error incrementing item quantity:', error);
      // Could add a toast notification here for better UX
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'bg-green-500';
    if (confidence >= 0.6) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getConfidenceText = (confidence: number) => {
    if (confidence >= 0.8) return 'High Confidence';
    if (confidence >= 0.6) return 'Medium Confidence';
    return 'Low Confidence';
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

    try {
      let imageUrl = null;
      if (image) {
        const formData = new FormData();
        formData.append('file', image);
        const response = await axios.post(getApiUrl('/upload/'), formData, { 
          headers: { 'Content-Type': 'multipart/form-data' } 
        });
        imageUrl = response.data.image_url;
      }

      const attributesObject = customAttributes.reduce((acc, attr) => {
        if (attr.key) acc[attr.key] = attr.value;
        return acc;
      }, {} as Record<string, any>);

      await axios.post(getApiUrl('/items/'), {
        name,
        category,
        quantity: quantity === '' ? 0 : quantity,
        image_url: imageUrl,
        custom_attributes: attributesObject,
      });

      navigate('/');
    } catch (error) {
      console.error('Error adding item:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Add New Item</CardTitle>
          <CardDescription>
            Add a new item to your inventory with custom attributes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* SmartAdd Section */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <Label className="text-base font-semibold">AI-Powered SmartAdd</Label>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowSmartAdd(!showSmartAdd)}
                  className="w-full sm:w-auto"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  {showSmartAdd ? 'Hide SmartAdd' : 'Use SmartAdd'}
                </Button>
              </div>

              {showSmartAdd && (
                <Card className="border-secondary/20 bg-secondary/50">
                  <CardContent className="pt-6 space-y-4">
                    <div>
                      <Label htmlFor="smart-photos">Upload Photos (Max 3)</Label>
                      <CameraCapture
                        onFilesSelected={handleSmartAddFilesSelected}
                        multiple={true}
                        label="Add Photos for Analysis"
                        className="mt-1"
                      />
                      
                      {smartAddFiles.length > 0 && (
                        <div className="mt-2 text-sm text-muted-foreground">
                          {smartAddFiles.length} photo{smartAddFiles.length > 1 ? 's' : ''} selected
                        </div>
                      )}
                    </div>

                    {/* Photo Previews - Mobile Responsive Grid */}
                    {smartAddFiles.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {smartAddFiles.map((file, index) => (
                          <div key={index} className="relative">
                            <img
                              src={URL.createObjectURL(file)}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-24 sm:h-20 object-cover rounded border"
                            />
                            {index === 0 && (
                              <Badge className="absolute top-1 right-1 text-xs">
                                Main
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Analyze Button */}
                    <Button
                      type="button"
                      onClick={handleSmartAddAnalyze}
                      disabled={smartAddFiles.length === 0 || isAnalyzing}
                      className="w-full h-12 sm:h-10"
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Analyzing with AI...
                        </>
                      ) : (
                        <>
                          <Camera className="w-4 h-4 mr-2" />
                          Analyze Photos
                        </>
                      )}
                    </Button>

                    {/* Analysis Results */}
                    {analysisResult && (
                      <div className="border rounded-lg p-3 sm:p-4 space-y-3 bg-card">
                        {analysisResult.success ? (
                          <>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                                <span className="font-medium">Analysis Complete</span>
                              </div>
                              <Badge 
                                className={`${getConfidenceColor(analysisResult.confidence)} text-primary-foreground self-start sm:self-auto`}
                              >
                                {getConfidenceText(analysisResult.confidence)} ({Math.round(analysisResult.confidence * 100)}%)
                              </Badge>
                            </div>

                            {analysisResult.suggestions && (
                              <div className="space-y-3">
                                <div className="space-y-2 text-sm">
                                  <div><strong>Name:</strong> {analysisResult.suggestions.name}</div>
                                  <div><strong>Category:</strong> {analysisResult.suggestions.category}</div>
                                  <div><strong>Quantity:</strong> {analysisResult.suggestions.quantity}</div>
                                  
                                  {Object.keys(analysisResult.suggestions.custom_attributes).length > 0 && (
                                    <div>
                                      <strong>Attributes:</strong>
                                      <div className="ml-2 mt-1 space-y-1">
                                        {Object.entries(analysisResult.suggestions.custom_attributes).map(([key, value]) => (
                                          <div key={key} className="text-xs">
                                            <span className="capitalize">{key}:</span> {value}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {/* Similar Items Detection - Mobile Optimized */}
                                {analysisResult.suggestions.similar_items && analysisResult.suggestions.similar_items.length > 0 && (
                                  <div className="border-t pt-3">
                                    <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded">
                                      <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                                      <div className="flex-1 min-w-0">
                                        <div className="font-medium text-blue-800 dark:text-blue-200 mb-2">Similar Items Found</div>
                                        <div className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                                          We found existing items that might be the same. You can increment their quantity instead of creating a new item.
                                        </div>
                                        <div className="space-y-2">
                                          {analysisResult.suggestions.similar_items.map((item) => (
                                            <div key={item.id} className="flex flex-col sm:flex-row sm:items-center gap-2 bg-card p-3 rounded border">
                                              <div className="flex-1 min-w-0">
                                                <div className="font-medium text-sm truncate">{item.name}</div>
                                                <div className="text-xs text-muted-foreground mt-1">
                                                  <div>Current quantity: {item.quantity}</div>
                                                  <div>Category: {item.category}</div>
                                                </div>
                                              </div>
                                              <Button
                                                type="button"
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleIncrementExisting(item.id, analysisResult?.suggestions?.quantity || 1)}
                                                className="w-full sm:w-auto sm:ml-2 h-9"
                                              >
                                                +{analysisResult?.suggestions?.quantity || 1}
                                              </Button>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}

                            {analysisResult.confidence < 0.6 && (
                              <div className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded text-xs">
                                <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                                <div>
                                  <div className="font-medium text-yellow-800 dark:text-yellow-200">Low Confidence Detection</div>
                                  <div className="text-yellow-700 dark:text-yellow-300">
                                    The AI couldn't clearly identify this item. Consider taking clearer photos or entering details manually.
                                  </div>
                                </div>
                              </div>
                            )}

                            {(!analysisResult.suggestions?.similar_items || analysisResult.suggestions.similar_items.length === 0) && (
                              <Button type="button" onClick={handleUseSuggestions} className="w-full h-12 sm:h-10">
                                Use These Suggestions
                              </Button>
                            )}

                            {analysisResult.suggestions?.similar_items && analysisResult.suggestions.similar_items.length > 0 && (
                              <div className="flex flex-col sm:flex-row gap-2">
                                <Button type="button" onClick={handleUseSuggestions} variant="outline" className="flex-1 h-12 sm:h-10">
                                  Create New Item
                                </Button>
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded">
                            <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                            <div className="text-sm">
                              <div className="font-medium text-red-800 dark:text-red-200">SmartAdd Failed</div>
                              <div className="text-red-700 dark:text-red-300">
                                {analysisResult.error_message || 'Unable to analyze the photos. Please try with different photos or enter details manually.'}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Basic Information */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter item name"
                  required
                  className="h-12 sm:h-10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="Enter category"
                  required
                  className="h-12 sm:h-10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                  placeholder="Enter quantity"
                  min="0"
                  required
                  className="h-12 sm:h-10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Image</Label>
                <CameraCapture
                  onFilesSelected={handleRegularImageSelected}
                  multiple={false}
                  label="Add Item Photo"
                />
                
                {image && (
                  <div className="mt-2">
                    <div className="text-sm text-muted-foreground mb-2">
                      Selected: {image.name}
                    </div>
                    {/* Image preview */}
                    <div className="relative w-32 h-32 rounded-lg overflow-hidden border">
                      <img
                        src={URL.createObjectURL(image)}
                        alt="Selected image preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Custom Attributes - Mobile Optimized */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <Label className="text-base font-semibold">Custom Attributes</Label>
                <Button type="button" variant="outline" size="sm" onClick={addAttribute} className="w-full sm:w-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Attribute
                </Button>
              </div>

              {customAttributes.length > 0 && (
                <div className="space-y-3">
                  {customAttributes.map((attr, index) => (
                    <div key={index} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      <Input
                        type="text"
                        placeholder="Attribute name"
                        value={attr.key}
                        onChange={(e) => handleAttributeChange(index, 'key', e.target.value)}
                        className="flex-1 h-12 sm:h-10"
                      />
                      <Input
                        type="text"
                        placeholder="Value"
                        value={attr.value}
                        onChange={(e) => handleAttributeChange(index, 'value', e.target.value)}
                        className="flex-1 h-12 sm:h-10"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeAttribute(index)}
                        className="w-full sm:w-auto h-12 sm:h-10"
                      >
                        <Trash2 className="h-4 w-4 sm:mr-2" />
                        <span className="sm:hidden">Remove</span>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button type="submit" disabled={isSubmitting} className="flex-1 h-12 sm:h-10">
                {isSubmitting ? 'Adding Item...' : 'Add Item'}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate('/')} className="flex-1 h-12 sm:h-10">
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddItemForm;