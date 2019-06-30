import execa from 'execa'

describe('openapi-to-typescript CLI', () => {
  it('should --help', async () => {
    const executed = await runCLI('--help')
    expect(executed.stdout).toMatchSnapshot()
  })

  describe('--input -i', () => {
    it('should output typescipt code to stdout', async () => {
      const executed = await runCLI('-i ./fixtures/petstore.json')
      expect(executed.stdout).toContain('API_URL = ')
      expect(executed.stdout).toContain('ShowPetById')
    })
  })

  describe('--server -s', () => {
    it('should set the API url to the one provided', async () => {
      const executed = await runCLI('-i ./fixtures/petstore.json -s some://custom.api')
      expect(executed.stdout).toContain('API_URL = "some://custom.api"')
    })
  })
})

function runCLI(arg: string, opts?: any) {
  return execa('ts-node', ['./lib/cli', ...arg.split(/\s+/g)], opts)
}
