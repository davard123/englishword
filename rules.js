// ═══════════════════════════════════════════════════════════════════════
// 魔法规则关：后缀 / 前缀 / 词根
//   每行一题：  部件+部件=答案 规则字母      例： stop+ed=stopped c
//   以 ! 开头 = 特殊字（例外，做成精英怪），后面写说明： !go+ed=went 不规则：go 的过去式是 went
//   词根关：规则字母的位置写中文意思：      trans+port=transport 运输（搬过去）
//   fmt：题目怎么显示（{0} {1} = 第几个部件，默认 "部件 + 部件"）
// 美式拼写（traveling, judgment, colorful）
// ═══════════════════════════════════════════════════════════════════════
const RULE_GROUPS = [
  { key: "suffix", name: "后缀魔法", icon: "🔮", desc: "单词后面加尾巴，拼写会变：去 e、双写、y 变 i……" },
  { key: "prefix", name: "前缀魔法", icon: "🪄", desc: "单词前面加头：前缀从不改变原词的拼写，n+n、s+s 都要保留" },
  { key: "root",   name: "词根魔法", icon: "🌳", desc: "认识词根，一个词根能拼出一大家子单词" },
]

const RULE_LEVELS = [
  // ───────────────────────── 后缀 ─────────────────────────
  { id: "plural1", group: "suffix", icon: "🍎", title: "复数 ① -s / -es / -ies", fmt: "{0} → 复数",
    rules: { a: "一般直接加 s：cat → cats", b: "以 s、x、z、ch、sh 结尾加 es：box → boxes", c: "辅音 + y 结尾：y 变 i 再加 es：baby → babies", d: "元音 + y 结尾：直接加 s：boy → boys" },
    items: `cat+s=cats a
book+s=books a
tree+s=trees a
pencil+s=pencils a
box+s=boxes b
bus+s=buses b
dish+s=dishes b
watch+s=watches b
fox+s=foxes b
glass+s=glasses b
church+s=churches b
baby+s=babies c
city+s=cities c
story+s=stories c
party+s=parties c
family+s=families c
boy+s=boys d
day+s=days d
key+s=keys d
monkey+s=monkeys d` },

  { id: "plural2", group: "suffix", icon: "🍂", title: "复数 ② -ves / -oes / 不规则", fmt: "{0} → 复数",
    rules: { a: "以 f / fe 结尾：变 v 再加 es：leaf → leaves", b: "有些以 o 结尾的加 es：potato → potatoes", c: "不规则复数要单独记：child → children" },
    items: `leaf+s=leaves a
knife+s=knives a
wolf+s=wolves a
half+s=halves a
life+s=lives a
shelf+s=shelves a
wife+s=wives a
potato+s=potatoes b
tomato+s=tomatoes b
hero+s=heroes b
echo+s=echoes b
child+s=children c
mouse+s=mice c
tooth+s=teeth c
foot+s=feet c
man+s=men c
woman+s=women c
person+s=people c
!roof+s=roofs 例外：roof 直接加 s，不变 v
!piano+s=pianos 例外：piano 直接加 s
!photo+s=photos 例外：photo 直接加 s
!sheep+s=sheep 例外：sheep 单复数一样
!fish+s=fish 例外：fish 单复数一样` },

  { id: "past1", group: "suffix", icon: "⏪", title: "过去式 ① -ed / -d",
    rules: { a: "一般直接加 ed：jump → jumped", b: "以 e 结尾：只加 d：bake → baked", c: "元音 + y 结尾：直接加 ed：play → played" },
    items: `jump+ed=jumped a
walk+ed=walked a
help+ed=helped a
start+ed=started a
talk+ed=talked a
want+ed=wanted a
open+ed=opened a
visit+ed=visited a
bake+ed=baked b
smile+ed=smiled b
dance+ed=danced b
hope+ed=hoped b
like+ed=liked b
move+ed=moved b
close+ed=closed b
use+ed=used b
play+ed=played c
stay+ed=stayed c
enjoy+ed=enjoyed c
!say+ed=said 特殊：say 的过去式是 said
!pay+ed=paid 特殊：pay 的过去式是 paid` },

  { id: "past2", group: "suffix", icon: "✌️", title: "过去式 ② 双写 / y 变 i",
    rules: { a: "短元音 + 一个辅音结尾的单音节词：双写再加 ed：stop → stopped", b: "辅音 + y 结尾：y 变 i 加 ed：cry → cried", c: "重音在最后的双音节词也双写：prefer → preferred" },
    items: `stop+ed=stopped a
plan+ed=planned a
hop+ed=hopped a
drop+ed=dropped a
clap+ed=clapped a
hug+ed=hugged a
shop+ed=shopped a
grab+ed=grabbed a
carry+ed=carried b
cry+ed=cried b
try+ed=tried b
study+ed=studied b
worry+ed=worried b
hurry+ed=hurried b
prefer+ed=preferred c
admit+ed=admitted c
permit+ed=permitted c
!open+ed=opened 重音在前（O-pen）：不双写
!visit+ed=visited 重音在前（VIS-it）：不双写
!fix+ed=fixed x 永远不双写
!snow+ed=snowed w 结尾不双写` },

  { id: "past3", group: "suffix", icon: "🌀", title: "不规则过去式", fmt: "{0} → 过去式",
    rules: { a: "-ought / -aught 家族：buy → bought，catch → caught", b: "元音变一下：sing → sang，write → wrote", c: "ee 变 e 再加 t：sleep → slept，keep → kept", d: "完全变样，只能记：go → went" },
    items: `buy+ed=bought a
think+ed=thought a
bring+ed=brought a
fight+ed=fought a
catch+ed=caught a
teach+ed=taught a
sing+ed=sang b
swim+ed=swam b
run+ed=ran b
begin+ed=began b
write+ed=wrote b
ride+ed=rode b
speak+ed=spoke b
know+ed=knew b
fly+ed=flew b
find+ed=found b
sleep+ed=slept c
keep+ed=kept c
feel+ed=felt c
leave+ed=left c
!go+ed=went 完全不规则：go → went
!eat+ed=ate 完全不规则：eat → ate
!see+ed=saw 完全不规则：see → saw
!take+ed=took 完全不规则：take → took` },

  { id: "ing1", group: "suffix", icon: "🏃", title: "-ing ① 直接加 / 去 e",
    rules: { a: "一般直接加 ing：read → reading", b: "以不发音的 e 结尾：去 e 加 ing：make → making" },
    items: `read+ing=reading a
play+ing=playing a
jump+ing=jumping a
sing+ing=singing a
go+ing=going a
eat+ing=eating a
draw+ing=drawing a
make+ing=making b
write+ing=writing b
ride+ing=riding b
dance+ing=dancing b
smile+ing=smiling b
come+ing=coming b
give+ing=giving b
have+ing=having b
take+ing=taking b
!see+ing=seeing ee 结尾不去 e
!be+ing=being be 的 e 要保留
!agree+ing=agreeing ee 结尾不去 e` },

  { id: "ing2", group: "suffix", icon: "🏊", title: "-ing ② 双写 / ie 变 y",
    rules: { a: "短元音 + 一个辅音：双写再加 ing：run → running", b: "ie 结尾：ie 变 y 加 ing：lie → lying", c: "y 结尾：直接加 ing（不变 i！）：cry → crying" },
    items: `run+ing=running a
swim+ing=swimming a
sit+ing=sitting a
stop+ing=stopping a
get+ing=getting a
hit+ing=hitting a
shop+ing=shopping a
begin+ing=beginning a
lie+ing=lying b
die+ing=dying b
tie+ing=tying b
cry+ing=crying c
study+ing=studying c
carry+ing=carrying c
try+ing=trying c
!open+ing=opening 重音在前：不双写
!visit+ing=visiting 重音在前：不双写
!fix+ing=fixing x 永远不双写
!travel+ing=traveling 美式拼写：traveling 只有一个 l` },

  { id: "compare", group: "suffix", icon: "📏", title: "比较级 -er / 最高级 -est",
    rules: { a: "一般直接加 er / est：tall → taller", b: "以 e 结尾：只加 r / st：large → larger", c: "短元音 + 一个辅音：双写：big → bigger", d: "辅音 + y：y 变 i：happy → happier" },
    items: `tall+er=taller a
small+est=smallest a
fast+er=faster a
long+est=longest a
short+er=shorter a
large+er=larger b
nice+est=nicest b
wide+er=wider b
late+est=latest b
big+er=bigger c
hot+est=hottest c
thin+er=thinner c
sad+est=saddest c
happy+er=happier d
easy+est=easiest d
funny+er=funnier d
busy+est=busiest d
early+er=earlier d
!good+er=better 不规则：good → better → best
!good+est=best 不规则：good → better → best
!bad+er=worse 不规则：bad → worse → worst
!bad+est=worst 不规则：bad → worse → worst
!far+er=farther 不规则：far → farther` },

  { id: "ly1", group: "suffix", icon: "🐢", title: "-ly ① 副词",
    rules: { a: "一般直接加 ly（e 也保留）：quick → quickly，nice → nicely", b: "辅音 + y：y 变 i 再加 ly：happy → happily", c: "以 l 结尾：直接加 ly，出现两个 l：careful → carefully" },
    items: `quick+ly=quickly a
slow+ly=slowly a
sad+ly=sadly a
loud+ly=loudly a
nice+ly=nicely a
safe+ly=safely a
brave+ly=bravely a
kind+ly=kindly a
happy+ly=happily b
easy+ly=easily b
angry+ly=angrily b
lucky+ly=luckily b
busy+ly=busily b
heavy+ly=heavily b
careful+ly=carefully c
real+ly=really c
final+ly=finally c
usual+ly=usually c
beautiful+ly=beautifully c` },

  { id: "ly2", group: "suffix", icon: "🎩", title: "-ly ② -le / -ic / 特殊",
    rules: { a: "以 -le 结尾：去 e 换成 y：gentle → gently", b: "以 -ic 结尾：加 ally：basic → basically" },
    items: `gentle+ly=gently a
simple+ly=simply a
terrible+ly=terribly a
possible+ly=possibly a
comfortable+ly=comfortably a
horrible+ly=horribly a
probable+ly=probably a
humble+ly=humbly a
basic+ly=basically b
magic+ly=magically b
tragic+ly=tragically b
automatic+ly=automatically b
dramatic+ly=dramatically b
scientific+ly=scientifically b
!true+ly=truly 特殊：true 去 e → truly
!whole+ly=wholly 特殊：whole 去 e → wholly
!full+ly=fully 特殊：full + ly 只剩两个 l
!public+ly=publicly 特殊：public 只加 ly
!day+ly=daily 特殊：day → daily
!shy+ly=shyly 特殊：shy 的 y 不变` },

  { id: "ful", group: "suffix", icon: "🎨", title: "-ful 充满…的",
    rules: { a: "直接加 ful（ful 只有一个 l！）：care → careful", b: "辅音 + y：y 变 i 再加 ful：beauty → beautiful" },
    items: `care+ful=careful a
help+ful=helpful a
hope+ful=hopeful a
use+ful=useful a
color+ful=colorful a
thank+ful=thankful a
wonder+ful=wonderful a
power+ful=powerful a
play+ful=playful a
cheer+ful=cheerful a
peace+ful=peaceful a
harm+ful=harmful a
success+ful=successful a
forget+ful=forgetful a
beauty+ful=beautiful b
pity+ful=pitiful b
plenty+ful=plentiful b
mercy+ful=merciful b
duty+ful=dutiful b
!skill+ful=skillful 美式：skill 的 ll 保留 + ful
!awe+ful=awful 特殊：awe 去 e → awful` },

  { id: "less", group: "suffix", icon: "🫥", title: "-less 没有…的",
    rules: { a: "直接加 less（e 也保留）：care → careless", b: "辅音 + y：y 变 i 再加 less：penny → penniless" },
    items: `care+less=careless a
help+less=helpless a
hope+less=hopeless a
use+less=useless a
home+less=homeless a
fear+less=fearless a
end+less=endless a
harm+less=harmless a
power+less=powerless a
pain+less=painless a
sleep+less=sleepless a
worth+less=worthless a
spot+less=spotless a
penny+less=penniless b
mercy+less=merciless b
pity+less=pitiless b` },

  { id: "ness", group: "suffix", icon: "😊", title: "-ness 名词",
    rules: { a: "直接加 ness（不双写）：kind → kindness，sad → sadness", b: "辅音 + y：y 变 i 再加 ness：happy → happiness", c: "以 n 结尾：直接加，出现两个 n：open → openness" },
    items: `kind+ness=kindness a
dark+ness=darkness a
sad+ness=sadness a
good+ness=goodness a
ill+ness=illness a
fit+ness=fitness a
weak+ness=weakness a
sick+ness=sickness a
aware+ness=awareness a
polite+ness=politeness a
happy+ness=happiness b
lazy+ness=laziness b
empty+ness=emptiness b
lonely+ness=loneliness b
ready+ness=readiness b
silly+ness=silliness b
open+ness=openness c
sudden+ness=suddenness c
!shy+ness=shyness 单音节的 y 保留：shyness
!dry+ness=dryness 单音节的 y 保留：dryness
!busy+ness=business 特殊：busy → business（生意）` },

  { id: "ment", group: "suffix", icon: "🎉", title: "-ment 名词",
    rules: { a: "直接加 ment（e 保留）：move → movement", b: "辅音 + y：y 变 i：merry → merriment" },
    items: `move+ment=movement a
excite+ment=excitement a
agree+ment=agreement a
enjoy+ment=enjoyment a
pay+ment=payment a
treat+ment=treatment a
develop+ment=development a
govern+ment=government a
manage+ment=management a
arrange+ment=arrangement a
achieve+ment=achievement a
equip+ment=equipment a
place+ment=placement a
merry+ment=merriment b
!argue+ment=argument 特殊：argue 去 e → argument
!judge+ment=judgment 美式：judge 去 e → judgment
!acknowledge+ment=acknowledgment 美式：去 e → acknowledgment` },

  { id: "al", group: "suffix", icon: "🎵", title: "-al 形容词 / 名词",
    rules: { a: "直接加 al：music → musical", b: "以 e 结尾：去 e 加 al：nature → natural" },
    items: `music+al=musical a
person+al=personal a
nation+al=national a
magic+al=magical a
origin+al=original a
tradition+al=traditional a
accident+al=accidental a
education+al=educational a
emotion+al=emotional a
logic+al=logical a
nature+al=natural b
arrive+al=arrival b
culture+al=cultural b
survive+al=survival b
refuse+al=refusal b
universe+al=universal b
approve+al=approval b
!center+al=central 特殊：center → central
!finance+al=financial 特殊：finance → financial
!benefit+al=beneficial 特殊：benefit → beneficial
!history+al=historical 特殊：history → historical` },

  { id: "able", group: "suffix", icon: "💪", title: "-able / -ible 能…的",
    rules: { a: "直接加 able：comfort → comfortable", b: "以 e 结尾：去 e 加 able：love → lovable", c: "ce / ge 结尾：e 要保留（保持软音）：notice → noticeable", d: "辅音 + y：y 变 i：rely → reliable" },
    items: `comfort+able=comfortable a
enjoy+able=enjoyable a
read+able=readable a
wash+able=washable a
depend+able=dependable a
accept+able=acceptable a
break+able=breakable a
remark+able=remarkable a
predict+able=predictable a
love+able=lovable b
value+able=valuable b
believe+able=believable b
use+able=usable b
desire+able=desirable b
imagine+able=imaginable b
notice+able=noticeable c
change+able=changeable c
manage+able=manageable c
replace+able=replaceable c
rely+able=reliable d
deny+able=deniable d
vary+able=variable d
!sense+able=sensible 用 -ible：sensible
!response+able=responsible 用 -ible：responsible
!access+able=accessible 用 -ible：accessible
!reverse+able=reversible 用 -ible：reversible
!flex+able=flexible 用 -ible：flexible` },

  { id: "tion", group: "suffix", icon: "🎬", title: "-tion / -sion 名词",
    rules: { a: "t 结尾：直接加 ion：act → action", b: "以 -ate 结尾：去 e 加 ion：create → creation", c: "以 -de / -se 结尾：变 -sion：decide → decision", d: "以 -ss 结尾：加 ion → -ssion：discuss → discussion" },
    items: `act+ion=action a
invent+ion=invention a
protect+ion=protection a
direct+ion=direction a
collect+ion=collection a
select+ion=selection a
connect+ion=connection a
predict+ion=prediction a
educate+ion=education b
create+ion=creation b
celebrate+ion=celebration b
decorate+ion=decoration b
operate+ion=operation b
populate+ion=population b
imitate+ion=imitation b
decide+ion=decision c
divide+ion=division c
explode+ion=explosion c
conclude+ion=conclusion c
include+ion=inclusion c
confuse+ion=confusion c
revise+ion=revision c
discuss+ion=discussion d
express+ion=expression d
impress+ion=impression d
possess+ion=possession d
!explain+ion=explanation 特殊：explain → explanation（没有 i 了）
!describe+ion=description 特殊：describe → description
!admit+ion=admission 特殊：admit → admission
!permit+ion=permission 特殊：permit → permission
!pronounce+ion=pronunciation 特殊：pronounce → pronunciation（没有 o 了）
!repeat+ion=repetition 特殊：repeat → repetition` },

  { id: "ous", group: "suffix", icon: "🦁", title: "-ous 形容词",
    rules: { a: "直接加 ous：danger → dangerous", b: "以 e 结尾：去 e 加 ous：fame → famous", c: "辅音 + y：y 变 i：glory → glorious" },
    items: `danger+ous=dangerous a
poison+ous=poisonous a
humor+ous=humorous a
mountain+ous=mountainous a
joy+ous=joyous a
fame+ous=famous b
nerve+ous=nervous b
adventure+ous=adventurous b
ridicule+ous=ridiculous b
glory+ous=glorious c
mystery+ous=mysterious c
envy+ous=envious c
fury+ous=furious c
victory+ous=victorious c
luxury+ous=luxurious c
harmony+ous=harmonious c
vary+ous=various c
!courage+ous=courageous ge 结尾保留 e：courageous
!outrage+ous=outrageous ge 结尾保留 e：outrageous
!advantage+ous=advantageous ge 结尾保留 e：advantageous
!space+ous=spacious 特殊：space → spacious
!grace+ous=gracious 特殊：grace → gracious` },

  { id: "yadj", group: "suffix", icon: "🌧️", title: "-y 形容词",
    rules: { a: "直接加 y：rain → rainy", b: "以 e 结尾：去 e 加 y：noise → noisy", c: "短元音 + 一个辅音：双写再加 y：sun → sunny" },
    items: `rain+y=rainy a
cloud+y=cloudy a
salt+y=salty a
dirt+y=dirty a
luck+y=lucky a
wind+y=windy a
smell+y=smelly a
dust+y=dusty a
health+y=healthy a
noise+y=noisy b
ice+y=icy b
shine+y=shiny b
ease+y=easy b
bone+y=bony b
stone+y=stony b
smoke+y=smoky b
sun+y=sunny c
fun+y=funny c
mud+y=muddy c
fog+y=foggy c
bag+y=baggy c
skin+y=skinny c
fur+y=furry c
star+y=starry c` },

  { id: "eror", group: "suffix", icon: "👩‍🏫", title: "-er / -or 做…的人",
    rules: { a: "直接加 er：teach → teacher", b: "去 e 加 r，或双写再加 er：write → writer，run → runner", c: "有些词用 -or：act → actor" },
    items: `teach+er=teacher a
farm+er=farmer a
paint+er=painter a
build+er=builder a
play+er=player a
sing+er=singer a
help+er=helper a
read+er=reader a
write+er=writer b
dance+er=dancer b
drive+er=driver b
bake+er=baker b
run+er=runner b
swim+er=swimmer b
shop+er=shopper b
win+er=winner b
act+er=actor c
visit+er=visitor c
invent+er=inventor c
direct+er=director c
sail+er=sailor c
edit+er=editor c
collect+er=collector c
conduct+er=conductor c
!lie+er=liar 特殊：说谎的人是 liar
!beg+er=beggar 特殊：乞丐是 beggar
!art+er=artist 用 -ist：artist
!science+er=scientist 用 -ist：scientist
!library+er=librarian 用 -ian：librarian` },

  { id: "ive", group: "suffix", icon: "⚡", title: "-ive 形容词",
    rules: { a: "直接加 ive：act → active", b: "以 e 结尾：去 e 加 ive：create → creative" },
    items: `act+ive=active a
attract+ive=attractive a
invent+ive=inventive a
protect+ive=protective a
effect+ive=effective a
select+ive=selective a
impress+ive=impressive a
express+ive=expressive a
mass+ive=massive a
collect+ive=collective a
create+ive=creative b
defense+ive=defensive b
expense+ive=expensive b
offense+ive=offensive b
cooperate+ive=cooperative b
!imagine+ive=imaginative 特殊：imagine → imaginative
!decide+ive=decisive 特殊：decide → decisive
!explode+ive=explosive 特殊：explode → explosive
!compete+ive=competitive 特殊：compete → competitive
!sense+ive=sensitive 特殊：sense → sensitive` },

  // ───────────────────────── 前缀 ─────────────────────────
  { id: "un", group: "prefix", icon: "🙃", title: "un- 不",
    rules: { a: "前缀直接加在前面，原词一个字母都不变：happy → unhappy", b: "原词以 n 开头：会出现两个 n：natural → unnatural" },
    items: `un+happy=unhappy a
un+kind=unkind a
un+lucky=unlucky a
un+fair=unfair a
un+safe=unsafe a
un+true=untrue a
un+able=unable a
un+tidy=untidy a
un+lock=unlock a
un+pack=unpack a
un+usual=unusual a
un+believable=unbelievable a
un+comfortable=uncomfortable a
un+known=unknown a
un+natural=unnatural b
un+necessary=unnecessary b
un+noticed=unnoticed b
un+needed=unneeded b` },

  { id: "dis", group: "prefix", icon: "🔄", title: "dis- 相反",
    rules: { a: "直接加 dis，原词不变：agree → disagree", b: "原词以 s 开头：会出现两个 s：satisfied → dissatisfied" },
    items: `dis+agree=disagree a
dis+like=dislike a
dis+appear=disappear a
dis+honest=dishonest a
dis+obey=disobey a
dis+connect=disconnect a
dis+cover=discover a
dis+able=disable a
dis+order=disorder a
dis+trust=distrust a
dis+loyal=disloyal a
dis+appoint=disappoint a
dis+satisfied=dissatisfied b
dis+similar=dissimilar b
dis+solve=dissolve b
dis+service=disservice b` },

  { id: "mis", group: "prefix", icon: "❌", title: "mis- 错",
    rules: { a: "直接加 mis，原词不变：take → mistake", b: "原词以 s 开头：会出现两个 s：spell → misspell" },
    items: `mis+take=mistake a
mis+behave=misbehave a
mis+understand=misunderstand a
mis+lead=mislead a
mis+place=misplace a
mis+use=misuse a
mis+read=misread a
mis+count=miscount a
mis+judge=misjudge a
mis+treat=mistreat a
mis+spell=misspell b
mis+step=misstep b
mis+statement=misstatement b
mis+shape=misshape b` },

  { id: "re", group: "prefix", icon: "🔁", title: "re- 再 / 回",
    rules: { a: "直接加 re，原词不变：write → rewrite" },
    items: `re+do=redo a
re+write=rewrite a
re+build=rebuild a
re+read=reread a
re+fill=refill a
re+play=replay a
re+tell=retell a
re+turn=return a
re+view=review a
re+cycle=recycle a
re+heat=reheat a
re+appear=reappear a
re+open=reopen a
re+arrange=rearrange a
re+paint=repaint a
re+charge=recharge a` },

  { id: "pre", group: "prefix", icon: "⏮️", title: "pre- / fore- / post- 前后",
    rules: { a: "pre- 之前：view → preview", b: "fore- 在前：cast → forecast", c: "post- 之后：war → postwar" },
    items: `pre+view=preview a
pre+heat=preheat a
pre+school=preschool a
pre+pay=prepay a
pre+historic=prehistoric a
pre+caution=precaution a
pre+fix=prefix a
pre+judge=prejudge a
fore+cast=forecast b
fore+head=forehead b
fore+see=foresee b
fore+ground=foreground b
post+war=postwar c
post+script=postscript c
post+game=postgame c` },

  { id: "inim", group: "prefix", icon: "🚫", title: "in- / im- / il- / ir- 不", fmt: "不 + {1}",
    rules: { a: "一般用 in-：correct → incorrect", b: "b、m、p 前面用 im-：possible → impossible", c: "l 前面用 il-（两个 l）：legal → illegal", d: "r 前面用 ir-（两个 r）：regular → irregular" },
    items: `in+correct=incorrect a
in+complete=incomplete a
in+visible=invisible a
in+active=inactive a
in+credible=incredible a
in+direct=indirect a
in+formal=informal a
in+expensive=inexpensive a
im+possible=impossible b
im+polite=impolite b
im+patient=impatient b
im+perfect=imperfect b
im+mature=immature b
im+mortal=immortal b
im+balance=imbalance b
il+legal=illegal c
il+logical=illogical c
il+literate=illiterate c
ir+regular=irregular d
ir+responsible=irresponsible d
ir+relevant=irrelevant d` },

  { id: "over", group: "prefix", icon: "🌉", title: "over- / under- / out-",
    rules: { a: "over- 超过 / 在上面", b: "under- 在下面 / 不够", c: "out- 在外 / 超过" },
    items: `over+sleep=oversleep a
over+flow=overflow a
over+eat=overeat a
over+look=overlook a
over+night=overnight a
over+come=overcome a
over+weight=overweight a
under+ground=underground b
under+line=underline b
under+water=underwater b
under+stand=understand b
under+wear=underwear b
out+side=outside c
out+door=outdoor c
out+run=outrun c
out+line=outline c
out+standing=outstanding c` },

  { id: "super", group: "prefix", icon: "🦸", title: "super- / sub- / inter- / trans- / anti- / auto-",
    rules: { a: "super- 超级：market → supermarket", b: "sub- 在下面：marine → submarine", c: "inter- 在…之间：national → international", d: "trans- 穿过 · anti- 反对 · auto- 自己" },
    items: `super+market=supermarket a
super+star=superstar a
super+hero=superhero a
super+natural=supernatural a
sub+way=subway b
sub+marine=submarine b
sub+title=subtitle b
sub+merge=submerge b
inter+national=international c
inter+net=internet c
inter+view=interview c
inter+act=interact c
trans+form=transform d
trans+plant=transplant d
anti+freeze=antifreeze d
anti+body=antibody d
auto+graph=autograph d
auto+mobile=automobile d
auto+pilot=autopilot d` },

  { id: "num", group: "prefix", icon: "🔢", title: "数字前缀 uni- / bi- / tri- / multi- / semi-",
    rules: { a: "uni- 一：unicorn 一只角", b: "bi- 二：bicycle 两个轮子", c: "tri- 三：triangle 三个角", d: "multi- 多 · semi- 一半" },
    items: `uni+cycle=unicycle a
uni+corn=unicorn a
uni+form=uniform a
bi+cycle=bicycle b
bi+lingual=bilingual b
tri+angle=triangle c
tri+cycle=tricycle c
tri+pod=tripod c
multi+ply=multiply d
multi+media=multimedia d
semi+circle=semicircle d
semi+final=semifinal d` },

  // ───────────────────────── 词根 ─────────────────────────
  { id: "port", group: "root", icon: "🚚", title: "port 搬运", root: "port（搬运）",
    rules: { a: "port = 搬运、带", b: "trans- 穿过 · ex- 向外 · im- 向里 · re- 回来 · sup- 从下面" },
    items: `trans+port=transport 运输（搬过去）
ex+port=export 出口（搬出去）
im+port=import 进口（搬进来）
re+port=report 报告（把消息带回来）
port+able=portable 便携的（能搬走的）
sup+port=support 支持（从下面托着）
air+port=airport 机场
pass+port=passport 护照
port+er=porter 搬运工
im+port+ant=important 重要的` },

  { id: "spect", group: "root", icon: "👀", title: "spect 看", root: "spect（看）",
    rules: { a: "spect = 看", b: "in- 向里 · re- 再 · pro- 向前 · per- 透过" },
    items: `in+spect=inspect 检查（往里看）
re+spect=respect 尊重（再看一眼）
spect+ator=spectator 观众（看的人）
spect+acle=spectacle 壮观的场面
spect+acular=spectacular 壮观的
in+spect+or=inspector 检查员
pro+spect=prospect 前景（往前看）
re+spect+ful=respectful 有礼貌的
per+spect+ive=perspective 视角
!sus+spect=suspect 合并：sus + spect 只写一个 s → suspect
!ex+spect=expect 合并：x 后面的 s 省掉 → expect` },

  { id: "rupt", group: "root", icon: "🌋", title: "rupt 断裂", root: "rupt（断）",
    rules: { a: "rupt = 断、破", b: "e- 向外 · inter- 中间 · dis- 分开 · cor- 完全" },
    items: `e+rupt=erupt 火山爆发（向外裂开）
inter+rupt=interrupt 打断（从中间断开）
dis+rupt=disrupt 扰乱
cor+rupt=corrupt 腐败（完全坏了）
bank+rupt=bankrupt 破产
ab+rupt=abrupt 突然的
rupt+ure=rupture 破裂
e+rupt+ion=eruption 喷发
inter+rupt+ion=interruption 打断` },

  { id: "tract", group: "root", icon: "🚜", title: "tract 拉", root: "tract（拉）",
    rules: { a: "tract = 拉、拖", b: "at- 向 · sub- 下面 · dis- 分开 · ex- 出来 · con- 一起" },
    items: `tract+or=tractor 拖拉机（拉东西的）
at+tract=attract 吸引（拉过来）
sub+tract=subtract 减去（拉下来）
dis+tract=distract 分心（拉开）
con+tract=contract 合同（拉到一起）
ex+tract=extract 提取（拉出来）
at+tract+ion=attraction 吸引力 / 景点
pro+tract+or=protractor 量角器
tract+ion=traction 牵引力` },

  { id: "dict", group: "root", icon: "🗣️", title: "dict 说", root: "dict（说）",
    rules: { a: "dict = 说", b: "pre- 提前 · contra- 相反 · ver- 真实" },
    items: `pre+dict=predict 预测（提前说）
dict+ion+ary=dictionary 字典
contra+dict=contradict 反驳（说反话）
ver+dict=verdict 裁决（说真话）
dict+ate=dictate 口述 / 听写
pre+dict+ion=prediction 预言
dict+ion=diction 措辞
pre+dict+able=predictable 可预测的` },

  { id: "scrib", group: "root", icon: "✍️", title: "scrib / script 写", root: "scrib / script（写）",
    rules: { a: "scrib / script = 写", b: "de- 往下 · sub- 下面 · pre- 提前 · manu- 手 · post- 后面" },
    items: `de+scribe=describe 描述（写下来）
sub+scribe=subscribe 订阅（在下面签名）
pre+scribe=prescribe 开药方（提前写好）
scrib+ble=scribble 乱写乱画
manu+script=manuscript 手稿（手写的）
post+script=postscript 附言 P.S.
in+scribe=inscribe 刻写
script=script 剧本
!de+scribe+ion=description 变形：describe → description（b 变 p）
!trans+script=transcript 合并：trans + script 只写一个 s` },

  { id: "struct", group: "root", icon: "🏗️", title: "struct 建造", root: "struct（建造）",
    rules: { a: "struct = 建造、堆起来", b: "con- 一起 · in- 里面 · de- 拆掉 · ob- 挡住 · infra- 下面" },
    items: `con+struct=construct 建造
struct+ure=structure 结构
in+struct=instruct 指导（往脑子里建）
de+struct+ion=destruction 毁灭
con+struct+ion=construction 建筑工程
in+struct+or=instructor 教练
ob+struct=obstruct 阻挡
infra+struct+ure=infrastructure 基础设施
re+con+struct=reconstruct 重建` },

  { id: "vis", group: "root", icon: "🔭", title: "vis / vid 看见", root: "vis / vid（看见）",
    rules: { a: "vis / vid = 看见", b: "in- 不 · re- 再 · super- 在上面 · e- 出来 · pro- 向前" },
    items: `vis+ible=visible 看得见的
vis+ion=vision 视力
in+vis+ible=invisible 隐形的
re+vise=revise 修改（再看一遍）
super+vise=supervise 监督（从上面看）
vid+eo=video 视频
e+vid+ence=evidence 证据（让人看见的）
tele+vis+ion=television 电视（看远处）
vis+it=visit 拜访（去看）
pro+vide=provide 提供（提前看到需要）` },

  { id: "ject", group: "root", icon: "🎯", title: "ject 扔", root: "ject（扔）",
    rules: { a: "ject = 扔、投", b: "in- 进 · pro- 向前 · re- 回 · ob- 对着 · sub- 下面 · e- 出" },
    items: `in+ject=inject 注射（扔进去）
pro+ject=project 投影 / 项目（向前扔）
re+ject=reject 拒绝（扔回去）
ob+ject=object 物体 / 反对
sub+ject=subject 科目
e+ject=eject 弹出
pro+ject+or=projector 投影仪
ob+ject+ion=objection 反对意见
re+ject+ion=rejection 拒绝` },

  { id: "greek", group: "root", icon: "📷", title: "tele / photo / graph / scope / micro / phone", root: "希腊词根",
    rules: { a: "tele 远 · photo 光 · graph 写 / 画 · scope 看 · micro 小 · phone 声音", b: "auto 自己 · para 旁边 · bio 生命 · geo 地球 · peri 周围" },
    items: `tele+phone=telephone 电话（远处的声音）
tele+scope=telescope 望远镜（看远处）
photo+graph=photograph 照片（用光画）
auto+graph=autograph 签名（自己写）
para+graph=paragraph 段落
micro+scope=microscope 显微镜（看小东西）
micro+phone=microphone 麦克风（小声音变大）
bio+graphy=biography 传记（写一生）
geo+graphy=geography 地理（画地球）
photo+graph+er=photographer 摄影师
peri+scope=periscope 潜望镜（看周围）` },

  { id: "logy", group: "root", icon: "🔬", title: "-logy / -graphy 学科", root: "logy（学问）",
    rules: { a: "-logy = …学：biology 生物学", b: "bio 生命 · geo 地球 · zoo 动物 · eco 生态 · myth 神话 · astro 星星" },
    items: `bio+logy=biology 生物学
geo+logy=geology 地质学
zoo+logy=zoology 动物学
techno+logy=technology 科技
eco+logy=ecology 生态学
myth+ology=mythology 神话
photo+graphy=photography 摄影
astro+nomy=astronomy 天文学
psych+ology=psychology 心理学` },

  { id: "aud", group: "root", icon: "👂", title: "aud 听 · voc 声音", root: "aud（听）· voc（声音）",
    rules: { a: "aud = 听", b: "voc = 声音、叫" },
    items: `audi+o=audio 音频
aud+ience=audience 观众（听的人）
aud+ible=audible 听得见的
in+aud+ible=inaudible 听不见的
aud+ition=audition 试音
aud+itor+ium=auditorium 礼堂
voc+al=vocal 声音的 / 唱的
voc+abulary=vocabulary 词汇
ad+voc+ate=advocate 倡导者（为别人发声）` },
]

// 解析成游戏里用的单词对象
const RULE_ITEMS = {}
RULE_LEVELS.forEach((L) => {
  RULE_ITEMS[L.id] = L.items.trim().split("\n").map((line) => {
    line = line.trim()
    const special = line.startsWith("!")
    if (special) line = line.slice(1)
    const sp = line.indexOf(" ")
    const formula = sp < 0 ? line : line.slice(0, sp)
    const rest = sp < 0 ? "" : line.slice(sp + 1).trim()
    const [lhs, ans] = formula.split("=")
    const parts = lhs.split("+")
    const tag = /^[a-z]$/.test(rest) ? rest : ""
    const why = special ? rest : tag ? (L.rules[tag] || "") : rest
    const shown = L.fmt ? L.fmt.replace(/\{(\d)\}/g, (_, i) => parts[+i] || "") : parts.join(" + ")
    return { w: ans, key: `rule:${L.id}:${ans}`, s: [ans], m: shown, e: "", parts, tag, why, special, rule: L.id, root: L.group === "root" }
  })
})
