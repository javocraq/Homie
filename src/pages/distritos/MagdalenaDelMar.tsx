import React from 'react';
import DistritoPage from '../DistritoPage';
import { distritos } from '../../data/distritos';

const MagdalenaDelMar = () =>
  <DistritoPage data={distritos.find(d => d.slug === 'magdalena-del-mar')!} />;

export default MagdalenaDelMar;
