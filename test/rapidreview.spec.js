const rewire = require("rewire");
const sinon = require('sinon');
const expect = require('./chai').expect;
const prompt = require('../src/cli/prompt');
const coreService = require('../src//service/core-service');
const rapidreview = rewire('../src/rapidreview');
const listrSilentRenderer = require('listr-silent-renderer');

describe('rapidreview/rapidreview.js', () => {

  let fake = undefined;

  beforeEach(() => {
    fake = sinon.fake.returns(() => undefined);
    const methods = [
      'parseInputBib','parseDirectoryBibs','prepareAnalysisFields','removeAnalysisFields','sanitizeInconsistent',
      'sanitizeDuplicate','filterByInclusion','buildSnowballingScopusURL','buildDefaultBib','buildReleaseBib',
      'save','release','printOutputPath','printScopusURL'
    ];
    methods.map((method) => sinon.replace(coreService, method, fake));
  });

  afterEach(() => sinon.restore());
    
  describe('prepare method', () => {

    it('should execute five tasks when output and writing are enabled', async function() {
      const _defineListrRendererReset = rapidreview.__set__('_defineListrRenderer', sinon.fake.returns(listrSilentRenderer));
      sinon.replace(prompt, 'io', sinon.fake.returns({ suppressOutput: false, suppressWriting: false }));
      await rapidreview.prepare();
      expect(fake.callCount).to.be.eq(5);
      _defineListrRendererReset();
    });
    
    it('should execute four tasks when output is disabled and writing is enabled', async function() {
      sinon.replace(prompt, 'io', sinon.fake.returns({ suppressOutput: true, suppressWriting: false }));
      await rapidreview.prepare();
      expect(fake.callCount).to.be.eq(4);
    });

    it('should execute three tasks when output and writing are disabled', async function() {
      sinon.replace(prompt, 'io', sinon.fake.returns({ suppressOutput: true, suppressWriting: true }));
      await rapidreview.prepare();
      expect(fake.callCount).to.be.eq(3);
    });

  });

  describe('sanitize method', () => {

    it('should execute seven tasks when output and writing are enabled', async function() {
      const _defineListrRendererReset = rapidreview.__set__('_defineListrRenderer', sinon.fake.returns(listrSilentRenderer));
      sinon.replace(prompt, 'sanitize', sinon.fake.returns({ suppressOutput: false, suppressWriting: false }));
      await rapidreview.sanitize();
      expect(fake.callCount).to.be.eq(7);
      _defineListrRendererReset();
    });

    it('should execute six tasks when output is disabled and writing is enabled', async function() {
      sinon.replace(prompt, 'sanitize', sinon.fake.returns({ suppressOutput: true, suppressWriting: false }));
      await rapidreview.sanitize();
      expect(fake.callCount).to.be.eq(6);
    });

    it('should execute five tasks when output and writing are disabled', async function() {
      sinon.replace(prompt, 'sanitize', sinon.fake.returns({ suppressOutput: true, suppressWriting: true }));
      await rapidreview.sanitize();
      expect(fake.callCount).to.be.eq(5);
    });

  });

  describe('snowballing method', () => {

    it('should execute four tasks when output is enabled', async function() {
      const _defineListrRendererReset = rapidreview.__set__('_defineListrRenderer', sinon.fake.returns(listrSilentRenderer));
      sinon.replace(prompt, 'snowballing', sinon.fake.returns({ suppressOutput: false }));
      await rapidreview.snowballing();
      expect(fake.callCount).to.be.eq(4);
      _defineListrRendererReset();
    });

    it('should execute three tasks when output is disabled', async function() {
      sinon.replace(prompt, 'snowballing', sinon.fake.returns({ suppressOutput: true }));
      await rapidreview.snowballing();
      expect(fake.callCount).to.be.eq(3);
    });

  });

  describe('build method', () => {

    it('should execute six tasks when output and writing are enabled', async () => {
      const _defineListrRendererReset = rapidreview.__set__('_defineListrRenderer', sinon.fake.returns(listrSilentRenderer));
      rapidreview.__set__('_defineListrRenderer', () => listrSilentRenderer);
      sinon.replace(prompt, 'directory', sinon.fake.returns({ suppressOutput: false, suppressWriting: false }));
      await rapidreview.build();
      expect(fake.callCount).to.be.eq(6);
      _defineListrRendererReset();
    });

    it('should execute five tasks when output is disabled and writing is enabled', async function() {
      sinon.replace(prompt, 'directory', sinon.fake.returns({ suppressOutput: true, suppressWriting: false }));
      await rapidreview.build();
      expect(fake.callCount).to.be.eq(5);
    });

    it('should execute four tasks when output and writing are disabled', async function() {
      sinon.replace(prompt, 'directory', sinon.fake.returns({ suppressOutput: true, suppressWriting: true }));
      await rapidreview.build();
      expect(fake.callCount).to.be.eq(4);
    });

  });

  describe('_defineListrRenderer method', () => {

    const _defineListrRenderer = rapidreview.__get__('_defineListrRenderer');
    
    it('should be default when output is enabled', async function() {
      const result = _defineListrRenderer({ suppressOutput: false });
      expect(result).to.be.a('string');
      expect(result).to.be.eq('default');
    });

    it('should be listrSilentRenderer when output is disabled', async function() {
      const result = _defineListrRenderer({ suppressOutput: true });
      expect(result).to.be.a('function');
      expect(result).to.be.eq(listrSilentRenderer);
    });

  });

});
