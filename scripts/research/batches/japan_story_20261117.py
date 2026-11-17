"""Original RU/EN fiction, not archival testimony. Emits country content and its exact translations."""
import json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[3]
translations={'Япония':'Japan'}
def t(ru,en):
    if ru in translations and translations[ru]!=en: raise ValueError(ru)
    translations[ru]=en
    return ru
def city(obj,opening,prompt,offset,ordinary,destination,label):
    return dict(openingObject=t(*obj),openingText=t(*opening),historyPrompt=t(*prompt),ordinaryYearOffset=offset,ordinaryText=t(*ordinary),destinationPlaceId=destination,destinationText=t(*label))
regions={
 'jp-tokyo':city(
  ('сложенная схема пересадок','a folded transfer map'),
  ('Нашла старую схему пересадок в Токио. Нужную станцию обвела, а выход не отметила. Видно, и тогда была уверена, что уж это-то запомню.','I found an old Tokyo transfer map. I circled the station I needed but never marked the exit. I must have been sure I would remember that part.'),
  ('Про Токио трудно рассказать без землетрясения и войны. Но я помню ещё, как менялись дороги и сколько времени уходило на обычную поездку.','It is hard to talk about Tokyo without the earthquake and the war. I also remember changing roads and the time an ordinary journey took.'),55,
  ('Мы с подругой договорились встретиться у станции в Токио и выбрали разные выходы. Обе пришли заранее, обе потом уверяли, что долго ждали. Когда наконец нашлись, сели пить чай и ещё полчаса выясняли, кто где стоял.','A friend and I arranged to meet at a Tokyo station and chose different exits. We both arrived early and later insisted we had waited ages. Once we found each other, we sat down for tea and spent another half hour working out where we had stood.'),
  'jp-osaka',('Осака','Osaka')),
 'jp-kyoto':city(
  ('конверт с образцом ткани','an envelope with a fabric sample'),
  ('В конверте лежал лоскут из Киото. Я всё пыталась подобрать к нему нитки, а потом убрала вместе с конвертом. Уже и не помню, что собиралась шить.','There was a scrap of fabric from Kyoto in an envelope. I kept trying to match the thread, then put everything away together. I no longer remember what I meant to sew.'),
  ('В Киото рядом со старыми ремёслами была вполне обычная городская жизнь, работа, учёба, дорога домой. А большие перемены в стране касались и нас.','Kyoto had ordinary city life alongside its old crafts: work, study and the journey home. The country’s great changes reached us too.'),54,
  ('В Киото я однажды зашла с подругой посмотреть ткань. Ничего покупать не собирались, только подбирали друг другу цвета. На выходе она сказала, что у меня опять все мысли о синем, и отдала свой зонтик, тоже синий.','In Kyoto a friend and I once went to look at fabrics. We had no intention of buying anything; we just chose colours for one another. As we left, she said I always had blue on my mind and handed me her umbrella, which was blue too.'),
  'jp-osaka',('Осака','Osaka')),
 'jp-osaka':city(
  ('тетрадка с маленькими расходами','a notebook of small expenses'),
  ('Нашла тетрадку, которую вела в Осаке. Кое-где даже мелочь записана, а рядом целая неделя пустая. То ли экономила, то ли надоело записывать.','I found a notebook I kept in Osaka. In places I recorded every little expense, and then a whole week is blank. Either I was saving or I had tired of writing it down.'),
  ('В Осаке многое было связано с торговлей и производством, с дорогой на работу. Только по одному этому нельзя понять, как жила каждая семья.','Much of Osaka’s life was connected with trade, manufacturing and getting to work. That alone cannot tell you how each family lived.'),55,
  ('Мы с подругой ходили в Осаке за покупками с очень точным списком. На обратной дороге сели передохнуть и обнаружили, что обе купили нитки, а нужную пуговицу забыли. Решили, что в следующий раз список будет держать кто-нибудь третий.','A friend and I went shopping in Osaka with a very precise list. On the way back we sat down to rest and discovered we had both bought thread but forgotten the button we needed. We decided a third person should hold the list next time.'),
  'jp-tokyo',('Токио','Tokyo')),
 'jp-hiroshima':city(
  ('открытка с видом реки','a postcard of the river'),
  ('Нашла открытку из Хиросимы, с рекой. На обороте всего две строчки и вопрос про погоду. Я тогда писала так, будто главное уже успела сказать при встрече.','I found a postcard from Hiroshima, showing the river. There are only two lines on the back and a question about the weather. I wrote as if I had already said everything important when we met.'),
  ('Про Хиросиму обязательно нужно сказать о бомбардировке и восстановлении. А потом я хочу рассказать и о городе, где люди учились, ездили на работу и встречались друг с другом.','Hiroshima’s bombing and reconstruction must be spoken of. I also want to tell you about a city where people studied, travelled to work and met one another.'),55,
  ('Мы с подругой сидели у реки в Хиросиме, каждая со своей книгой. Она всё время спрашивала, хорошая ли моя, а я отвечала, что ещё не поняла. Потом стемнело, и пришлось признаться, что мы обе почти ничего не прочитали.','A friend and I sat by the river in Hiroshima, each with a book. She kept asking whether mine was good, and I said I had not decided yet. Then it grew dark, and we had to admit that neither of us had read much at all.'),
  'jp-osaka',('Осака','Osaka')),
}
jobs=[]
for ident,title,kind,trained,start,middle,late in [
 ('jp-sewing-workshop',('швея в небольшой мастерской','seamstress in a small workshop'),'craft',False,
  ('Я стала работать в швейной мастерской. Сначала больше всего боялась испортить чужую ткань и всё проверяла по нескольку раз.','I began working in a sewing workshop. At first I was most afraid of spoiling someone else’s fabric and checked everything several times.'),
  ('Потом мне стали поручать сложные заказы. Я всё равно сначала раскладывала всё на столе, даже если знала работу наизусть.','Later I was trusted with difficult orders. I still laid everything out on the table first, even when I knew the work by heart.'),
  ('Из мастерской я ушла, а напёрсток ещё долго носила в сумке. Не знаю, что я собиралась чинить по дороге.','I left the workshop but kept carrying a thimble in my bag. I do not know what I expected to mend on the way.')),
 ('jp-office-clerk',('служащая в небольшой конторе','clerk in a small office'),'office',True,
  ('После учёбы я устроилась в небольшую контору. Первый месяц по три раза проверяла, тот ли лист подшила в папку.','After studying I found a job in a small office. For the first month I checked three times that I had filed the right sheet.'),
  ('В конторе я уже знала, где лежат старые бумаги. Дома почему-то всегда приходилось искать.','At the office I knew where the old papers were. At home I always seemed to be looking for them.'),
  ('Когда я перестала работать в конторе, первые дни всё просыпалась к прежнему часу. Потом научилась ещё немного полежать, хотя получалось не сразу.','When I stopped working at the office, I still woke at the old time. Eventually I learned to stay in bed a little longer, though it took practice.')),
 ('jp-shop-work',('продавщица в небольшом магазине','assistant in a small shop'),'service',False,
  ('Меня взяли в маленький магазин. Я сперва запоминала товары по месту на полке, и очень сердилась, когда их переставляли.','I was taken on at a small shop. At first I remembered goods by their place on the shelf and got very annoyed when they were moved.'),
  ('Постоянных покупателей я уже узнавала по голосу. Иногда человек ещё за дверью, а я знала, что он спросит.','I came to recognize regular customers by their voices. Sometimes I knew what they would ask before they came through the door.'),
  ('Из магазина я ушла, а привычка всё аккуратно складывать осталась. Даже когда никто не проверяет, ровно ли лежит бумага.','I left the shop but kept the habit of folding things neatly, even when no one was checking the paper.')),
]:
 jobs.append(dict(id=ident,title=t(*title),kind=kind,trained=trained,countries=['JP'],settlement='urban',**{'from':1918,'to':1965},start=t(*start),middle=t(*middle),late=t(*late)))

