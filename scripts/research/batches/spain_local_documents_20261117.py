"""Spain only. Manually read documents, including the identified reproduced originals.

No network calls. Replaying identical records is safe; conflicting records require inspection.
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from records import source, evidence, event, context, save_batch

ARCHIVE = 'https://archivomunicipal.malaga.eu/opencms/export/sites/archivo-municipal/.galeria-descargas/10ebb013-ba53-11e3-86e5-005056846acf/'
DAY = '2026-11-17'


def register(identifier, title, url, publisher, notes, kind=None):
    return source('ES', identifier, title, url, 'es', publisher=publisher,
                  kind=kind, accessed_on=DAY, notes=notes)


def main():
    health = register('es_malaga_vaccination_minutes_1901',
        'La Beneficencia Municipal de Málaga: acta del 13 de diciembre de 1901', ARCHIVE+'C3.pdf',
        'Archivo Municipal de Málaga',
        'PDF открыт в web; скачан обычным публичным HTTP-запросом. Прочитана транскрипция с.11–12 и визуально факсимиле с.14–15. '
        'Оригинал: Actas Capitulares, vol.302, ff.245–246. В приложении воспроизведены оригинальные листы; '
        'первичность относится к ним и транскрипции заседания, не ко всему современному историческому очерку. '
        'Источник свидетельствует о дискуссии и решении совета, не о всеобщем исполнении вакцинации.')
    libraries = register('es_malaga_park_libraries_documents',
        'Las Bibliotecas de Parques y Jardines de Málaga. Vestigios de otra época en el Archivo Municipal', ARCHIVE+'C9.pdf',
        'Archivo Municipal de Málaga',
        'Прочитаны исторический очерк с.3–6 и оригинальные Normas para los lectores от23.04.1953 на с.19 '
        '(скачивание и визуальное чтение). Открытие библиотеки12.10.1926 описано современным очерком и считается вторичной опорой. '
        'Правила1953 первичны: читать только на ближайших скамьях, одну книгу за раз, вернуть на место, не шуметь. '
        'Правила не доказывают, что каждый житель пользовался библиотекой.')
    books = register('es_malaga_proteo_licence_report_1969',
        'Una aproximación a las librerías malagueñas del siglo XX: expediente Proteo', ARCHIVE+'C14.pdf',
        'Archivo Municipal de Málaga',
        'Прочитан очерк с.1–4 и визуально оригинальный Informe del Negociado de Policía Urbana,04.09.1969, с.6 PDF. '
        'На с.6 положительное заключение по заявке на розничную продажу новых книг, Juan de Padilla18; '
        'не само окончательное разрешение. Отдельный шифр дела в прочитанном листе не установлен. '
        'Сведения очерка о подпольных книгах не приписываются этому административному листу. События2021 не извлекаются.')
    medicine = register('es_oviedo_medicine_law_1968',
        'Ley56/1968 sobre creación de Facultades de Medicina',
        'https://www.boe.es/diario_boe/txt.php?id=BOE-A-1968-908',
        'Agencia Estatal Boletín Oficial del Estado',
        'Прочитан TEXTO ORIGINAL, arts.1–3, и ANÁLISIS. Закон27.07, опубликован29.07.1968, '
        'вступил в силу18.08.1968. Статья3 требует постепенного введения курсов при наличии средств и помещений; '
        'это юридическое создание, не утверждение о немедленном обучении всех желающих.')
    university = register('es_malaga_university_decree_1972',
        'Decreto2566/1972 por el que se crean las Universidades de Córdoba, Málaga y Santander',
        'https://www.boe.es/boe/dias/1972/09/30/pdfs/A17512-17512.pdf',
        'Agencia Estatal Boletín Oficial del Estado',
        'Оригинальный одностраничный PDF прочитан через web, art.2,4,7. Создание Университета Малаги, '
        'экономический факультет из состава Гранады и новый медицинский; округ соответствует провинции. '
        'Decreto18.08.1972, публикация30.09, вступление01.10.1972. Дата юридического действия отделена от подписания.')
    fire = register('es_oviedo_university_fire_photo_1934',
        'Fotografías del incendio de la Universidad de Oviedo el13 de octubre de1934',
        'https://colecciones.rebiun.org/s/exp-malheridos/item/442',
        'Universidad de Oviedo / REBIUN',
        'Открыта карточка: Universidad de Oviedo AFUO.GP-Alb.1-1. Изображение e748a934dc3c4146a0c1342c3f823e4d3c098133.jpg '
        'скачано по публичной ссылке карточки и визуально просмотрено. Видны горящее здание/дым; дата и идентификация '
        'даны институциональной карточкой. Фото не доказывает виновников, число жертв или судьбу конкретного человека. '
        'Не публиковать само изображение без проверки прав.', kind='archive')
    rebuild = register('es_oviedo_reconstruction_order_1939',
        'Orden de12 de diciembre de1939: Junta de Reconstrucción de Oviedo',
        'https://www.boe.es/gazeta/dias/1939/12/15/pdfs/BOE-1939-349.pdf',
        'Agencia Estatal Boletín Oficial del Estado / Gazeta',
        'Прочитана только с.7043, Orden12.12.1939, опубликованная15.12: передать документацию и средства '
        'упразднённой Junta de Socorros совету реконструкции. В преамбуле упоминается Decreto25.04.1938, '
        'но самостоятельная первичная проверка того декрета не заявляется. Пропагандные формулы диктатуры '
        'не принимаются как нейтральные описания и не копируются в игровой текст.')
    plan = register('es_oviedo_urban_plan_1941',
        'Plan de urbanización de Oviedo, Germán Valentín y García Noblejas, Revista Nacional de Arquitectura4(1941)',
        'https://www.coam.org/media/Default%20Files/fundacion/biblioteca/revista-arquitectura-100/1941-1946/docs/revista-completa/revista-nacional-arquitectura-1941-n04.pdf',
        'Biblioteca del Colegio Oficial de Arquitectos de Madrid / Dirección General de Arquitectura',
        'PDF открыт и скачан, прочитаны оглавление и разделы статьи на печатных с.17,25–26,28,30,36. '
        'С.1 подтверждает год1941 и автора; месяц не установлен. Автор плана описывает состояние и проекты '
        'на фоне реконструкции. Схемы подписаны ноябрём1940; публикация1941 не равна утверждению или завершению '
        'всех работ. Политически ангажированный источник режима: его социальная иерархия и пропагандные оценки '
        'не переносятся в авторский голос; статистика и утверждения о боевых действиях без независимой проверки не извлекаются.',
        kind='archive')

    events, contexts = [], []
    ev = evidence(health, 'Acta del Pleno Municipal: medidas contra la viruela',
        'AMM, Actas Capitulares vol.302, ff.245–246, sesión13.12.1901', '1901-12-13', 'es', 'municipal_record',
        'Муниципальный совет обсуждал случаи оспы, вакцинацию и дезинфекцию; предоставил мэру полномочия принимать меры.',
        locator='C3.pdf, transcripción pp.11–12; facsímil pp.14–15')
    events.append(event('ES','malaga-1901-smallpox-measures','1901-12-13','es-malaga',
        'Меры городского совета Малаги против оспы','Málaga council measures against smallpox',
        'Городской совет обсуждал вакцинацию и дезинфекцию при случаях оспы и уполномочил мэра принимать меры против распространения болезни.',
        'The council discussed vaccination and disinfection amid smallpox cases and authorised the mayor to act against its spread.', ev,category='public_health'))
    contexts.append(context('ES','malaga-1901-municipal-health','es-malaga',1901,1901,'healthcare',
        'Вакцинация и городская помощь в Малаге','Vaccination and municipal care in Málaga',
        'В протоколе совета названы Институт вакцинации, дезинфекция жилищ и сообщения врачей о случаях оспы.',
        'Council minutes name the vaccination institute, disinfection of homes and doctors reporting smallpox cases.',ev))

    ev = evidence(libraries,'Normas para los lectores: Bibliotecas de Parques y Jardines',
        'Ayuntamiento de Málaga, Servicio de Cultura, Normas23.04.1953; reproducción C9.pdf p.19',
        '1953-04-23','es','municipal_record','Свободный доступ; читать на ближайших скамьях, одну книгу за раз; вернуть книгу на полку и соблюдать тишину.',
        locator='C9.pdf p.19, facsímil inferior izquierdo, Normas para los lectores')
    events.append(event('ES','malaga-1953-park-library-rules','1953-04-23','es-malaga',
        'Правила чтения в парковых библиотеках Малаги','Málaga park-library reading rules',
        'Муниципальные правила предусматривали свободный доступ к книгам парковых библиотек и чтение на расположенных рядом скамьях.',
        'Municipal rules provided free access to park-library books for reading on nearby benches.',ev,category='culture_leisure'))
    contexts.append(context('ES','malaga-1953-reading-on-benches','es-malaga',1953,1953,'leisure_culture',
        'Книга для чтения на скамье','A book to read on a bench',
        'Читатель мог взять одну книгу, прочитать её на скамье возле библиотеки и вернуть на полку. Правила запрещали шум и пометки.',
        'A reader could take one book, read it on a bench nearby and return it to its shelf. Noise and annotations were prohibited.',ev))
    ev = evidence(libraries,'Las Bibliotecas de Parques y Jardines de Málaga',
        'C9.pdf, epígrafe Inauguración de la Primera Biblioteca, pp.4–5',
        'sin fecha, referencias consultadas en2022','es','historical_study',
        'Современный муниципальный очерк датирует открытие первой парковой библиотеки12.10.1926.',primary=False,locator='pp.4–5')
    events.append(event('ES','malaga-1926-park-library','1926-10-12','es-malaga',
        'Первая библиотека в парке Малаги','First library in Málaga park',
        'В парке Малаги открыли небольшую общедоступную библиотеку, устроенную как шкаф для книг рядом со скамьями.',
        'A small public library opened in Málaga park, with a book cabinet beside benches.',ev,category='culture_leisure'))

    ev = evidence(books,'Informe del Negociado de Policía Urbana sobre venta de libros nuevos',
        'Ayuntamiento de Málaga, Informe04.09.1969, Juan de Padilla18; reproducción C14.pdf p.6',
        '1969-09-04','es','municipal_record',
        'Положительное заключение по заявке на розничную торговлю новыми книгами по адресу Juan de Padilla18.',locator='C14.pdf p.6, facsímil fechado04.09.1969')
    events.append(event('ES','malaga-1969-bookshop-report','1969-09-04','es-malaga',
        'Заключение по новой книжной лавке в Малаге','Report on a new Málaga bookshop',
        'Городской отдел подготовил положительное заключение по заявке на продажу новых книг на улице Хуан-де-Падилья, 18.',
        'A municipal department issued a favourable report on an application to sell new books at 18 Juan de Padilla.',ev,category='culture_leisure'))

    ev = evidence(medicine,'Ley56/1968, de27 de julio, creación de Facultades de Medicina',
        'BOE-A-1968-908, BOE181, p.11091, arts.1–3','1968-07-29','es','legal_publication',
        'Юридическое создание медицинского факультета Университета Овьедо; постепенное введение обучения; вступление18.08.1968.',locator='TEXTO ORIGINAL, arts.1–3; ANÁLISIS')
    events.append(event('ES','oviedo-1968-medical-faculty','1968-08-18','es-oviedo',
        'Создание медицинского факультета в Овьедо','Creation of Oviedo medical faculty',
        'Вступил в силу закон о создании медицинского факультета Университета Овьедо. Обучение предписывалось вводить постепенно, с выделением средств и помещений.',
        'A law creating Oviedo University medical faculty took effect. Courses were to be introduced gradually as funding and facilities became available.',ev,category='education'))
    contexts.append(context('ES','oviedo-1968-medical-study','es-oviedo',1968,1968,'education',
        'Подготовка медицинского образования в Овьедо','Preparing medical education in Oviedo',
        'Закон связывал развёртывание медицинских курсов с бюджетом, помещениями и возможными соглашениями с больницами.',
        'The law linked the introduction of medical courses to budgets, premises and possible hospital agreements.',ev))

    ev = evidence(university,'Decreto2566/1972, de18 de agosto',
        'BOE-A-1972-1400, BOE235, p.17512, arts.2,4,7','1972-09-30','es','legal_publication',
        'Университет Малаги создаётся с экономическим и медицинским факультетами; декрет вступает в силу01.10.1972.',locator='p.17512, arts.2,4,7')
    events.append(event('ES','malaga-1972-university','1972-10-01','es-malaga',
        'Создание Университета Малаги','Creation of the University of Málaga',
        'Вступил в силу декрет о создании Университета Малаги. В его первоначальную структуру включили экономический и новый медицинский факультеты.',
        'The decree creating the University of Málaga took effect. Its initial structure included economics and a new medical faculty.',ev,category='education'))
    contexts.append(context('ES','malaga-1972-university-studies','es-malaga',1972,1972,'education',
        'Высшее образование в Малаге','Higher education in Málaga',
        'Экономический факультет, ранее входивший в Университет Гранады, включили в новый университет; его учебный округ соответствовал провинции Малага.',
        'The economics faculty previously attached to Granada joined the new university, whose district corresponded to Málaga province.',ev))

    ev = evidence(fire,'Fotografías del incendio de la Universidad de Oviedo',
        'Universidad de Oviedo AFUO.GP-Alb.1-1','1934-10-13','es','photograph',
        'Пожар здания университета в Овьедо, идентифицированный и датированный институциональной карточкой; видимые дым и повреждение.',locator='Ficha442; imagen e748a934dc3c4146a0c1342c3f823e4d3c098133.jpg')
    events.append(event('ES','oviedo-1934-university-fire','1934-10-13','es-oviedo',
        'Пожар университета в Овьедо','Fire at Oviedo University',
        'Во время октябрьских событий 1934 года в Овьедо горело здание университета. Архивная фотография сохранила вид пожара.',
        'During the October 1934 events in Oviedo, the university building caught fire. An archival photograph records the fire.',ev,category='war_conflict',sensitive=True))
    ev = evidence(rebuild,'Orden de12 de diciembre de1939: Junta de Reconstrucción de Oviedo',
        'BOE349,15.12.1939, p.7043, artículo único','1939-12-15','es','legal_publication',
        'Передача документов и средств упразднённого органа помощи в распоряжение Junta de Reconstrucción de Oviedo.',locator='p.7043, Ministerio de la Gobernación, artículo único')
    events.append(event('ES','oviedo-1939-reconstruction-funds','1939-12-15','es-oviedo',
        'Средства для реконструкции Овьедо','Funds for Oviedo reconstruction',
        'Опубликован приказ передать совету реконструкции Овьедо документы и средства прежнего органа помощи пострадавшим.',
        'An order directed the transfer of the former relief body\'s documents and funds to Oviedo\'s reconstruction board.',ev,category='housing_urban'))

    ev = evidence(plan,'Plan de urbanización de Oviedo, Germán Valentín y García Noblejas',
        'Revista Nacional de Arquitectura, año1, núm.4(1941), pp.3–50','1941','es','administrative_report',
        'Опубликованный авторами план реконструкции и описания существовавших городских служб; проектируемые работы отделены от выполненных.',locator='printed pp.25–26,28,30,36; contents p.1')
    events.append(event('ES','oviedo-1941-urban-plan-publication','1941','es-oviedo',
        'Публикация плана реконструкции Овьедо','Publication of Oviedo reconstruction plan',
        'Архитектурный журнал опубликовал план реконструкции Овьедо, включавший жилые кварталы, городские службы и транспортные связи.',
        'An architectural journal published Oviedo\'s reconstruction plan, covering housing, municipal services and transport links.',ev,category='housing_urban'))
    contexts.append(context('ES','oviedo-1941-housing-observation','es-oviedo',1941,1941,'housing',
        'Жильё в описании реконструкции Овьедо','Housing in the Oviedo reconstruction account',
        'Авторы плана отмечали внутренние тёмные комнаты в старом жилье и необходимость беречь сохранившиеся после войны дома.',
        'The planners described dark internal rooms in older housing and the need to retain houses surviving the war.',ev))
    contexts.append(context('ES','oviedo-1941-post-and-telephone','es-oviedo',1941,1941,'communication',
        'Почта и телефон в Овьедо','Post and telephone in Oviedo',
        'Описание плана помещает почту в арендованный дом на улице Кампоманес, телефонную централь на площади Порльер.',
        'The plan account locates the post office in rented premises on Campomanes street and the telephone exchange on Porlier square.',ev))

    save_batch('ES','spain',events,contexts)
    print('Spain local documents: %d events, %d contexts; registry checkpointed.' % (len(events),len(contexts)))


if __name__=='__main__':
    main()
