
import { CustomFormData } from '../types/form-types';

export const validateForm = (formData: CustomFormData) => {
  const errors: {[key: string]: string} = {};
  
  if (!formData.aceptaTerminos) {
    errors.aceptaTerminos = "form.error.terminos";
  }
  
  return { errors, isValid: Object.keys(errors).length === 0 };
};

export const prepareFormDataForSubmission = (formData: CustomFormData, imageUrls: string[]) => {
  // Convert FormData to JSON-compatible object for webhook
  return {
    ...formData,
    amoblado: formData.amoblado ? 'Sí' : 'No',
    aceptaTerminos: formData.aceptaTerminos ? 'Sí' : 'No'
  };
};