milestones=[]
def milestone(slug,event,kind,heard,young,lived,deeper,legal=False):
    item=dict(id='jp-'+slug,country='JP',eventIds=['jp-'+event],kind=kind,voice={k:t(*v) for k,v in [('heard',heard),('young',young),('lived',lived),('deeper',deeper)]})
    if legal:item['includeLegalMilestone']=True
    milestones.append(item)

milestone('russian-war','1904-russo-japanese-war','war',
 ('Русско-японская война началась, когда я была совсем маленькой. О ней мне рассказывали уже потом.','The Russo-Japanese War began when I was very small. I heard about it later.'),
 ('Тогда шла война с Россией. Я была ребёнком и понимала из разговоров далеко не всё.','There was war with Russia then. I was a child and understood very little of the talk.'),
 ('Тогда началась война с Россией. Теперь я стараюсь не смешивать то, что знала в те дни, с тем, что прочитала позднее.','War with Russia began then. I try to distinguish what I knew at the time from what I read later.'),
 ('Про военные решения можно прочитать. А в семейных разговорах часто оставались совсем другие подробности.','You can read about military decisions. Family conversations often held quite different details.'))
milestone('korea-annexation','1910-korea-annexation','state_change',
 ('Договор об аннексии Кореи подписали, когда я была маленькой. Смысл этих слов я узнала позже.','The treaty annexing Korea was signed when I was small. I learned what those words meant later.'),
 ('Тогда Япония подписала договор об аннексии Кореи. В детстве я ещё не понимала, что это значило для корейцев.','Japan signed the treaty annexing Korea then. As a child I did not understand what that meant for Koreans.'),
 ('Тогда Япония подписала договор об аннексии Кореи. Теперь я понимаю, сколько чужого опыта не было в привычных нам рассказах.','Japan signed the treaty annexing Korea then. I now see how much other people’s experience was absent from the stories familiar to us.'),
 ('Я могу рассказать, что знала сама. Но объяснять за людей, которые жили под колониальной властью, я не берусь.','I can tell you what I knew myself. I cannot speak on behalf of people who lived under colonial rule.'))
