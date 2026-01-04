import { Options, HasParams, RegisteredKeys } from '.'
import { TString } from '@/types/common'

type RegisteredKeysWithStrictMode<T extends 'strict' | 'loose'> =
  T extends 'strict' ? RegisteredKeys : TString.Autocomplete<RegisteredKeys>

export namespace QueryKeyParser {
  type FnReturn<Opts> = Opts extends { search: any } ? unknown[] : string[]

  type FnOptions<Path extends string, Opts> =
    HasParams<Path> extends true ? [opts: Opts] : [opts?: Opts]

  export type Fn<Strictness extends 'strict' | 'loose' = 'loose'> = {
    <
      Path extends RegisteredKeysWithStrictMode<Strictness>,
      Opts extends Options<Path>,
    >(
      path: Path,
      ...args: FnOptions<Path, Opts>
    ): FnReturn<Opts>
  }
}
