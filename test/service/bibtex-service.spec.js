const rewire = require("rewire");
const sinon = require('sinon');
const expect = require('../chai').expect;
const bibtexParser = require('bibtex-parse-js');
const bibtexService = rewire('../../src/service/bibtex-service');

describe('rapidreview/service/bibtex-service.js', () => {

  afterEach(() => sinon.restore());

  describe('bibtex2object method', () => {
    
    it('should be array of objects when succeeds', async function() {
      const documents = [{ entryType: 'COMMENT' }, { entryType: 'DOCUMENT' }];
      const fake = sinon.replace(bibtexParser, 'toJSON', sinon.fake.returns(documents));
      const result = await bibtexService.bibtex2object('XPTO');
      expect(result).to.be.an('array').that.is.not.empty;
      expect(result).to.have.lengthOf(1);
      expect(fake.called).to.be.true;
    });
    
    it('should throw Error when bibtexParser toJSON fails', function (done) {
      sinon.replace(bibtexParser, 'toJSON', sinon.fake.throws(new Error()));
      expect(bibtexService.bibtex2object()).to.eventually.not.be.rejectedWith(Error).and.notify(done);
    });

  });

  describe('object2bibtex method', () => {

    it('should be string when succeeds', async function() {
      const fake = sinon.replace(bibtexParser, 'toBibtex', sinon.fake.returns('XPTO'));
      const documents = [{ entryType: 'COMMENT' }, { entryType: 'DOCUMENT' }];
      const result = await bibtexService.object2bibtex(documents);
      expect(result).to.be.a('string');
      expect(fake.called).to.be.true;
    });
    
    it('should throw Error when bibtexParser toBibtex fails', function (done) {
      sinon.replace(bibtexParser, 'toBibtex', sinon.fake.throws(new Error()));
      expect(bibtexService.object2bibtex()).to.eventually.not.be.rejectedWith(Error).and.notify(done);
    });

  });

  describe('prepareAnalysisFields method', () => {
    
    it('should be array with documents when documents exists', async function() {
      const result = await bibtexService.prepareAnalysisFields([{}, { entryTags: {} }]);
      expect(result).to.be.an('array').that.is.not.empty;
      expect(result).to.have.lengthOf(2);
    });

    it('should be empty array when documents do not exists', async function() {
      expect(await bibtexService.prepareAnalysisFields([])).to.be.an('array').that.is.empty;
    });

  });

  describe('removeAnalysisFields method', () => {

    it('should be array with documents when documents exists', async function() {
      const documents = [{ entryTags: { title_criteria: 'XPTO', abstract_criteria: 'XPTO', reading_criteria: 'XPTO' } }, null, {}];
      const result = await bibtexService.removeAnalysisFields(documents);
      expect(result).to.be.an('array').that.is.not.empty;
      expect(result).to.have.lengthOf(3);
      expect(result[0].entryTags).to.not.have.property('title_criteria');
      expect(result[0].entryTags).to.not.have.property('abstract_criteria');
      expect(result[0].entryTags).to.not.have.property('reading_criteria');
    });

    it('should be empty array when documents do not exists', async function() {
      expect(await bibtexService.removeAnalysisFields([])).to.be.an('array').that.is.empty;
    });

  });

  describe('sanitizeInconsistent method', () => {
    
    it('should be array with documents when documents exists', async function() {
      const documents = [
        null,
        { entryTags: {} },
        { entryTags: { title: 'XPTO', year: '2000', author: 'XPTO' } },
        { entryTags: { title_criteria: 'YES', abstract_criteria: 'YES', reading_criteria: 'YES' } }
      ];
      const result = await bibtexService.sanitizeInconsistent(documents);
      expect(result).to.be.an('array').that.is.not.empty;
      expect(result).to.have.lengthOf(4);
      expect(result[0].entryTags.title_criteria).to.be.eq('INCONSISTENT');
      expect(result[1].entryTags.title_criteria).to.be.eq('INCONSISTENT');
      expect(result[2].entryTags.title_criteria).to.be.not.eq('INCONSISTENT');
      expect(result[3].entryTags.title_criteria).to.be.not.eq('INCONSISTENT');
    });

    it('should be empty array when documents do not exists', async function() {
      expect(await bibtexService.sanitizeInconsistent([])).to.be.an('array').that.is.empty;
    });

  });

  describe('sanitizeDuplicate method', () => {

    it('should be array with documents when documents exists', async function() {
      const documents = [
        null,
        {},
        { entryTags: { title: 'XPTO', year: '2000', author: 'XPTO' } },
        { entryTags: { title: 'XPTO', year: '2000', author: 'XPTO' } },
        { entryTags: { doi: '00.0000/XPTO.2000.00000' } },
        { entryTags: { title_criteria: 'YES', abstract_criteria: 'YES', reading_criteria: 'YES' } }
      ];
      const existingDocuments = [{ entryTags: { doi: '00.0000/XPTO.2000.00000' } }];
      const existingBibs = [{ source: 'directory', systempath: '/fake/dir/existing.bib', name: 'existing.bib', documents: existingDocuments }];
      const result = await bibtexService.sanitizeDuplicate('fake.bib', documents, existingBibs);
      expect(result).to.be.an('array').that.is.not.empty;
      expect(result).to.have.lengthOf(6);
      expect(result[0].entryTags.title_criteria).to.be.not.eq('DUPLICATED');
      expect(result[1].entryTags.title_criteria).to.be.not.eq('DUPLICATED');
      expect(result[2].entryTags.title_criteria).to.be.not.eq('DUPLICATED');
      expect(result[3].entryTags.title_criteria).to.be.eq('DUPLICATED');
      expect(result[4].entryTags.title_criteria).to.be.eq('DUPLICATED');
      expect(result[5].entryTags.title_criteria).to.be.not.eq('DUPLICATED');
    });

    it('should be empty array when documents do not exists', async function() {
      expect(await bibtexService.sanitizeDuplicate('fake.bib', [], null)).to.be.an('array').that.is.empty;
    });

  });

  describe('filterByFieldValue method', () => {

    it('should be array with documents when documents exists', async function() {
      const documents = [
        {},
        { entryTags: { title_criteria: 'XPTO' } },
        { entryTags: { title_criteria: 'XPTO', abstract_criteria: 'XPTO', reading_criteria: 'XPTO' } },
        { entryTags: { title_criteria: 'XPTO', abstract_criteria: 'XPTO', reading_criteria: 'YES' } }
      ];
      const result = await bibtexService.filterByFieldValue(documents, 'reading_criteria', 'YES');
      expect(result).to.be.an('array').that.is.not.empty;
      expect(result).to.have.lengthOf(1);
    });

    it('should be empty array when documents do not exists', async function() {
      expect(await bibtexService.filterByFieldValue([], 'field', 'value')).to.be.an('array').that.is.empty;
    });

  });

  describe('buildSnowballingScopusURL method', () => {
    
    it('should execute _buildBackwardSnowballingScopusURL when strategy is equals to backward', async function() {
      const fake = sinon.fake.returns(undefined);
      const _buildBackwardSnowballingScopusURLReset = bibtexService.__set__('_buildBackwardSnowballingScopusURL', fake);
      await bibtexService.buildSnowballingScopusURL('backward');
      expect(fake.called).to.be.true;
      _buildBackwardSnowballingScopusURLReset();
    });

    it('should execute _buildForwardSnowballingScopusURL when strategy is equals to forward', async function() {
      const fake = sinon.fake.returns(undefined);
      const _buildForwardSnowballingScopusURLReset = bibtexService.__set__('_buildForwardSnowballingScopusURL', fake);
      await bibtexService.buildSnowballingScopusURL('forward');
      expect(fake.called).to.be.true;
      _buildForwardSnowballingScopusURLReset();
    });

    it('should be null when strategy is invalid', async function() {
      expect(await bibtexService.buildSnowballingScopusURL(undefined)).to.be.eq(null);
    });
    
  });

  describe('_extractDocuments method', () => {

    const _extractDocuments = bibtexService.__get__('_extractDocuments');

    it('should be empty array when there are no bib files', async function() {
      expect(_extractDocuments([])).to.be.an('array').that.is.empty;
      expect(_extractDocuments(undefined)).to.be.an('array').that.is.empty;
    });

  });

  describe('_buildBackwardSnowballingScopusURL method', () => {

    const _buildBackwardSnowballingScopusURL = bibtexService.__get__('_buildBackwardSnowballingScopusURL');
    
    it('should be string that includes citingId when there is only one document', async function() {
      const documents = [{ entryTags: { url: 'https://www.xpto.com?eid=2-s2.0-00000000001' } }];
      const result = _buildBackwardSnowballingScopusURL(documents);
      expect(result).to.be.a('string');
      expect(result.includes('citingId')).to.be.true;
    });

    it('should be string that does not includes citingId when there are multiple documents', async function() {
      const documents = [
        { entryTags: {} },
        { entryTags: { url: 'https://www.xpto.com?eid=2-s2.0-00000000001' } },
        { entryTags: { url: 'https://www.xpto.com?eid=2-s2.0-00000000002' } },
        { entryTags: { url: 'https://www.xpto.com' } }
      ];
      const result = _buildBackwardSnowballingScopusURL(documents);
      expect(result).to.be.a('string');
      expect(result.includes('citingId')).to.be.false;
    });

    it('should be null when documents do not exists', async function() {
      expect(_buildBackwardSnowballingScopusURL([])).to.be.eq(null);
    });

  });

  describe('_buildForwardSnowballingScopusURL method', () => {

    const _buildForwardSnowballingScopusURL = bibtexService.__get__('_buildForwardSnowballingScopusURL');

    it('should be string when documents exists', async function() {
      const documents = [
        undefined,
        { entryTags: undefined },
        { entryTags: { url: 'https://www.xpto.com?eid=2-s2.0-00000000001' } },
        { entryTags: { url: 'https://www.xpto.com?eid=2-s2.0-00000000002' } },
        { entryTags: { url: 'https://www.xpto.com' } }
      ];
      expect(_buildForwardSnowballingScopusURL(documents)).to.be.a('string');
    });

    it('should be null when documents do not exists', async function() {
      expect(_buildForwardSnowballingScopusURL([])).to.be.eq(null);
    });

  });
  
  describe('_extractScopusEids method', () => {

    const _extractScopusEids = bibtexService.__get__('_extractScopusEids');

    it('should be array with expected eids when documents exists', async function() {
      const documents = [
        undefined,
        { entryTags: undefined },
        { entryTags: { url: 'https://www.xpto.com?eid=2-s2.0-00000000001' } },
        { entryTags: { url: 'https://www.xpto.com?eid=2-s2.0-00000000002' } },
        { entryTags: { url: 'https://www.xpto.com' } }
      ];
      const result = _extractScopusEids(documents);
      expect(result).to.be.an('array').that.is.not.empty;
      expect(result).to.be.an('array').that.includes('2-s2.0-00000000001');
      expect(result).to.be.an('array').that.includes('2-s2.0-00000000002');
    });

    it('should be empty array when documents do not exists', async function() {
      expect(_extractScopusEids([])).to.be.an('array').that.is.empty;
    });

  });

});