milestone('world-war-one','1914-first-world-war','war',
 ('Япония вступила в Первую мировую войну в годы моего детства. Это я знаю уже по поздним рассказам.','Japan entered the First World War during my early childhood. I learned about it later.'),
 ('Япония тогда вступила в Первую мировую войну. Мне ещё трудно было представить, как далеко идут боевые действия.','Japan entered the First World War then. I could barely imagine how far away the fighting was.'),
 ('Япония вступила в Первую мировую войну. Далёкие названия стали всё чаще встречаться в новостях.','Japan entered the First World War. Distant place names appeared more and more often in the news.'),
 ('Когда вспоминаешь давно прошедшее, очень легко всё объяснить задним числом. Тогда мы знали гораздо меньше.','It is easy to explain distant events with hindsight. We knew much less at the time.'))
milestone('rice-prices','1918-rice-riots','economic_crisis',
 ('Когда я была маленькой, из-за дороговизны риса начались протесты. Подробности я узнала позднее.','When I was small, rising rice prices led to protests. I learned the details later.'),
 ('Тогда по стране шли рисовые бунты. Я ещё плохо понимала политику, а разговоры о цене еды понять было проще.','Rice riots spread across the country. Politics was hard for me to understand, but talk about food prices was easier.'),
 ('Тогда из-за цены риса начались протесты по всей стране. В разговорах о деньгах вдруг стало гораздо меньше терпения.','Rice prices brought protests across the country. People had much less patience when talking about money.'),
 ('Я не хочу придумывать, что было в каждой семье. Но цену еды люди обсуждали без всяких сложных объяснений.','I do not want to invent what happened in every household. People could discuss food prices without complicated explanations.'))
milestone('repression','1925-peace-preservation-law','repression',
 ('Когда я была маленькой, приняли закон об охране общественного порядка. О его последствиях я узнавала позже.','The Peace Preservation Law was passed when I was small. I learned about its consequences later.'),
 ('Тогда приняли закон об охране общественного порядка. Я ещё не понимала, за какие слова и взгляды можно было оказаться под подозрением.','The Peace Preservation Law was passed then. I did not yet understand which words or views could bring suspicion.'),
 ('Тогда приняли закон об охране общественного порядка. Расширяли мужское голосование, а свободы говорить от этого у всех не прибавилось.','The Peace Preservation Law was passed then. Men’s voting rights expanded, but that did not give everyone greater freedom to speak.'),
 ('Люди не всегда одинаково говорили дома и при посторонних. Только по молчанию нельзя узнать, что человек думал.','People did not always speak the same way at home and among strangers. Silence alone cannot tell you what a person thought.'))
