'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { linksApi } from '../api/links';
import { TokenStorage } from '../utils/token';
import type { CreateLinkRequest, UpdateLinkRequest } from '@/types/link';

/**
 * Mutation hook to create a payment link
 */
export function useCreateLink() {
  const queryClient = useQueryClient();
  const token = TokenStorage.get();

  return useMutation({
    mutationFn: (data: CreateLinkRequest) => {
      if (!token) throw new Error('No authentication token');
      return linksApi.create(token, data);
    },
    onSuccess: (data) => {
      // Invalidate links list to refetch
      queryClient.invalidateQueries({ queryKey: ['links'] });

      // Show success toast
      toast.success('Link created!', {
        description: `Payment link "${data.link.name}" has been created successfully.`,
      });
    },
    onError: (error: Error) => {
      // Show error toast
      toast.error('Failed to create link', {
        description: error.message || 'An unexpected error occurred',
      });
    },
  });
}

/**
 * Mutation hook to update a payment link
 */
export function useUpdateLink() {
  const queryClient = useQueryClient();
  const token = TokenStorage.get();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateLinkRequest }) => {
      if (!token) throw new Error('No authentication token');
      return linksApi.update(token, id, data);
    },
    onSuccess: (data, variables) => {
      // Invalidate specific link and list
      queryClient.invalidateQueries({ queryKey: ['link', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['links'] });

      // Show success toast
      toast.success('Link updated!', {
        description: `Payment link "${data.link.name}" has been updated successfully.`,
      });
    },
    onError: (error: Error) => {
      // Show error toast
      toast.error('Failed to update link', {
        description: error.message || 'An unexpected error occurred',
      });
    },
  });
}
