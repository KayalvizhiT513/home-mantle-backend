import { addMonths } from 'date-fns';
export const calculateWarrantyEndDate = (purchaseDate, warrantyDurationMonths) => {
    return addMonths(new Date(purchaseDate), warrantyDurationMonths);
};
export const formatDateForDB = (date) => {
    return new Date(date);
};
