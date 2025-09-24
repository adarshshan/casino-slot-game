
import { useState } from 'react';

const useApiRequest = () => {
  const [loading, setLoading] = useState(false);

  const request = async ({ url, method, body }: { url: string; method: string; body?: any }) => {
    setLoading(true);
    const token = localStorage.getItem('accessToken');
    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      if (!response.ok || data.success === false) {
        throw new Error(data.message || 'API request failed');
      }
      setLoading(false);
      return data;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  return { request, loading };
};

export default useApiRequest;
