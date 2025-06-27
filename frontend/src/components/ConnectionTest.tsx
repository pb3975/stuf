import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getApiUrl, getApiBaseUrl } from '../lib/config';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const ConnectionTest: React.FC = () => {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [smartAddResult, setSmartAddResult] = useState<{ status: string; message: string }>({ status: '', message: '' });

  const runTests = async () => {
    setIsRunning(true);
    const results: any[] = [];
    
    // Test 1: Configuration
    const apiBaseUrl = getApiBaseUrl();
    results.push({
      test: 'Configuration',
      status: 'success',
      message: `API Base URL: ${apiBaseUrl}`,
      details: {
        hostname: window.location.hostname,
        host: window.location.host,
        protocol: window.location.protocol,
        apiBaseUrl
      }
    });

    // Test 2: Backend connectivity
    try {
      const response = await axios.get(getApiUrl('/items/'), { timeout: 5000 });
      results.push({
        test: 'Backend Connection',
        status: 'success',
        message: `Connected successfully (${response.status})`,
        details: { 
          status: response.status,
          itemCount: response.data?.length || 0,
          data: response.data 
        }
      });
    } catch (error: any) {
      results.push({
        test: 'Backend Connection',
        status: 'error',
        message: 'Failed to connect to backend',
        details: {
          error: error.message,
          code: error.code,
          response: error.response?.status,
          responseData: error.response?.data
        }
      });
    }

    // Test 3: Categories endpoint
    try {
      const response = await axios.get(getApiUrl('/categories/'), { timeout: 5000 });
      results.push({
        test: 'Categories Endpoint',
        status: 'success',
        message: `Categories loaded (${response.data?.length || 0} categories)`,
        details: response.data
      });
    } catch (error: any) {
      results.push({
        test: 'Categories Endpoint',
        status: 'error',
        message: 'Failed to load categories',
        details: error.message
      });
    }

    // Test 4: SmartAdd endpoint (without data)
    try {
      const response = await axios.post(getApiUrl('/smart-add/'), { photos: [] }, { timeout: 5000 });
      results.push({
        test: 'SmartAdd Endpoint',
        status: 'success',
        message: 'SmartAdd endpoint accessible',
        details: response.data
      });
    } catch (error: any) {
      results.push({
        test: 'SmartAdd Endpoint',
        status: error.response?.status === 422 ? 'warning' : 'error',
        message: error.response?.status === 422 ? 'Endpoint accessible (validation error expected)' : 'SmartAdd endpoint failed',
        details: {
          status: error.response?.status,
          message: error.message,
          data: error.response?.data
        }
      });
    }

    setTestResults(results);
    setIsRunning(false);
  };

  const testSmartAdd = async () => {
    setSmartAddResult({ status: 'testing', message: 'Testing SmartAdd functionality...' });
    
    try {
      // Create a simple test image (1x1 pixel red image in base64)
      const testImageBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
      
      const apiUrl = getApiUrl('/smart-add/');
      console.log('🧪 Testing SmartAdd at:', apiUrl);
      
      const response = await axios.post(apiUrl, {
        photos: [testImageBase64]
      });
      
      console.log('✅ SmartAdd test successful:', response.data);
      setSmartAddResult({ 
        status: 'success', 
        message: `SmartAdd working! Confidence: ${Math.round(response.data.confidence * 100)}%` 
      });
    } catch (error) {
      console.error('❌ SmartAdd test failed:', error);
      
      let errorMessage = 'SmartAdd test failed';
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as any;
        if (axiosError.response) {
          errorMessage = `HTTP ${axiosError.response.status}: ${axiosError.response.data?.detail || axiosError.response.statusText}`;
        } else if (axiosError.request) {
          errorMessage = 'No response from server';
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      setSmartAddResult({ status: 'error', message: errorMessage });
    }
  };

  useEffect(() => {
    runTests();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Connection Test
          <div className="space-x-2">
            <Button onClick={runTests} disabled={isRunning}>
              {isRunning ? 'Running...' : 'Rerun Tests'}
            </Button>
            <Button onClick={testSmartAdd} variant="outline">
              Test SmartAdd
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* SmartAdd Test Result */}
        {smartAddResult.status && (
          <div className={`p-4 rounded border ${
            smartAddResult.status === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
            smartAddResult.status === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
            'bg-blue-50 border-blue-200 text-blue-800'
          }`}>
            <div className="font-medium">SmartAdd Test</div>
            <div className="text-sm mt-1">{smartAddResult.message}</div>
          </div>
        )}
        {testResults.map((result, index) => (
          <div key={index} className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">{result.test}</h3>
              <Badge className={`${getStatusColor(result.status)} text-white`}>
                {result.status.toUpperCase()}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-2">{result.message}</p>
            {result.details && (
              <details className="text-xs">
                <summary className="cursor-pointer text-muted-foreground">Details</summary>
                <pre className="mt-2 p-2 bg-muted rounded overflow-auto">
                  {JSON.stringify(result.details, null, 2)}
                </pre>
              </details>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default ConnectionTest; 