"""Manually read documents, 17 November 2026. Idempotent; no downloads at execution."""
import sys
import copy
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from records import source, evidence, event, context, save_batch
from japan_sources import repository_for, polish_records

COUNTRY = 'JP'
events, contexts = [], []

def doc(key, name, url, date, identifier, locator, primary=True, kind='government', rights=None):
    repo = source('JP', key, name, url, 'ja', publisher=repository_for(url), kind=kind, accessed_on='2026-11-17',
        notes='Содержание прочитано: ' + locator + '. Только собственный пересказ фактов, без сканов и цитат.', rights=rights)
    return evidence(repo, name, identifier, date, 'ja', 'municipal_record' if primary else 'historical_study',
        locator, primary=primary, locator=locator)

def add(ev, slug, date, city, ru, en, text, english, category):
    events.append(event('JP', slug, date, city, ru, en, text, english, ev, category=category))

def ctx(ev, slug, city, first, last, kind, ru, en, text, english):
    contexts.append(context('JP', slug, city, first, last, kind, ru, en, text, english, ev))

kyoto = doc('jp_kyoto_culture_law_1950', '京都国際文化観光都市建設法',
    'https://www.shugiin.go.jp/internet/itdb_housei.nsf/html/houritsu/00819501022251.htm',
    '1950-10-22', '法律第251号', 'Статьи1–7 и附則1: культурное развитие, городское планирование, помощь государства; вступление в силу в день опубликования.')
add(kyoto, 'kyoto-1950-cultural-city-law', '1950-10-22', 'jp-kyoto', 'Закон о культурном и туристическом развитии Киото', 'Kyoto cultural and tourism development law',
    'Специальный закон связал развитие Киото с сохранением культурных ресурсов и созданием туристической инфраструктуры. Исполнение городских проектов поручалось мэру; закон не означал, что все жители работали в туризме.',
    'A special law linked Kyoto development with preservation of cultural resources and tourism facilities. The mayor was responsible for municipal projects; residents did not all work in tourism.', 'housing_urban')
ctx(kyoto, 'kyoto-1950-cultural-planning', 'jp-kyoto', 1950, 1959, 'work', 'Культура и городские работы Киото', 'Culture and municipal projects in Kyoto',
    'Закон1950 года предусматривал проекты культурных и туристических объектов и сохранение соответствующих территорий. Это институциональный контекст городской работы, а не статистика занятости или заработка.',
    'The 1950 law provided for cultural and tourism projects and preservation districts. This describes municipal policy, not measured employment or wages.')
subway = doc('jp_kyoto_subway_history', '地下鉄のあゆみと概要', 'https://www.city.kyoto.lg.jp/kotsu/page/0000094752.html',
    '2011-02-18', 'Kyoto Transportation Bureau page94752', '地下鉄のあゆみ: открытие29.05.1981, Kitaoji–Kyoto,6.6km.', primary=False)
add(subway, 'kyoto-1981-subway', '1981-05-29', 'jp-kyoto', 'Открытие линии Карасума', 'Karasuma subway line opens',
    'Муниципальное метро Киото открылось участком Китаодзи–Киото. Оно стало новым звеном городского транспорта после закрытия муниципального трамвая.',
    'Kyoto municipal subway opened between Kitaoji and Kyoto, adding a new transport link after the municipal tram system had closed.', 'infrastructure_transport')
heritage = doc('jp_kyoto_heritage_briefing_2016', '門川市長年頭記者会見（2016年1月4日）',
    'https://www.city.kyoto.lg.jp/sogo/page/0000192381.html', '2016-01-04', 'Kyoto page192381',
    'Раздел о новой программе京都遺産 и вопросы о Nishijin: объявление системы; Nishijin предложен для рассмотрения, не назван уже признанным.')
add(heritage, 'kyoto-2016-heritage-programme', '2016-01-04', 'jp-kyoto', 'Объявление программы городского наследия Киото', 'Kyoto announces a municipal heritage programme',
    'Мэр объявил программу, связывающую культурное наследие с местными ремёслами и повседневной жизнью. Нисидзин предложили для рассмотрения; объявление не подтверждает последующее присвоение статуса.',
    'The mayor announced a programme connecting heritage with local crafts and everyday life. Nishijin was proposed for consideration; the announcement does not establish a later designation.', 'culture_leisure')
