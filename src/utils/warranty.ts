import { addMonths } from 'date-fns';

export const calculateWarrantyEndDate = (purchaseDate: Date, warrantyDurationMonths: number): Date => {
  return addMonths(new Date(purchaseDate), warrantyDurationMonths);
};

export const formatDateForDB = (date: string | Date): Date => {
  return new Date(date);
};