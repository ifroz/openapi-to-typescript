export class Store<T> {
  protected store:{ [k: string]: T } = {}  
  assign(newItems:{ [k: string]: T }) {
    Object.assign(this.store, newItems)
  }

  toString() {
    return Object.values(this.store).filter(t => t).join('\n')
  }
}