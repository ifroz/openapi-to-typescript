import { intersection } from 'lodash'

export class Store<T> {
  protected store:{ [k: string]: T } = {}
  assign(newItems:{ [k: string]: T }) {
    this.validateNewItems(newItems)
    Object.assign(this.store, newItems)
  }

  private validateNewItems(newItems: { [k: string]: T }):void {
    const intersectingKeys = intersection(Object.keys(this.store), Object.keys(newItems))
    if (intersectingKeys.length)
      throw new Error(`Type definition(s) ${intersectingKeys.join(', ')} already exist in Store<T>.`)
  }

  toString() {
    return Object.values(this.store).filter(t => t).join('\n')
  }

  toObject() {
    return Object.assign({}, this.store)
  }
}