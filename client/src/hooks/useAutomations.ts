import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { AutomationRuleState } from "@/types";

export function useAutomations() {
  return useQuery<AutomationRuleState[]>({
    queryKey: ['/api/automation-rules'],
  });
}

export function useAutomation(id: number) {
  return useQuery<AutomationRuleState>({
    queryKey: ['/api/automation-rules', id],
    enabled: !!id,
  });
}

export function useAddAutomation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (rule: Omit<AutomationRuleState, 'id'>) => {
      const res = await apiRequest('POST', '/api/automation-rules', rule);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/automation-rules'] });
    },
  });
}

export function useUpdateAutomation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & Partial<AutomationRuleState>) => {
      const res = await apiRequest('PATCH', `/api/automation-rules/${id}`, updates);
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/automation-rules'] });
      queryClient.invalidateQueries({ queryKey: ['/api/automation-rules', variables.id] });
    },
  });
}

export function useDeleteAutomation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest('DELETE', `/api/automation-rules/${id}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/automation-rules'] });
    },
  });
}

export function useToggleAutomation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest('POST', `/api/automation-rules/${id}/toggle`, {});
      return res.json();
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['/api/automation-rules'] });
      queryClient.invalidateQueries({ queryKey: ['/api/automation-rules', id] });
    },
  });
}
