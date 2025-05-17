import { ShellyDeviceState } from "@/types";

// Simple MQTT client interface for browser
export class MqttClient {
  private ws: WebSocket | null = null;
  private subscribers: Map<string, ((topic: string, message: string) => void)[]> = new Map();
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000;
  private isConnected = false;
  
  constructor(private url: string) {}
  
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url);
        
        this.ws.onopen = () => {
          console.log('Connected to MQTT broker');
          this.isConnected = true;
          this.reconnectAttempts = 0;
          resolve();
        };
        
        this.ws.onmessage = (event) => {
          try {
            const { topic, payload } = JSON.parse(event.data);
            this.notifySubscribers(topic, payload);
          } catch (error) {
            console.error('Error parsing MQTT message:', error);
          }
        };
        
        this.ws.onclose = () => {
          console.log('Disconnected from MQTT broker');
          this.isConnected = false;
          this.tryReconnect();
        };
        
        this.ws.onerror = (error) => {
          console.error('MQTT WebSocket error:', error);
          this.isConnected = false;
          reject(error);
        };
      } catch (error) {
        console.error('Error connecting to MQTT broker:', error);
        reject(error);
      }
    });
  }
  
  private tryReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('Max reconnect attempts reached');
      return;
    }
    
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
    
    this.reconnectTimeout = setTimeout(() => {
      console.log(`Attempting to reconnect (${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})...`);
      this.reconnectAttempts++;
      this.connect().catch(() => {
        // Connection failed, will retry
      });
    }, this.reconnectDelay);
  }
  
  subscribe(topic: string, callback: (topic: string, message: string) => void): void {
    if (!this.subscribers.has(topic)) {
      this.subscribers.set(topic, []);
      
      if (this.isConnected && this.ws) {
        this.ws.send(JSON.stringify({ action: 'subscribe', topic }));
      }
    }
    
    const callbacks = this.subscribers.get(topic);
    if (callbacks && !callbacks.includes(callback)) {
      callbacks.push(callback);
    }
  }
  
  unsubscribe(topic: string, callback?: (topic: string, message: string) => void): void {
    if (!this.subscribers.has(topic)) return;
    
    if (callback) {
      const callbacks = this.subscribers.get(topic);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index !== -1) {
          callbacks.splice(index, 1);
        }
        
        if (callbacks.length === 0) {
          this.subscribers.delete(topic);
          
          if (this.isConnected && this.ws) {
            this.ws.send(JSON.stringify({ action: 'unsubscribe', topic }));
          }
        }
      }
    } else {
      this.subscribers.delete(topic);
      
      if (this.isConnected && this.ws) {
        this.ws.send(JSON.stringify({ action: 'unsubscribe', topic }));
      }
    }
  }
  
  publish(topic: string, message: string): void {
    if (!this.isConnected || !this.ws) {
      console.error('Cannot publish: not connected to MQTT broker');
      return;
    }
    
    this.ws.send(JSON.stringify({ action: 'publish', topic, payload: message }));
  }
  
  private notifySubscribers(topic: string, message: string): void {
    // Notify exact topic subscribers
    const exactSubscribers = this.subscribers.get(topic);
    if (exactSubscribers) {
      exactSubscribers.forEach(callback => callback(topic, message));
    }
    
    // Notify wildcard subscribers
    this.subscribers.forEach((callbacks, subscribedTopic) => {
      if (subscribedTopic.includes('#') && topic.startsWith(subscribedTopic.replace('#', ''))) {
        callbacks.forEach(callback => callback(topic, message));
      }
    });
  }
  
  disconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    
    this.isConnected = false;
  }
}

// Control a Shelly device via MQTT
export function controlDevice(
  mqttClient: MqttClient | null, 
  device: ShellyDeviceState, 
  action: 'turn_on' | 'turn_off'
): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!mqttClient) {
      reject(new Error('MQTT client not connected'));
      return;
    }
    
    try {
      const topic = `${device.mqttTopic}/command`;
      const message = action === 'turn_on' ? 'on' : 'off';
      
      mqttClient.publish(topic, message);
      
      // In a real-world scenario, we might want to wait for confirmation
      // For now, we'll just resolve immediately
      resolve();
    } catch (error) {
      reject(error);
    }
  });
}
