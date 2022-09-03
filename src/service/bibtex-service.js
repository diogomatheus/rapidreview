/**
 * Rapid Review Service BibTex Module.
 * @module rapidreview/service/bibtex-service.js
 */
const bibtexParser = require('@orcid/bibtex-parse-js');

/**
 * @description Convert BibTex to array of objects (i.e., documents).
 * @public
 * @async
 *
 * @param {string} contents - BibTex contents.
 * @return {Promise<array>} Array of objects (i.e., documents).
 */
module.exports.bibtex2object = async (contents) => {
  try {
    return bibtexParser.toJSON(contents).filter((item) => item.entryType !== 'COMMENT');
  } catch (error) {
    throw new Error('Unable to parse the BibTex to Object.');
  }
};

/**
 * @description Convert array of objects (i.e., documents) to BibTex.
 * @public
 * @async
 *
 * @param {array} documents - Array of objects (i.e., documents).
 * @return {Promise<string>} BibTex contents.
 */
module.exports.object2bibtex = async (documents) => {
  try {
    return bibtexParser.toBibtex(documents);
  } catch (error) {
    throw new Error('Unable to parse the Object to BibTex.');
  }
};

/**
 * @description Prepare documents analysis fields.
 * @public
 * @async
 *
 * @param {array} documents - Array of objects (i.e., documents).
 * @return {Promise<array>} Array of objects (i.e., documents).
 */
module.exports.prepareAnalysisFields = async (documents) => {
  if (!Array.isArray(documents) || !documents.length) {
    return [];
  }

  return documents.map((document) => _prepareAnalysisFields(document));
};

/**
 * @description Remove documents analysis fields.
 * @public
 * @async
 *
 * @param {array} documents - Array of objects (i.e., documents).
 * @return {Promise<array>} Array of objects (i.e., documents).
 */
module.exports.removeAnalysisFields = async (documents) => {
  if (!Array.isArray(documents) || !documents.length) {
    return [];
  }

  return documents.map((document) => {
    if (!_isInvalid(document)) {
      delete document.entryTags.title_criteria;
      delete document.entryTags.abstract_criteria;
      delete document.entryTags.reading_criteria;
    }
    return document;
  });
};

/**
 * @description Mark incosistent objects (i.e., documents).
 * @public
 * @async
 *
 * @param {array} documents - Array of objects (i.e., documents).
 * @return {Promise<array>} Array of objects (i.e., documents).
 */
module.exports.sanitizeInconsistent = async (documents) => {
  if (!Array.isArray(documents) || !documents.length) {
    return [];
  }

  return documents.map((document) => {
    document = _prepareAnalysisFields(document);

    if (_isInconsistent(document)) {
      document.entryTags.title_criteria = 'INCONSISTENT';
      document.entryTags.abstract_criteria = 'N/A';
      document.entryTags.reading_criteria = 'N/A';
      document.entryTags.comment = 'Consider checking before proceeding.';
    }

    return document;
  });
};

/**
 * @description Mark duplicate objects (i.e., documents).
 * @public
 * @async
 *
 * @param {string} filename - Input bib file name.
 * @param {array} documents - Array of objects (i.e., documents).
 * @param {array} existingBibs - Array of objects (i.e., bib file information).
 * @return {Promise<array>} Array of objects (i.e., documents).
 */
module.exports.sanitizeDuplicate = async (filename, documents, existingBibs) => {
  if (!Array.isArray(documents) || !documents.length) {
    return [];
  }

  const existingDocuments = _extractDocuments(existingBibs);
  return documents.map((document) => {
    document = _prepareAnalysisFields(document);
    if (document.entryTags.title_criteria === 'TO DO' && existingDocuments.length) {
      const replica = existingDocuments.find((item) => _isEqual(item.document, document));
      if (replica) {
        document.entryTags.title_criteria = 'DUPLICATED';
        document.entryTags.abstract_criteria = 'N/A';
        document.entryTags.reading_criteria = 'N/A';
        document.entryTags.comment = `Entry already exists in ${replica.filename}.`;
      }
    }
    existingDocuments.push({ filename, document });
    return document;
  });
};

