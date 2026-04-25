import React from 'react';
import DistritoPage from '../DistritoPage';
import { distritos } from '../../data/distritos';

const Barranco = () => <DistritoPage data={distritos.find(d => d.slug === 'barranco')!} />;
export default Barranco;
