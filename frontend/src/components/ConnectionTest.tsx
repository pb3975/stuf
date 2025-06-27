import React, { useState } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, AlertCircle, Zap } from 'lucide-react';
import { getApiUrl } from '../lib/config';
import type { TestResult, ApiError } from '../types/api-error';

const ConnectionTest: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);

  const runTests = async () => {
    setIsLoading(true);
    const results: TestResult[] = [];

    // Test 1: Basic API Connection
    try {
      const response = await axios.get(getApiUrl('/docs'));
      results.push({
        test: 'API Documentation Access',
        status: 'success',
        message: `Status: ${response.status}`,
        data: 'API docs accessible'
      });
    } catch (error: unknown) {
      const apiError = error as ApiError;
      results.push({
        test: 'API Documentation Access',
        status: 'error',
        message: apiError.message || 'Failed to access API docs'
      });
    }

    // Test 2: Items Endpoint
    try {
      const response = await axios.get(getApiUrl('/items/'));
      results.push({
        test: 'Items Endpoint',
        status: 'success',
        message: `Retrieved ${Array.isArray(response.data) ? response.data.length : 0} items`,
        data: response.data
      });
    } catch (error: unknown) {
      const apiError = error as ApiError;
      results.push({
        test: 'Items Endpoint',
        status: 'error',
        message: `Error: ${apiError.response?.status || 'Unknown'} - ${apiError.message}`
      });
    }

    // Test 3: Categories Endpoint
    try {
      const response = await axios.get(getApiUrl('/categories/'));
      results.push({
        test: 'Categories Endpoint',
        status: 'success',
        message: `Found ${Array.isArray(response.data) ? response.data.length : 0} categories`,
        data: response.data
      });
    } catch (error: unknown) {
      const apiError = error as ApiError;
      results.push({
        test: 'Categories Endpoint',
        status: 'error',
        message: `Error: ${apiError.response?.status || 'Unknown'} - ${apiError.message}`
      });
    }

    // Test 4: SmartAdd Endpoint (basic connectivity)
    try {
      // Send a minimal request to test endpoint existence
      const response = await axios.post(getApiUrl('/smart-add/'), {
        photos: ['data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==']
      });
      
      results.push({
        test: 'SmartAdd Endpoint',
        status: 'success',
        message: 'SmartAdd endpoint is accessible',
        data: response.data
      });
    } catch (error: unknown) {
      const apiError = error as ApiError;
      if (apiError.response?.status === 200) {
        // If we get a 200 but it's an "error" response, the endpoint is working
        results.push({
          test: 'SmartAdd Endpoint',
          status: 'success',
          message: 'SmartAdd endpoint is accessible (API key needed for full functionality)'
        });
      } else {
        results.push({
          test: 'SmartAdd Endpoint',
          status: 'error',
          message: `Error: ${apiError.response?.status || 'Unknown'} - ${apiError.message}`
        });
      }
    }

    setResults(results);
    setIsLoading(false);
  };

  const getStatusIcon = (status: 'success' | 'error') => {
    return status === 'success' ? 
      <CheckCircle className="h-4 w-4 text-green-500" /> : 
      <AlertCircle className="h-4 w-4 text-red-500" />;
  };

  const getStatusBadge = (status: 'success' | 'error') => {
    return (
      <Badge variant={status === 'success' ? 'default' : 'destructive'}>
        {status === 'success' ? 'PASS' : 'FAIL'}
      </Badge>
    );
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Connection Test
        </CardTitle>
        <CardDescription>
          Test connectivity to the Stuf API backend and verify all endpoints are working correctly.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={runTests} 
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Running Tests...
            </>
          ) : (
            'Run Connection Tests'
          )}
        </Button>

        {results.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold">Test Results:</h3>
            {results.map((result, index) => (
              <div key={index} className="flex items-start justify-between p-3 border rounded-lg">
                <div className="flex items-start gap-3 flex-1">
                  {getStatusIcon(result.status)}
                  <div className="flex-1">
                    <div className="font-medium">{result.test}</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {result.message}
                    </div>
                    {result.data != null && (
                      <details className="mt-2">
                        <summary className="text-xs text-muted-foreground cursor-pointer">
                          View Response Data
                        </summary>
                        <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-auto max-h-32">
                          {typeof result.data === 'string' ? result.data : JSON.stringify(result.data, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
                {getStatusBadge(result.status)}
              </div>
            ))}
            
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <div className="text-sm">
                <strong>Summary:</strong> {results.filter(r => r.status === 'success').length} of {results.length} tests passed
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ConnectionTest; 