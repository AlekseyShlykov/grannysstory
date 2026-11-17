"""Final reviewed gaps. No uninspected image or inaccessible document is counted as primary."""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from records import source, evidence, event, context, save_batch
from japan_sources import repository_for, polish_records

def doc(key,title,url,date,identifier,locator,primary=False,kind='encyclopedia',lang='en'):
    repo=source('JP',key,title,url,lang,publisher=repository_for(url), kind=kind,accessed_on='2026-11-17',notes=locator+' Только собственный пересказ фактов; изображения не распространяются.')
    return evidence(repo,title,identifier,date,lang,'legal_publication' if primary else 'historical_study',locator,primary=primary,locator=locator)
tax=doc('jp_consumption_tax_1988','消費税法','https://jahis.law.nagoya-u.ac.jp/lawdb/l/363a0108','1988-12-30','昭和63年法律108号',
    'Прочитан исходный текст:ст29 ставка3%;附則2 применимость с01.04.1989, записанной как昭和64. AI要約 не используется.',True,'library','ja')
e=event('JP','1989-consumption-tax','1989-04-01','jp','Введение налога на потребление','Consumption tax introduced',
    'Началось применение нового налога на потребление с общей ставкой3%. У закона были исключения и переходные условия; налог не равен изменению всех цен на3%.',
    'The new consumption tax began to apply at a standard rate of3%, with exemptions and transition rules. This was not a3% change in every price.',tax,category='consumer_life',scope='national')
fuk=doc('jp_wiki_fukushima','Fukushima nuclear accident','https://en.wikipedia.org/wiki/Fukushima_nuclear_accident','undated current revision; accessed2026-11-17','Fukushima nuclear accident; opening and accident sections',
    'Прочитано:начало11.03.2011,связьцунами,потеряэнергоснабжения,авария. Вторичная опора, не доказательство личного облучения.')
f=event('JP','2011-fukushima-accident','2011-03-11','jp','Авария на АЭС Фукусима-дайити','Fukushima Daiichi accident',
    'После землетрясения и цунами началась тяжёлая авария на Фукусиме-дайити. Национальная значимость не означает эвакуации или облучения жителей каждого поддержанного города.',
    'A severe accident began at Fukushima Daiichi after the earthquake and tsunami. National significance does not establish evacuation or radiation exposure in every supported city.',fuk,category='disaster',scope='national',sensitive=True)
f['confidence']='medium'
raid=doc('jp_wiki_tokyo_air_raid','Bombing of Tokyo,10March1945','https://en.wikipedia.org/wiki/Bombing_of_Tokyo_(10_March_1945)','undated current revision; accessed2026-11-17','Bombing of Tokyo,opening/history',
    'Прочитано:ночь9/10.03.1945,зажигательнаябомбардировкаUSAAF,разрушениявосточныхрайонов. Безточногоспорногочислажертв.')
t=event('JP','tokyo-1945-air-raid','1945-03-10','jp-tokyo','Зажигательная бомбардировка Токио','Tokyo firebombing',
    'В ночь9–10 марта американская авиация провела разрушительную зажигательную бомбардировку восточных районов Токио. Наличие города в биографии не определяет адрес, личное присутствие или потери семьи.',
    'On the night of March9–10 US aircraft carried out a devastating incendiary raid on eastern Tokyo. A biography’s city does not establish an address, personal presence or family losses.',raid,category='war_conflict',sensitive=True)
t['confidence']='medium'
save_batch('JP','japan',polish_records([e,f,t]),[])