milestone('manchuria','1931-manchurian-invasion','war',
 ('Захват Маньчжурии начался, когда я была совсем маленькой. Разобраться в этом я смогла гораздо позже.','The invasion of Manchuria began when I was very small. I understood it much later.'),
 ('Тогда японская армия начала захват Маньчжурии. Я слышала названия, но ещё не понимала, что происходило с людьми там.','The Japanese army began taking Manchuria. I heard the names but did not understand what was happening to people there.'),
 ('Тогда начался захват Маньчжурии. Влияние военных становилось всё сильнее, а понять происходящее по привычным разговорам было трудно.','The invasion of Manchuria began then. Military influence grew stronger, and ordinary conversations did not make events easy to understand.'),
 ('То, что человек слышал тогда, и то, что он узнал после войны, часто совсем разные вещи. Я стараюсь помнить эту разницу.','What someone heard then and what they learned after the war were often very different. I try to remember that distinction.'))
milestone('china-war','1937-war-in-china','war',
 ('Полномасштабная война в Китае началась, когда я была маленькой. Многое о ней я узнала уже взрослой.','Full-scale war in China began when I was small. I learned much of it as an adult.'),
 ('Тогда война в Китае разрасталась. Я была ребёнком и не понимала, сколько людей за этими новостями.','The war in China was spreading. I was a child and did not understand how many people stood behind the news.'),
 ('Тогда началась полномасштабная война в Китае. С годами мне всё труднее говорить о ней только теми словами, которые были привычны тогда.','Full-scale war in China began then. With the years I find it harder to speak of it only in the words familiar at the time.'),
 ('Я могу вспомнить свои дни, но это не весь рассказ о войне. О том, что пережили люди в Китае, нужно слушать и другие голоса.','I can remember my own days, but that is not the whole story of the war. Other voices are needed to tell what people in China experienced.'))
milestone('pacific-war','1941-pacific-war','war',
 ('Война на Тихом океане началась, когда я была совсем маленькой. Моих собственных ясных воспоминаний о начале нет.','The Pacific War began when I was very small. I have no clear personal memory of its beginning.'),
 ('В сорок первом началась война на Тихом океане. Я была ребёнком и многое узнавала только из разговоров взрослых.','The Pacific War began in1941. I was a child and learned much of it only from adults’ conversations.'),
 ('В сорок первом началась война на Тихом океане. Обычные планы приходилось обдумывать уже среди военных новостей.','The Pacific War began in1941. Ordinary plans had to be considered amid war news.'),
 ('Про те годы я могу говорить не сразу. Иногда сначала вспоминается какая-нибудь мелочь, и только потом удаётся продолжить.','It can take me a while to speak about those years. Sometimes a small detail comes first, and only then can I continue.'))
milestone('atomic-bombings','1945-atomic-bombings','war',
 ('Атомные бомбы сбросили на Хиросиму и Нагасаки в годы моего раннего детства. Понять, что произошло, я смогла позже.','Atomic bombs were dropped on Hiroshima and Nagasaki during my early childhood. I understood what happened later.'),
 ('В августе атомные бомбы сбросили на Хиросиму и Нагасаки. Мне ещё многое приходилось объяснять, и не на каждый вопрос находились слова.','Atomic bombs were dropped on Hiroshima and Nagasaki in August. Much still had to be explained to me, and there were not words for every question.'),
 ('В августе атомные бомбы сбросили на Хиросиму и Нагасаки. Тут я хочу говорить осторожно, чтобы не выдавать чужие воспоминания за свои.','Atomic bombs were dropped on Hiroshima and Nagasaki in August. I want to speak carefully, so that other people’s memories do not become my own.'),
 ('Я сейчас помолчу немного. Об этом у людей осталось столько разных рассказов, и я не хочу говорить поспешно.','I will be quiet for a moment. People have left so many different accounts, and I do not want to speak hastily.'))
milestone('surrender','1945-surrender','war_end',
 ('Война закончилась, когда я была маленькой. О капитуляции я знаю уже по рассказам и тому, что узнала позднее.','The war ended when I was small. I know about the surrender from stories and what I learned later.'),
 ('Тогда Япония капитулировала, война закончилась. Я ещё не понимала, что будет с обычной жизнью после неё.','Japan surrendered and the war ended. I did not yet understand what ordinary life would be like afterwards.'),
 ('Тогда Япония капитулировала, война закончилась. Сразу представить себе, как жить дальше, было трудно.','Japan surrendered and the war ended. It was difficult to imagine how life would continue.'),
 ('Конец войны можно отметить одной датой. А люди ещё долго разбирались с тем, что осталось после неё.','You can mark the end of a war with a date. People took much longer to deal with what it left behind.'))
