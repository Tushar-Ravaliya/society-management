import { format, formatDistanceToNow, isValid, parseISO } from 'date-fns';

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '';
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(parsedDate)) return '';
  return format(parsedDate, 'dd MMM yyyy');
}

export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return '';
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(parsedDate)) return '';
  return format(parsedDate, 'dd MMM yyyy, hh:mm a');
}

export function formatRelative(date: string | Date | null | undefined): string {
  if (!date) return '';
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(parsedDate)) return '';
  return formatDistanceToNow(parsedDate, { addSuffix: true });
}
