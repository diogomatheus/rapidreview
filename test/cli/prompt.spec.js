const rewire = require("rewire");
const sinon = require('sinon');
const expect = require('../chai').expect;
const inquirer = require('inquirer');
const filesystemService = require('../../src/service/filesystem-service');
const prompt = rewire('../../src/cli/prompt');

describe('rapidreview/cli/prompt.js', () => {

  afterEach(() => sinon.restore());

  describe('io method', () => {

    it('should keep object structure when output is disabled', async function() {
      const args = { suppressOutput: true };
      expect(await prompt.io(args)).to.be.eql(args);
    });
    
    it('should keep object structure when all arguments exist', async function() {
      const _isInputValidReset = prompt.__set__('_isInputValid', sinon.fake.returns(true));
      const _isOutputValidReset = prompt.__set__('_isOutputValid', sinon.fake.returns(true));
      const args = { input: 'fake.bib', output: 'fake.bib' };
      expect(await prompt.io(args)).to.be.eql(args);
      _isInputValidReset();
      _isOutputValidReset();
    });

    describe('should prompt when any argument is missing', () => {

      it('should prompt one question when input argument is missing', async function() {
        const _isOutputValidReset = prompt.__set__('_isOutputValid', sinon.fake.returns(true));
        const expected = { output: 'fake.bib' };
        const fake = sinon.replace(inquirer, 'prompt', sinon.fake.returns(expected));
        expect(await prompt.io({ output: 'fake.bib' })).to.be.eql(expected);
        expect(fake.called).to.be.true;
        expect(fake.getCall(0).args[0].length).to.be.eq(1);
        _isOutputValidReset();
      });

      it('should prompt two questions when output argument is missing', async function() {
        const _isInputValidReset = prompt.__set__('_isInputValid', sinon.fake.returns(true));
        const expected = { input: 'fake.bib' };
        const fake = sinon.replace(inquirer, 'prompt', sinon.fake.returns(expected));
        expect(await prompt.io({ input: 'fake.bib' })).to.be.eql(expected);
        expect(fake.called).to.be.true;
        expect(fake.getCall(0).args[0].length).to.be.eq(2);
        _isInputValidReset();
      });

      it('should prompt three questions when all arguments are missing', async function() {
        const expected = { input: 'fake.bib', output: 'fake.bib' };
        const fake = sinon.replace(inquirer, 'prompt', sinon.fake.returns(expected));
        expect(await prompt.io({})).to.be.eql(expected);
        expect(fake.called).to.be.true;
        expect(fake.getCall(0).args[0].length).to.be.eq(3);
      });

    });

  });

  describe('sanitize method', () => {

    it('should keep object structure when output is disabled', async function() {
      const args = { suppressOutput: true };
      expect(await prompt.sanitize(args)).to.be.eql(args);
    });

    it('should keep object structure when all arguments exist', async function() {
      const _isInputValidReset = prompt.__set__('_isInputValid', sinon.fake.returns(true));
      const _isOutputValidReset = prompt.__set__('_isOutputValid', sinon.fake.returns(true));
      const _isDirectoryValidReset = prompt.__set__('_isDirectoryValid', sinon.fake.returns(true));
      const args = { input: 'fake.bib', output: 'fake.bib', directory: '/fake/dir' };
      expect(await prompt.sanitize(args)).to.be.eql(args);
      _isInputValidReset();
      _isOutputValidReset();
      _isDirectoryValidReset();
    });

    describe('should prompt when any argument is missing', () => {

      it('should prompt one question when input argument is missing', async function() {
        const _isOutputValidReset = prompt.__set__('_isOutputValid', sinon.fake.returns(true));
        const _isDirectoryValidReset = prompt.__set__('_isDirectoryValid', sinon.fake.returns(true));
        const expected = { output: 'fake.bib', directory: '/fake/dir' };
        const fake = sinon.replace(inquirer, 'prompt', sinon.fake.returns(expected));
        expect(await prompt.sanitize({ output: 'fake.bib', directory: '/fake/dir' })).to.be.eql(expected);
        expect(fake.called).to.be.true;
        expect(fake.getCall(0).args[0].length).to.be.eq(1);
        _isOutputValidReset();
        _isDirectoryValidReset();
      });

      it('should prompt two questions when output argument is missing', async function() {
        const _isInputValidReset = prompt.__set__('_isInputValid', sinon.fake.returns(true));
        const _isDirectoryValidReset = prompt.__set__('_isDirectoryValid', sinon.fake.returns(true));
        const expected = { input: 'fake.bib', directory: '/fake/dir' };
        const fake = sinon.replace(inquirer, 'prompt', sinon.fake.returns(expected));
        expect(await prompt.sanitize({ input: 'fake.bib', directory: '/fake/dir' })).to.be.eql(expected);
        expect(fake.called).to.be.true;
        expect(fake.getCall(0).args[0].length).to.be.eq(2);
        _isInputValidReset();
        _isDirectoryValidReset();
      });

      it('should prompt one question when directory argument is missing', async function() {
        const _isInputValidReset = prompt.__set__('_isInputValid', sinon.fake.returns(true));
        const _isOutputValidReset = prompt.__set__('_isOutputValid', sinon.fake.returns(true));
        const expected = { input: 'fake.bib', output: 'fake.bib', directory: '/fake/dir' };
        const fake = sinon.replace(inquirer, 'prompt', sinon.fake.returns(expected));
        expect(await prompt.sanitize({ input: 'fake.bib', output: 'fake.bib' })).to.be.eql(expected);
        expect(fake.called).to.be.true;
        expect(fake.getCall(0).args[0].length).to.be.eq(1);
        _isInputValidReset();
        _isOutputValidReset();
      });

      it('should prompt four questions when all arguments are missing', async function() {
        const expected = { input: 'fake.bib', output: 'fake.bib', directory: '/fake/dir' };
        const fake = sinon.replace(inquirer, 'prompt', sinon.fake.returns(expected));
        expect(await prompt.sanitize({})).to.be.eql(expected);
        expect(fake.called).to.be.true;
        expect(fake.getCall(0).args[0].length).to.be.eq(4);
      });

    });

  });

  describe('snowballing method', () => {

    it('should keep object structure when output is disabled', async function() {
      const args = { suppressOutput: true };
      expect(await prompt.snowballing(args)).to.be.eql(args);
    });

    it('should keep object structure when all arguments exist', async function() {
      const _isInputValidReset = prompt.__set__('_isInputValid', sinon.fake.returns(true));
      const args = { input: 'fake.bib', strategy: 'backward' };
      expect(await prompt.snowballing(args)).to.be.eql(args);
      _isInputValidReset();
    });

    describe('should prompt when any argument is missing', () => {

      it('should prompt one question when input argument is missing', async function() {
        const expected = { input: 'fake.bib', strategy: 'backward' };
        const fake = sinon.replace(inquirer, 'prompt', sinon.fake.returns(expected));
        expect(await prompt.snowballing({ strategy: 'backward' })).to.be.eql(expected);
        expect(fake.called).to.be.true;
        expect(fake.getCall(0).args[0].length).to.be.eq(1);
      });

      it('should prompt one question when strategy argument is missing', async function() {
        const _isInputValidReset = prompt.__set__('_isInputValid', sinon.fake.returns(true));
        const expected = { input: 'fake.bib', strategy: 'backward' };
        const fake = sinon.replace(inquirer, 'prompt', sinon.fake.returns(expected));
        expect(await prompt.snowballing({ input: 'fake.bib' })).to.be.eql(expected);
        expect(fake.called).to.be.true;
        expect(fake.getCall(0).args[0].length).to.be.eq(1);
        _isInputValidReset();
      });

      it('should prompt two questions when all arguments are missing', async function() {
        const expected = { input: 'fake.bib', strategy: 'backward' };
        const fake = sinon.replace(inquirer, 'prompt', sinon.fake.returns(expected));
        expect(await prompt.snowballing({})).to.be.eql(expected);
        expect(fake.called).to.be.true;
        expect(fake.getCall(0).args[0].length).to.be.eq(2);
      });

    });

  });

  describe('directory method', () => {

    it('should keep object structure when output is disabled', async function() {
      const args = { suppressOutput: true };
      expect(await prompt.directory(args)).to.be.eql(args);
    });

    it('should keep object structure when all arguments exist', async function() {
      const _isDirectoryValidReset = prompt.__set__('_isDirectoryValid', sinon.fake.returns(true));
      const args = { directory: '/fake/dir' };
      expect(await prompt.directory(args)).to.be.eql(args);
      _isDirectoryValidReset();
    });

    describe('should prompt when any argument is missing', () => {

      it('should prompt one question when all arguments are missing', async function() {
        const expected = { directory: '/fake/dir' };
        const fake = sinon.replace(inquirer, 'prompt', sinon.fake.returns(expected));
        expect(await prompt.directory({})).to.be.eql(expected);
        expect(fake.called).to.be.true;
        expect(fake.getCall(0).args[0].length).to.be.eq(1);
      });

    });

  });
  
  describe('_isInputValid method', () => {

    const _isInputValid = prompt.__get__('_isInputValid');

    it('should be true when systempath exists and is indeed file', async function() {
      sinon.replace(filesystemService, 'fileExists', sinon.fake.returns(true));
      expect(await _isInputValid('fake.bib')).to.be.true;
    });

    it('should be error message when systempath do not exists or is not file', async function() {
      sinon.replace(filesystemService, 'fileExists', sinon.fake.returns(false));
      expect(await _isInputValid('fake.bib')).to.be.a('string');
    });

  });

  describe('_isOutputValid method', () => {

    const _isOutputValid = prompt.__get__('_isOutputValid');

    it('should be true when systempath do not represents a directory', async function() {
      sinon.replace(filesystemService, 'directoryExists', sinon.fake.returns(false));
      expect(await _isOutputValid('fake.bib')).to.be.true;
    });

    it('should be error message when systempath represents a directory', async function() {
      sinon.replace(filesystemService, 'directoryExists', sinon.fake.returns(true));
      expect(await _isOutputValid('fake.bib')).to.be.a('string');
    });

  });

  describe('_isDirectoryValid  method', () => {

    const _isDirectoryValid = prompt.__get__('_isDirectoryValid');

    it('should be true when systempath represents a directory', async function() {
      sinon.replace(filesystemService, 'directoryExists', sinon.fake.returns(true));
      expect(await _isDirectoryValid('fake.bib')).to.be.true;
    });

    it('should be error message when systempath do not represents a directory', async function() {
      sinon.replace(filesystemService, 'directoryExists', sinon.fake.returns(false));
      expect(await _isDirectoryValid('fake.bib')).to.be.a('string');
    });

  });

  describe('_shouldPromptOutput method', () => {

    const _shouldPromptOutput = prompt.__get__('_shouldPromptOutput');

    it('should be false when overwrite argument is true', async function() {
      expect(_shouldPromptOutput({ overwrite: true })).to.be.false;
    });

    it('should be true when overwrite argument is not true', async function() {
      expect(_shouldPromptOutput()).to.be.true;
    });

  });
    
});
