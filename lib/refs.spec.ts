import { InternalRefRewriter } from './refs'

describe('InternalRefRewriter', () => {
  it('should modify internal references ($ref-s)', () => {
    const rewriter = new InternalRefRewriter('scheme')
    const root = {
      $ref: '#/some/path/selector',
    }
    rewriter.rewrite(root)
    expect(root).toMatchObject({
      $ref: 'scheme://some/path/selector',
    })
  })

  it('should recursively rewrite any $refs', () => {
    const rewriter = new InternalRefRewriter('scheme')
    const root = {
      nested: {
        deeply: {
          $ref: '#/deep/internal/ref',
        },
      },
    }
    rewriter.rewrite(root)
    expect(root).toMatchObject({
      nested: {
        deeply: {
          $ref: 'scheme://deep/internal/ref',
        },
      },
    })
  })
})