milestone('occupation','1945-allied-occupation','occupation',
 ('После войны Япония была под союзной оккупацией. Про устройство той власти я узнала позднее.','Japan was under Allied occupation after the war. I learned later how that authority worked.'),
 ('После войны началась союзная оккупация. Для меня многое тогда оставалось непонятным, особенно кто за что теперь отвечает.','The Allied occupation followed the war. Much was unclear to me, especially who was now responsible for what.'),
 ('После войны Япония оказалась под союзной оккупацией. Менялись порядки, и к новым словам ещё нужно было привыкнуть.','Japan came under Allied occupation after the war. Rules changed, and new words took getting used to.'),
 ('Большие решения принимали далеко от нашей повседневной жизни, а последствия приходили в неё постепенно. Не всё я тогда могла объяснить.','Great decisions were made far from our daily lives, and their effects reached us gradually. I could not explain everything at the time.'))
milestone('womens-vote','1945-women-voting-rights','social_transformation',
 ('Женщины получили право парламентского голосования, когда я была совсем маленькой. Мне потом объясняли, что прежде его не было.','Women gained parliamentary voting rights when I was very small. I was later told they had not had them before.'),
 ('После войны женщины получили право голосовать. Я ещё была мала, чтобы им воспользоваться.','Women gained the vote after the war. I was still too young to use it.'),
 ('После войны женщины получили право голосовать. Для меня было важно само то, что это теперь наше право, хотя думали мы все по-разному.','Women gained the vote after the war. The right itself mattered to me, though we all thought differently.'),
 ('Я не буду говорить, будто у всех женщин было одно мнение. Даже за одним столом согласиться удавалось не всегда.','I will not pretend that all women held one opinion. Even around one table we did not always agree.'),True)
milestone('constitution','1947-constitution','social_transformation',
 ('Новая Конституция вступила в силу в годы моего раннего детства. О равенстве и новых правах я узнавала уже позже.','The new Constitution took effect in my early childhood. I learned about equality and new rights later.'),
 ('Тогда вступила в силу новая Конституция, с новыми правами и равенством в семейных отношениях. В детстве я ещё не умела связать эти слова с обычным днём.','The new Constitution came into force with new rights and equality in family matters. As a child I could not connect those words to an ordinary day.'),
 ('Тогда вступила в силу новая Конституция, с равенством и другими правилами семейной жизни. Привычки людей, конечно, менялись медленнее текста.','The new Constitution came into force with equality and different principles for family life. People’s habits changed more slowly than the text.'),
 ('Когда право появляется на бумаге, ещё нужно научиться им пользоваться. В семье тоже не всё сразу получается сказать вслух.','When a right appears on paper, people still have to learn to use it. Some things remain hard to say aloud within a family.'),True)
milestone('education','1947-education-reform','social_transformation',
 ('Послевоенные правила открывали новые возможности учиться. В моём раннем детстве я ещё не понимала, как сильно они отличались от прежних.','Postwar rules opened new educational opportunities. In my early childhood I did not understand how different they were.'),
 ('После войны меняли образование, закрепили девять лет обязательной учёбы и равные возможности. До меня смысл этих перемен доходил постепенно.','Education changed after the war, with nine compulsory years and equal opportunity. I understood these changes gradually.'),
 ('После войны меняли образование, закрепили девять лет обязательной учёбы и равные возможности. Но разрешить учиться и суметь продолжить учёбу всё-таки разные вещи.','Education changed after the war, with nine compulsory years and equal opportunity. Being allowed to study and being able to continue were still different things.'),
 ('Для одной семьи важнее были деньги, для другой дорога до школы. В одной общей дате этого не видно.','For one family money mattered most, for another the journey to school. A single date cannot show that.'),True)
milestone('occupation-end','1952-occupation-ends','state_change',
 ('Союзная оккупация закончилась, когда я была совсем маленькой. Об этом мне рассказывали позднее.','The Allied occupation ended when I was very small. I heard about it later.'),
 ('В пятьдесят втором союзная оккупация закончилась. Я ещё не очень понимала договоры, по которым это произошло.','The Allied occupation ended in1952. I did not yet understand the treaties behind it.'),
 ('В пятьдесят втором закончилась союзная оккупация. Только это не значило, что все послевоенные вопросы уже решены.','The Allied occupation ended in1952. That did not mean every postwar question had been settled.'),
 ('Планы на будущее возвращались к людям в разное время. У кого-то раньше, у кого-то гораздо позже.','People began making plans again at different times. Earlier for some, much later for others.'))
