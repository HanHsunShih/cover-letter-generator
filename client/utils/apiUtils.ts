/// <reference types="vite/client" />
import axios from "axios";

const api_url = import.meta.env.VITE_SERVER_URL;

export const getOpenAIResponse = async () => {
  try {
    const response = await axios.get(`${api_url}/openai`);
    return response.data;
  } catch (error) {
    console.error("Error fetching products data" + error);
  }
};