ctx(heritage, 'kyoto-2016-nishijin-work', 'jp-kyoto', 2016, 2016, 'work', 'Разделение труда в Нисидзине', 'Division of work in Nishijin',
    'На пресс-конференции описана специализация текстильного производства Нисидзина и обсуждалось, как связать посещения мастерских с покупками. Это свидетельство муниципальной дискуссии2016 года, не доказательство роста продаж.',
    'The briefing described specialized textile production in Nishijin and discussed connecting visits with purchases. It records a 2016 policy discussion, not an increase in sales.')
save_batch('JP', 'japan', polish_records(events), polish_records(contexts))
events, contexts = [], []

osaka41 = doc('jp_osaka_shisei_041', '大阪市政だより第41号',
    'https://www.city.osaka.lg.jp/seisakukikakushitsu/cmsfiles/contents/0000010/10544/041.pdf', '1951-05-15', '市政だより41',
    'Оригинальный скан, нижний правый блок労働会館誕生: новый рабочий центр, комнаты, библиотека и консультации.')
add(osaka41, 'osaka-1951-workers-hall', '1951-05', 'jp-osaka', 'Рабочий центр Осаки', 'Osaka workers’ hall',
    'Городская газета сообщила о новом рабочем центре с помещениями для собраний, библиотекой и консультациями. Это местная инфраструктура труда и досуга, а не автоматическое членство персонажа в профсоюзе.',
    'The municipal paper reported a new workers’ hall with meeting rooms, a library and advice services. This is local work and leisure infrastructure, not automatic union membership.', 'labor')
ctx(osaka41, 'osaka-1951-workers-services', 'jp-osaka', 1951, 1951, 'leisure_culture', 'Библиотека и встречи при рабочем центре', 'Library and meetings at the workers’ hall',
    'Опубликованная таблица перечисляла помещения рабочего центра и условия их использования. Доступность услуги не означает, что конкретная семья ею пользовалась.',
    'The published table listed rooms and conditions of use at the workers’ hall. Availability does not establish a particular family’s attendance.')
osaka94 = doc('jp_osaka_shisei_094', '市政だより第94号',
    'https://www.city.osaka.lg.jp/seisakukikakushitsu/cmsfiles/contents/0000010/10544/094_1.pdf', '1954-07', '市政だより94,p1',
    'Прочитан оригинал: 沈殿水の給水開始 西大阪に工業用水道; подача началась21 июня; не питьевой водопровод.')
add(osaka94, 'osaka-1954-industrial-water', '1954-06-21', 'jp-osaka', 'Промышленный водопровод западной Осаки', 'Industrial water supply in western Osaka',
    'В западной Осаке началась подача промышленной воды. Проект должен был уменьшить откачку грунтовых вод и проседание почвы; сообщение о начале подачи не доказывает полного решения проблемы.',
    'Industrial water supply began in western Osaka to reduce groundwater pumping and subsidence. The start of supply does not establish that subsidence was fully resolved.', 'local_economy')
ctx(osaka94, 'osaka-1954-industry-subsidence', 'jp-osaka', 1954, 1954, 'work', 'Промышленная вода и городская почва', 'Industrial water and subsidence',
    'Муниципальная газета связывала промышленное водоснабжение с борьбой против проседания земли. Производственная инфраструктура имела последствия для городской среды, без привязки героини к определённому заводу.',
    'The paper connected industrial water supply with efforts against subsidence, documenting industry’s urban setting without assigning a factory to the character.')
osaka210 = doc('jp_osaka_shisei_210', '大阪市政だより第210号,1・2面',
    'https://www.city.osaka.lg.jp/seisakukikakushitsu/cmsfiles/contents/0000010/10544/210_1_2.pdf', '1964-11', '市政だより210,pp1–2',
    'Прочитаны обе страницы: p1 месячная кампания против дыма с16 ноября; p2 приглашение на обследование лёгких в Osaka Medical Center.')