/**
 * @description Filter the array of objects (i.e., documents) by field value.
 * @public
 * @async
 *
 * @param {array} documents - Array of objects (i.e., documents).
 * @param {string} field - Field name.
 * @param {any} value - Expected field value.
 * @return {Promise<array>} Array of objects (i.e., documents).
 */
module.exports.filterByFieldValue = async (documents, field, value) => {
  if (!Array.isArray(documents) || !documents.length || typeof field !== 'string') {
    return [];
  }

  return documents.filter((document) => {
    if (typeof document.entryTags !== 'object' || !Object.prototype.hasOwnProperty.call(document.entryTags, field)) {
      return false;
    }

    return document.entryTags[field] === value;
  });
};

/**
 * @description Build snowballing Scopus URL.
 * @public
 * @async
 *
 * @param {string} strategy - Snowballing strategy.
 * @param {array} documents - Array of objects (i.e., documents).
 * @return {Promise<string>} Scopus URL.
 */
module.exports.buildSnowballingScopusURL = async (strategy, documents) => {
  switch (strategy) {
    case 'backward':
      return _buildBackwardSnowballingScopusURL(documents);
    case 'forward':
      return _buildForwardSnowballingScopusURL(documents);
    default:
      return null;
  }
};

/**
 * @description Prepare documents analysis fields.
 * @private
 * @sync
 *
 * @param {object} document - Object (i.e., document).
 * @return {object} Object (i.e., document).
 */
function _prepareAnalysisFields(document) {
  if (document === null || typeof document !== 'object') {
    document = {};
  }
  if (!Object.prototype.hasOwnProperty.call(document, 'entryTags')) {
    document.entryTags = {};
  }
  if (!Object.prototype.hasOwnProperty.call(document.entryTags, 'title_criteria')) {
    document.entryTags.title_criteria = 'TO DO';
  }
  if (!Object.prototype.hasOwnProperty.call(document.entryTags, 'abstract_criteria')) {
    document.entryTags.abstract_criteria = 'TO DO';
  }
  if (!Object.prototype.hasOwnProperty.call(document.entryTags, 'reading_criteria')) {
    document.entryTags.reading_criteria = 'TO DO';
  }
  return document;
}

/**
 * @description Analyze if document is inconsistent.
 * @private
 * @sync
 *
 * @param {object} document - Object (i.e., document).
 * @return {boolean} Inconsistent flag.
 */
function _isInconsistent(document) {
  return (
    document.entryTags.title_criteria === 'TO DO' &&
    (typeof document.entryTags.year !== 'string' ||
      document.entryTags.year.trim().length === 0 ||
      typeof document.entryTags.title !== 'string' ||
      document.entryTags.title.trim().length === 0 ||
      typeof document.entryTags.author !== 'string' ||
      document.entryTags.author.trim().length === 0)
  );
}

/**
 * @description Extract objects (i.e., documents) from bib files.
 * @private
 * @sync
 *
 * @param {array} bibs - Array of objects (i.e., bib file information).
 * @return {array} Array of objects (i.e., documents).
 */
function _extractDocuments(bibs) {
  let documents = [];
  if (Array.isArray(bibs) && bibs.length) {
    const _documents = (bib) => bib.documents.map((document) => ({ filename: bib.name, document }));
    documents = bibs.reduce((array, bib) => array.concat(_documents(bib)), []);
  }
  return documents;
}

/**
 * @description Compare objects (i.e., documents).
 * @private
 * @sync
 *
 * @param {type} object - Object (i.e., document).
 * @param {type} other - Other (i.e., document).
 * @return {boolean} Equality indicator.
 */
function _isEqual(object, other) {
  return _isDOIEqual(object, other) || _isCriteriaEqual(object, other);
}

/**
 * @description Analyzes if the objects' (i.e., documents) DOI are equals.
 * @private
 * @sync
 *
 * @param {type} object - Object (i.e., document).
 * @param {type} other - Other (i.e., document).
 * @return {boolean} Equality flag.
 */
