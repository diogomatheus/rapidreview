const rewire = require("rewire");
const sinon = require('sinon');
const expect = require('../chai').expect;
const bibtexService = require('../../src/service/bibtex-service');
const filesystemService = require('../../src/service/filesystem-service');
const coreService = rewire('../../src/service/core-service');

describe('rapidreview/service/core-service.js', () => {

  afterEach(() => sinon.restore());

  describe('parseInputBib method', () => {

    it('should be array of objects when succeeds and context bibs is array', async function() {
      const fakeRead = sinon.replace(filesystemService, 'readFile', sinon.fake.returns({}));
      const fakeParse = sinon.fake.returns({});
      const _parseBibFileReset = coreService.__set__('_parseBibFile', fakeParse);
      const result = await coreService.parseInputBib({ input: 'fake.bib' }, { bibs: [{}] });
      expect(result.bibs).to.be.an('array').that.is.not.empty;
      expect(fakeRead.called).to.be.true;
      expect(fakeParse.called).to.be.true;
      _parseBibFileReset();
    });
    
    it('should be array of objects when succeeds and context bibs is not array', async function() {
      const fakeRead = sinon.replace(filesystemService, 'readFile', sinon.fake.returns({}));
      const fakeParse = sinon.fake.returns({});
      const _parseBibFileReset = coreService.__set__('_parseBibFile', fakeParse);
      const result = await coreService.parseInputBib({ input: 'fake.bib' }, {});
      expect(result.bibs).to.be.an('array').that.is.not.empty;
      expect(fakeRead.called).to.be.true;
      expect(fakeParse.called).to.be.true;
      _parseBibFileReset();
    });

    it('should not execute readFile when input argument is missing', async function() {
      const fake = sinon.replace(filesystemService, 'readFile', sinon.fake.returns({}));
      await coreService.parseInputBib({}, {});
      expect(fake.called).to.be.false;
    });
    
  });

  describe('parseDirectoryBibs method', () => {

    it('should be array of objects when succeeds and context bibs is array', async function() {
      const fakeRead = sinon.replace(filesystemService, 'readDirectoryBibFiles', sinon.fake.returns([{}]));
      const fakeParse = sinon.fake.returns([{}]);
      const _parseBibFilesReset = coreService.__set__('_parseBibFiles', fakeParse);
      const result = await coreService.parseDirectoryBibs({ directory: '/fake/dir' }, { bibs: [{}] });
      expect(result.bibs).to.be.an('array').that.is.not.empty;
      expect(fakeRead.called).to.be.true;
      expect(fakeParse.called).to.be.true;
      _parseBibFilesReset();
    });
    
    it('should be array of objects when succeeds and context bibs is not array', async function() {
      const fakeRead = sinon.replace(filesystemService, 'readDirectoryBibFiles', sinon.fake.returns([{}]));
      const fakeParse = sinon.fake.returns([{}]);
      const _parseBibFilesReset = coreService.__set__('_parseBibFiles', fakeParse);
      const result = await coreService.parseDirectoryBibs({ directory: '/fake/dir' }, {});
      expect(result.bibs).to.be.an('array').that.is.not.empty;
      expect(fakeRead.called).to.be.true;
      expect(fakeParse.called).to.be.true;
      _parseBibFilesReset();
    });

    it('should not execute readDirectoryBibFiles and _parseBibFiles when directory argument is missing', async function() {
      const fakeRead = sinon.replace(filesystemService, 'readDirectoryBibFiles', sinon.fake.returns([]));
      const fakeParse = sinon.fake.returns([{}]);
      const _parseBibFilesReset = coreService.__set__('_parseBibFiles', fakeParse);
      expect(await coreService.parseDirectoryBibs({}, {})).to.be.an('object');
      expect(fakeRead.called).to.be.false;
      expect(fakeParse.called).to.be.false;
      _parseBibFilesReset();
    });
    
  });

  describe('prepareAnalysisFields method', () => {
    
    it('should execute prepareAnalysisFields when there are context bibs', async function() {
      const bibs = [{ source: 'input', documents: [] }];
      const fake = sinon.replace(bibtexService, 'prepareAnalysisFields', sinon.fake.returns([]));
      const result = await coreService.prepareAnalysisFields({}, { bibs });
      expect(result.bibs).to.be.an('array').that.is.not.empty;
      expect(fake.called).to.be.true;
    });
    
    it('should not execute prepareAnalysisFields when there are no context bibs', async function() {
      const fake = sinon.replace(bibtexService, 'prepareAnalysisFields', sinon.fake.returns([]));
      const result = await coreService.prepareAnalysisFields({}, { bibs: [] });
      expect(result.bibs).to.be.an('array').that.is.empty;
      expect(fake.called).to.be.false;
    });

  });

  describe('removeAnalysisFields method', () => {
    
    it('should execute removeAnalysisFields when there are context bibs', async function() {
      const bibs = [{ source: 'input', documents: [] }];
      const fake = sinon.replace(bibtexService, 'removeAnalysisFields', sinon.fake.returns([]));
      const result = await coreService.removeAnalysisFields({}, { bibs });
      expect(result.bibs).to.be.an('array').that.is.not.empty;
      expect(fake.called).to.be.true;
    });
    
    it('should not execute removeAnalysisFields when there are no context bibs', async function() {
      const fake = sinon.replace(bibtexService, 'removeAnalysisFields', sinon.fake.returns([]));
      const result = await coreService.removeAnalysisFields({}, { bibs: [] });
      expect(result.bibs).to.be.an('array').that.is.empty;
      expect(fake.called).to.be.false;
    });

  });

  describe('sanitizeInconsistent method', () => {
    
    it('should execute sanitizeInconsistent when there are bib files', async function() {
      const fake = sinon.replace(bibtexService, 'sanitizeInconsistent', sinon.fake.returns([]));
      const bibs = [{ source: 'input', documents: [] }, { source: 'directory', documents: [] }];
      const result = await coreService.sanitizeInconsistent({}, { bibs });
      expect(result.bibs).to.be.an('array').that.is.not.empty;
      expect(fake.called).to.be.true;
    });
    
    it('should not execute sanitizeInconsistent when there are no bib files', async function() {
      const fake = sinon.replace(bibtexService, 'sanitizeInconsistent', sinon.fake.returns([]));
      const result = await coreService.sanitizeInconsistent({}, { bibs: [] });
      expect(result.bibs).to.be.an('array').that.is.empty;
      expect(fake.called).to.be.false;
    });

    it('should not execute sanitizeInconsistent when input bib file is missing', async function() {
      const fake = sinon.replace(bibtexService, 'sanitizeInconsistent', sinon.fake.returns([]));
      const bibs = [{ source: 'directory', documents: [] }];
      const result = await coreService.sanitizeInconsistent({}, { bibs });
      expect(result.bibs).to.be.an('array').that.is.not.empty;
      expect(fake.called).to.be.false;
    });

  });

  describe('sanitizeDuplicate method', () => {

    it('should execute sanitizeDuplicate when there are bib files', async function() {
      const fake = sinon.replace(bibtexService, 'sanitizeDuplicate', sinon.fake.returns([]));
      const bibs = [{ source: 'input', documents: [] }, { source: 'directory', documents: [] }];
      const result = await coreService.sanitizeDuplicate({}, { bibs });
      expect(result.bibs).to.be.an('array').that.is.not.empty;
      expect(fake.called).to.be.true;
    });
    
    it('should not execute sanitizeDuplicate when there are no bib files', async function() {
      const fake = sinon.replace(bibtexService, 'sanitizeDuplicate', sinon.fake.returns([]));
      const result = await coreService.sanitizeDuplicate({}, { bibs: [] });
      expect(result.bibs).to.be.an('array').that.is.empty;
      expect(fake.called).to.be.false;
    });

    it('should not execute sanitizeDuplicate when input bib file is missing', async function() {
      const fake = sinon.replace(bibtexService, 'sanitizeDuplicate', sinon.fake.returns([]));
      const bibs = [{ source: 'directory', documents: [] }];
      const result = await coreService.sanitizeDuplicate({}, { bibs });
      expect(result.bibs).to.be.an('array').that.is.not.empty;
      expect(fake.called).to.be.false;
    });

  });

  describe('filterByInclusion method', () => {
    
    it('should execute filterByFieldValue when there are context bibs', async function() {
      const bibs = [{ source: 'input', documents: [] }];
      const fake = sinon.replace(bibtexService, 'filterByFieldValue', sinon.fake.returns([]));
      const result = await coreService.filterByInclusion({}, { bibs });
      expect(result.bibs).to.be.an('array').that.is.not.empty;
      expect(fake.called).to.be.true;
    });
    
    it('should not execute filterByFieldValue when there are no context bibs', async function() {
      const fake = sinon.replace(bibtexService, 'filterByFieldValue', sinon.fake.returns([]));
      const result = await coreService.filterByInclusion({}, { bibs: [] });
      expect(result.bibs).to.be.an('array').that.is.empty;
      expect(fake.called).to.be.false;
    });

  });

  describe('buildSnowballingScopusURL method', () => {
    
    it('should execute buildSnowballingScopusURL when there is input bib file', async function() {
      const fake = sinon.replace(bibtexService, 'buildSnowballingScopusURL', sinon.fake.returns('XPTO'));
      const bibs = [{ source: 'input', documents: [] }];
      const result = await coreService.buildSnowballingScopusURL({ strategy: 'backward' }, { bibs });
      expect(result.response).to.be.a('string');
      expect(fake.called).to.be.true;
    });

    it('should not execute buildSnowballingScopusURL when there are no bib files', async function() {
      const fake = sinon.replace(bibtexService, 'buildSnowballingScopusURL', sinon.fake.returns('XPTO'));
      const result = await coreService.buildSnowballingScopusURL({ strategy: 'backward' }, { bibs: [] });
      expect(result.response).to.be.an('undefined');
      expect(fake.called).to.be.false;
    });

    it('should not execute buildSnowballingScopusURL when input bib file is missing', async function() {
      const fake = sinon.replace(bibtexService, 'buildSnowballingScopusURL', sinon.fake.returns('XPTO'));
      const bibs = [{ source: 'directory', documents: [] }];
      const result = await coreService.buildSnowballingScopusURL({ strategy: 'backward' }, { bibs });
      expect(result.response).to.be.an('undefined');
      expect(fake.called).to.be.false;
    });

  });

  describe('buildDefaultBib method', () => {
    
    it('should be string when there is input bib file', async function() {
      const fake = sinon.replace(bibtexService, 'object2bibtex', sinon.fake.returns('XPTO'));
      const bibs = [{ source: 'input', documents: [] }];
      const result = await coreService.buildDefaultBib({}, { bibs });
      expect(result.response).to.be.a('string');
      expect(fake.called).to.be.true;
    });

    it('should be undefined when input bib file is missing', async function() {
      const fake = sinon.replace(bibtexService, 'object2bibtex', sinon.fake.returns('XPTO'));
      const result = await coreService.buildDefaultBib({}, { bibs: [] });
      expect(result.response).to.be.an('undefined');
      expect(fake.called).to.be.false;
    });

  });

  describe('buildReleaseBib method', () => {
    
    it('should be string when succeeds', async function() {
      const bibs = [{ documents: [] }];
      const fake = sinon.replace(bibtexService, 'object2bibtex', sinon.fake.returns('XPTO'));
      const result = await coreService.buildReleaseBib({}, { bibs });
      expect(result.response).to.be.a('string');
      expect(fake.called).to.be.true;
    });
    
  });

  describe('save method', () => {

    it('should output be equals to input when overwrite is true', async function() {
      const fake = sinon.replace(filesystemService, 'saveFile', sinon.fake.returns(undefined));
      const args = { overwrite: true, input: 'first.bib' };
      const result = await coreService.save(args, {});
      expect(fake.called).to.be.true;
      expect(result.output).to.be.eq(args.input);
    });

    it('should output not be equals to input when overwrite is false', async function() {
      const fake = sinon.replace(filesystemService, 'saveFile', sinon.fake.returns(undefined));
      const args = { overwrite: false, input: 'first.bib', output: 'second.bib' };
      const result = await coreService.save(args, {});
      expect(fake.called).to.be.true;
      expect(result.output).to.be.not.eq(args.input);
      expect(result.output).to.be.eq(args.output);
    });

  });

  describe('release method', () => {

    it('should execute filesystem service buildPath and saveFile methods always', async function() {
      const systempath = '/fake/dir/release.bib';
      const fakeBuildPath = sinon.replace(filesystemService, 'buildPath', sinon.fake.returns(systempath));
      const fakeSaveFile = sinon.replace(filesystemService, 'saveFile', sinon.fake.returns(undefined));
      const result = await coreService.release({ directory: '/fake/dir' }, {});
      expect(result.output).to.be.eq(systempath);
      expect(fakeBuildPath.called).to.be.true;
      expect(fakeSaveFile.called).to.be.true;
    });

  });
  
  describe('printOutputPath method', () => {

    it('should execute console log method when context output exists', async function() {
      const fake = sinon.replace(console, 'log', sinon.fake.returns(undefined));
      await coreService.printOutputPath({}, { output: 'file.bib' });
      expect(fake.called).to.be.true;
    });

    it('should not execute console log method when context output do not exists', async function() {
      const fake = sinon.replace(console, 'log', sinon.fake.returns(undefined));
      await coreService.printOutputPath({}, { output: undefined });
      expect(fake.called).to.be.false;
    });

  });
  
  describe('printScopusURL method', () => {

    it('should execute console log method when context response exists', async function() {
      const fake = sinon.replace(console, 'log', sinon.fake.returns(undefined));
      await coreService.printScopusURL({}, { response: 'XPTO' });
      expect(fake.called).to.be.true;
    });

    it('should not execute console log method when context response do not exists', async function() {
      const fake = sinon.replace(console, 'log', sinon.fake.returns(undefined));
      await coreService.printScopusURL({}, { response: undefined });
      expect(fake.called).to.be.false;
    });
    
  });
  
  describe('_parseBibFile method', () => {

    const _parseBibFile = coreService.__get__('_parseBibFile');

    it('should be object when succeeds', async function() {
      const fake = sinon.replace(bibtexService, 'bibtex2object', sinon.fake.returns({}));
      expect(await _parseBibFile({})).to.be.an('object');
      expect(fake.called).to.be.true;
    });

    it('should be null and not execute bibtext service bibtex2object when there is no file', async function() {
      const fake = sinon.replace(bibtexService, 'bibtex2object', sinon.fake.returns({}));
      expect(await _parseBibFile(undefined)).to.be.eq(null);
      expect(fake.called).to.be.false;
    });

  });

  describe('_parseBibFiles method', () => {

    const _parseBibFiles = coreService.__get__('_parseBibFiles');

    it('should be array of object and execute _parseBibFiles when succeeds', async function() {
      const fake = sinon.fake.returns({});
      const _parseBibFileReset = coreService.__set__('_parseBibFile', fake);
      expect(await _parseBibFiles([{}])).to.be.an('array').that.is.not.empty;
      expect(fake.called).to.be.true;
      _parseBibFileReset();
    });

    it('should be empty array and not execute _parseBibFiles when there are no files', async function() {
      const fake = sinon.fake.returns({});
      const _parseBibFileReset = coreService.__set__('_parseBibFile', fake);
      expect(await _parseBibFiles([])).to.be.an('array').that.is.empty;
      expect(fake.called).to.be.false;
      _parseBibFileReset();
    });

  });

});
