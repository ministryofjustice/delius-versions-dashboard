import {DataSource} from '@angular/cdk/collections';
import {MatSort} from '@angular/material/sort';
import {map, switchMap, tap} from 'rxjs/operators';
import {forkJoin, merge, Observable, of, timer} from 'rxjs';
import {EnvironmentConfig} from './model/environment-config';
import {HttpClient} from '@angular/common/http';
import {EventEmitter, Injectable} from '@angular/core';
import {ConfigFiles, EnvironmentConfigFiles} from './model/config-files';
import {safeLoad} from 'js-yaml';

declare var parse: (hcl: string) => object;

/**
 * Data source for the App view. This class should
 * encapsulate all logic for fetching and manipulating the displayed data
 * (including sorting, pagination, and filtering).
 */
@Injectable()
export class EnvironmentConfigDatasource extends DataSource<EnvironmentConfig> {
  updateInterval = 60e3; // ms
  environments = [
    'delius-core-dev',
    'delius-test',
    'delius-int',
    'delius-po-test1',
    'delius-mis-dev',
    'delius-training-test',
    'delius-training',
    'delius-stage',
    'delius-perf',
    'delius-pre-prod',
    'delius-prod'
  ];
  configRepo: string;
  versionsRepo: string;

  sort: MatSort;

  data: EnvironmentConfig[];
  changes: EventEmitter<EnvironmentConfig[]> = new EventEmitter<EnvironmentConfig[]>();

  constructor(private http: HttpClient) {
    super();
  }

  /**
   * Connect this data source to the table. The table will only update when
   * the returned stream emits new items.
   * @returns A stream of the items to be rendered.
   */
  connect(): Observable<EnvironmentConfig[]> {
    // Create a data stream that emits the config values on a regular timer
    const dataStream: Observable<EnvironmentConfig[]> = timer(0, this.updateInterval).pipe(
      // Get repo urls
      switchMap(() => forkJoin([
        this.repoUrl('hmpps-env-configs').pipe(tap(url => this.configRepo = url)),
        this.repoUrl('delius-versions').pipe(tap(url => this.versionsRepo = url)),
      ])),
      // Fetch config files
      switchMap(() => this.getConfigFiles()),
      // Map into table data
      map((files: ConfigFiles) => this.environments.map(env => this.mapToEnvironmentConfig(env, files))),
      tap(data => this.data = data));

    // Combine everything that affects the rendered data into one update
    // stream for the data-table to consume.
    const dataMutations = [
      dataStream,
      this.sort.sortChange
    ];

    return merge(...dataMutations).pipe(
      map(() => this.getSortedData([...this.data])),
      tap(data => this.changes.emit(data)));
  }

  disconnect() {}

  private getConfigFiles(): Observable<ConfigFiles> {
    // Concurrently lookup each config file and return the combined result
    return forkJoin({
      versions: this.getTfVars(this.versionsRepo + '/config/020-delius-core.tfvars'),
      common: this.getTfVars(this.configRepo + '/common/common.tfvars'),
      commonProd: this.getTfVars(this.configRepo + '/common-prod/common.tfvars'),
      groupVarsAll: this.getYaml('/ansible/group_vars/all.yml'),
      environments: forkJoin(this.environments.map(env => this.getEnvironmentConfigFiles(env))).pipe(this.arrayToMap())
    });
  }

  private getEnvironmentConfigFiles(environmentName: string): Observable<EnvironmentConfigFiles> {
    // Concurrently lookup each config file and return the combined result
    return forkJoin({
      name: of(environmentName),
      isProd: this.isProd(environmentName),
      deliusCore: this.getTfVars(this.configRepo + '/' + environmentName + '/sub-projects/delius-core.tfvars'),
      groupVarsAll: this.getYaml('/' + environmentName + '/ansible/group_vars/all.yml'),
      groupVarsLdap: this.getYaml('/' + environmentName + '/ansible/group_vars/ldap.yml')
    });
  }

  private mapToEnvironmentConfig(name: string, files: ConfigFiles): EnvironmentConfig {
    // Map config files to an EnvironmentConfig object
    const envFiles = files.environments.get(name);
    const tfvars: any = {
      ...(envFiles.isProd ? files.commonProd : files.common),
      ...envFiles.deliusCore,
    };
    const ansibleVars: any = {
      ...files.groupVarsAll,
      ...envFiles.groupVarsAll,
      ...envFiles.groupVarsLdap
    };
    return {
      name,
      data: envFiles.isProd ? 'Production' : 'Test',
      delius: ansibleVars.ndelius_version,
      rbac: ansibleVars.ldap_config.rbac_version,
      umt: tfvars.umt_config[0].version || tfvars.default_umt_config[0].version,
      gdpr_ui: tfvars.gdpr_config[0].ui_version || tfvars.default_gdpr_config[0].ui_version,
      gdpr_api: tfvars.gdpr_config[0].api_version || tfvars.default_gdpr_config[0].api_version,
      aptracker_api: tfvars.aptracker_api_config[0].version || tfvars.default_aptracker_api_config[0].version,
      infrastructure: files.versions['hmpps-delius-core-terraform'][0][name] || 'latest',
      env_config: files.versions['delius-core-hmpps-env-configs'][0][name] || 'latest'
    };
  }

  private getTfVars(url: string): Observable<object> {
    return this.http.get<string>(url, {responseType: 'text' as 'json'})
      .pipe(map(res => parse(res)[0]));
  }

  private getYaml(path: string): Observable<object> {
    return this.http.get<string>(this.configRepo + path, {responseType: 'text' as 'json'})
      .pipe(map(res => safeLoad(res)));
  }

  private isProd(environmentName: string): Observable<boolean> {
    return this.http.get<string>(
      this.configRepo + '/' + environmentName + '/' + environmentName + '.properties', {responseType: 'text' as 'json'})
      .pipe(map(res => res.indexOf('"common-prod"') !== -1));
  }

  private getSortedData(data: EnvironmentConfig[]) {
    if (!this.sort.active || this.sort.direction === '') { return data; }
    return data.sort((a, b) => {
      return (a[this.sort.active] < b[this.sort.active] ? -1 : 1) * (this.sort.direction === 'asc' ? 1 : -1);
    });
  }

  private arrayToMap() {
    return map((envArr: EnvironmentConfigFiles[]) => new Map(envArr.map(env => [env.name, env])));
  }

  private repoUrl(repo: string): Observable<string> {
    return this.http.get<any>('https://api.github.com/repos/ministryofjustice/' + repo)
      .pipe(map(res => 'https://raw.githubusercontent.com/ministryofjustice/' + repo + '/' + res.default_branch));
  }
}
