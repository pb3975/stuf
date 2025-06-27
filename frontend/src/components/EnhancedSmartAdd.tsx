import React, { useState } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { 
  Loader2, 
  AlertCircle, 
  Sparkles, 
  ImageIcon,
  DollarSign,
  Calendar,
  Layers,
  X
} from 'lucide-react';
import CameraCapture from './CameraCapture';
import { getApiUrl } from '../lib/config';
import type { SmartAddSuggestion } from '../types/api-error';

interface EnhancedSmartAddResponse {
  success: boolean;
  confidence: number;
  batch_results?: Array<{
    name: string;
    category: string;
    quantity: number;
    custom_attributes: Record<string, string | number | boolean>;
    confidence: number;
    similar_items?: Array<{
      id: number;
      name: string;
      quantity: number;
      category: string;
    }>;
  }>;
  suggestions?: {
    name: string;
    category: string;
    quantity: number;
    custom_attributes: Record<string, string | number | boolean>;
    similar_items?: Array<{
      id: number;
      name: string;
      quantity: number;
      category: string;
    }>;
  };
  price_estimate?: string;
  expiry_date?: string;
  barcode_data?: string;
  error_message?: string;
}

interface EnhancedSmartAddProps {
  onSuggestionsReady: (suggestions: SmartAddSuggestion) => void;
  onBatchResults: (results: SmartAddSuggestion[]) => void;
}

