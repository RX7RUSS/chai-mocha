// The difficult part will be mocking SFTP Fast Put and sftpClient.list(sftpPath)

const mod = require('../src/module')
const path = require('path')

const { expect } = require('chai')
const { createSandbox } = require('sinon')

describe('Module >>', () => {

  describe('getRemoteResources()', () => {

    const fileFixture = { name: 'example_BANK_ACCT', modifyTime: 100 }

    const fileFixtureBad = { name: 'testname', modifyTime: 50 }

    const fileFixtureEmpty = {}

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

    it('verfies path', async () => {
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

    it('tests modifyTime conditional', async () => {
      const log = []
      const modifyTime = fileFixture.modifyTime
      
      const listStub = sandbox.stub().callsFake((filePath) => {
        expect(filePath).to.equal('/path')
        expect(fileFixture.modifyTime).to.equal(100)
        return [ fileFixture, Object.assign({}, fileFixture, { modifyTime: 120 }) ]
      })

      console.log('modifyTime', fileFixture.modifyTime)    

      console.log('modifyTime on Bad', fileFixtureBad.modifyTime)

      sandbox.stub(path, 'resolve').returns('test-path')

      const getStub = sandbox.stub().throws(new Error('nope-getStub'))

      try {
        const result = await mod.getRemoteResources({ list: listStub, fastGet: getStub }, '/path', log, modifyTime)
        expect(result.modifyTime).to.equal(100);
      } catch(err) {
        console.log(modifyTime)
        console.log(err)
      }

    });

  })

})

