import {NotUsed} from './not-used'

export class Main {
  /**
   * Wow, it's a constructor
   */
  constructor(bob: string) {

  }

  private notused: boolean

  private notUsedFunction() {

  }

  /**
   * @param cycles  Does not do anything, just there for looks.
   * @param child
   */
  run(cycles: number, child?: Main) {

  }

  doNothing(): any[] {
    return []
  }

  /**
   * Does not do anything, the sequel.
   * @param crazy  Does not do anything, just there for looks.
   */
  doNothing2(crazy: string = 'this is a default'): any[] {
    return []
  }
}

export interface Entity {
  /**
   * Name of the entity
   */
  name: string

  /**
   * Rarely used
   */
  kill(): void
}

export enum MeansOfTravel {
  flying,
  teleporting,
  somersaults,
}