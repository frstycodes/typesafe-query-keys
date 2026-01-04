import { Context } from 'effect'
import { Config } from './config-schema'

export class ConfigService extends Context.Tag('ConfigService')<
  ConfigService,
  Config
>() {}
