import { useEffect, useState } from "react";
import { supabase } from "./utils";

export const useFetch = ({ table }) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);

  const getData = async () => {
    try {
      setLoading(true);
      const { data } = await supabase.from(table).select().order("name");
      setData(data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  return { data, loading, refetch: getData };
};

export const uploadStorage = () => {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(false);

  const upload = async (payload) => {
    const img = payload?.target?.files[0];
    try {
      setLoading(true);
      const { data, error } = await supabase.storage
        .from("receipt")
        .upload(`receipt-${Date.now()}.png`, img);
      setResponse(data);
      setError(error);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return { upload, loading, response, error };
};
