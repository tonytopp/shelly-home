import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { ShellyDeviceState } from "@/types";

export function useDevices() {
  return useQuery<ShellyDeviceState[]>({
    queryKey: ['/api/devices'],
  });
}

export function useDevice(id: number) {
  return useQuery<ShellyDeviceState>({
    queryKey: ['/api/devices', id],
    enabled: !!id,
  });
}

export function useAddDevice() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (device: Omit<ShellyDeviceState, 'id' | 'status' | 'power' | 'isOn' | 'lastSeen'>) => {
      const res = await apiRequest('POST', '/api/devices', device);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/devices'] });
    },
  });
}

export function useUpdateDevice() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & Partial<ShellyDeviceState>) => {
      const res = await apiRequest('PATCH', `/api/devices/${id}`, updates);
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/devices'] });
      queryClient.invalidateQueries({ queryKey: ['/api/devices', variables.id] });
    },
  });
}

export function useDeleteDevice() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest('DELETE', `/api/devices/${id}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/devices'] });
    },
  });
}

export function useControlDevice() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, action }: { id: number, action: 'turn_on' | 'turn_off' }) => {
      const res = await apiRequest('POST', `/api/devices/${id}/control`, { action });
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/devices'] });
      queryClient.invalidateQueries({ queryKey: ['/api/devices', variables.id] });
    },
  });
}
