import { useState, useCallback } from "react";
import { AxiosResponse } from "axios";
import api from "../utils/api";

interface ApiRequestOptions<T = any> {
  url: string;
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  body?: T;
  headers?: Record<string, string>;
}

const useApiRequest = <T = any, R = any>() => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<R | null>(null);

  const request = useCallback(
    async ({
      url,
      method = "GET",
      body,
      headers = {},
    }: ApiRequestOptions<T>): Promise<R | void> => {
      setLoading(true);
      setError(null);
      try {
        const response: AxiosResponse<R> = await api({
          url,
          method,
          data: body,
          headers: {
            ...headers,
          },
        });
        if (response.data && response.data.success === false) {
          throw new Error(response.data.message || 'API request failed');
        }
        setData(response.data);
        return response.data;
      } catch (err: any) {
        const errorMessage = err.response && err.response.data && (err.response.data.message || (err.response.data.success === false && 'API request failed'))
          ? err.response.data.message || 'API request failed'
          : "Something went wrong";
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    loading,
    error,
    data,
    request,
  };
};

export default useApiRequest;
