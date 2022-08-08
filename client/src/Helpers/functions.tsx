import axios from "axios";
import { useEffect, useState } from "react";

export const useFetch = (url: string) => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const source = axios.CancelToken.source();
    const fetchData = async () => {
      setIsLoading(true);
      setData([]);
      setError("");
      try {
        const res = await axios.get(url, { cancelToken: source.token });
        if (res) {
          setIsLoading(false);
          setData(res.data);
        }
      } catch (error) {
        setIsLoading(false);
        setError("An error occurred!");
      }
    };

    fetchData();
    return () => {
      source.cancel();
    };
  }, [url]);

  return { data, isLoading, error };
};
