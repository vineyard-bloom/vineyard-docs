import {NotUsed} from './not-used'

export class Main {
  /**
   * Wow, it's a constructor
   */
  constructor(bob: string) {

  }

  /**
   * @param cycles  Does not do anything, just there for looks.
   * @param child
   */
  run(cycles: number, child: Main) {

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