import * as Context from 'effect/Context'
import { Config } from './config-schema'

export class ConfigService extends Context.Tag('ConfigService')<
  ConfigService,
  Config
>() {}
