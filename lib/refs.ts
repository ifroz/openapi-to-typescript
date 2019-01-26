export class InternalRefRewriter {
  private readonly prefix:string
  constructor(prefix = 'internal:/') {
    this.prefix = prefix
  }

  public rewrite(root: any):void {
    Object.keys(root).forEach(key => {
      if (key === '$ref') root[key] = this.prefixedRef(root[key])
      if (typeof root[key] === 'object') this.rewrite(root[key]) // resursion
    })
  }

  private prefixedRef(refValue: string) {
    return refValue.startsWith('#') ? this.prefix + refValue.substr(1) : refValue
  }
}