add(osaka210, 'osaka-1964-smoke-campaign', '1964-11-16', 'jp-osaka', 'Месяц борьбы с дымовым загрязнением в Осаке', 'Osaka smoke pollution campaign',
    'Город объявил месячную кампанию против дымового загрязнения с рекомендациями для котельных, предприятий и жителей. Меры и предупреждения не означают, что воздух сразу стал чистым.',
    'The city announced a month-long smoke pollution campaign with guidance for boilers, businesses and residents. Announced measures do not establish an immediate improvement in air quality.', 'environment')
add(osaka210, 'osaka-1964-lung-screening', '1964-11', 'jp-osaka', 'Объявление бесплатного обследования лёгких', 'Free lung screening announcement',
    'Городская газета пригласила участников национального медицинского страхования на бесплатное обследование в Osaka Medical Center. Объявление задавало условия участия и не охватывало автоматически всех жителей.',
    'The paper invited National Health Insurance members to free lung screening at Osaka Medical Center. Eligibility was specified; participation by all residents is not implied.', 'healthcare')
ctx(osaka210, 'osaka-1964-air-health', 'jp-osaka', 1964, 1964, 'healthcare', 'Промышленный воздух и здоровье в Осаке', 'Industrial air and health in Osaka',
    'Городская газета обсуждала вред дыма и смоговые предупреждения. Обследования и рекомендации показывают работу служб, а не диагноз героини.',
    'The municipal paper discussed smoke hazards and smog warnings. Screening services and advice do not establish the character’s diagnosis.')
save_batch('JP', 'japan', polish_records(events), polish_records(contexts))
events, contexts = [], []

hiro_rights = 'Hiroshima Municipal Archives: скачать по явной ссылке разрешено для исследования. Для вторичного использования изображений требуется согласование. Сканы не включены в игру; только собственный пересказ фактов и ссылка.'
hiro50 = doc('jp_hiroshima_shisei_1950_1_3', '市政広報ひろしま,第1–3号',
    'https://www.city.hiroshima.lg.jp/_res/projects/default_project/_page_/001/008/366/239645.pdf',
    '1950-08', 'Hiroshima Municipal Archives digital gallery239645',
    'Скан PDF, прочитаныpp1,3,4: первый выпуск1 августа; p1生活相談所開設 с1 июля; p4第2号15 августа химическая пожарная машина.', rights=hiro_rights)
add(hiro50, 'hiroshima-1950-municipal-paper', '1950-08-01', 'jp-hiroshima', 'Первый выпуск городской газеты Хиросимы', 'Hiroshima municipal paper begins',
    'Вышел первый выпуск городского информационного листка: решения, налоги и практические объявления соседствовали с темой мира. Это источник о восстановлении муниципального общения с жителями.',
    'The first municipal information paper combined decisions, taxes and practical notices with the theme of peace, documenting the rebuilding of local public communication.', 'media_communication')
add(hiro50, 'hiroshima-1950-welfare-advice', '1950-07-01', 'jp-hiroshima', 'Консультационная помощь жителям Хиросимы', 'Hiroshima welfare advice service',
    'Первый городской выпуск сообщал о консультационной службе, начавшей работу1 июля, и приглашал обращаться по жизненным трудностям. Сведения не означают обращения героини за помощью.',
    'The first issue reported an advice service operating from July1 and invited residents to seek help with difficulties. The character is not presumed to have used it.', 'social_policy')
add(hiro50, 'hiroshima-1950-chemical-fire-engine', '1950-08', 'jp-hiroshima', 'Химическая пожарная машина в Хиросиме', 'Chemical fire engine in Hiroshima',
    'Второй выпуск городской газеты сообщил о новой химической пожарной машине. Это конкретная деталь восстановления городских служб, без утверждения, что все работы по пожарной безопасности завершились.',
    'The second municipal issue reported a new chemical fire engine, a specific detail of rebuilding city services rather than completion of all fire safety work.', 'technology')
