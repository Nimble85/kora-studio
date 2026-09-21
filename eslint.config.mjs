import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';

const config = [
  ...nextVitals,
  ...nextTypescript,
  { ignores: ['.next/**', 'next-env.d.ts'] },
  // The existing client screen hydrates local preferences and repository data in effects.
  { files: ['app/page.tsx'], rules: { 'react-hooks/set-state-in-effect': 'off' } },
];

export default config;
