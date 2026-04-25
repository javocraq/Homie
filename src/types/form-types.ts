
export type CustomFormData = {
  nombre: string;
  telefono: string;
  email: string;
  direccion: string;
  ciudad: string;
  distrito: string;
  habitaciones: string;
  mensaje: string;
  metraje: string;
  banos: string;
  capacidad: string;
  amoblado: boolean;
  fotos: File[];
  aceptaTerminos: boolean;
};

export type FormErrors = {
  [key: string]: string;
};