milestone('shinkansen','1964-shinkansen','social_transformation',
 ('Когда я была маленькой, открыли скоростную дорогу между Токио и Осакой. Про её первые годы я знаю уже по рассказам.','When I was small, the high-speed railway between Tokyo and Osaka opened. I know its first years from later stories.'),
 ('Тогда открыли синкансэн между Токио и Осакой. Даже название новой дороги звучало как обещание, хотя поездку ещё нужно было оплатить.','The Shinkansen between Tokyo and Osaka opened then. Its name sounded like a promise, though a journey still had to be paid for.'),
 ('Тогда открыли синкансэн между Токио и Осакой. Расстояние оставалось тем же, а думать о поездке стали уже иначе.','The Shinkansen between Tokyo and Osaka opened then. The distance was the same, but people thought about a journey differently.'),
 ('Можно было представить, как съездишь к кому-нибудь на один день. А потом всё равно открывала календарь и считала деньги.','You could imagine going to see someone for a day. Then you still had to open the calendar and count your money.'))
milestone('olympics','1964-olympics','social_transformation',
 ('В годы моего детства в Токио прошла Олимпиада. Об этой большой перемене я узнавала позже.','The Tokyo Olympics took place in my early childhood. I learned about that great change later.'),
 ('В Токио тогда была Олимпиада. Я ещё плохо понимала, почему вокруг неё столько разговоров.','The Olympics were in Tokyo then. I barely understood why people talked about them so much.'),
 ('В Токио тогда проходила Олимпиада. Казалось, о стране вдруг говорят совсем другим голосом.','The Olympics were held in Tokyo then. It seemed that the country was being spoken of in a different voice.'),
 ('Но если спросить меня про тот год, я могу сначала вспомнить чью-нибудь встречу, а уже потом соревнования. У памяти свой порядок.','Ask me about that year and I may remember meeting someone before I remember the competitions. Memory has its own order.'))
milestone('oil','1973-oil-crisis','economic_crisis',
 ('Нефтяной кризис случился в годы моего детства. Объяснение ему я узнала уже потом.','The oil crisis happened in my early childhood. I learned the explanation later.'),
 ('Тогда начался нефтяной кризис, всё чаще говорили о ценах. Подробностей я ещё не понимала.','The oil crisis began and people talked more about prices. I did not understand the details yet.'),
 ('Тогда начался нефтяной кризис, цены быстро росли. Даже привычные расходы приходилось обдумывать заново.','The oil crisis began and prices rose quickly. Even familiar expenses had to be thought through again.'),
 ('Мне легче вспомнить, как пересчитывали покупки, чем все экономические объяснения. Это было ближе к обычному дню.','I remember working out purchases more easily than the economic explanations. It was closer to an ordinary day.'))
milestone('equal-work','1986-equal-employment','social_transformation',
 ('Тогда вступили в силу новые правила равных возможностей на работе. Про прежние ограничения я узнавала позже.','New equal employment opportunity rules took effect then. I learned about the earlier restrictions later.'),
 ('Тогда начали действовать новые правила равных возможностей на работе. Я ещё не знала, сколько препятствий одним законом не убрать.','New equal employment opportunity rules took effect. I did not yet know how many obstacles one law could not remove.'),
 ('Тогда вступили в силу новые правила равных возможностей на работе. Я слушала и думала о женщинах, которым прежде отвечали, что это место не для них.','New equal employment opportunity rules took effect. I thought of women who had previously been told a job was not for them.'),
 ('Правила менялись, а старый ответ мог ещё долго оставаться у человека в голове. Не только у того, кто его говорил.','The rules changed, but an old answer could stay in someone’s head for a long time, and not only in the head of the person who said it.'),True)
milestone('bubble','1992-bubble-collapse','economic_crisis',
 ('Когда я была маленькой, закончились годы финансового пузыря. Что это значило, я поняла уже позже.','The asset bubble years ended when I was small. I understood what that meant later.'),
 ('Тогда лопнул финансовый пузырь. Я ещё не понимала, почему взрослые стали осторожнее говорить о будущем.','The asset bubble burst then. I did not yet understand why adults spoke more cautiously about the future.'),
 ('В начале девяностых закончились годы финансового пузыря. О будущем стали говорить осторожнее, и прежние обещания уже звучали иначе.','The asset bubble years ended in the early1990s. People spoke more cautiously about the future, and old promises sounded different.'),
 ('Одной семье было трудно, другая ещё держалась привычного распорядка. По общему слову «кризис» чужую жизнь не угадаешь.','One family struggled while another kept its usual routine. The word “crisis” cannot tell you someone else’s life.'))
