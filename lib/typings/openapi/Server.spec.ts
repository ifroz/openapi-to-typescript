import { Server, ServerVariable } from './Server'

describe('openapi3-ts Server', () => {
    it('create server', () => {
        const v1 = new ServerVariable('dev', ['dev', 'qa', 'prod'], 'environment')
        const sut = new Server('http://api.qa.machine.org', 'qa maquine')
        sut.addVariable('environment', v1)

        expect(sut.url).toEqual('http://api.qa.machine.org')
        expect(sut.description).toEqual('qa maquine')
        expect(sut.variables.environment.default).toEqual('dev')
    })
})

describe('openapi3-ts ServerVariable', () => {
    it('server var', () => {
        const sut = new ServerVariable('dev', ['dev', 'qa', 'prod'], 'environment')

        expect(sut.default).toEqual('dev')
        expect(sut.description).toEqual('environment')
        expect(sut.enum).toEqual(['dev', 'qa', 'prod'])
    })
})
