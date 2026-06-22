import { toast } from 'svelte-sonner';

export function toastFormResult(
  form: Record<string, unknown> | null | undefined,
  options: {
    id: string;
    successLabel?: string;
    errorLabel?: string;
    onSuccess?: (message: string) => void;
    onError?: (message: string) => void;
  }
) {
  if (!form) return '';
  const success = typeof form.success === 'string' ? form.success : '';
  const error = typeof form.error === 'string' ? form.error : '';
  const marker = `${options.id}:${success || error}`;
  if (!success && !error) return '';

  if (success) {
    toast.success(options.successLabel ?? 'Action completed', { description: success });
    options.onSuccess?.(success);
  } else if (error) {
    toast.error(options.errorLabel ?? 'Action failed', { description: error });
    options.onError?.(error);
  }

  return marker;
}
