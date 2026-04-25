import React from 'react';
import DistritoPage from '../DistritoPage';
import { distritos } from '../../data/distritos';

const Miraflores = () => <DistritoPage data={distritos.find(d => d.slug === 'miraflores')!} />;
export default Miraflores;
