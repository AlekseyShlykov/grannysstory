"""Barcelona period gaps; secondary evidence stays explicitly secondary."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from records import source, evidence, event, context, save_batch


def register(identifier,title,url,publisher,notes,language='es',status='accessed'):
    return source('ES',identifier,title,url,language,publisher=publisher,notes=notes,
                  accessed_on='2026-11-17',status=status)


def main():
    revolt = register('es_barcelona_tragic_week_museum','La Setmana Tràgica',
        'https://www.mhcat.cat/exposicions/la_memoria_d_un_pais/els_anys_electrics/obrerisme_i_conflictivitat_social/la_setmana_tragica',
        'Museu d’Història de Catalunya',
        'Прочитан раздел La Setmana Tràgica, два абзаца экспозиции, не только поисковый фрагмент. '
        'Современный музейный очерк, дата публикации не указана: вторичная опора. '
        'Призыв резервистов, стачка26.07.1909 и особенно тяжёлые столкновения в Барселоне. '
        'Объяснения виновников поджогов и персональные потери в игровой текст не перенесены.',language='ca')
    industry = register('es_barcelona_first_seat_1953_retrospective','SEAT:70años sobre ruedas,13.11.2023',
        'https://www.seat-cupra-mediacenter.es/SEAT-Brand/seat-brand-news/modelrange/2023/SEAT-70-anos-sobre-ruedas',
        'SEAT S.A. / Media Center',
        'Открыт и прочитан юбилейный релиз13.11.2023, абзацы о1953. Первый1400 произведён13.11.1953 '
        'на фабрике Zona Franca в Барселоне. Это современный корпоративный пересказ, не первичный производственный '
        'журнал1953; не включён в первичную долю. Цифры2023, реклама и новая фабрика Martorell не извлечены.')
    olympics = register('es_barcelona_olympic_opening_press_1992','El País,26.07.1992, portada: inauguración olímpica',
        'https://elpais.com/diario/1992/07/26/portada/712101601_850215.html','El País / archivo de prensa',
        'Прочитана исходная газетная статья26.07.1992 о состоявшейся церемонии. '
        'Литературные оценки, численность аудитории и технический рассказ о стреле не извлекаются. '
        'Точный день25.07 независимо сверен с RTVE; участие героини не подразумевается.')
    olympic_date = register('es_barcelona_olympic_opening_rtve_date','Los Juegos Olímpicos de Barcelona92,10.07.2017',
        'https://www.rtve.es/rtve/20170710/els-jocs-olimpics-barcelona-92/1579313.shtml','RTVE',
        'Прочитан текст о церемонии25.07.1992 на стадионе Монжуика. Современная справка, вторичная опора '
        'для точной даты. Сам архивный видеоматериал не просмотрен и не считается проверенным фильмом.')
    forum = register('es_barcelona_forum_public_opening_2004','El Fórum de Barcelona abre sus puertas al público,09.05.2004',
        'https://elpais.com/cultura/2004/05/09/actualidad/1084053601_850215.html','El País / archivo de prensa',
        'Прочитан датированный репортаж об открытии для публики09.05, после церемонии08.05. '
        'Площадка расположена в Барселоне и Sant Adrià de Besòs: оба муниципалитета названы; не переносится '
        'целиком в один город. Прогнозы посещаемости не выдаются за результаты.')
    register('es_barcelona_md_olympics_1992_inaccessible','Mundo Deportivo,26.07.1992, primera página: access lead',
        'https://hemeroteca-paginas.mundodeportivo.com/EMD02/HEM/1992/07/26/MD19920726-001.pdf',
        'Hemeroteca de Mundo Deportivo',
        'Проверенный URL вернул403, обхода и повторных запросов нет. Не прочитан, ничего из этого листа не извлечено.',status='inaccessible')
    register('es_barcelona_la84_report_download_lead','Official report Barcelona1992, volumeII: download lead',
        'https://library.la84.org/6oic/OfficialReports/1992/1992s2.pdf','LA84 Foundation',
        'Обычный запрос завершился редиректом на HTML вместо PDF. Полный отчёт не получен и не прочитан. '
        'Найденная карточка нынешнего каталога требует JavaScript; право LA84 распространять отчёт '
        'не объявляется лицензией проекта на копирование.',status='inaccessible')

    events, contexts = [], []
    ev = evidence(revolt,'La Setmana Tràgica', 'Museu d’Història de Catalunya, exposició Els anys elèctrics, La Setmana Tràgica',
        'sin fecha indicada','ca','historical_study',
        'Стачка26.07.1909 на фоне мобилизации резервистов и последующие столкновения, особенно тяжёлые в Барселоне.',primary=False,locator='two paragraphs under La Setmana Tràgica')
    events.append(event('ES','barcelona-1909-tragic-week','1909-07-26','es-barcelona',
        'Стачка и Трагическая неделя в Барселоне','Strike and Tragic Week in Barcelona',
        'Протесты против мобилизации резервистов сопровождались стачкой и тяжёлыми столкновениями в Барселоне. За подавлением выступлений последовали репрессии.',
        'Protests against reservist mobilisation were accompanied by a strike and severe clashes in Barcelona, followed by repression.',ev,category='labor',sensitive=True))
    ev = evidence(industry,'SEAT:70años sobre ruedas','SEAT Media Center,13.11.2023, historical paragraphs1953',
        '2023-11-13','es','historical_study','Первый SEAT 1400 произведён13.11.1953 на фабрике Zona Franca, Барселона.',primary=False,locator='opening historical paragraphs')
    events.append(event('ES','barcelona-1953-first-seat-1400','1953-11-13','es-barcelona',
        'Первый SEAT 1400 на фабрике в Барселоне','First SEAT 1400 produced in Barcelona',
        'На фабрике SEAT в Зона-Франка в Барселоне произвели первый автомобиль SEAT 1400.',
        'The SEAT factory in Barcelona\'s Zona Franca produced its first SEAT 1400 car.',ev,category='local_economy'))
    contexts.append(context('ES','barcelona-1953-automobile-manufacturing','es-barcelona',1953,1953,'work',
        'Автомобильное производство в Зона-Франка','Car manufacturing in Zona Franca',
        'Фабрика в Зона-Франка стала местом сборки автомобилей SEAT.',
        'The Zona Franca factory assembled SEAT cars.',ev))
    ev = evidence(olympics,'El deporte olímpico clama por la paz en una emocionante inauguración de los Juegos',
        'El País,26.07.1992, portada, archivo712101601_850215','1992-07-26','es','contemporary_newspaper',
        'Состоявшаяся церемония открытия Олимпийских игр в Барселоне.',locator='opening report of the completed ceremony')
    date_ev = evidence(olympic_date,'Los Juegos Olímpicos de Barcelona92',
        'RTVE,10.07.2017, article1579313','2017-07-10','es','historical_study',
        'Точная дата церемонии25.07.1992 и место: Estadio Olímpico de Montjuic.',primary=False,locator='paragraph on inauguration')
    record = event('ES','barcelona-1992-olympic-opening','1992-07-25','es-barcelona',
        'Открытие Олимпийских игр в Барселоне','Opening of the Barcelona Olympic Games',
        'На Олимпийском стадионе Монжуика прошла церемония открытия летних Олимпийских игр.',
        'The Summer Olympic Games opened with a ceremony at Montjuïc Olympic Stadium.',ev,category='sport')
    record['evidence'].append(date_ev)
    record['source_ids'].append(olympic_date['source_id'])
    events.append(record)
    ev = evidence(forum,'El Fórum de Barcelona abre sus puertas al público',
        'El País,09.05.2004, Cultura, archivo1084053601_850215','2004-05-09','es','contemporary_newspaper',
        'Открытие Форума для публики09.05.2004; площадка на границе Barcelona и Sant Adrià de Besòs.',locator='opening paragraphs and final paragraph on location')
    events.append(event('ES','barcelona-2004-forum-public-opening','2004-05-09','es-barcelona',
        'Форум культур открылся для посетителей','Forum of Cultures opens to visitors',
        'Форум культур открылся для публики на площадке в Барселоне и соседнем Сан-Адриа-де-Бесос.',
        'The Forum of Cultures opened to visitors at a site spanning Barcelona and neighbouring Sant Adrià de Besòs.',ev,category='culture_leisure'))
    contexts.append(context('ES','barcelona-2004-forum-activities','es-barcelona',2004,2004,'leisure_culture',
        'Выставки и встречи Форума культур','Forum of Cultures exhibitions and events',
        'Посетителям Форума предлагали выставки, представления и мастерские. Город рекомендовал добираться общественным транспортом.',
        'The Forum offered exhibitions, performances and workshops. The city recommended travelling by public transport.',ev))
    save_batch('ES','spain',events,contexts)
    print('Barcelona periods: %d events, %d contexts.' % (len(events),len(contexts)))


if __name__=='__main__':
    main()
