"""Essential Asturian labour history and Málaga travel; never relabel regional facts as city records."""
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from records import source, evidence, event, context, save_batch
from checkpoint import ROOT


def main():
    specs = [
        ('es_wiki_asturias_1934', 'Revolución de Asturias de1934',
         'https://es.wikipedia.org/wiki/Revoluci%C3%B3n_de_Asturias_de_1934', 'encyclopedia', 'Wikipedia contributors',
         'Прочитаны введение и раздел последствий. Месяц октябрь подтверждён; противоречивые точные границы и числа жертв не извлекаются.',
         'asturias-1934-uprising', '1934-10', 'es-province-oviedo', 'regional', 'labor', True,
         'Рабочее восстание в Астурии', 'Workers’ uprising in Asturias',
         'В Астурии произошло вооружённое рабочее восстание, связанное с общенациональной стачкой. Власти подавили выступление; боевые действия и репрессии тяжело затронули край.',
         'An armed workers’ uprising linked to the nationwide strike took place in Asturias. Government suppression, fighting and repression severely affected the region.'),
        ('es_wiki_asturias_1962', 'Huelga minera de Asturias de1962',
         'https://es.wikipedia.org/wiki/Huelga_minera_de_Asturias_de_1962', 'encyclopedia', 'Wikipedia contributors',
         'Прочитаны введение и Desarrollo:06.04.1962, солидарность с уволенными шахтёрами pozoNicolasa вМьересе. Это не шахта внутри города Овьедо. Численность не извлечена.',
         'asturias-1962-miners-strike', '1962-04-06', 'es-province-oviedo', 'regional', 'labor', False,
         'Шахтёрская забастовка в Астурии', 'Miners’ strike in Asturias',
         'После увольнений на шахте Николаса в Мьересе началась стачка солидарности, распространившаяся по горнопромышленным районам Астурии.',
         'Dismissals at the Nicolasa pit in Mieres prompted a solidarity strike that spread across Asturias’s mining districts.'),
        ('es_aena_malaga_terminal_history', 'Historia del aeropuerto de Málaga: terminal1968',
         'https://www.aena.es/es/malaga-costa-del-sol/conocenos/historia.html', 'government', 'Aena',
         'Прочитаны исторические абзацы и хронология1968. Терминал открыт29.01.1968 для внутренних и международных рейсов. Современная ретроспектива, не первичный акт открытия. Региональный транспортный узел.',
         'malaga-area-1968-airport-terminal', '1968-01-29', 'es-province-malaga', 'regional', 'infrastructure_transport', False,
         'Новый пассажирский терминал аэропорта Малаги', 'New passenger terminal at Málaga Airport',
         'Открылся новый пассажирский терминал аэропорта Малаги. В него перевели обслуживание внутренних и международных рейсов.',
         'A new Málaga Airport passenger terminal opened, taking over domestic and international services.'),
        ('es_wiki_malaga_battle_1937', 'Batalla de Málaga1937',
         'https://es.wikipedia.org/wiki/Batalla_de_M%C3%A1laga_(1937)', 'encyclopedia', 'Wikipedia contributors',
         'Прочитаны введение, Asalto sobreMálaga и раздел о дороге. Вход войск08.02 подтверждён текстом после07.02; не используются противоречивые числа жертв и беженцев. Личный побег и потери не назначаются.',
         'malaga-1937-fall-and-civilian-flight', '1937-02-08', 'es-malaga', 'municipal', 'war_conflict', True,
         'Падение Малаги и бегство мирных жителей', 'Fall of Málaga and civilian flight',
         'В Малагу вошли силы франкистов и их итальянских союзников. Бегущие по прибрежной дороге в сторону Альмерии мирные жители подвергались обстрелам.',
         'Francoist forces and their Italian allies entered Málaga. Civilians fleeing along the coastal road towards Almería came under attack.'),
        ('es_wiki_second_republic', 'Segunda República española',
         'https://es.wikipedia.org/wiki/Segunda_Rep%C3%BAblica_espa%C3%B1ola', 'encyclopedia', 'Wikipedia contributors',
         'Прочитаны введение и Proclamación:14.04.1931, смена монархии республикой. Провозглашение отличается от принятия Конституции09.12.1931.',
         '1931-republic-proclaimed', '1931-04-14', 'es', 'national', 'political_change', False,
         'Провозглашение Второй республики', 'Proclamation of the Second Republic',
         'В Испании провозглашена республика, сменившая монархию Альфонсо XIII.',
         'A republic was proclaimed in Spain, replacing Alfonso XIII’s monarchy.'),
    ]
    events, contexts = [], []
    for sid, title, url, kind, publisher, note, slug, date, place, scope, category, sensitive, ru, en, text_ru, text_en in specs:
        repo = source('ES', sid, title, url, 'es', kind=kind, publisher=publisher, notes=note,
                      accessed_on='2026-11-17', rights='CC BY-SA for Wikipedia text; Aena republication permission not established. Only original factual paraphrases; no article text or media.')
        ev = evidence(repo, title, title+'; sections specified in registry',
                      'publication/revision date not established; accessed2026-11-17', 'es',
                      'encyclopedia' if kind == 'encyclopedia' else 'historical_study', text_ru, primary=False, locator=note)
        row = event('ES', slug, date, place, ru, en, text_ru, text_en, ev,
                    category=category, scope=scope, sensitive=sensitive)
        row['confidence'] = 'medium'
        events.append(row)
        if slug == 'asturias-1962-miners-strike':
            contexts.append(context('ES', 'asturias-1962-mining-and-labour', place, 1962, 1962, 'work', ru, en, text_ru, text_en, ev))
        if slug == 'malaga-area-1968-airport-terminal':
            contexts.append(context('ES', 'malaga-area-1968-air-travel', place, 1968, 1968, 'transport', ru, en, text_ru, text_en, ev))
    # Already reviewed Spain article,1960s paragraph: migration, industrialisation and tourism.
    repo = next(row for row in json.loads((ROOT/'data/sources/es.json').read_text())['sources'] if row['source_id'] == 'es_wiki_un_membership')
    ev = evidence(repo, 'Spain: Civil War and Francoist dictatorship,1960s economic growth',
                  'Wikipedia Spain, history section,1960s paragraph',
                  'revision date not established; accessed2026-11-17', 'en', 'encyclopedia',
                  'Национальная индустриализация, внутренние переезды из сельских районов и рост туризма в1960-х, без городских долей и личных последствий.',
                  primary=False, locator='paragraph beginning In the1960s, Spain had an unprecedented rate of economic growth')
    contexts.append(context('ES', '1960s-urban-migration', 'es', 1960, 1969, 'migration',
                            'Переезды из сельской местности в города', 'Migration from rural areas to cities',
                            'Промышленный рост сопровождался переездами из сельских районов в крупные города, в том числе Мадрид и Барселону. Это общенациональная тенденция, без точной местной доли.',
                            'Industrial growth accompanied migration from rural areas to major cities, including Madrid and Barcelona. This is a national trend, with no precise local rate.', ev))
    contexts.append(context('ES', '1960s-industry-and-tourism', 'es', 1960, 1969, 'work',
                            'Промышленность и туризм в экономическом росте', 'Industry and tourism in economic growth',
                            'Индустриализация и туризм были частью быстрого экономического роста страны. Возможность конкретной работы зависела от места, подготовки и семейных обстоятельств.',
                            'Industrialisation and tourism formed part of the country’s rapid economic growth. Particular job opportunities depended on place, training and family circumstances.', ev))
    save_batch('ES', 'spain', events, contexts)
    print('Spain regional contexts: %d events, %d contexts.' % (len(events), len(contexts)))


if __name__ == '__main__':
    main()
