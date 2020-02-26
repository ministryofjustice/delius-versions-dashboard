export interface EnvironmentConfigFiles {
  name: string;
  isProd: boolean;
  deliusCore: object;
}

export interface ConfigFiles {
  common: object;
  commonProd: object;
  environments?: Map<string, EnvironmentConfigFiles>;
}
