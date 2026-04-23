import React from 'react';
import DistritoPage from '../DistritoPage';
import { distritos } from '../../data/distritos';

const SanIsidro = () => <DistritoPage data={distritos.find(d => d.slug === 'san-isidro')!} />;
export default SanIsidro;