milestone('crisis2008','2008-global-financial-crisis','economic_crisis',
 ('Мировой финансовый кризис случился в годы моего детства. Про его последствия я узнала позже.','The global financial crisis happened during my early childhood. I learned about its effects later.'),
 ('Тогда пришёл мировой финансовый кризис. Я ещё не понимала, почему события за границей меняют разговоры у нас.','The global financial crisis arrived. I did not understand why events abroad changed conversations here.'),
 ('Тогда мировой финансовый кризис дошёл и до Японии. Всё чаще говорили о работе и о том, что лучше пока отложить расходы.','The global financial crisis reached Japan too. Work and postponing expenses came up more often in conversation.'),
 ('В такие годы даже маленькое обещание приходится давать осторожнее. И всё-таки люди продолжали договариваться о встречах.','In years like that even a small promise has to be made carefully. People still went on arranging to meet.'))
milestone('earthquake2011','2011-tohoku-earthquake','disaster',
 ('Землетрясение и цунами в Тохоку произошли в годы моего детства. Я узнавала об этом позднее.','The Tohoku earthquake and tsunami happened in my early childhood. I learned about them later.'),
 ('Тогда произошло землетрясение и цунами в Тохоку. За отдельными новостями мне ещё трудно было представить целую жизнь людей.','The Tohoku earthquake and tsunami happened then. It was hard to imagine people’s whole lives behind the separate reports.'),
 ('Тогда произошло землетрясение и цунами на северо-востоке страны. Новости были тяжёлые, и я всё время думала о людях, от которых ждали ответа.','The earthquake and tsunami struck the northeast. The news was distressing, and I kept thinking about people whose reply was awaited.'),
 ('Я могу рассказать, что запомнила в те дни. Но чужие потери мне хочется оставить в чужих, собственных словах.','I can tell you what I remember of those days. Other people’s losses deserve their own words.'))
milestone('fukushima','2011-fukushima-accident','disaster',
 ('В годы моего детства произошла авария на Фукусиме-дайити. Подробности я узнала позднее.','The Fukushima Daiichi accident happened in my early childhood. I learned the details later.'),
 ('Тогда произошла авария на Фукусиме-дайити. Я ещё не могла разобраться во всех сообщениях о станции.','The Fukushima Daiichi accident happened then. I could not make sense of every report about the plant.'),
 ('После землетрясения и цунами произошла авария на Фукусиме-дайити. Мы узнавали о станции из новостей, и ясности долго не хватало.','After the earthquake and tsunami came the Fukushima Daiichi accident. We learned about the plant from the news, and much remained unclear.'),
 ('Теперь многое можно проверить по датам. А тогда хотелось прежде всего понять, что происходит и кому нужна помощь.','Much can now be checked against dates. At the time people first wanted to understand what was happening and who needed help.'))
milestone('pandemic','2020-pandemic-emergency','pandemic',
 ('Пандемия началась в годы моего раннего детства. Это уже рассказанное мне позже.','The pandemic began in my early childhood. That is something I was told later.'),
 ('Тогда началась пандемия и объявили чрезвычайную ситуацию. Привычные встречи пришлось обсуждать заново.','The pandemic began and an emergency was declared. Ordinary visits had to be reconsidered.'),
 ('В двадцатом году началась пандемия и объявили чрезвычайную ситуацию. Мне стало особенно заметно, сколько в неделе было коротких встреч.','The pandemic began in2020 and an emergency was declared. I became especially aware of all the brief meetings in a week.'),
 ('Можно было созвониться, спросить про покупки, просто услышать голос. Иногда разговор получался совсем коротким, но я его ждала.','You could call, ask about shopping, just hear a voice. Sometimes the conversation was very short, but I looked forward to it.'))

