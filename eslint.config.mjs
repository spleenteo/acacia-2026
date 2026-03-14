import nextConfig from 'eslint-config-next';

const eslintConfig = [
  ...nextConfig,
  {
    ignores: ['schema.graphql', 'src/lib/datocms/graphql-env.d.ts', 'src/lib/datocms/cma-types.ts'],
  },
];

export default eslintConfig;
