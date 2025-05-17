import { useState, useEffect, useCallback } from "react";
import { MqttClient } from "@/lib/mqtt";

export function useMqtt(url: string) {
  const [client, setClient] = useState<MqttClient | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  // Initialize the MQTT client
  useEffect(() => {
    const mqttClient = new MqttClient(url);
    setClient(mqttClient);
    
    return () => {
      if (mqttClient) {
        mqttClient.disconnect();
      }
    };
  }, [url]);
  
  // Connect to the MQTT broker
  const connect = useCallback(async () => {
    if (!client) return;
    
    try {
      await client.connect();
      setIsConnected(true);
      setError(null);
    } catch (err) {
      setIsConnected(false);
      setError(err instanceof Error ? err : new Error(String(err)));
    }
  }, [client]);
  
  // Connect when the client is initialized
  useEffect(() => {
    if (client) {
      connect();
    }
  }, [client, connect]);
  
  // Subscribe to a topic
  const subscribe = useCallback(
    (topic: string, callback: (topic: string, message: string) => void) => {
      if (!client || !isConnected) return;
      client.subscribe(topic, callback);
    },
    [client, isConnected]
  );
  
  // Unsubscribe from a topic
  const unsubscribe = useCallback(
    (topic: string, callback?: (topic: string, message: string) => void) => {
      if (!client || !isConnected) return;
      client.unsubscribe(topic, callback);
    },
    [client, isConnected]
  );
  
  // Publish a message to a topic
  const publish = useCallback(
    (topic: string, message: string) => {
      if (!client || !isConnected) return;
      client.publish(topic, message);
    },
    [client, isConnected]
  );
  
  return {
    client,
    isConnected,
    error,
    connect,
    subscribe,
    unsubscribe,
    publish
  };
}