const EnhancedSmartAdd: React.FC<EnhancedSmartAddProps> = ({ 
  onSuggestionsReady, 
  onBatchResults 
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<EnhancedSmartAddResponse | null>(null);
  
  // Enhanced options
  const [batchMode, setBatchMode] = useState(false);
  const [detectPrice, setDetectPrice] = useState(false);
  const [detectExpiry, setDetectExpiry] = useState(false);

  // Check if user is on mobile device
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                   window.innerWidth <= 768;

  const handleFilesSelected = (fileList: FileList | null) => {
    if (fileList) {
      const fileArray = Array.from(fileList);
      const imageFiles = fileArray.filter(file => file.type.startsWith('image/'));
      setFiles(imageFiles.slice(0, 5)); // Max 5 photos for enhanced mode
      setAnalysisResult(null);
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleAnalyze = async () => {
    if (files.length === 0) return;

    setIsAnalyzing(true);
    try {
      console.log('🤖 Starting Enhanced SmartAdd analysis...');
      
      // Convert files to base64
      const base64Photos = await Promise.all(
        files.map(file => convertToBase64(file))
      );
      console.log(`📸 Converted ${base64Photos.length} photos to base64`);

      // Send to enhanced backend endpoint
      const apiUrl = getApiUrl('/enhanced-smart-add/');
      console.log('🌐 Sending Enhanced SmartAdd request to:', apiUrl);
      
      const response = await axios.post<EnhancedSmartAddResponse>(apiUrl, {
        photos: base64Photos,
        batch_mode: batchMode,
        detect_price: detectPrice,
        detect_expiry: detectExpiry
      });

      console.log('✅ Enhanced SmartAdd analysis successful:', response.data);
      setAnalysisResult(response.data);
      
      // Pass results to parent component
      if (response.data.success) {
        if (batchMode && response.data.batch_results) {
          onBatchResults(response.data.batch_results);
        } else if (response.data.suggestions) {
          onSuggestionsReady({
            ...response.data.suggestions,
            price_estimate: response.data.price_estimate,
            expiry_date: response.data.expiry_date,
            barcode_data: response.data.barcode_data
          });
        }
      }
      
    } catch (error) {
      console.error('❌ Enhanced SmartAdd analysis failed:', error);
      
      setAnalysisResult({
        success: false,
        confidence: 0,
        error_message: 'Failed to connect to Enhanced SmartAdd service'
      });
    } finally {
      setIsAnalyzing(false);
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

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-500" />
          Enhanced SmartAdd AI
        </CardTitle>
        <CardDescription>
          Advanced AI analysis with batch processing, price detection, expiry scanning, and barcode reading
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Enhanced Options */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-center space-x-2">
            <Switch 
              id="batch-mode" 
              checked={batchMode} 
              onCheckedChange={setBatchMode} 
            />
            <Label htmlFor="batch-mode" className="flex items-center gap-2">
              <Layers className="h-4 w-4" />
              Batch Processing
            </Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch 
              id="detect-price" 
              checked={detectPrice} 
              onCheckedChange={setDetectPrice} 
            />
            <Label htmlFor="detect-price" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Price Detection
            </Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch 
              id="detect-expiry" 
              checked={detectExpiry} 
              onCheckedChange={setDetectExpiry} 
            />
            <Label htmlFor="detect-expiry" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Expiry Detection
            </Label>
          </div>
        </div>

        <Separator />

        {/* Photo Upload Section */}
        <div className="space-y-4">
          <Label className="text-base font-semibold">
            Upload Photos (Max 5 for enhanced analysis)
          </Label>
          
          {/* Camera/File Selection */}
          <div className="flex flex-col sm:flex-row gap-3">
            {isMobile ? (
              <CameraCapture onFilesSelected={handleFilesSelected} />
            ) : (
              <div className="flex-1">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => handleFilesSelected(e.target.files)}
                  className="hidden"
                  id="enhanced-file-input"
                />
                <Label
                  htmlFor="enhanced-file-input"
                  className="flex items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/50 transition-colors"
                >
                  <div className="text-center">
                    <ImageIcon className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Click to select photos
                    </span>
                  </div>
                </Label>
              </div>
            )}
          </div>

          {/* Photo Previews */}
          {files.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {files.map((file, index) => (
                <div key={index} className="relative group">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg border"
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeFile(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                  <Badge 
                    variant="secondary" 
                    className="absolute bottom-1 left-1 text-xs px-1"
                  >
                    {index + 1}
                  </Badge>
                </div>
              ))}
            </div>
          )}

          {/* Analyze Button */}
          <Button
            onClick={handleAnalyze}
            disabled={files.length === 0 || isAnalyzing}
            className="w-full h-12"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analyzing with AI...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Analyze {files.length} Photo{files.length !== 1 ? 's' : ''} with Enhanced AI
              </>
            )}
          </Button>
        </div>

        {/* Analysis Results */}
        {analysisResult && (
          <div className="space-y-4">
            <Separator />
            
            {analysisResult.success ? (
              <div className="space-y-4">
                {/* Confidence and Additional Data */}
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className={`${getConfidenceColor(analysisResult.confidence)} text-white`}>
                    {getConfidenceText(analysisResult.confidence)} ({Math.round(analysisResult.confidence * 100)}%)
                  </Badge>
                  
                  {analysisResult.price_estimate && (
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      <DollarSign className="h-3 w-3 mr-1" />
                      {analysisResult.price_estimate}
                    </Badge>
                  )}
                  
                  {analysisResult.expiry_date && (
                    <Badge variant="outline" className="text-orange-600 border-orange-600">
                      <Calendar className="h-3 w-3 mr-1" />
                      Expires: {analysisResult.expiry_date}
                    </Badge>
                  )}
                  
                  {analysisResult.barcode_data && (
                    <Badge variant="outline" className="text-blue-600 border-blue-600">
                      {analysisResult.barcode_data}
                    </Badge>
                  )}
                </div>

                {/* Batch Results */}
                {batchMode && analysisResult.batch_results ? (
                  <div className="space-y-3">
                    <h4 className="font-semibold">
                      Found {analysisResult.batch_results.length} items:
                    </h4>
                    {analysisResult.batch_results.map((item, index) => (
                      <Card key={index} className="p-3">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-medium">{item.name}</h5>
                          <Badge variant="secondary">Qty: {item.quantity}</Badge>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">{item.category}</Badge>
                          <Badge className={`${getConfidenceColor(item.confidence)} text-white text-xs`}>
                            {Math.round(item.confidence * 100)}%
                          </Badge>
                        </div>
                        {Object.keys(item.custom_attributes).length > 0 && (
                          <div className="text-xs text-muted-foreground">
                            {Object.entries(item.custom_attributes).map(([key, value]) => (
                              <span key={key} className="mr-2">
                                {key}: {String(value)}
                              </span>
                            ))}
                          </div>
                        )}
                      </Card>
                    ))}
                  </div>
                ) : (
                  /* Single Item Result */
                  analysisResult.suggestions && (
                    <div className="space-y-3">
                      <h4 className="font-semibold">AI Suggestions:</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Name:</span> {analysisResult.suggestions.name}
                        </div>
                        <div>
                          <span className="font-medium">Category:</span> {analysisResult.suggestions.category}
                        </div>
                        <div>
                          <span className="font-medium">Quantity:</span> {analysisResult.suggestions.quantity}
                        </div>
                      </div>
                      
                      {Object.keys(analysisResult.suggestions.custom_attributes).length > 0 && (
                        <div>
                          <h5 className="font-medium mb-2">Detected Attributes:</h5>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                            {Object.entries(analysisResult.suggestions.custom_attributes).map(([key, value]) => (
                              <div key={key} className="flex justify-between p-2 bg-muted rounded">
                                <span className="font-medium">{key}:</span>
                                <span>{String(value)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 p-4 bg-destructive/10 rounded-lg">
                <AlertCircle className="h-5 w-5 text-destructive" />
                <span className="text-destructive">
                  {analysisResult.error_message || 'Analysis failed'}
                </span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EnhancedSmartAdd; 