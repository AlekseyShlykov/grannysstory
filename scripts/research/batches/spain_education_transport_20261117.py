"""Reviewed Spain-only batch: educational reports, transport and municipal development."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from records import source, evidence, event, context, save_batch

DAY = '2026-11-17'


def register(identifier, title, url, publisher, notes, language='es', status='accessed'):
    return source('ES', identifier, title, url, language, publisher=publisher,
                  accessed_on=DAY, notes=notes, status=status)


def main():
    annual = register('es_oviedo_anales_tomo_2', 'Anales de la Universidad de Oviedo, tomo II',
        'https://digibuo.uniovi.es/dspace/bitstream/handle/10651/5290/000000662825_Tomo_02.pdf?isAllowed=y&sequence=32',
        'Universidad de Oviedo / Repositorio Institucional de la Universidad de Oviedo',
        'Обычное открытие web дало тайм-аут; публичный PDF успешно скачан без обхода ограничений. '
        'Прочитаны Las clases populares, pp.276–280 (PDF280–284), Las colonias escolares, pp.281–285 (PDF285–289), '
        'оглавление и колофон. На последнем листе дата окончания печати04.01.1904, а не1903. '
        'Это отчёты организаторов о курсах1901–1903. Школьная поездка организована в Овьедо, место отдыха Salinas '
        'не объявляется частью города. Устаревшие диагнозы, данные названных детей и заявления о лечебном результате не извлекаются.')
    railway = register('es_oviedo_railway_tender_1925',
        'Compañía de los Ferrocarriles Económicos de Asturias: concurso de cambios de vía',
        'https://www.boe.es/gazeta/dias/1925/12/16/pdfs/C00585-00592.pdf',
        'Agencia Estatal Boletín Oficial del Estado / Gazeta',
        'Прочитано оригинальное объявление на с.589 (PDF5), дата подписи10.12.1925, публикация16.12. '
        'Шесть стрелочных переводов для соединения двух станций Овьедо: пять у Ferrocarriles Económicos и один у Vasco-Asturiana. '
        'Это конкурс на поставку, не доказательство открытия линии или поставки. OCR искажён; прочитано также изображение страницы.')
    awards = register('es_oviedo_awards_speech_1981', 'Premios Príncipe de Asturias1981–2014. Discursos: Discurso I',
        'https://www.fpa.es/files/flippingbook/Discursos/files/assets/common/downloads/publication.pdf?uni=0d98916224f4ca33c3d440eddeb2b45c',
        'Fundación Princesa de Asturias',
        'Прочитаны титул, описание издания и раздел Discurso I: дата03.10.1981 и место Oviedo/Teatro Campoamor '
        '(PDF59–67; текст речи PDF67). Оригинальная речь1981 воспроизведена фондом в сборнике, напечатанном вянваре2016. '
        'Используется как документ состоявшейся церемонии; цитаты, фото EFE и формулы речи в игру не копируются.')
    heritage = register('es_oviedo_unesco_extension_1998', 'Decision22 COM VIII.B.2: Monuments of Oviedo and the Kingdom of the Asturias',
        'https://whc.unesco.org/en/decisions/2785', 'UNESCO World Heritage Centre',
        'Прочитан текст решения: расширение объекта312bis с включением Cámara Santa, San Julián de los Prados '
        'и La Foncalada в Овьедо. Год1998; точный день принятия из карточки не установлен. '
        'Решение1985 не подменяется этим расширением; посещение героиней не подразумевается.',language='en')
    buses = register('es_oviedo_feder_final_report_2011', 'Programa Operativo Integrado de Asturias2000–2006. Informe final',
        'https://www.fondoseuropeos.hacienda.gob.es/sitios/dgfc/es-ES/ipr/fcpp0006/fe/f/ro1/gsc/pir/Documents/Informe%20final%20POI%20Asturias%20FEDER%202000-2006.pdf',
        'Ministerio de Economía y Hacienda, Dirección General de Fondos Comunitarios',
        'Прочитаны титул/датаabril2011 и с.175–176 (PDF179–180), medida6.6: завершение автобусной станции Овьедо '
        'в2003 на месте прежней станции Ferrocarriles Económicos;44крытых посадочных места. Это отчёт выполнения '
        'инвестиционного проекта, не современный общий исторический очерк. Остальные478страниц прочитанными не заявляются.')
    park = register('es_malaga_technology_park_funding_1992', 'Acuerdo de8 de septiembre de1992: aportación al Parque Tecnológico de Andalucía',
        'https://www.juntadeandalucia.es/boja/1992/110/24', 'Junta de Andalucía / BOJA',
        'Прочитан текст первичного Acuerdo в BOJA110,29.10.1992: ратифицирован взнос300миллионов песет. '
        'Дата решения08.09.1992, публикация29.10. Наличие сайта-предупреждения о юридической силе '
        'HTML отмечено; текст используется как историческая публикация, не правовая консультация. '
        'Решение не доказывает дату открытия парка или число рабочих мест.')
    border = register('es_malaga_torremolinos_decree_1988', 'Decreto283/1988: segregación de Torremolinos del municipio de Málaga',
        'https://www.boe.es/boe/dias/1989/01/19/pdfs/A01567-01568.pdf',
        'Agencia Estatal Boletín Oficial del Estado',
        'Прочитан оригинальный Decreto283/1988,27.09.1988, arts.1–4, напечатанный в BOE16,19.01.1989, с.1567. '
        'Решение выделяет Torremolinos и делит имущество/обязательства. BOJA79,11.10.1988 указана IECA как ранняя публикация, '
        'но оригинальный BOJA пока не прочитан; точный день фактического административного перехода не установлен. '
        'Событие датируется принятием декрета, не датой вступления. В преамбуле есть противоречивые упоминания1923/1924; '
        'они не превращены в новую точную границу. География города сохраняет needs_review.')
    register('es_oviedo_bop_1910_access_lead', 'Boletín Oficial de la Provincia de Oviedo, número82,14.04.1910',
        'https://prensahistorica.mcu.es/es/consulta/registro.do?formato=ficha_comprende&id=10004064364',
        'Biblioteca Virtual de Prensa Histórica / Biblioteca de Asturias',
        'Открытие17.11.2026 вернуло HTTP429. Повторных запросов и обхода нет; поисковый фрагмент не считается '
        'чтением содержания. События не извлечены.',status='inaccessible')

    events, contexts = [], []
    ev = evidence(annual,'Adolfo Posada, Las clases populares de la Universidad de Oviedo',
        'Anales, tomoII, pp.276–280; colofón04.01.1904','1904-01-04','es','administrative_report',
        'Первый опыт курсов1901–1902, бесплатная запись и обсуждение программы с представителями рабочих.',locator='printed pp.277–279, PDF281–283')
    events.append(event('ES','oviedo-1901-popular-classes','1901','es-oviedo',
        'Занятия для рабочих при университете Овьедо','Classes for workers at Oviedo University',
        'В 1901–1902 учебном году университет организовал занятия с бесплатной записью, предварительно обсудив программу с представителями рабочих.',
        'In the 1901–1902 academic year the university organised classes with free enrolment, after consulting workers\' representatives about the programme.',ev,category='education'))
    events[-1]['end_date']='1902'
    contexts.append(context('ES','oviedo-1901-workers-evening-study','es-oviedo',1901,1903,'education',
        'Учёба после работы в Овьедо','Study after work in Oviedo',
        'Участники занятий просили изменить расписание: ежедневная работа затрудняла домашнюю подготовку. Организаторы согласовывали уроки с вечерним рисованием.',
        'Participants asked to revise the timetable because daily work limited preparation at home. Organisers coordinated the classes with evening drawing lessons.',ev))
    ev = evidence(annual,'Juan Antonio Fandiño, Las colonias escolares de Oviedo',
        'Anales, tomoII, pp.281–287; colofón04.01.1904','1904-01-04','es','administrative_report',
        'Отчёт директора о21ребёнке, отправленном из Овьедо в школьную колонию в Салинасе летом1902.',locator='printed p.284, PDF288')
    events.append(event('ES','oviedo-1902-school-holiday-colony','1902','es-oviedo',
        'Школьная поездка из Овьедо в Салинас','School holiday trip from Oviedo to Salinas',
        'Организаторы школьной колонии Овьедо отчитались о поездке 21 ребёнка в Салинас летом 1902 года.',
        'The organisers of Oviedo\'s school holiday colony reported taking 21 children to Salinas in summer 1902.',ev,category='education'))
    contexts.append(context('ES','oviedo-1902-school-holiday','es-oviedo',1902,1902,'leisure_culture',
        'Школьный отдых за пределами Овьедо','School holidays outside Oviedo',
        'Городская школьная колония давала небольшой группе детей возможность провести время на пляже Салинаса.',
        'The city\'s school holiday colony offered a small group of children time at Salinas beach.',ev))

    ev = evidence(railway,'Concurso para el suministro de cambios de vía',
        'Gaceta350, AnexoI,16.12.1925, p.589, anuncioX-3587','1925-12-16','es','contemporary_newspaper',
        'Конкурс на шесть стрелочных переводов для соединения двух станций Овьедо; не открытие линии.',locator='p.589, PDF5, centro y derecha')
    events.append(event('ES','oviedo-1925-station-link-tender','1925-12-16','es-oviedo',
        'Поставка оборудования для связи станций Овьедо','Equipment tender for the Oviedo station link',
        'Компания Ferrocarriles Económicos de Asturias объявила конкурс на стрелочные переводы для железнодорожной связи двух станций Овьедо.',
        'Ferrocarriles Económicos de Asturias invited tenders for points for the railway link between two Oviedo stations.',ev))
    ev = evidence(awards,'DiscursoI, Oviedo, Teatro Campoamor,3 de octubre de1981',
        'Fundación Princesa de Asturias, Discursos1981–2014, DiscursoI, pp.1–7','1981-10-03','es','government_document',
        'Состоявшаяся церемония премий Príncipe de Asturias в Teatro Campoamor, Овьедо.',locator='PDF59–67; speech PDF67; edition2016')
    events.append(event('ES','oviedo-1981-asturias-prizes','1981-10-03','es-oviedo',
        'Церемония премий принца Астурийского в Овьедо','Prince of Asturias Awards ceremony in Oviedo',
        'В театре Кампоамор в Овьедо прошла церемония вручения премий принца Астурийского. Датированная речь сохранила свидетельство этого события.',
        'The Prince of Asturias Awards ceremony took place at Oviedo\'s Campoamor Theatre, documented by the dated speech.',ev,category='culture_leisure'))
    ev = evidence(heritage,'Decision22 COM VIII.B.2',
        'UNESCO,22 COM VIII.B.2, property312bis','1998','en','government_document',
        'Включение Cámara Santa, San Julián de los Prados и La Foncalada в Овьедо при расширении объекта.',locator='Decision text, paragraph1')
    events.append(event('ES','oviedo-1998-world-heritage-extension','1998','es-oviedo',
        'Расширение списка памятников Овьедо под охраной ЮНЕСКО','Extension of Oviedo World Heritage listing',
        'Комитет Всемирного наследия включил Камара-Санта, Сан-Хулиан-де-лос-Прадос и фонтан Ла-Фонкалада в расширенный объект наследия.',
        'The World Heritage Committee added Cámara Santa, San Julián de los Prados and La Foncalada to the extended property.',ev,category='culture_leisure'))
    ev = evidence(buses,'Programa Operativo Integrado de Asturias2000–2006, Informe final',
        'DG Fondos Comunitarios, Informe final abril2011, medida6.6, pp.175–176','2011-04','es','administrative_report',
        'Завершение строительства автобусной станции Овьедо в2003 и44крытые посадочные площадки.',locator='printed pp.175–176, PDF179–180')
    events.append(event('ES','oviedo-2003-bus-station-completion','2003','es-oviedo',
        'Завершение строительства автовокзала Овьедо','Completion of Oviedo bus station',
        'В Овьедо завершили строительство автовокзала на месте прежней станции Ferrocarriles Económicos.',
        'Oviedo\'s bus station was completed on the site of the former Ferrocarriles Económicos station.',ev))
    contexts.append(context('ES','oviedo-2003-bus-station-facilities','es-oviedo',2003,2009,'transport',
        'Автовокзал и повседневные поездки','The bus station and everyday travel',
        'Автовокзал включал кассы, зал ожидания, камеру хранения, кафе и 44 крытые посадочные площадки.',
        'The bus station included ticket offices, waiting areas, luggage storage, a café and 44 covered boarding bays.',ev))

    ev = evidence(park,'Acuerdo de8 de septiembre de1992',
        'BOJA110,29.10.1992, disposición24','1992-10-29','es','legal_publication',
        'Ратификация дополнительного взноса300миллионов песет для Parque Tecnológico de Andalucía en Málaga.',locator='ACUERDO, párrafo único')
    events.append(event('ES','malaga-1992-technology-park-funding','1992-09-08','es-malaga',
        'Дополнительное финансирование технологического парка Малаги','Additional funding for Málaga technology park',
        'Правительство Андалусии утвердило дополнительный взнос в 300 миллионов песет для технологического парка в Малаге.',
        'Andalusia\'s government ratified an additional contribution of 300 million pesetas to the technology park in Málaga.',ev,category='local_economy'))
    ev = evidence(border,'Decreto283/1988, de27 de septiembre',
        'BOE-A-1989-1397, BOE16,19.01.1989, p.1567, arts.1–4','1989-01-19','es','legal_publication',
        'Решение27.09.1988 о выделении Торремолиноса из муниципалитета Малага в самостоятельный муниципалитет.',locator='p.1567, arts.1–4')
    events.append(event('ES','malaga-1988-torremolinos-segregation-decree','1988-09-27','es-malaga',
        'Декрет о выделении Торремолиноса из Малаги','Decree separating Torremolinos from Málaga',
        'Правительство Андалусии приняло декрет о выделении Торремолиноса из муниципалитета Малага. Документ предусматривал раздел территории, имущества и обязательств.',
        'Andalusia\'s government adopted a decree separating Torremolinos from Málaga municipality, with provisions for dividing territory, assets and liabilities.',ev,category='border_administrative'))

    save_batch('ES','spain',events,contexts)
    print('Spain education/transport: %d events, %d contexts.' % (len(events),len(contexts)))


if __name__=='__main__':
    main()
