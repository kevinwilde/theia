import * as path from 'path'
import AuthPlugin from './plugins/auth-plugin'
import Builder from './builder'
import BuildPlugin from './plugins/build-plugin'
import Core from './core'
import ExpressPlugin from './plugins/express-plugin'
import HeartbeatPlugin from './plugins/heartbeat-plugin'
import InvalidateBuildManifestCachePlugin from './plugins/invalidate-build-manifest-cache-plugin'
import LocalStorage from './local-storage'
import ReheatCachePlugin from './plugins/reheat-cache-plugin'
import RollbarPlugin from './plugins/rollbar-plugin'
import S3Storage from './s3-storage'
import SlackPlugin from './plugins/slack-plugin'
import UsagePlugin from './plugins/usage-plugin'

export interface TheiaExport {
  (optionsFromParams?: Theia.Configuration): Theia.Core
  AuthPlugin: typeof AuthPlugin
  Builder: typeof Builder
  BuildPlugin: typeof BuildPlugin
  ExpressPlugin: typeof ExpressPlugin
  HeartbeatPlugin: typeof HeartbeatPlugin
  InvalidateBuildManifestCachePlugin: typeof InvalidateBuildManifestCachePlugin
  LocalStorage: typeof LocalStorage
  nn: typeof nn
  ReheatCachePlugin: typeof ReheatCachePlugin
  RollbarPlugin: typeof RollbarPlugin
  S3Storage: typeof S3Storage
  SlackPlugin: typeof SlackPlugin
  UsagePlugin: typeof UsagePlugin
}

// no nulls
export function nn<T> (array: (T | null)[]): T[] {
  return array.filter(e => e !== null) as T[]
}

function getConfig (configPath: string): Theia.Configuration {
  return require(configPath).default
}

function configDefaulter (options: Theia.Configuration): Theia.CompleteConfiguration {
  const opts = Object.assign({}, options)

  if (opts.builder === undefined) {
    opts.builder = new Builder()
  }

  if (opts.environment === undefined) {
    opts.environment = process.env.THEIA_ENV as Theia.Environment || 'development'
  }

  if (opts.storage === undefined) {
    opts.storage = new LocalStorage(path.resolve(__dirname, '..', 'libs'))
  }

  if (opts.verbose === undefined) {
    opts.verbose = true
  }

  return opts as Theia.CompleteConfiguration
}

const theia = function theia (optionsFromParams?: Theia.Configuration): Theia.Core {
  const configPaths = [
    path.resolve('theia.config'),
    path.resolve('dist/theia.config'),
    path.resolve('src/theia.config')
  ]
  const configPath = configPaths.find(p => {
    try {
      require.resolve(p)
      return true
    } catch (e) {
      return false
    }
  })

  if (!configPath) {
    throw new Error('could not find theia config')
  }

  const config = configDefaulter(getConfig(configPath))

  if (config.verbose) {
    console.log('Libs:', JSON.stringify(config.libs, null, 2))
    console.log('Plugins:', config.plugins.map(p => p.constructor.name).join(' '))
    console.log('Storage:', config.storage.constructor.name)
  }

  const core = new Core(config)
  return core
} as TheiaExport

theia.AuthPlugin = AuthPlugin
theia.Builder = Builder // TODO DefaultBuilder?
theia.BuildPlugin = BuildPlugin
theia.ExpressPlugin = ExpressPlugin
theia.HeartbeatPlugin = HeartbeatPlugin
theia.InvalidateBuildManifestCachePlugin = InvalidateBuildManifestCachePlugin
theia.LocalStorage = LocalStorage
theia.nn = nn
theia.ReheatCachePlugin = ReheatCachePlugin
theia.RollbarPlugin = RollbarPlugin
theia.S3Storage = S3Storage
theia.SlackPlugin = SlackPlugin
theia.UsagePlugin = UsagePlugin
export default theia
