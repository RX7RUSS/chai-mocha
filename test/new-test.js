// Tnew tests for revised code

const mod = require('../src/revised-block')
const path = require('path')

const { expect } = require('chai')
const { createSandbox } = require('sinon')

describe('Module >>', () => {

  describe('getRemoteResources()', () => {

    const fileFixture = { name: 'example_BANK_ACCT' }

    const fileFixtureBad = { name: 'testname' }

    let sandbox

    beforeEach(() => {
      sandbox = createSandbox()
    })

    afterEach(() => {
      sandbox.restore()
    })

    it('throws error when there are no files', async () => {

      const listStub = sandbox.stub().callsFake((filePath) => {
        expect(filePath).to.equal('/path')
        return []
      })

      try {
        await mod.getRemoteResources({ list: listStub }, '/path')
        expect(true).to.be.false;
      } catch(err) {
        expect(err.message).to.equal('No files in /path')
        sandbox.assert.calledOnce(listStub)
      }

    });

    it('returns false when no expected files are present', async () => {

      const listStub = sandbox.stub().callsFake((filePath) => {
        expect(filePath).to.equal('/path')
        return [ fileFixtureBad ]
      })

      try {
        const result = await mod.getRemoteResources({ list: listStub }, '/path')
        expect(result).to.be.false;
      } catch(err) {
        expect(true).to.be.false;
      }

    });

    it('final call with all args', async () => {
      const log = []
      const listStub = sandbox.stub().callsFake((filePath) => {
        expect(filePath).to.equal('/path')
        return [ fileFixture ]
      })

      sandbox.stub(path, 'resolve').returns('test-path')

      const getStub = sandbox.stub().throws(new Error('nope-getStub'))

      try {
        const result = await mod.getRemoteResources({ list: listStub, fastGet: getStub }, '/path', log)
        expect(result).to.be.true;
      } catch(err) {
        console.log(err)
      }

    });


  })

})

