export interface EnvironmentConfigFiles {
  name: string;
  isProd: boolean;
  deliusCore: object;
  groupVarsAll: object;
  groupVarsLdap: object;
}

export interface ConfigFiles {
  versions: object;
  common: object;
  commonProd: object;
  groupVarsAll: object;
  environments?: Map<string, EnvironmentConfigFiles>;
}