ctx(hiro50, 'hiroshima-1950-rent-rules', 'jp-hiroshima', 1950, 1950, 'housing', 'Жильё и регулирование платы в Хиросиме', 'Housing and rent regulation in Hiroshima',
    'Выпуск15 августа разъяснял пересмотр регулирования земельной и квартирной платы. Он различал жильё и нежилые помещения; из этой статьи нельзя получить среднюю плату или жилищные условия всех семей.',
    'The August15 issue explained revised land and rent controls, distinguishing housing from non-residential premises. It does not establish average rents or every family’s housing conditions.')
ctx(hiro50, 'hiroshima-1950-food-prices', 'jp-hiroshima', 1950, 1950, 'prices_spending', 'Рыночные сведения в городской газете', 'Market information in the municipal paper',
    'В выпуске15 августа опубликована таблица свободных рыночных цен по отдельным продуктам с сравнением с предыдущим месяцем. Это моментное наблюдение городской газеты, не годовой бюджет семьи.',
    'The August15 issue published selected free-market food prices and changes from the preceding month, a newspaper observation rather than an annual household budget.')
hirohist = doc('jp_hiroshima_municipal_history', '広島の歴史', 'https://www.city.hiroshima.lg.jp/shisei/gaiyo/1021754/1003436.html',
    '2026-09-30', 'Hiroshima page1003436', 'Раздел明治・大正:1902 высшая нормальная школа,1912ноябрь три трамвайные линии.', primary=False)
add(hirohist, 'hiroshima-1902-teacher-college', '1902', 'jp-hiroshima', 'Высшая нормальная школа Хиросимы', 'Hiroshima higher normal school',
    'В Хиросиме открылась высшая нормальная школа, часть развития города как образовательного центра. Это не означает доступность данного учреждения для любой женщины того поколения.',
    'A higher normal school opened in Hiroshima as the city developed into an education centre. This does not establish access for every woman of that generation.', 'education')
add(hirohist, 'hiroshima-1912-tram', '1912-11', 'jp-hiroshima', 'Начало трамвайного движения в Хиросиме', 'Hiroshima tram services begin',
    'Открылись три городские трамвайные линии, включая направление от вокзала через Камия-тё к мосту Айой. Трамвай постепенно сменял конные омнибусы как основной городской транспорт.',
    'Three city tram routes opened, including the station–Kamiyacho–Aioi Bridge route, gradually replacing horse buses as a principal form of city transport.', 'infrastructure_transport')
astram = doc('jp_hiroshima_astram_history', '広島高速交通のあらまし', 'https://www.jametro.or.jp/subway/japan/hiroshima/',
    '2026', 'Japan Subway Association/Hiroshima outline', 'НачалоAstram:20.08.1994,Hondori–Koiki-koen-mae18.4km; жилищное развитие северо-запада.', primary=False, kind='transport_association')
add(astram, 'hiroshima-1994-astram', '1994-08-20', 'jp-hiroshima', 'Открытие Астрам-лайн', 'Astram Line opens',
    'Линия Хондори–Коикэ-коэн-маэ связала город с северо-западными жилыми районами. Она обслуживала также Азиатские игры1994 года, но её роль не ограничивалась спортивным событием.',
    'The Hondori–Koiki-koen-mae line connected the city with northwestern residential areas. It also carried passengers for the1994 Asian Games but served wider transport needs.', 'infrastructure_transport')
save_batch('JP', 'japan', polish_records(events), polish_records(contexts))
events, contexts = [], []

tok10 = doc('jp_tokyo_photo_2010_10', '東京フォトニュース2010年10月', 'https://www.koho.metro.tokyo.lg.jp/photo/news/2010/10.html',
    '2010-10', 'Tokyo Photo News20101004', 'Текст и датированная подпись20.10: строительство туннеляOhi, будущаяShinagawaLine, не уже открытая дорога.')
add(tok10, 'tokyo-2010-shinagawa-tunnel-work', '2010-10-20', 'jp-tokyo', 'Строительство туннеля линии Синагава', 'Shinagawa Line tunnel construction',
    'Муниципальная хроника показала строительство туннеля в Ои для линии Синагава. Полное открытие кольца тогда ещё было будущим проектом, а не завершённым событием.',
    'The municipal chronicle documented tunnel construction in Ohi for the Shinagawa Line. Completion of the ring was still a future project.', 'housing_urban')
