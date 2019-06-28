export const INTERNAL_SCHEME = 'internal'

export class InternalRefRewriter {
  private readonly prefix: string
  constructor() {
    this.prefix = INTERNAL_SCHEME + ':/'
  }

  public rewrite(root: any): void {
    Object.keys(root).forEach((key) => {
      if (key === '$ref') root[key] = this.prefixedRef(root[key])
      if (root[key] && typeof root[key] === 'object') this.rewrite(root[key]) // recursion
    })
  }

  private prefixedRef(refValue: string) {
    return refValue.startsWith('#') ? this.prefix + refValue.substr(1) : refValue
  }
}