function _isDOIEqual(object, other) {
  return (
    !_isInvalid(object) &&
    !_isInvalid(other) &&
    typeof object.entryTags.doi === 'string' &&
    typeof other.entryTags.doi === 'string' &&
    object.entryTags.doi.trim().toUpperCase() === other.entryTags.doi.trim().toUpperCase()
  );
}

/**
 * @description Analyzes if equality criteria are met.
 * @private
 * @sync
 *
 * @param {type} object - Object (i.e., document).
 * @param {type} other - Other (i.e., document).
 * @return {boolean} Equality flag.
 */
function _isCriteriaEqual(object, other) {
  const _slugifyTitle = (title) => {
    const titleFormatted = title.trim().toUpperCase();
    return titleFormatted.replace(/[-:]/g, '').replace(/\s{2,}/g, ' ');
  };
  return (
    !_isInvalid(object) &&
    !_isInvalid(other) &&
    typeof object.entryTags.year === 'string' &&
    typeof other.entryTags.year === 'string' &&
    object.entryTags.year.trim().toUpperCase() === other.entryTags.year.trim().toUpperCase() &&
    typeof object.entryTags.title === 'string' &&
    typeof other.entryTags.title === 'string' &&
    _slugifyTitle(object.entryTags.title) === _slugifyTitle(other.entryTags.title)
  );
}

/**
 * @description Analyze if object (i.e., document) basic structure is invalid.
 * @private
 * @sync
 *
 * @param {object} document - Object (i.e., document).
 * @return {boolean} Invalid flag.
 */
function _isInvalid(document) {
  return (
    document === null ||
    typeof document !== 'object' ||
    document.entryTags === null ||
    typeof document.entryTags !== 'object'
  );
}

/**
 * @description Build snowballing backward Scopus URL.
 * @private
 * @sync
 *
 * @param {array} documents - Array of objects (i.e., documents).
 * @return {string} Scopus URL.
 */
function _buildBackwardSnowballingScopusURL(documents) {
  if (!Array.isArray(documents) || !documents.length) {
    return null;
  }

  const eids = _extractScopusEids(documents);
  const query = eids.map((eid) => `${eid.split('-')[2]}`).join('+OR+');
  let scopusURL = 'https://www.scopus.com/results/references.uri'
    .concat('?sort=cp-f&src=r&imp=t&sot=citedreferences&sdt=citedreferences&sl=42')
    .concat(`&s=CITEID%28${query}%29`)
    .concat(`&citeCnt=${eids.length}`);

  if (eids.length === 1) {
    scopusURL = scopusURL.concat(`&citingId=${eids[0]}`);
  }

  return scopusURL;
}

/**
 * @description Build snowballing forward Scopus URL.
 * @private
 * @sync
 *
 * @param {array} documents - Array of objects (i.e., documents).
 * @return {string} Scopus URL.
 */
function _buildForwardSnowballingScopusURL(documents) {
  if (!Array.isArray(documents) || !documents.length) {
    return null;
  }

  const eids = _extractScopusEids(documents);
  const query = eids.join('+OR+');
  return 'https://www.scopus.com/results/results.uri'
    .concat('?sort=plfo-f&src=s&imp=t&sot=mulcite&sdt=mulcite&sl=48')
    .concat(`&s=REFEID%28${query}%29&origin=resultslist`)
    .concat(`&citeCnt=${eids.length}`)
    .concat(`&mciteCt=${eids.length}`);
}

/**
 * @description Extract Scopus eids.
 * @private
 * @sync
 *
 * @param {array} documents - Array of objects (i.e., documents).
 * @return {array} Array of string.
 */
function _extractScopusEids(documents) {
  if (!Array.isArray(documents) || !documents.length) {
    return [];
  }

  const eids = [];
  documents.forEach((document) => {
    if (!_isInvalid(document) && typeof document.entryTags.url === 'string') {
      const parameters = new URLSearchParams(document.entryTags.url.split('?')[1]);
      if (parameters.has('eid')) {
        eids.push(parameters.get('eid'));
      }
    }
  });
  return eids;
}
