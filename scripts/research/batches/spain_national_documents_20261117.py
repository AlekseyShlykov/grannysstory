"""Read original Spanish legislation: legal rules, not assumed personal outcomes."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from records import source, evidence, event, context, save_batch


# source id, title, URL, document date, locator, verification note,
# event id/date/category, RU/EN titles and summaries, context kind.
DOCUMENTS = [
    ('es_accidents_law_1900_reprint', 'Ley de accidentes del trabajo, 30 de enero de 1900',
     'https://www.boe.es/datos/pdfs/BOE/1900/119/A00495-00496.pdf', '1900-01-30',
     'Gaceta de Madrid 119, 29.04.1900, pp.495–496, arts.1–4 and signature',
     'Прочитан PDF, повторная публикация после исчерпания тиражей31.01 и09.02. Дата закона30.01 в подписи. '
     'Статьи1–4 ограничивают охват видами труда и определяют ответственность работодателя; не всеобщая страховка.',
     '1900-industrial-accidents-law', '1900-01-30', 'labor',
     'Ответственность работодателей за производственные травмы', 'Employers’ liability for industrial accidents',
     'Закон установил ответственность работодателей за производственные травмы в перечисленных отраслях и правила компенсации пострадавшим работникам.',
     'The law established employers’ liability for work injuries in specified industries and rules for compensating injured workers.', 'work'),
    ('es_women_children_law_1900', 'Ley de 13 de marzo de 1900 sobre trabajo de mujeres y niños',
     'https://www.boe.es/gazeta/dias/1900/03/14/pdfs/GMD-1900-73.pdf', '1900-03-13',
     'Gaceta de Madrid 73, 14.03.1900, pp.875–876, especially art.9',
     'Прочитан оригинал, в том числе статья9. В оригинале три недели после родов, а в сборнике1907 '
     'уже четыре–шесть после поправки1906: позднюю редакцию не переносить в1900. '
     'Час для кормления нельзя вычитать из оплаты; оплаченный отпуск в целом законом здесь не подтверждён.',
     '1900-maternity-work-protection', '1900-03-13', 'women_rights',
     'Защита места работы после родов', 'Job protection after childbirth',
     'Закон запрещал труд женщин в течение трёх недель после родов, предусматривал сохранение места и час в рабочем дне для кормления ребёнка без вычета из заработка.',
     'The law prohibited women’s work for three weeks after childbirth, provided job protection and an hour during the working day for nursing without a wage deduction.', 'family_marriage'),
    ('es_women_matriculation_order_1910', 'Real orden de 8 de marzo de 1910 sobre matrícula de mujeres',
     'https://www.boe.es/gazeta/dias/1910/03/09/pdfs/GMD-1910-68.pdf', '1910-03-08',
     'Gaceta de Madrid 68, 09.03.1910, pp.497–498, order signed Romanones',
     'PDF скачан обычным запросом и прочитан после отказа web-инструмента из-за размера. '
     'Отменена необходимость отдельного обращения к начальству при женской официальной matrícula; '
     'это не первая женщина в университете и не отмена всех социальных препятствий.',
     '1910-women-official-enrolment', '1910-03-08', 'education',
     'Женское поступление без отдельного разрешения министерства', 'Women’s enrolment without individual ministry permission',
     'Учебным заведениям разрешили принимать заявления женщин на официальное обучение по общим правилам, без отдельного согласования каждого случая с начальством.',
     'Educational institutions could enrol women under the general rules without referring each application for individual approval by higher authorities.', 'education'),
    ('es_eight_hour_decree_1919', 'Real decreto de 3 de abril de 1919 sobre jornada máxima legal',
     'https://www.boe.es/gazeta/dias/1919/04/04/pdfs/GMD-1919-94.pdf', '1919-04-03',
     'Gaceta de Madrid 94, 04.04.1919, p.42, arts.1–4',
     'Прочитан первый декрет наp.42. Восемь часов в день ИЛИ48 в неделю с01.10.1919; '
     'статьи2–4 предусматривают разбор исключений. Следующий декрет о ночной работе пекарен не смешивается с этим.',
     '1919-eight-hour-day', '1919-10-01', 'labor',
     'Вступление в силу восьмичасового рабочего дня', 'Eight-hour working-day rule takes effect',
     'Для труда установили общую предельную продолжительность восемь часов в день или сорок восемь в неделю. Декрет предусматривал отдельное рассмотрение отраслевых исключений.',
     'A general limit of eight working hours a day or forty-eight a week took effect. The decree provided a procedure for considering industry-specific exceptions.', 'work'),
    ('es_urban_rents_decree_1920', 'Real decreto de 21 de junio de 1920 sobre arrendamientos urbanos',
     'https://www.boe.es/gazeta/dias/1920/06/22/pdfs/GMD-1920-174.pdf', '1920-06-21',
     'Gaceta de Madrid 174, 22.06.1920, arts.1–7',
     'Прочитаны статьи1–7 в текстовом представлении BOE; PDF получен, OCR тяжело повреждён. '
     'Охват: столицы провинций и города свыше20000 жителей. Продление договоров с исключениями, '
     'регулируемые повышения, а не бессрочный запрет любого роста любой аренды.',
     '1920-urban-rent-protection', '1920-06-22', 'housing_urban',
     'Защита действующих договоров городской аренды', 'Protection for existing urban tenancies',
     'В столицах провинций и крупных городах действующие договоры городской аренды подлежали обязательному продлению для владельцев. Декрет оговаривал исключения и допустимые изменения платы.',
     'Existing urban tenancies in provincial capitals and larger towns were subject to compulsory renewal for landlords, with specified exceptions and permitted rent changes.', 'housing'),
    ('es_compulsory_sickness_law_1942', 'Ley de 14 de diciembre de 1942: Seguro obligatorio de enfermedad',
     'https://www.boe.es/gazeta/dias/1942/12/27/pdfs/BOE-1942-361.pdf', '1942-12-14',
     'BOE361, 27.12.1942, pp.10592–10593, arts.1–9',
     'Прочитаны статьи1–9. Закон для работников с доходами ниже нормативного предела и оговорёнными '
     'исключениями, а не бесплатная медицина для всех. Событие — публикация закона, не начало фактических выплат. '
     'Пропагандистское предисловие не принимается как описание результатов системы.',
     '1942-compulsory-sickness-insurance-law', '1942-12-27', 'healthcare',
     'Закон об обязательном страховании на случай болезни', 'Compulsory sickness-insurance law published',
     'Опубликован закон о страховании на случай болезни и материнства для работников с ограниченными доходами. Правила определяли круг застрахованных, зависимых членов семьи и исключения.',
     'A law established sickness and maternity insurance for workers with limited earnings, defining insured groups, dependent relatives and exclusions.', 'healthcare'),
    ('es_primary_education_law_1945', 'Ley de 17 de julio de 1945 sobre Educación Primaria',
     'https://www.boe.es/datos/pdfs/BOE/1945/199/A00385-00416.pdf', '1945-07-17',
     'BOE199, 18.07.1945, pp.388–389, arts.5–7,12–14',
     'Карточка без текста; открыт исходный32-страничный PDF. Прочитаны основные принципы, обязательность '
     'и разделение полов. Католическое и националистическое содержание — требования режима, не позиция проекта. '
     'Не заявляется фактическое посещение школы каждым ребёнком.',
     '1945-primary-education-law', '1945-07-18', 'education',
     'Правила начальной школы при диктатуре', 'Primary-school rules under the dictatorship',
     'Опубликован закон о начальной школе с обязательным религиозным и государственно-патриотическим воспитанием, преподаванием испанского языка и разделением мальчиков и девочек.',
     'The primary-school law required religious and state-patriotic education, Spanish-language teaching and separation of boys and girls.', 'education'),
    ('es_economic_ordinance_1959', 'Decreto-ley 10/1959, de 21 de julio, de ordenación económica',
     'https://www.boe.es/gazeta/dias/1959/07/22/pdfs/BOE-1959-174.pdf', '1959-07-21',
     'BOE174, 22.07.1959, pp.10005–10007, heading, arts.1–3 and signature',
     'Прочитан оригинал, проверена дата21.07 (20.07 — заседание правительства). '
     'Извлечены либерализация импорта и пересмотр вмешивающихся органов. '
     'Программные обещания благосостояния и автоматическое увеличение семейного дохода не извлекаются.',
     '1959-economic-stabilisation', '1959-07-22', 'economic_crisis',
     'Экономический поворот и план стабилизации', 'Economic turn and stabilisation plan',
     'Опубликованные меры экономической стабилизации предусматривали либерализацию части импорта и пересмотр государственного вмешательства в торговлю.',
     'Published economic stabilisation measures provided for liberalising some imports and reviewing state intervention in trade.', 'work'),
    ('es_women_employment_law_1961', 'Ley 56/1961, de 22 de julio, sobre derechos de la mujer',
     'https://www.boe.es/diario_boe/txt.php?id=BOE-A-1961-14132', '1961-07-22',
     'BOE175, 24.07.1961, pp.11004–11005, arts.3–5 and final provision1',
     'Открыт TEXTO ORIGINAL. Вступление01.01.1962 прямо указано в заключительном положении. '
     'Статья3 исключала ряд военных, судебных и морских профессий; статья5 сохраняла marital authorization '
     'там, где она требовалась законом. Не считать полным равноправием или отменой разрешения мужа.',
     '1962-women-employment-rights', '1962-01-01', 'women_rights',
     'Расширение профессиональных прав женщин с исключениями', 'Women’s professional rights expanded with exclusions',
     'Вступили в силу новые профессиональные и трудовые права женщин. Сохранялись исключения для ряда профессий и требование разрешения мужа в предусмотренных законом случаях.',
     'New professional and employment rights for women took effect, retaining exclusions for certain professions and marital authorisation where required by law.', 'work'),
    ('es_social_security_bases_1963', 'Ley 193/1963, de 28 de diciembre, sobre Bases de la Seguridad Social',
     'https://www.boe.es/diario_boe/txt.php?id=BOE-A-1963-22667', '1963-12-28',
     'BOE312, 30.12.1963, pp.18181–18190, arts.1–2; bases2,4,5',
     'Открыт исходный текст: закон основ и поручение разработать исполнительные тексты, '
     'а не одновременное включение всего населения в готовую систему. Прочитаны положения об охвате, '
     'единой регистрации и видах защиты. Веха1967 требует другого документа.',
     '1963-social-security-bases', '1963-12-30', 'social_policy',
     'Основы реформы социального страхования', 'Bases for social-security reform',
     'Опубликованы основы реформы социального страхования: единая регистрация застрахованных, медицинская помощь и денежные выплаты в установленных случаях. Дальнейшее устройство системы требовало отдельных норм.',
     'The published bases for social-security reform provided for a single insurance registration, healthcare and specified cash benefits, with further implementing rules still required.', 'retirement'),
    ('es_married_women_capacity_law_1975', 'Ley 14/1975, de 2 de mayo: situación jurídica de la mujer casada',
     'https://www.boe.es/diario_boe/txt.php?id=BOE-A-1975-9245', '1975-05-02',
     'BOE107, 05.05.1975, pp.9413–9419, new Civil Code arts.57–65',
     'Открыт TEXTO ORIGINAL, прочитаны новые статьи57–65 и объяснение отмены licencia marital. '
     'Статья59 всё ещё делала мужа администратором общего имущества при отсутствии другого соглашения. '
     'Событие датировано публикацией, не неподтверждённым днём вступления в силу.',
     '1975-married-women-capacity', '1975-05-05', 'women_rights',
     'Отмена общего ограничения дееспособности замужних женщин', 'Removal of the general restriction on married women’s legal capacity',
     'Реформа установила, что брак сам по себе не ограничивает дееспособность супругов, и убрала общее требование разрешения мужа. Неравенство в управлении общим имуществом ещё сохранялось.',
     'The reform stated that marriage itself did not restrict either spouse’s legal capacity and removed the general marital-permission requirement. Inequality in managing joint property remained.', 'family_marriage'),
]


def main():
    events, contexts = [], []
    for spec in DOCUMENTS:
        sid, title, url, doc_date, locator, note, slug, date, category, ru, en, text_ru, text_en, kind = spec
        repo = source('ES', sid, title, url, 'es', publisher='Agencia Estatal Boletín Oficial del Estado',
                      notes=note, accessed_on='2026-11-17')
        ev = evidence(repo, title, locator, doc_date, 'es', 'legal_publication',
                      text_ru, locator=locator)
        events.append(event('ES', slug, date, 'es', ru, en, text_ru, text_en, ev, category=category, scope='national'))
        # The legal context is anchored to its verified year. No unsupported duration or local statistic.
        year = int(date[:4])
        contexts.append(context('ES', slug, 'es', year, year, kind, ru, en, text_ru, text_en, ev))
    save_batch('ES', 'spain', events, contexts)
    print('Spain national documents: %d events, %d contexts.' % (len(events), len(contexts)))


if __name__ == '__main__':
    main()