tok11 = doc('jp_tokyo_photo_2011_03', '東京フォトニュース2011年3月', 'https://www.koho.metro.tokyo.lg.jp/photo/news/2011/03.html',
    '2011-03', 'Tokyo Photo News20110301–04', 'Датированные репортажи: нарушение транспорта11марта; затем18–23марта сбор помощи в здании правительства.')
add(tok11, 'tokyo-2011-commuter-disruption', '2011-03-11', 'jp-tokyo', 'Нарушение транспорта в Токио после землетрясения', 'Tokyo transport disruption after the earthquake',
    'После землетрясения на северо-востоке страны сбои столичного транспорта оставили многих людей без обычного пути домой. Это местное последствие, не утверждение о цунами в каждом токийском квартале.',
    'After the northeastern earthquake, metropolitan transport disruption left many people without their usual route home. This is a local consequence, not a tsunami in every Tokyo neighbourhood.', 'infrastructure_transport')
events[-1]['sensitive'] = True
ctx(tok11, 'tokyo-2011-mutual-aid', 'jp-tokyo', 2011, 2011, 'social_policy', 'Сбор помощи в Токио', 'Collecting relief supplies in Tokyo',
    'В марте правительство Токио принимало и сортировало пожертвованные вещи для пострадавших территорий. Существование сбора не превращает героиню в участницу волонтёрской работы.',
    'In March the Tokyo government received and sorted donated supplies for affected areas. The character is not automatically assigned volunteer work.')
tok12 = doc('jp_tokyo_photo_2012_05', '東京フォトニュース2012年5月', 'https://www.koho.metro.tokyo.lg.jp/photo/news/2012/05.html',
    '2012-05', 'Tokyo Photo News20120501–02', '6мая праздникнаSumida;21мая подпись указывает открытиеSkytreeнаследующийдень22мая.')
add(tok12, 'tokyo-2012-river-light-festival', '2012-05-06', 'jp-tokyo', 'Праздник огней на Сумида', 'Light festival on the Sumida',
    'На участке набережной Сумида провели Tokyo Hotaru с плавающими светодиодными огнями. Это местный городской праздник и изменение досуга у реки, не обычай всех японских семей.',
    'Tokyo Hotaru placed floating LED lights along a section of the Sumida waterfront, documenting a local leisure event rather than a custom of all Japanese families.', 'culture_leisure')
add(tok12, 'tokyo-2012-skytree', '2012-05-22', 'jp-tokyo', 'Открытие Tokyo Skytree', 'Tokyo Skytree opens',
    'Открылась башня Tokyo Skytree. Фотохроника непосредственно перед открытием фиксировала новый городской ориентир рядом с рекой Сумида.',
    'Tokyo Skytree opened. The municipal chronicle immediately preceding the opening documented the new landmark beside the Sumida.', 'technology')
# The21May report says "opens tomorrow". It does not establish that the opening actually occurred.
# Retain the research lead, exclude it from verified counts and browser exports.
events[-1]['verification_status'] = 'needs_review'
events[-1]['confidence'] = 'medium'
events[-1]['evidence'] = copy.deepcopy(events[-1]['evidence'])
events[-1]['evidence'][0]['claim_coverage'] = 'partial'
events[-1]['research_note'] = 'Предварительное объявление21мая не подтверждает фактическое открытие22мая. Требуется отдельный документ об исполнении; в игру не экспортировать.'
ctx(tok12, 'tokyo-2012-waterfront-leisure', 'jp-tokyo', 2012, 2012, 'leisure_culture', 'Досуг на Сумида', 'Leisure along the Sumida',
    'Муниципальный репортаж показывает использование набережной для светового праздника. Отдельное событие не доказывает регулярность посещений конкретной семьёй.',
    'A municipal report shows the waterfront used for a light festival, without establishing regular attendance by a particular family.')
save_batch('JP', 'japan', polish_records(events), polish_records(contexts))
