const rewire = require("rewire");
const sinon = require('sinon');
const expect = require('../chai').expect;
const fs = require('fs');
const path = require('path');
const filesystemService = rewire('../../src/service/filesystem-service');

describe('rapidreview/service/filesystem-service.js', () => {

  afterEach(() => sinon.restore());

  describe('buildPath method', () => {

    it('should execute path join when succeeds', async function() {
      const systempath = '/fake/dir/fake.bib';
      const fake = sinon.replace(path, 'join', sinon.fake.returns(systempath));
      expect(await filesystemService.buildPath('/fake/dir', 'fake.bib')).to.be.eq(systempath)
      expect(fake.called).to.be.true;
    });

  });

  describe('fileExists method', () => {

    it('should be true when file exists', async function() {
      expect(await filesystemService.fileExists(__filename)).to.be.true;
    });

    it('should be false when file do not exists', async function() {
      expect(await filesystemService.fileExists('XPTO')).to.be.false;
    });

    it('should be false when systempath do not represents a file', async function() {
      expect(await filesystemService.fileExists(__dirname)).to.be.false;
    });

  });

  describe('readFile method', () => {
    
    it('should execute _readFile when succeeds', async function() {
      const fake = sinon.fake.returns(undefined);
      const _readFileReset = filesystemService.__set__('_readFile', fake);
      await filesystemService.readFile('fake.bib');
      expect(fake.called).to.be.true;
      _readFileReset();
    });

  });

  describe('readJabRefTemplateFile method', () => {

    it('should execute buildPath and readFile when template is valid', async function() {
      const fakeBuildPath = sinon.replace(filesystemService, 'buildPath', sinon.fake.returns('/fake/dir/fake.bib'));
      const fakeReadFile = sinon.replace(filesystemService, 'readFile', sinon.fake.returns(undefined));
      await filesystemService.readJabRefTemplateFile('default');
      expect(fakeBuildPath.called).to.be.true;
      expect(fakeReadFile.called).to.be.true;
    });

    it('should be null when template is invalid', async function() {
      expect(await filesystemService.readJabRefTemplateFile('XPTO')).to.be.eq(null);
    });

  });

  describe('directoryExists method', () => {

    it('should be true when directory exists', async function() {
      expect(await filesystemService.directoryExists(__dirname)).to.be.true;
    });

    it('should be false when directory do not exists', async function() {
      expect(await filesystemService.directoryExists('XPTO')).to.be.false;
    });

    it('should be false when systempath represents a file', async function() {
      expect(await filesystemService.directoryExists(__filename)).to.be.false;
    });

  });

  describe('readDirectoryBibFiles method', () => {
    
    it('should be array with expected length when succeeds', async function() {
      const directoryFiles = [
        { isDirectory: () => false, name: 'first.bib' },
        { isDirectory: () => false, name: 'second.bib' },
        { isDirectory: () => false, name: 'third.txt' },
        { isDirectory: () => true, name: '/fake/dir' }
      ];
      const _readDirectoryReset = filesystemService.__set__('_readDirectory', sinon.fake.returns(directoryFiles));
      sinon.replace(filesystemService, 'readFile', sinon.fake.returns(undefined));
      const result = await filesystemService.readDirectoryBibFiles('/fake/dir', 'second.bib');
      expect(result).to.be.an('array').that.is.not.empty;
      expect(result).to.have.lengthOf(1);
      _readDirectoryReset();
    });
    
    it('should be empty array when there are no files in the directory', async function() {
      const _readDirectoryReset = filesystemService.__set__('_readDirectory', sinon.fake.returns([]));
      expect(await filesystemService.readDirectoryBibFiles(__dirname)).to.be.an('array').that.is.empty;
      _readDirectoryReset();
    });

  });

  describe('saveFile method', () => {

    it('should execute writeFile when succeeds', async function() {
      const fake = sinon.replace(fs.promises, 'writeFile', sinon.fake.returns(undefined));
      await filesystemService.saveFile('fake.bib', 'XPTO');
      expect(fake.called).to.be.true;
    });

  });
  
  describe('_readFile method', () => {

    const _readFile = filesystemService.__get__('_readFile');
    
    it('should be object when succeeds', async function() {
      const fake = sinon.replace(fs.promises, 'readFile', sinon.fake.returns('XPTO'));
      expect(await _readFile(__filename)).to.be.an('object');
      expect(fake.called).to.be.true;
    });
    
    it('should throw exception when systempath represents a directory', function (done) {
      expect(_readFile(__dirname)).to.eventually.be.rejectedWith(Error).and.notify(done);
    });
    
    it('should throw exception when systempath is invalid', function (done) {
      expect(_readFile(undefined)).to.eventually.be.rejectedWith(Error).and.notify(done);
    });

  });

  describe('_readDirectory method', () => {

    const _readDirectory = filesystemService.__get__('_readDirectory');
    
    it('should be array when succeeds', async function() {
      const fake = sinon.replace(fs.promises, 'readdir', sinon.fake.returns([]));
      expect(await _readDirectory(__dirname)).to.be.an('array');
      expect(fake.called).to.be.true;
    });
    
    it('should throw exception when systempath represents a file', function (done) {
      expect(_readDirectory(__filename)).to.eventually.be.rejectedWith(Error).and.notify(done);
    });

    it('should throw exception when systempath is invalid', function (done) {
      expect(_readDirectory(undefined)).to.eventually.be.rejectedWith(Error).and.notify(done);
    });

  });

});
