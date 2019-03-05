import { Store } from './store'

describe('Store<T>', () => {
  it('should assign to store', () => {
    const s = new Store<true>()
    s.assign({ a: true })
    s.assign({ b: true, c: true })
    expect(s.toObject()).toEqual({
      a: true,
      b: true,
      c: true,
    })
  })

  it('should not allow overwrites', () => {
    const s = new Store<number>()
    s.assign({ everything: 42 })
    expect(() => s.assign({ everything: 42 })).toThrow('everything')
    s.assign({ other: 100 })
  })
})
