const rewire = require("rewire");
const sinon = require('sinon');
const expect = require('../chai').expect;
const rapidreview = require('../../src/rapidreview');
const program = rewire('../../src/cli/program');

describe('rapidreview/cli/program.js', () => {

  const _builder = program.__get__('_builder');

  afterEach(() => sinon.restore());

  describe('CLI commands', () => {

    it('should execute rapidreview prepare method when prepare command is called', async function() {
      const fake = sinon.replace(rapidreview, 'prepare', sinon.fake.returns(undefined));
      _builder(['prepare'], {});
      expect(fake.called).to.be.true;
    });
  
    it('should execute rapidreview sanitize method when sanitize command is called', async function() {
      const fake = sinon.replace(rapidreview, 'sanitize', sinon.fake.returns(undefined));
      _builder(['sanitize'], { suppressOutput: true, suppressWritting: true });
      expect(fake.called).to.be.true;
    });
  
    it('should execute rapidreview snowballing method when snowballing command is called', async function() {
      const fake = sinon.replace(rapidreview, 'snowballing', sinon.fake.returns(undefined));
      _builder(['snowballing'], { suppressOutput: true });
      expect(fake.called).to.be.true;
    });
  
    it('should execute rapidreview build method when build command is called', async function() {
      const fake = sinon.replace(rapidreview, 'build', sinon.fake.returns(undefined));
      _builder(['build'], { suppressOutput: false, suppressWritting: false });
      expect(fake.called).to.be.true;
    });
  
    it('should throw error when unknown command is called', async function() {
      expect(() => _builder(['unknown-command'], { exitOverride: true, suppressOutput: true })).to.throw();
    });

  });

});
