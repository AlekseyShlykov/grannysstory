"""Spain-only, document-led local cultural and labour records. No copied speeches or images."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from records import source, evidence, event, context, save_batch


def register(identifier, title, url, publisher, notes, language='es'):
    return source('ES',identifier,title,url,language,publisher=publisher,accessed_on='2026-11-17',notes=notes)


def main():
    expo = register('es_barcelona_exposition_newspaper_1929','El Mundo Deportivo,20.05.1929, portada',
        'https://hemeroteca-paginas.mundodeportivo.com/EMD02/HEM/1929/05/20/MD19290520-001.pdf',
        'Hemeroteca de Mundo Deportivo',
        'Прочитана оригинальная первая полоса, в том числе визуально. Заголовок сообщает об открытии выставки вчера; '
        'выпуск понедельника20.05.1929, значит церемония19.05. Это отделено от встречающейся в современных справках '
        'даты20.05. На фото стадион: подпись говорит о предстоящем открытии сегодня, поэтому не смешивать две церемонии. '
        'Торжественные оценки монархии не перенесены, изображение и газетная проза не публикуются.')
    autonomy = register('es_barcelona_university_autonomy_1933','Decreto de1 de junio de1933: autonomía de la Universidad de Barcelona',
        'https://www.boe.es/gazeta/dias/1933/06/02/pdfs/GMD-1933-153.pdf',
        'Agencia Estatal Boletín Oficial del Estado / Gazeta',
        'Прочитан декрет на с.1630–1631, arts.1–9. Подписан01.06.1933, опубликован02.06; не подменять его '
        'последующим университетским статутом. Art.5 устанавливает сосуществование кастильского и каталонского '
        'в равенстве прав для преподавателей и учащихся. Контекст ограничен1933: дальнейшие приостановления ещё изучаются. '
        'Это Университет Барселоны, не основанная в1968 UAB с кампусом в Бельятерре.')
    workers = register('es_barcelona_seat_workers_bulletin_1974','Asamblea Obrera, número120,11.11.1974, página1',
        'https://hemeroteca.fundacionlito.es/admin/pdf2/FFLC_Asamblea_Obrera_%281974%29_19741111%20-%2000001.pdf',
        'Fundación Francisco Largo Caballero, Hemeroteca',
        'Одна страница оригинального рабочего бюллетеня скачана и прочитана визуально; número120 и дата11.11.74 '
        'на листе. Заголовок призывает к общей стачке в Барселоне и окрестностях; текст сообщает о собрании '
        'рабочих SEAT на площади Каталонии и требованиях занятости. Численность и политические обвинения '
        'авторов не принимаются за независимо установленные факты. Verified относится к публикации и содержанию '
        'требований, не к всеобщему участию жителей или личной роли героини. Исследована только страница1.')
    urban = register('es_barcelona_comarcal_plan_law_1953','Ley de3 de diciembre de1953 sobre ordenación urbana de Barcelona y su comarca',
        'https://www.boe.es/gazeta/dias/1953/12/05/pdfs/BOE-1953-339.pdf',
        'Agencia Estatal Boletín Oficial del Estado / Gazeta',
        'Прочитаны только с.7180–7181, arts.1–11 и вступление. Закон03.12, публикация05.12.1953; '
        'точная дата вступления не извлечена, событие о публикации. Art.3 перечисляет муниципалитеты плана, '
        'не всю провинцию. Запись региональная в пакете провинции с явным ограничением Barcelona y su comarca, '
        'не копия национального события для каждого города. Предусмотренные жильё и зелёные пространства '
        'не объявляются уже построенными; аннексия всех муниципалитетов не следует из закона.')
    madrid_art = register('es_madrid_reina_sofia_opening_1986','El País,27.05.1986, Cultura: apertura del Centro Reina Sofía',
        'https://elpais.com/diario/1986/05/27/cultura/517528810_850215.html','El País / archivo de prensa',
        'Прочитан доступный текст датированной газетной статьи о церемонии накануне. '
        'Центр искусств1986 отделён от последующего статуса национального музея. Прогнозы автора и цитаты не извлекаются.')
    madrid_war = register('es_madrid_fire_service_history_1936','Guerra Civil1936, historia del Cuerpo de Bomberos',
        'https://www.madrid.es/portales/munimadrid/es/Inicio/Emergencias-y-seguridad/Guerra-Civil-1936/?vgnextchannel=f9cd31d3b28fe410VgnVCM1000000b205a0aRCRD&vgnextoid=a5debba6308b6210VgnVCM2000000c205a0aRCRD',
        'Ayuntamiento de Madrid / Cuerpo de Bomberos',
        'Прочитан современный институциональный очерк, абзацы о ноябре1936–весне1937. Это вторичная опора, '
        'не архивный оперативный журнал. Изображение не объявляется отдельно проверенным первичным источником. '
        'Личные потери и свидетельство героини не назначаются.')
    sol = register('es_madrid_sol_inauguration_2009','Cordialidad institucional en la estación de Sol, Soledad Alcaide,28.06.2009',
        'https://elpais.com/diario/2009/06/28/madrid/1246188256_850215.html','El País / archivo de prensa',
        'Прочитана современная событию статья; ayer относит церемонию к27.06.2009. '
        'Не смешивать с запуском пассажирского движения28.06.2009; здесь событие только церемонии. '
        'Партийные характеристики и прогноз пассажиропотока не извлекаются.')
    picasso = register('es_malaga_picasso_inauguration_2003','Inauguration of the Museo Picasso Málaga on Monday27October',
        'https://www.museopicassomalaga.org/en/prensa/el-picasso-de-los-picasso-the-picasso-s-picassos-1',
        'Museo Picasso Málaga / Press Office',
        'Открыт и прочитан собственный пресс-релиз музея с датой27.10.2003, раздел открытия и первых коллекций. '
        'Первичный документ организатора; открытие во дворце Buenavista и временная выставка. '
        'Не приравнивать церемонию27.10 к первому дню общего посещения28.10. '
        'Современные всплывающие меню и данные2026 не относятся к записи; иллюстрации и авторский текст не публикуются.',language='en')

    events, contexts = [], []
    ev = evidence(expo,'El Mundo Deportivo,20 de mayo de1929, portada',
        'El Mundo Deportivo, añoXXIII, núm.2149,20.05.1929, p.1','1929-05-20','es','contemporary_newspaper',
        'Сообщение об открытии Международной выставки в Барселоне накануне19.05.1929.',locator='p.1, headline and first two columns')
    events.append(event('ES','barcelona-1929-international-exposition','1929-05-19','es-barcelona',
        'Открытие Международной выставки в Барселоне','Opening of Barcelona International Exposition',
        'В Барселоне состоялось торжественное открытие Международной выставки на Монжуике. Газета следующего дня описала церемонию.',
        'Barcelona held the opening ceremony of the International Exposition at Montjuïc, reported in the following day\'s newspaper.',ev,category='culture_leisure'))
    ev = evidence(autonomy,'Decreto otorgando autonomía a la Universidad de Barcelona',
        'Gaceta153,02.06.1933, pp.1630–1631, arts.1–9','1933-06-02','es','legal_publication',
        'Автономия университета и равенство кастильского и каталонского в будущем статуте, art.5.',locator='pp.1630–1631; arts.1,2,5,6')
    events.append(event('ES','barcelona-1933-university-autonomy-decree','1933-06-02','es-barcelona',
        'Декрет об автономии Университета Барселоны','Barcelona University autonomy decree',
        'Опубликован декрет об автономии Университета Барселоны. Управление передавалось попечительскому совету с представителями Республики и Женералитата.',
        'A decree granting Barcelona University autonomy was published, establishing a board with representatives of the Republic and Generalitat.',ev,category='education'))
    contexts.append(context('ES','barcelona-1933-university-languages','es-barcelona',1933,1933,'education',
        'Два языка в университетском декрете','Two languages in the university decree',
        'Декрет требовал обеспечить в университетском статуте равенство прав каталонского и кастильского языков и свободу выбора языка преподавателями и учащимися.',
        'The decree required the university statute to ensure equal rights for Catalan and Castilian and freedom of language choice for teachers and students.',ev))
    ev = evidence(workers,'Asamblea Obrera120: Realicemos la huelga general en Barcelona y comarca',
        'Fundación Francisco Largo Caballero, Asamblea Obrera120,11.11.1974, p.1','1974-11-11','es','contemporary_newspaper',
        'Бюллетень рабочих SEAT сообщал о собрании на площади Каталонии и требовал гарантий занятости.',locator='p.1, masthead, opening paragraphs and demands1–2')
    events.append(event('ES','barcelona-1974-seat-workers-bulletin','1974-11-11','es-barcelona',
        'Рабочий бюллетень SEAT о стачке в Барселоне','SEAT workers\' bulletin on the Barcelona strike',
        'Бюллетень Asamblea Obrera сообщал о собрании рабочих SEAT на площади Каталонии и требовал гарантий рабочих мест и отмены взысканий.',
        'Asamblea Obrera reported a SEAT workers\' assembly in Plaça de Catalunya and demanded job guarantees and cancellation of sanctions.',ev,category='labor'))
    contexts.append(context('ES','barcelona-1974-job-security-demands','es-barcelona',1974,1974,'work',
        'Занятость в требованиях рабочих SEAT','Job security in SEAT workers\' demands',
        'Сохранение рабочих мест и покупательной способности было частью требований, опубликованных рабочим бюллетенем. Это были требования, а не гарантированные условия труда.',
        'Job security and purchasing power featured in the workers\' bulletin as demands, rather than guaranteed employment conditions.',ev))
    ev = evidence(urban,'Ley de3 de diciembre de1953 sobre ordenación urbana de Barcelona y su comarca',
        'BOE339,05.12.1953, pp.7180–7181, arts.1–11','1953-12-05','es','legal_publication',
        'Утверждение плана Барселоны и перечисленных окрестных муниципалитетов; создание комиссии градостроительства.',locator='pp.7180–7181; arts.1,3–5')
    events.append(event('ES','barcelona-area-1953-urban-plan-law','1953-12-05','es-province-barcelona',
        'Публикация закона о плане Барселоны и окрестностей','Publication of the Barcelona-area planning law',
        'Закон утвердил план Барселоны и перечисленных соседних муниципалитетов. Для его исполнения создавалась градостроительная комиссия; присоединение этих муниципалитетов к городу не требовалось.',
        'A law approved a plan for Barcelona and listed neighbouring municipalities, establishing a planning commission without requiring their annexation to the city.',ev,category='housing_urban',scope='regional'))
    contexts.append(context('ES','barcelona-area-1953-housing-planning','es-province-barcelona',1953,1953,'housing',
        'Жильё и планирование окрестностей Барселоны','Housing and Barcelona-area planning',
        'Закон о плане Барселоны и окрестностей ставил вопросы участков под жильё, зелёных пространств и общественных зданий.',
        'The Barcelona-area planning law addressed land for housing, green spaces and public buildings.',ev))

    ev = evidence(madrid_art,'El Centro Reina Sofía se abre como lugar de encuentro del arte español con la creación artística internacional',
        'El País,27.05.1986, Cultura, archivo517528810_850215','1986-05-27','es','contemporary_newspaper',
        'Открытие Центра искусств Рейна-София в Аточе накануне26.05.1986.',locator='opening paragraph: inauguró ayer')
    events.append(event('ES','madrid-1986-reina-sofia-art-centre','1986-05-26','es-madrid',
        'Открытие Центра искусств Рейна-София','Opening of the Reina Sofía art centre',
        'В районе Аточа открылся Центр искусств Рейна-София с выставкой испанского и зарубежного искусства.',
        'The Reina Sofía art centre opened in Atocha with an exhibition of Spanish and international art.',ev,category='culture_leisure'))
    ev = evidence(madrid_war,'Guerra Civil1936, historia del Cuerpo de Bomberos',
        'Ayuntamiento de Madrid, portal Emergencias y seguridad, Guerra Civil1936','sin fecha indicada','es','historical_study',
        'Бомбардировки Мадрида с ноября1936 до весны1937, согласно истории городской пожарной службы.',primary=False,locator='paragraph beginning Desde principios de noviembre')
    events.append(event('ES','madrid-1936-bombardments','1936-11','es-madrid',
        'Бомбардировки Мадрида','Bombardments of Madrid',
        'Мадрид подвергался бомбардировкам во время боёв за город. История пожарной службы описывает их с ноября 1936 года до весны 1937 года.',
        'Madrid faced bombardments during the battle for the city. The fire service history describes attacks from November 1936 to spring 1937.',ev,category='war_conflict',sensitive=True))
    events[-1]['end_date']='1937'
    ev = evidence(sol,'Cordialidad institucional en la estación de Sol',
        'Soledad Alcaide, El País,28.06.2009, Madrid, archivo1246188256_850215','2009-06-28','es','contemporary_newspaper',
        'Церемония открытия станции Соль27.06.2009.',locator='opening paragraphs: ayer and inauguración de Sol')
    events.append(event('ES','madrid-2009-sol-inauguration','2009-06-27','es-madrid',
        'Церемония открытия железнодорожной станции Соль','Sol railway station inauguration',
        'В центре Мадрида состоялась церемония открытия новой станции пригородной железной дороги Соль.',
        'Madrid held the inauguration of the new Sol suburban railway station in the city centre.',ev))
    ev = evidence(picasso,'Inauguration of the Museo Picasso Málaga on Monday27October',
        'Museo Picasso Málaga, Press Office,27.10.2003, inauguration release','2003-10-27','en','administrative_report',
        'Открытие музея Пикассо во дворце Buenavista27.10.2003 и первая временная выставка.',locator='dated release, opening paragraphs')
    events.append(event('ES','malaga-2003-picasso-museum-inauguration','2003-10-27','es-malaga',
        'Открытие музея Пикассо в Малаге','Inauguration of Museo Picasso Málaga',
        'Во дворце Буэнависта в Малаге состоялось открытие музея Пикассо с постоянной коллекцией и первой временной выставкой.',
        'Museo Picasso Málaga was inaugurated in the Palacio de Buenavista, with a permanent collection and its first temporary exhibition.',ev,category='culture_leisure'))
    contexts.append(context('ES','malaga-2003-museum-exhibitions','es-malaga',2003,2003,'leisure_culture',
        'Выставки в музее Пикассо','Exhibitions at Museo Picasso Málaga',
        'В новом музее постоянную коллекцию дополняла временная выставка произведений из других музеев и частных собраний.',
        'The new museum combined its permanent collection with a temporary exhibition of loans from other museums and private collections.',ev))

    save_batch('ES','spain',events,contexts)
    print('Spain culture/labour: %d events, %d contexts.' % (len(events),len(contexts)))


if __name__=='__main__':
    main()
