"""Spain's settlement points, provinces and regional inheritance; not a municipal-boundary GIS."""
import copy
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from records import source, evidence, event, context, save_batch
from checkpoint import ROOT, atomic_write


def main():
    definition = source('ES', 'es_catalonia_statute_original_1932', 'Ley relativa al Estatuto de Cataluña,15.09.1932',
        'https://www.boe.es/datos/pdfs/BOE/1932/265/A02090-02094.pdf', 'es',
        publisher='Agencia Estatal Boletín Oficial del Estado', accessed_on='2026-11-17',
        notes='Оригинальный PDF скачан и прочитан: статьи1–2, заключительная переходная норма и подпись. '
        'Четыре провинции, испанский и каталонский официальные языки. Закон подписан15.09, опубликован21.09; '
        'день публикации не выдаётся за установленный здесь день вступления в силу. Региональная география '
        'не означает непрерывного действия автономных органов в1900–1979.')
    restored = source('ES', 'es_catalonia_provisional_1977', 'Real Decreto-ley41/1977, restablecimiento provisional de la Generalidad',
        'https://www.boe.es/diario_boe/txt.php?id=BOE-A-1977-24354', 'es',
        publisher='Agencia Estatal Boletín Oficial del Estado', accessed_on='2026-11-17',
        notes='Прочитаны статьи1–2,6, заключительные и переходное положения. '
        'Подписан29.09.1977, но действует с публикации05.10.1977. Провинциальные учреждения сохраняют '
        'правосубъектность; это временный режим, не восстановление статута1932 и не современная автономия1980.')
    resumed = source('ES', 'es_catalan_parliament_resumption_1936', 'Decreto-ley de26.02.1936: Parlamento catalán',
        'https://www.boe.es/gazeta/dias/1936/02/27/pdfs/GMD-1936-58.pdf', 'es',
        publisher='Agencia Estatal Boletín Oficial del Estado', accessed_on='2026-11-17',
        notes='Прочитан исходный decreto-ley наp.1635. Разрешено возобновить работу парламента для назначения '
        'правительства Generalitat; преамбула прямо называет ещё действующий закон02.01.1935. '
        'Событие — публикация разрешения27.02, не неподтверждённая точная дата передачи всех служб.')
    history = source('ES', 'es_generalitat_institutional_history', 'La Generalitat contemporánea, siglosXX–XXI',
        'https://web.gencat.cat/es/generalitat/qui-som/historia-generalitat/generalitat-contemporania', 'es',
        publisher='Generalitat de Catalunya', accessed_on='2026-11-17',
        notes='Прочитаны разделы1931–1939,1939–1977,1977–1980. Современная институциональная история, '
        'вторичная опора: временная Generalitat1931; приостановка парламента1934–1936; акт Франко1938 '
        'не равен фактическому контролю над Барселоной до января1939; временная реставрация1977 '
        'не является современной автономией. Политические оценки автора не переносятся как нейтральные факты.')
    p = ROOT/'data/locations/es.json'
    data = json.loads(p.read_text())
    by_id = {row['id']: row for row in data['locations']}
    regional_id = 'es-historical-catalonia'
    if regional_id not in by_id:
        row = copy.deepcopy(by_id['es-community-catalonia'])
        row.update(id=regional_id, valid_from=None, valid_to='1980-01-10', geography_role='historical_region',
                   names=[dict(name='Cataluña / Catalunya', lang='es', **{'from':None,'to':'1980-01-10'})],
                   names_ru=[dict(name='Каталония, исторический регион', name_en='Catalonia, historical region',
                                  locative='в Каталонии', **{'from':None,'to':'1980-01-10'})],
                   parents=[dict(id='es', **{'from':None,'to':'1980-01-10'})],
                   source_ids=[definition['source_id'], restored['source_id'], history['source_id']],
                   geography_review='verified',
                   geography_note='Географический контейнер четырёх каталонских провинций, не утверждение '
                   'непрерывной автономии. Республиканские, приостановленные и временные органы описаны '
                   'отдельными документами и событиями; государственный предок остаётся Испанией.')
        data['locations'].append(row)
        by_id[regional_id] = row
    province = by_id['es-province-barcelona']
    expected = [('es', None, '1980-01-10'), (regional_id, None, '1980-01-10')]
    if (province['parents'][0]['id'], province['parents'][0]['from'], province['parents'][0]['to']) not in expected:
        raise ValueError('Barcelona hierarchy changed; inspect before applying this review')
    province['parents'][0]['id'] = regional_id
    for row in data['locations']:
        if row['id'] == regional_id:
            continue
        row['geography_review'] = 'verified'
        row['geography_review_scope'] = 'settlement point, stable province, dated modern autonomy; historical governments are context, not sovereignty changes'
        row['geography_note'] = ('Проверены точка населённого места, его провинциальная принадлежность и '
            'датированная современная автономия. Граф задаёт географическое наследование, а не полный список '
            'органов власти. Провозглашение республики, диктатура и переход описаны национальными событиями. '
            'Имена городов стабильны; название провинции Овьедо меняется отдельно с08.04.1983. '
            'Точка на карте не изображает исторический муниципальный полигон; статистика сохраняет исходные границы.')
        if row['id'] in {'es-malaga','es-province-malaga'}:
            row['geography_note'] += (' Отделение Торремолиноса решением27.09.1988 не перемещает точку Малаги; '
                                     'точная дата фактической передачи территории здесь не устанавливается, '
                                     'прежняя территория не применяется к современным муниципальным числам.')
        if row['id'] in {'es-barcelona','es-province-barcelona'}:
            row['source_ids'] = sorted(set(row['source_ids']+[definition['source_id'],restored['source_id'],history['source_id']]))
    atomic_write(p, data)
    events, contexts = [], []
    for repo, slug, date, doc_date, title, locator, ru, en, text_ru, text_en in [
        (definition, 'catalonia-1932-statute-publication', '1932-09-21', '1932-09-15',
         'Ley relativa al Estatuto de Cataluña', 'Gaceta265,21.09.1932,pp.2090–2094,arts.1–2',
         'Публикация республиканского статута Каталонии', 'Publication of Catalonia’s republican statute',
         'Опубликован статут Каталонии, определявший автономный регион из четырёх провинций и официальный статус испанского и каталонского языков.',
         'The published statute defined Catalonia as an autonomous region of four provinces and gave Spanish and Catalan official status.'),
        (resumed, 'catalonia-1936-parliament-resumption', '1936-02-27', '1936-02-26',
         'Decreto-ley: reanudación del Parlamento catalán', 'Gaceta58,27.02.1936,p.1635,artículo único',
         'Разрешено возобновить работу каталонского парламента', 'Catalan Parliament authorised to resume',
         'Правительство республики разрешило каталонскому парламенту возобновить работу для назначения правительства Женералитата после периода приостановки автономных органов.',
         'The republican government authorised the Catalan Parliament to resume work to appoint the Generalitat government after the suspension of autonomous institutions.'),
        (restored, 'catalonia-1977-provisional-restoration', '1977-10-05', '1977-09-29',
         'Real Decreto-ley41/1977', 'BOE-A-1977-24354,arts.1–2,6; final provision1',
         'Временное восстановление Женералитата', 'Provisional restoration of the Generalitat',
         'Вступило в силу временное восстановление Женералитата для четырёх каталонских провинций. Полномочия определял отдельный переходный режим до будущей автономии.',
         'Provisional restoration of the Generalitat for the four Catalan provinces took effect under a transitional regime preceding future autonomy.')]:
        ev = evidence(repo,title,locator,doc_date,'es','legal_publication',text_ru,locator=locator)
        events.append(event('ES',slug,date,regional_id,ru,en,text_ru,text_en,ev,category='border_administrative',scope='regional'))
        if slug == 'catalonia-1932-statute-publication':
            contexts.append(context('ES','catalonia-1932-official-languages',regional_id,1932,1932,'communication',ru,en,text_ru,text_en,ev))
    save_batch('ES','spain',events,contexts)
    print('Spain geography review: province/settlement scope,3 regional events,1 context.')


if __name__ == '__main__':
    main()
