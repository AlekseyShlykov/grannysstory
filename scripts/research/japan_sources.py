"""Institutional repositories of the manually read Japanese document batch."""
from urllib.parse import urlparse
import re

def polish_records(rows):
    """Space prose around numerals; preserve identifiers, URLs, dates and evidence verbatim."""
    for row in rows:
        for key in ['title', 'title_en', 'historical_summary', 'historical_summary_en', 'description', 'description_en']:
            if key in row:
                row[key] = re.sub(r'(?<=[А-Яа-яЁёA-Za-z])(?=\d)|(?<=\d)(?=[А-Яа-яЁёA-Za-z])', ' ', row[key])
    return rows

def repository_for(url):
    host=urlparse(url).netloc
    for domain, name in [
        ('jahis.law.nagoya-u.ac.jp','Nagoya University Graduate School of Law, Japanese Historical Legal Documents Database'),
        ('shugiin.go.jp','House of Representatives of Japan, enacted laws collection'),
        ('ndl.go.jp','National Diet Library'),
        ('city.osaka.lg.jp','Osaka Municipal Government, Shisei Dayori archive'),
        ('city.kyoto.lg.jp','Kyoto Municipal Government'),
        ('city.hiroshima.lg.jp','Hiroshima Municipal Government / Municipal Archives'),
        ('jametro.or.jp','Japan Subway Association'),
        ('koho.metro.tokyo.lg.jp','Tokyo Metropolitan Government, Tokyo Album'),
        ('mhlw.go.jp','Ministry of Health, Labour and Welfare, Japan'),
        ('mext.go.jp','Ministry of Education, Culture, Sports, Science and Technology, Japan'),
        ('mofa.go.jp','Ministry of Foreign Affairs of Japan'),
        ('boj.or.jp','Bank of Japan, historical policy releases'),
        ('jma.go.jp','Japan Meteorological Agency'),
        ('nta.go.jp','National Tax Agency, Japan'),
        ('titech.ac.jp','Tokyo Institute of Technology, International Student Exchange Division'),
        ('stat.go.jp','Statistics Bureau of Japan'),
        ('wikipedia.org','Wikipedia, Wikimedia Foundation'),
    ]:
        if host==domain or host.endswith('.'+domain): return name
    raise ValueError('Review repository owner: '+url)
