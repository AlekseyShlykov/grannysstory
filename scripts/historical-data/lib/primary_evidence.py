"""Document-level rules for the six-country expansion. Legacy records keep their published policy."""
from urllib.parse import urlparse

COUNTRIES = {'ES', 'JP', 'BR', 'ZA', 'CD', 'EG'}
PERIODS = [(1900, 1919), (1920, 1939), (1940, 1959), (1960, 1979), (1980, 1999), (2000, 2009), (2010, 2020)]
PRIMARY_TYPES = {'contemporary_newspaper', 'municipal_record', 'provincial_record', 'government_document',
                 'census', 'statistical_yearbook', 'map', 'administrative_report', 'legal_publication',
                 'diary_letter', 'oral_testimony', 'photograph', 'film_newsreel'}
REQUIRED = ('source_id', 'repository', 'url', 'title', 'record_identifier', 'document_date', 'language', 'evidence_type',
            'supports', 'accessed', 'verification_status', 'rights', 'access_conditions')


def applies(record):
    codes = set(record.get('country_codes', [])) | {record.get('country_code')}
    return bool(codes & COUNTRIES)


def evidence_errors(item, sources):
    errors = ['missing document field ' + field for field in REQUIRED if not item.get(field)]
    source = sources.get(item.get('source_id'))
    parsed = urlparse(item.get('url') or '')
    if parsed.scheme not in {'http', 'https'} or not parsed.netloc or parsed.path in {'', '/'}:
        errors.append('a direct document URL is required')
    if not source or source.get('status') != 'accessed':
        errors.append('document repository has not been accessed')
    if item.get('verification_status') != 'verified':
        errors.append('document is not verified')
    if not isinstance(item.get('is_primary'), bool):
        errors.append('is_primary must be an explicit boolean')
    if item.get('is_primary'):
        if item.get('evidence_type') not in PRIMARY_TYPES:
            errors.append('evidence_type is not a primary document type')
        if 'wikipedia.org' in parsed.netloc:
            errors.append('Wikipedia cannot be primary evidence')
        if item.get('reviewed_content') is not True:
            errors.append('primary document content has not been reviewed')
    return errors


def has_primary(record, sources):
    # An image of one street cannot substantiate a wider city-wide claim on its own.
    return any(item.get('is_primary') is True and item.get('claim_coverage', 'direct') == 'direct'
               and not evidence_errors(item, sources)
               for item in record.get('evidence', []))


def share(records, sources):
    # Deduplicate events, never count inherited copies or the number of citations.
    unique = {record['id']: record for record in records if record.get('verification_status') == 'verified'}
    primary = sorted(key for key, record in unique.items() if has_primary(record, sources))
    total = len(unique)
    return {'verified': total, 'primary': len(primary), 'primaryIds': primary,
            'percentage': round(100 * len(primary) / total, 2) if total else None,
            'meets55Percent': bool(total and len(primary) * 100 >= total * 55)}
