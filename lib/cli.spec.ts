import execa from 'execa'

describe('openapi-to-typescript CLI', () => {
  it('should --help', async () => {
    const executed = await runCLI('--help')
    expect(executed.stdout).toMatchSnapshot()
  })
  it('should output typescipt code to stdout', async () => {
    const executed = await runCLI('-i ./fixtures/petstore.json')
    expect(executed.stdout).toContain('API_URL = ')
    expect(executed.stdout).toContain('ShowPetById')
  })
})

function runCLI(arg: string) {
  return execa('yarn', ['cli', ...arg.split(/\s+/g)])
}
