"""Original Madrid municipal yearbook pages, visually read on 2026-11-17."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from records import source, evidence, event, context, save_batch

BASE = 'https://www.madrid.es/UnidadesDescentralizadas/UDCEstadistica/Nuevaweb/Publicaciones/anuesta/hist%C3%B3ricos/ANUARIOS/1950/'
DOC_DATE = 'sin fecha de impresión establecida; anuario de referencia1950'


def document(slug, chapter, title, identifier, locator, supports, notes):
    repo = source('ES','es_madrid_1950_'+slug,'Anuario Estadístico Municipal1950: '+title,BASE+chapter,'es',
        publisher='Ayuntamiento de Madrid / Estadística Municipal',accessed_on='2026-11-17',
        notes='Catálogo municipal abierto; PDF público descargado sin restricciones y página original leída visualmente. '
        'La fecha30.01.2012 de la web es la digitalización/catalogación, no la publicación original. '+notes)
    return evidence(repo,title,identifier,DOC_DATE,'es','statistical_yearbook',supports,locator=locator)


def statistic(ev, indicator, value, unit, year, method, population):
    return dict(indicator=indicator,value=value,unit=unit,year=year,area_id='es-madrid',
                population=population,method_note=method,source_id=ev['source_id'])


def main():
    geography = document('population','Estad%C3%ADstica/1950020001.pdf',
        'Estadística local: población, superficie y densidad',
        'Anuario1950, p.7, cuadros1–3','p.7, cuadro1 and footnote',
        'Третье исправление муниципального регистра на31.12.1949: население de hecho capital1509289; '
        'отдельная колонка включает населённые пункты плана присоединения.',
        'Прочитана с.7 целиком. В cuadro1 capital отдельно от con inclusión de los pueblos comprendidos en el plan de anexión. '
        'Данные не равны текущим границам Мадрида и не являются переписью населения1950. '
        'План присоединения не принят за доказательство уже состоявшегося включения всех перечисленных мест.')
    transport = document('emt_transport','Varios%20servicios/1950090001.pdf',
        'Transportes urbanos: Empresa Municipal de Transportes',
        'Anuario1950, p.73, cuadros93–95','p.73, cuadro94',
        'В1950 муниципальная статистика учитывала троллейбусный маршрут; месячные данные с апреля и5831826билетов за год.',
        'Прочитана с.73: трамваи, троллейбусы, автобусы. В троллейбусной таблице январь–март без показателей, '
        'с апреля одна линия. Не утверждается точный день открытия. Проданные билеты не равны числу разных пассажиров; '
        'единица билетов не переносится на жителей или поездки героини.')
    housing = document('housing','Varios%20servicios/1950090009.pdf',
        'Edificación y vivienda: resumen general del año',
        'Anuario1950, p.75, cuadro99','p.75, Nueva planta, totals, approved/completed columns',
        'В1950 утверждены проекты7529новых квартир, закончено1597; это отдельные колонки годового учёта.',
        'Одна страница, прочитаны заголовки и итоговые строки. Nueva planta: Proyectos aprobados7529viviendas, '
        'Obras terminadas1597viviendas;177зданий. Не смешивать квартиры, здания, разрешения и завершение; '
        'не вычислять дефицит как7529–1597: это не обязательно одна когорта объектов.')
    water = document('water','Salubridad/1950050018.pdf',
        'Consumo de agua en Madrid: Canal de IsabelII',
        'Anuario1950, p.45, cuadros58–59','p.45, cuadro59, row1950',
        'Годовое потребление воды Lozoya в таблице за1950 составляет113452540кубических метров.',
        'Прочитана с.45: различаются подача в резервуар и расход; извлечён итог consumo anual из cuadro59. '
        'Учёт службы водоснабжения, не бытовое потребление одного человека, не доля домов с водопроводом. '
        'Причины колебаний1939–1950 не установлены и не выдумываются.')
    food = document('fruit_supply','Bromatolog%C3%ADa/1950070004.pdf',
        'Mercado Central de Frutas y Verduras: especies introducidas',
        'Anuario1950, p.60, Mercado Central de Frutas y Verduras','PDF p.1, printed p.60, row Albaricoques',
        'Поставки абрикосов на Центральный рынок: май743320кг, июнь3675830кг.',
        'Из четырёхстраничного PDF визуально прочитана только с.60 (PDF1): поступления фруктов в килограммах за январь–июль. '
        'Цены на последующих страницах не извлечены. Это оптовый рыночный поток, не розничные покупки, '
        'рацион или траты семьи; отсутствие показателя не трактуется как невозможность купить продукт.')
    culture = document('cultural_services','Varios%20servicios/1950090017.pdf',
        'Hemeroteca, Museo Municipal, Biblioteca Municipal',
        'Anuario1950, p.78, cuadros103–105','p.78, cuadro104 footnote and cuadro105',
        'Музей был закрыт на работы до апреля; библиотечный фонд93367томов, показатель Lectores durante el año7420; уникальность читателей не установлена.',
        'Прочитана с.78. Сноска к музею: Cerrado por obras hasta el mes de abril; с апреля есть посещения. '
        'Biblioteca: Número de volúmenes existentes93367; Lectores durante el año7420. '
        'Не установлено, уникальные ли читатели: показатель в статистике сохраняется как reported readers, '
        'не число грамотных жителей. Современная модель посещений не навязывается первичному учёту.')

    events = [
        event('ES','madrid-1949-population-register','1949-12-31','es-madrid',
            'Городской учёт населения Мадрида','Madrid municipal population register',
            'Исправленный городской регистр учитывал в столице 1 509 289 наличных жителей. Населённые пункты плана присоединения приведены отдельно.',
            'The revised municipal register counted 1,509,289 people present in the capital. Settlements in the annexation plan were listed separately.',geography,category='housing_urban'),
        event('ES','madrid-1950-trolleybus-service','1950','es-madrid',
            'Троллейбус в городской сети Мадрида','Trolleybus service in Madrid',
            'Муниципальный ежегодник учитывал работу троллейбусной линии в Мадриде, с помесячными данными начиная с апреля.',
            'The municipal yearbook recorded a Madrid trolleybus route, with monthly figures from April onwards.',transport),
        event('ES','madrid-1950-municipal-museum-reopening','1950-04','es-madrid',
            'Муниципальный музей Мадрида после ремонта','Madrid municipal museum after building work',
            'Муниципальный музей возобновил приём посетителей после работ. Годовой отчёт отмечает закрытие до апреля и учитывает посещения с этого месяца.',
            'The municipal museum resumed receiving visitors after building work. The annual report notes closure until April and records visits from that month.',culture,category='culture_leisure'),
    ]
    contexts = [
        context('ES','madrid-1949-population-boundaries','es-madrid',1949,1949,'demography',
            'Мадрид и план расширения','Madrid and the expansion plan',
            'Городской учёт различал столицу и населённые пункты плана присоединения, среди них Вальекас, Фуэнкарраль и Вильяверде.',
            'Municipal records distinguished the capital from settlements in the annexation plan, including Vallecas, Fuencarral and Villaverde.',geography,
            [statistic(geography,'population_present_register',1509289,'persons',1949,
                'Third register rectification at31December1949; capital column only, excluding the separate planned-annexation column; not current boundaries.',
                'Population de hecho, capital as defined in cuadro1')]),
        context('ES','madrid-1950-emt-trolleybus','es-madrid',1950,1950,'transport',
            'Троллейбусные билеты в Мадриде','Madrid trolleybus tickets',
            'В городской сети работала троллейбусная линия наряду с автобусами и трамваями.',
            'A trolleybus route operated alongside buses and trams in the city network.',transport,
            [statistic(transport,'emt_trolleybus_tickets_sold',5831826,'tickets',1950,
                'Cuadro94 annual total; monthly observations begin in April; tickets sold, not unique passengers or city population.',
                'Tickets reported by Empresa Municipal de Transportes trolleybus service')]),
        context('ES','madrid-1950-housing-construction','es-madrid',1950,1950,'housing',
            'Новое жильё в Мадриде','New housing in Madrid',
            'Городской ежегодник учитывал утверждённые проекты и законченные квартиры раздельно: строительство не завершалось одновременно с выдачей разрешений.',
            'The municipal yearbook counted approved projects and completed dwellings separately; permission and completion were different stages.',housing,
            [statistic(housing,'new_dwellings_projects_approved',7529,'dwellings',1950,
                'Cuadro99, Nueva planta, Proyectos aprobados, annual total; not completed homes.', 'Dwellings in approved new-build projects'),
             statistic(housing,'new_dwellings_completed',1597,'dwellings',1950,
                'Cuadro99, Nueva planta, Obras terminadas, annual total; not the same project cohort as approvals and not buildings.', 'Dwellings reported completed in new buildings')]),
        context('ES','madrid-1950-water-supply','es-madrid',1950,1950,'housing',
            'Городское водоснабжение Мадрида','Madrid municipal water supply',
            'Система Канала Изабеллы II снабжала разные части Мадрида; городской учёт отдельно выделял Университетский городок.',
            'The Canal de Isabel II system supplied different parts of Madrid; municipal accounts separately identified the university district.',water,
            [statistic(water,'lozoya_water_annual_consumption',113452540,'cubic_metres',1950,
                'Cuadro59 Consumo anual; total system consumption reported for Madrid, not per-person household use, and distinct from reservoir delivery.',
                'Water consumption within the reporting service area')]),
        context('ES','madrid-1950-seasonal-fruit-supply','es-madrid',1950,1950,'food',
            'Фрукты на Центральном рынке Мадрида','Fruit at Madrid central market',
            'На Центральный рынок поступали апельсины, бананы, абрикосы и вишня. Поставки менялись по месяцам.',
            'Oranges, bananas, apricots and cherries arrived at the central market, with supplies varying by month.',food,
            [statistic(food,'apricots_market_arrivals_may',743320,'kilograms',1950,
                'Printed p.60, Albaricoques, Mayo; wholesale market arrivals, not household consumption or retail sales.', 'Apricots arriving at Mercado Central de Frutas y Verduras in May'),
             statistic(food,'apricots_market_arrivals_june',3675830,'kilograms',1950,
                'Printed p.60, Albaricoques, Junio; wholesale market arrivals, not household consumption or retail sales.', 'Apricots arriving at Mercado Central de Frutas y Verduras in June')]),
        context('ES','madrid-1950-municipal-reading','es-madrid',1950,1950,'leisure_culture',
            'Муниципальная библиотека Мадрида','Madrid municipal library',
            'В муниципальной библиотеке хранились десятки тысяч томов; в учёте выдач представлены история, география, романы, искусства и другие темы.',
            'The municipal library held tens of thousands of volumes; requests included history, geography, novels, arts and other subjects.',culture,
            [statistic(culture,'municipal_library_volumes',93367,'volumes',1950,
                'Cuadro105 Número de volúmenes existentes; stock, not annual acquisitions or volumes owned per household.', 'Holdings of Biblioteca Municipal')]),
    ]
    save_batch('ES','spain',events,contexts)
    print('Madrid yearbook: %d events, %d contexts.' % (len(events),len(contexts)))


if __name__=='__main__':
    main()
