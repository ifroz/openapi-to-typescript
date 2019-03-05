import { SpecificationExtension } from './'

describe('SpecificationExtension', () => {
    it('addExtension() ok', () => {
        const sut = new SpecificationExtension()
        const extensionValue = { payload: 5 }
        sut.addExtension('x-name', extensionValue)

        expect(sut['x-name']).toEqual(extensionValue)
    })
    it('addExtension() invalid', (done) => {
        const sut = new SpecificationExtension()
        const extensionValue = { payload: 5 }
        try {
            sut.addExtension('y-name', extensionValue)
            done('Must fail. Invalid extension')
        } catch (err) {
            done()
        }
    })
    it('getExtension() ok', () => {
        const sut = new SpecificationExtension()
        const extensionValue1 = { payload: 5 }
        const extensionValue2 = { payload: 6 }
        sut.addExtension('x-name', extensionValue1)
        sut.addExtension('x-load', extensionValue2)

        expect(sut.getExtension('x-name')).toEqual(extensionValue1)
        expect(sut.getExtension('x-load')).toEqual(extensionValue2)
    })
    it('getExtension() invalid', (done) => {
        const sut = new SpecificationExtension()
        try {
            sut.getExtension('y-name')
            done('Error. invalid extension')
        } catch (err) {
            done()
        }
    })
    it('getExtension() not found', () => {
        const sut = new SpecificationExtension()
        expect(sut.getExtension('x-resource')).toEqual(null)
    })
    it('listExtensions()', () => {
        const sut = new SpecificationExtension()
        const extensionValue1 = { payload: 5 }
        const extensionValue2 = { payload: 6 }
        sut.addExtension('x-name', extensionValue1)
        sut.addExtension('x-load', extensionValue2)

        expect(sut.listExtensions()).toEqual(['x-name', 'x-load'])
    })
})
