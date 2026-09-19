import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';

export const DeleteTest = () => {
  const [testResults, setTestResults] = useState<string[]>([]);

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testConnection = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/health');
      const data = await response.json();
      addResult(`✅ Server connection: ${data.status}, DB: ${data.database}`);
    } catch (error) {
      addResult(`❌ Server connection failed: ${error}`);
    }
  };

  const testAuthentication = () => {
    const token = localStorage.getItem('token');
    if (token) {
      addResult(`✅ Token exists: ${token.substring(0, 20)}...`);
    } else {
      addResult(`❌ No authentication token found`);
    }
  };

  const testDeleteEndpoint = async () => {
    try {
      await api.delete('/waste/invalid-id-test');
    } catch (error: any) {
      if (error.message.includes('not found') || error.message.includes('Invalid')) {
        addResult(`✅ Delete endpoint responding: ${error.message}`);
      } else if (error.message.includes('No token')) {
        addResult(`✅ Delete endpoint requires auth: ${error.message}`);
      } else {
        addResult(`❌ Delete endpoint error: ${error.message}`);
      }
    }
  };

  const runAllTests = async () => {
    setTestResults([]);
    addResult('🔍 Starting delete functionality tests...');
    
    await testConnection();
    testAuthentication();
    await testDeleteEndpoint();
    
    addResult('✅ Tests completed');
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Delete Functionality Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={runAllTests} className="w-full">
          Run Delete Tests
        </Button>
        
        <div className="space-y-2">
          <h3 className="font-medium">Test Results:</h3>
          <div className="bg-gray-100 p-4 rounded-lg max-h-60 overflow-y-auto">
            {testResults.length === 0 ? (
              <p className="text-gray-500">No tests run yet</p>
            ) : (
              testResults.map((result, index) => (
                <div key={index} className="text-sm font-mono">
                  {result}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <Button variant="outline" onClick={testConnection}>
            Test Server
          </Button>
          <Button variant="outline" onClick={testAuthentication}>
            Test Auth
          </Button>
          <Button variant="outline" onClick={testDeleteEndpoint}>
            Test Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};