local={
 'jp-tokyo-1927-subway':dict(
  heard=t('Про первую линию метро в Токио я знаю по поздним рассказам. Она соединяла Асакусу с Уэно.','I know about Tokyo’s first subway line from later accounts. It connected Asakusa and Ueno.'),
  lived=t('Тогда в Токио открыли первую линию метро. Я ещё долго пыталась представить город и сверху, и под землёй сразу.','Tokyo’s first subway line opened then. I kept trying to picture the city above and below ground at once.')),
 'jp-kyoto-1978-tram-closure':dict(
  heard=t('Муниципальный трамвай в Киото закрыли, когда я была маленькой. Про прежние маршруты мне рассказывали позже.','Kyoto’s municipal tram closed when I was small. I learned about the old routes later.'),
  lived=t('В Киото тогда перестал ходить муниципальный трамвай. Старые остановки ещё долго оставались в разговоре, хотя добирались уже иначе.','Kyoto’s municipal tram stopped running then. The old stops stayed in conversation long after people began travelling differently.')),
 'jp-osaka-1954-industrial-water':dict(
  heard=t('Промышленный водопровод западной Осаки начали вводить, когда я была маленькой. Это мне объясняли уже потом.','The industrial water supply in western Osaka began when I was small. I learned about it later.'),
  lived=t('В западной Осаке тогда начали подавать воду для промышленности, чтобы меньше откачивали её из-под земли. Про работу фабрик стало трудно говорить отдельно от самого города.','Western Osaka began supplying industrial water to reduce groundwater pumping. It became hard to talk about factory work apart from the city itself.')),
 'jp-hiroshima-1949-peace-city-law':dict(
  heard=t('В Хиросиме приняли специальный закон о восстановлении города. Я ещё была маленькой и узнала о нём позже.','Hiroshima received a special reconstruction law. I was small and learned about it later.'),
  lived=t('Для восстановления Хиросимы тогда приняли специальный закон. Дороги и дома появлялись постепенно, у каждого дела был свой срок.','A special law was passed for rebuilding Hiroshima. Roads and homes appeared gradually; each task took its own time.')),
 'jp-hiroshima-1994-astram':dict(
  heard=t('Про первые годы Астрам-лайн я знаю по рассказам. Новая линия связала центр Хиросимы с северо-западными районами.','I know the early years of the Astram Line from accounts. It linked central Hiroshima with northwestern districts.'),
  lived=t('В Хиросиме тогда открыли Астрам-лайн. Когда меняется дорога, даже знакомый адрес поначалу приходится объяснять заново.','Hiroshima’s Astram Line opened then. When a route changes, even a familiar address needs explaining again.')),
}
content=dict(country='JP',regionNarratives=regions,occupations=jobs,sharedGenericJobIds=['west-nurse','west-teacher','west-farm'],
 retirementAge=dict(age=65,note='Модельный возраст завершения работы, не универсальный японский возраст увольнения или назначенная выплата. jp-ctx-1959-retirement-conditions:ст26国民年金法1959 связывала страховую пенсию с65лет и условиями стажа; для старших когорт переходные режимы. Личное получение пенсии не устанавливается.'),
 milestones=milestones,historicalVoice=local)
(ROOT/'content/scenes/countries/jp.ts').write_text('import type { CountryContent } from "./types";\n\n// Original fiction, not testimony. Sensitive prose follows provisional D-019; human editorial review remains open.\n// No birthplace, national milestone or occupation assigns a personal injury, loss, political allegiance or hibakusha status.\nexport const content: CountryContent = '+json.dumps(content,ensure_ascii=False,indent=2)+';\n')
for ru,en in [('Хару','Haru'),('Фуми','Fumi'),('Ёси','Yoshi'),('Сидзу','Shizu'),('Умэ','Ume'),('Кику','Kiku'),('Сатико','Sachiko'),('Тосико','Toshiko'),('Сато','Sato'),('Судзуки','Suzuki'),('Такахаси','Takahashi'),('Танака','Tanaka'),('Ватанабэ','Watanabe'),('Ито','Ito'),('Ямамото','Yamamoto'),('Накамура','Nakamura')]:t(ru,en)
for parent,en in [('мамы','Mum'),('папы','Dad')]:
    t('Тогда не стало '+parent+'. Помню, как в доме стало непривычно тихо и как я не понимала, куда мне теперь деть руки.',
      'That was when I lost my '+en.lower()+'. I remember the unfamiliar quiet in the house and not knowing what to do with my hands.')
(ROOT/'src/i18n/en/jp.json').write_text(json.dumps({'exact':translations},ensure_ascii=False,indent=2)+'\n')
