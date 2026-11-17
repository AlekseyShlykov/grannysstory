"""National milestones; reviewed Wikipedia is secondary under owner decision D-044."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from records import source, evidence, event, context, save_batch


SECONDARY = [
    ('es_wiki_primo_coup', 'Golpe de Estado de Primo de Rivera',
     'https://es.wikipedia.org/wiki/Golpe_de_Estado_en_Espa%C3%B1a_de_1923', 'es',
     'Introduction and El golpe; 13–15 September distinguished from appointment on15 September.',
     '1923-primo-coup', '1923-09-13', 'political_change',
     'Переворот Примо де Риверы', 'Primo de Rivera’s coup',
     'Начался военный переворот Примо де Риверы. При поддержке короля установилась военная диктатура.',
     'Primo de Rivera launched a military coup. With the king’s support, a military dictatorship was established.'),
    ('es_wiki_un_membership', 'Spain: Civil War and Francoist dictatorship',
     'https://en.wikipedia.org/wiki/Spain', 'en',
     'Civil War and Francoist dictatorship: UN exclusion ended1955. Exact admission day not extracted.',
     '1955-un-membership', '1955', 'political_change',
     'Испания принята в ООН', 'Spain joins the United Nations',
     'Испания вошла в Организацию Объединённых Наций после послевоенной международной изоляции.',
     'Spain joined the United Nations following its post-war international isolation.'),
    ('es_wiki_european_accession', 'Adhesión de España a las Comunidades Europeas',
     'https://es.wikipedia.org/wiki/Adhesi%C3%B3n_de_Espa%C3%B1a_a_las_Comunidades_Europeas', 'es',
     'Introduction: treaty signed12.06.1985, accession effective01.01.1986; not yet called the EU.',
     '1986-european-communities', '1986-01-01', 'political_change',
     'Вступление в Европейские сообщества', 'Accession to the European Communities',
     'Испания вступила в Европейские сообщества одновременно с Португалией.',
     'Spain joined the European Communities alongside Portugal.'),
    ('es_wiki_euro_history', 'Euro: introduction and historical currencies',
     'https://en.wikipedia.org/wiki/Euro', 'en',
     'Introduction, launch and historical-currency table: peseta fixed at166.386 per euro. '
     '1999 accounting currency differs from2002 cash. No current member count or2026 facts extracted.',
     '1999-euro-accounting', '1999-01-01', 'consumer_life',
     'Евро введён в безналичные расчёты', 'Euro introduced for non-cash transactions',
     'Испания участвовала во введении евро для безналичных расчётов. Монеты и банкноты песеты ещё оставались в обращении.',
     'Spain took part in the introduction of the euro for non-cash transactions, while peseta coins and notes remained in circulation.'),
    ('es_wiki_euro_history', 'Euro: introduction and historical currencies',
     'https://en.wikipedia.org/wiki/Euro', 'en',
     'Introduction, launch and historical-currency table: peseta fixed at166.386 per euro. '
     '1999 accounting currency differs from2002 cash. No current member count or2026 facts extracted.',
     '2002-euro-cash', '2002-01-01', 'consumer_life',
     'В обращение вошли банкноты и монеты евро', 'Euro notes and coins enter circulation',
     'В Испании появились банкноты и монеты евро, начав заменять наличные песеты.',
     'Euro banknotes and coins entered circulation in Spain, beginning to replace peseta cash.'),
    ('es_wiki_financial_crisis_2008', '2008–2014 Spanish financial crisis',
     'https://en.wikipedia.org/wiki/2008%E2%80%932014_Spanish_financial_crisis', 'en',
     'Introduction: crisis began2008, housing bubble, recession and unemployment. '
     'No fabricated exact start day, local job-loss rate or automatic family bankruptcy.',
     '2008-financial-crisis', '2008', 'economic_crisis',
     'Начало экономического кризиса', 'Economic crisis begins',
     'На фоне мирового финансового кризиса и спада на рынке жилья Испания вошла в тяжёлый экономический кризис с ростом безработицы.',
     'Against the global financial crisis and a housing-market downturn, Spain entered a severe economic crisis with rising unemployment.'),
    ('es_wiki_15m', 'Movimiento15-M', 'https://es.wikipedia.org/wiki/Movimiento_15-M', 'es',
     'Introduction: demonstrations15.05.2011, camps in different Spanish cities and demands for participation. '
     'No attribution of party support or participation to every resident.',
     '2011-indignados', '2011-05-15', 'political_change',
     'Начало движения возмущённых, 15-М', 'The15-M indignados movement begins',
     'В разных городах Испании прошли выступления, из которых выросло движение 15-М. Участники требовали более открытой демократии и обсуждали безработицу и последствия кризиса.',
     'Demonstrations across Spanish cities gave rise to the15-M movement, calling for more open democracy and debating unemployment and the crisis.'),
]

# ID, original document metadata, event date, category, context type, RU/EN copy.
LAWS = [
    ('es_divorce_law_1981', 'Ley30/1981, de7 de julio, matrimonio y divorcio',
     'BOE-A-1981-16216', '1981-07-07', 'Civil Code arts.85–86, BOE172,20.07.1981',
     '1981-divorce-restored', '1981-07-20', 'family_law', 'family_marriage',
     'Возвращение законной возможности развода', 'Legal divorce restored',
     'Опубликованный закон вновь разрешил расторжение брака через развод. Для обращения в суд действовали установленные основания и сроки раздельной жизни.',
     'The published law restored legal divorce, subject to specified grounds and periods of separation.'),
    ('es_logse_original_1990', 'Ley Orgánica1/1990, de3 de octubre, LOGSE',
     'BOE-A-1990-24172', '1990-10-03', 'Art.5 and additional provision1, BOE238,04.10.1990',
     '1990-basic-education-reform', '1990-10-04', 'education', 'education',
     'Реформа обязательного школьного обучения', 'Compulsory-schooling reform',
     'Опубликована реформа, предусматривавшая обязательное бесплатное базовое обучение с шести до шестнадцати лет. Новая система вводилась постепенно по отдельному календарю.',
     'The published reform provided for compulsory free basic education from six to sixteen, to be introduced gradually under a separate timetable.'),
    ('es_equal_marriage_law_2005', 'Ley13/2005, de1 de julio, derecho a contraer matrimonio',
     'BOE-A-2005-11364', '2005-07-01', 'Art.único.1, Civil Code44; final provision2; BOE157,02.07.2005',
     '2005-equal-marriage', '2005-07-03', 'family_law', 'family_marriage',
     'Равное право на брак для однополых пар', 'Equal marriage rights for same-sex couples',
     'Вступила в силу реформа, установившая одинаковые условия и последствия брака для пар одного или разного пола.',
     'A reform granting the same marriage requirements and legal effects to same-sex and different-sex couples took effect.'),
    ('es_austerity_decree_2010', 'Real Decreto-ley8/2010, de20 de mayo, reducción del déficit público',
     'BOE-A-2010-8228', '2010-05-20', 'Art.1, amended budget art.22.Dos.B; BOE126,24.05.2010',
     '2010-public-pay-cuts', '2010-06-01', 'economic_crisis', 'wages_income',
     'Сокращение оплаты труда в государственном секторе', 'Public-sector pay reductions',
     'В рамках мер экономии вступило в силу сокращение общего фонда оплаты труда государственного сектора. Уменьшение на пять процентов в годовом выражении не означало одинакового вычета для каждого работника.',
     'Austerity measures reduced the public-sector pay bill by five percent in annual terms, with differing effects on individual employees.'),
    ('es_minimum_income_decree_2020', 'Real Decreto-ley20/2020, de29 de mayo, ingreso mínimo vital',
     'BOE-A-2020-5493', '2020-05-29', 'Arts.1–3 and final provision11; BOE154,01.06.2020',
     '2020-minimum-living-income', '2020-06-01', 'social_policy', 'social_policy',
     'Введена помощь в виде минимального жизненного дохода', 'Minimum living-income benefit introduced',
     'Введена общенациональная помощь людям и домохозяйствам с недостаточными средствами при соблюдении установленных условий. Это адресная выплата, а не одинаковый доход для всех.',
     'A nationwide means-tested benefit was introduced for eligible people and households lacking sufficient resources.'),
    ('es_remote_work_decree_2020', 'Real Decreto-ley28/2020, de22 de septiembre, trabajo a distancia',
     'BOE-A-2020-11043', '2020-09-22', 'Art.5, transitional provision3, final provision14; BOE253,23.09.2020',
     '2020-remote-work-agreements', '2020-10-13', 'labor', 'communication',
     'Новые правила регулярной удалённой работы', 'New rules for regular remote work',
     'Вступили в силу правила регулярной удалённой работы, предусматривавшие добровольное письменное соглашение работника и работодателя. Для экстренной работы из дома из-за пандемии сохранялся особый переходный режим.',
     'Rules for regular remote work took effect, requiring a voluntary written agreement; emergency pandemic homeworking retained separate transitional arrangements.'),
    ('es_first_alarm_decree_2020', 'Real Decreto463/2020, de14 de marzo, estado de alarma por COVID-19',
     'BOE-A-2020-3692', '2020-03-14', 'Arts.1–3,7,9–10; BOE67,14.03.2020',
     '2020-pandemic-alarm', '2020-03-14', 'public_health', 'healthcare',
     'Пандемия и ограничения передвижения', 'Pandemic and movement restrictions',
     'Из-за COVID-19 объявили общенациональное чрезвычайное положение с ограничениями передвижения и приостановкой очного обучения. Предусматривались исключения, в том числе для покупки необходимого и медицинской помощи.',
     'A nationwide state of alarm imposed movement restrictions and suspended in-person schooling because of COVID-19, with exceptions including essential shopping and healthcare.'),
]


def main():
    events, contexts = [], []
    for sid, title, url, language, note, slug, date, category, ru, en, text_ru, text_en in SECONDARY:
        repo = source('ES', sid, title, url, language, kind='encyclopedia', publisher='Wikipedia contributors',
                      notes='Прочитаны указанные разделы, не только поисковая выдача. Вторичный источник. '+note,
                      accessed_on='2026-11-17', rights='Wikipedia text: CC BY-SA; only independently worded facts exported, no article text or media.')
        ev = evidence(repo, title, title+'; section specified in registry',
                      'revision date not established; article accessed2026-11-17', language,
                      'encyclopedia', text_ru, primary=False, locator=note)
        row = event('ES', slug, date, 'es', ru, en, text_ru, text_en, ev, category=category, scope='national')
        row['confidence'] = 'medium'
        events.append(row)
        if slug in {'2002-euro-cash', '2008-financial-crisis'}:
            year = int(date[:4])
            contexts.append(context('ES', slug, 'es', year, year, 'prices_spending', ru, en, text_ru, text_en, ev))
    for sid, title, ref, doc_date, locator, slug, date, category, kind, ru, en, text_ru, text_en in LAWS:
        repo = source('ES', sid, title, 'https://www.boe.es/diario_boe/txt.php?id='+ref, 'es',
                      publisher='Agencia Estatal Boletín Oficial del Estado', accessed_on='2026-11-17',
                      notes='Прочитан TEXTO ORIGINAL, не поздняя сводная редакция. '+locator+'. '
                      'Дата публикации и начало действия различены. Правовая норма не доказывает получение выплаты, '
                      'развод, потерю работы, болезнь или участие героини. Только перечисленные положения, без позднейших поправок.')
        ev = evidence(repo, title, ref, doc_date, 'es', 'legal_publication', text_ru, locator=locator)
        events.append(event('ES', slug, date, 'es', ru, en, text_ru, text_en, ev,
                            category=category, scope='national', sensitive=slug == '2020-pandemic-alarm'))
        year = int(date[:4])
        contexts.append(context('ES', slug, 'es', year, year, kind, ru, en, text_ru, text_en, ev))
    repo = source('ES', 'es_pension_original_1974', 'Ley General de la Seguridad Social, texto1974, artículo154',
                  'https://www.boe.es/boe/dias/1974/07/22/pdfs/A15170-15185.pdf', 'es',
                  publisher='Agencia Estatal Boletín Oficial del Estado', accessed_on='2026-11-17',
                  notes='Прочитан исходный текст статьи154:65 лет для наёмных работников и страховой стаж; '
                  'число дней взносов в исходном тексте отличается от поздней редакции1989. '
                  'В игре пенсионный возраст — упрощение для оплачиваемой карьеры, не утверждение о всех женщинах или неоплачиваемом домашнем труде.')
    ev = evidence(repo, 'Decreto2065/1974, texto refundido de la Ley General de la Seguridad Social',
                  'BOE174,22.07.1974,p.15174,art.154', '1974-05-30', 'es', 'legal_publication',
                  'Возраст65 лет и требования страхового стажа для обычной пенсии наёмных работников.', locator='art.154.1–2')
    contexts.append(context('ES', '1974-retirement-conditions', 'es', 1974, 1974, 'retirement',
                            'Условия обычной пенсии по старости', 'Conditions for an ordinary retirement pension',
                            'Для обычной пенсии наёмным работникам требовались достижение шестидесяти пяти лет и необходимый страховой стаж. Для отдельных тяжёлых профессий допускалось снижение возраста.',
                            'An ordinary employee retirement pension required reaching sixty-five and sufficient insurance contributions, with lower ages permitted for specified arduous occupations.', ev))
    save_batch('ES', 'spain', events, contexts)
    print('Spain national milestones: %d events, %d contexts.' % (len(events), len(contexts)))


if __name__ == '__main__':
    main()
