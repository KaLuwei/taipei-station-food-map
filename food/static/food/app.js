
'use strict';
const RESTAURANTS=JSON.parse(document.getElementById('restaurant-data').textContent);
const OFFICIAL_LOGOS=JSON.parse(document.getElementById('logos-data').textContent);
const AREAS=[
{id:'station',name:'車站站內 2F',color:'#368b78',zones:['station']},
{id:'q',name:'京站商場',color:'#c79245',zones:['qmain','qfood']},
{id:'south',name:'南陽街・許昌街',color:'#c67f6a',zones:['south']},
{id:'west',name:'開封街・懷寧街',color:'#608fbe',zones:['west']},
{id:'north',name:'華陰街・後車站',color:'#9476bc',zones:['north']},
{id:'y',name:'台北地下街 Y區',color:'#4b8aa2',zones:['y']},
{id:'z',name:'站前地下街 Z區',color:'#8969b3',zones:['z']},
{id:'k',name:'東森廣場 K區',color:'#b97e46',zones:['k']},
{id:'r',name:'中山地下街 R區',color:'#8c6d9c',zones:['r']},
{id:'east',name:'中山北路・長安巷弄',color:'#66a39c',zones:['east']},
{id:'skm',name:'站前百貨・凱撒飯店',color:'#9d8067',zones:['skm']},
{id:'southeast',name:'公園路・青島西路',color:'#ad817c',zones:['southeast']}
];
const CUISINES=['台式／小吃','麵食','日式','西式／義式','異國亞洲','韓式','火鍋','海鮮','蔬食','甜點／飲料'];
const $=id=>document.getElementById(id);
function escapeHtml(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function icon(name){return `<svg class="icon"><use href="#i-${name}"/></svg>`;}
function classify(r){const x=r.kind+' '+r.name;if(/蔬食|素食/.test(x))return '蔬食';if(/牛肉麵|拉麵|刀削|麵食|拌麵|湯麵|麵線/.test(x))return '麵食';if(/海鮮|生魚|鮭魚/.test(x))return '海鮮';if(/甜|冰|咖啡|果汁|飲料/.test(x))return '甜點／飲料';if(/韓式|韓國/.test(x))return '韓式';if(/泰式|越式|東南亞|印度/.test(x))return '異國亞洲';if(/火鍋|涮涮|壽喜燒/.test(x))return '火鍋';if(/日式|壽司|丼飯|咖哩|燒肉|天丼|豬排/.test(x))return '日式';if(/義式|西式|牛排|歐式|洋食|地中海/.test(x))return '西式／義式';return '台式／小吃';}
function group(r){return AREAS.find(a=>a.zones.includes(r.zone));}
function isFast(r){return /便當|飯糰|麵|丼|咖哩|水餃|小吃|粽|餅|滷肉飯/.test(r.kind+' '+r.dish);}
function isGroup(r){return /火鍋|合菜|早午餐|義式|西式|自助餐|牛排|燒肉|餐館|食堂|泰式/.test(r.kind+' '+r.name);}
function fitsMood(r,m){if(m==='all')return true;if(m==='fast'||m==='solo')return isFast(r)||r.low<=250;if(m==='group')return isGroup(r)||r.low>=300;if(m==='light')return /小吃|甜|冰|麵線|咖啡|餅|包|飯糰/.test(r.kind+' '+r.dish);return true;}
const NORMAL_GROUPS={
'牛肉麵':['牛肉麵','牛肉','刀削','拉麵'],
'平價':['平價','便宜','省錢','學生','200元內','200以下','一百','兩百'],
'日式':['日式','日本','拉麵','壽司','天丼','豬排','咖哩'],
'聚餐':['聚餐','朋友','家庭','聊天','多人'],
'甜點':['甜點','下午茶','冰','咖啡','飯後'],
'快速':['快速','趕時間','一個人','獨食','簡單吃'],
'台式':['台式','台灣','小吃','滷肉飯','飯糰'],
'火鍋':['火鍋','涮涮','壽喜燒'],
'素食':['素食','蔬食','vegan']};
function norm(s){return String(s||'').toLowerCase().normalize('NFKC').replace(/[\s、，。·・\/\-＿_!！？?（）()]+/g,'');}
function scoreQuery(r,query){let q=norm(query);if(!q)return 1;const name=norm(r.name),all=norm([r.name,r.dish,r.kind,r.zoneLabel,r.good,classify(r)].join(' '));if(name.includes(q))return 120;if(all.includes(q))return 50;let s=0;for(const [canon,aliases] of Object.entries(NORMAL_GROUPS)){if(aliases.some(w=>q.includes(norm(w)))||q.includes(norm(canon))){const hay=aliases.concat([canon]);if(hay.some(w=>all.includes(norm(w))))s+=20;if(canon==='平價'&&r.low<=200)s+=35;if(canon==='快速'&&isFast(r))s+=30;if(canon==='聚餐'&&isGroup(r))s+=30;}}
const money=q.match(/(\d{2,4})(?:元|塊|以下|內)/);if(money&&r.low<=Number(money[1]))s+=25;
for(const chunk of q.match(/.{1,2}/g)||[]){if(chunk.length===2&&all.includes(chunk))s+=3;}return s;}
const state={query:'',area:'all',cuisine:'all',budget:'all',mood:'all',meal:null,sort:'relevant',results:false,selected:null,from:'',wheel:null};
function filtered(s=state){let arr=RESTAURANTS.map(r=>({...r,score:s.query?scoreQuery(r,s.query):0}));if(s.query)arr=arr.filter(r=>r.score>0);if(s.area!=='all'){const area=AREAS.find(a=>a.id===s.area);if(area)arr=arr.filter(r=>area.zones.includes(r.zone));else arr=arr.filter(r=>r.zone===s.area);}if(s.cuisine!=='all')arr=arr.filter(r=>classify(r)===s.cuisine);if(s.budget!=='all')arr=arr.filter(r=>s.budget==='high'?r.low>=500:r.low<=Number(s.budget));arr=arr.filter(r=>fitsMood(r,s.mood));if(s.meal)arr=arr.filter(r=>fitsMeal(r,s.meal));if(s.sort==='price')arr.sort((a,b)=>a.low-b.low);else if(s.sort==='name')arr.sort((a,b)=>a.name.localeCompare(b.name,'zh-Hant'));else arr.sort((a,b)=>b.score-a.score||a.low-b.low);return arr;}
function sizeMap(keep=false){const wrap=$('mapWrap'),paper=$('mapPaper');const oldRatio=wrap.scrollWidth>wrap.clientWidth?wrap.scrollLeft/(wrap.scrollWidth-wrap.clientWidth):.5;const width=Math.max(wrap.clientWidth,wrap.clientHeight*2048/1260);paper.style.width=width+'px';paper.style.height=width*1260/2048+'px';if(!keep)wrap.scrollLeft=(wrap.scrollWidth-wrap.clientWidth)*.53;else wrap.scrollLeft=(wrap.scrollWidth-wrap.clientWidth)*oldRatio;}
function renderLegend(){$('legend').innerHTML=AREAS.map(a=>`<button type="button" data-area="${a.id}"><i class="swatch" style="background:${a.color}"></i>${a.name} <span>${RESTAURANTS.filter(r=>a.zones.includes(r.zone)).length}</span></button>`).join('');$('legend').querySelectorAll('button').forEach(b=>b.onclick=()=>chooseArea(b.dataset.area));}
function paintZones(selected=''){$('zoneSvg').querySelectorAll('.zone-group').forEach(x=>x.classList.toggle('active',x.dataset.area===selected));}
function resetRefine(){$('refinePrice').value='all';$('refineCuisine').value='all';$('refineSort').value='relevant';}
function openResults(title){state.results=true;renderResults(title);$('results').classList.add('open');}
function chooseArea(id){closeJourney();$('manualControls').classList.add('hidden');$('manualToggle').setAttribute('aria-expanded','false');state.meal=null;state.query='';state.area=id;state.cuisine='all';state.budget='all';state.mood='all';state.sort='relevant';$('searchInput').value='';resetRefine();paintZones(id);openResults(AREAS.find(a=>a.id===id)?.name||'區域美食');}
function renderResults(title){const arr=filtered();$('resultsTitle').textContent=title||state.from||'符合的店家';$('resultSummary').textContent=state.query?'依店名、料理、相近關鍵字及篩選條件找店家。':'點選店名，可在同一頁快速看完推薦、評論及 AI 分析。';$('resultCount').textContent=`已收錄 ${arr.length} 家 · 不代表區域全部店家；價格、營業時間僅供參考`;
$('resultItems').innerHTML=arr.length?arr.map(r=>`<button type="button" class="restaurant-card" data-id="${r.id}"><div class="mark" data-logo="${r.id}"></div><div><div class="r-title">${escapeHtml(r.name)}</div><div class="r-sub">${escapeHtml(classify(r))} · ${escapeHtml(group(r)?.name||'北車商圈')}</div><div class="r-dish">推薦：${escapeHtml(r.dish)}</div><div class="r-footer"><b>NT$ ${r.low}–${r.high}</b><span>${escapeHtml(r.good)}</span></div></div><svg class="icon r-next"><use href="#i-arrow"/></svg></button>`).join(''):'<div class="no-results">沒有完全符合這組條件的店家。<br>可以放寬價位或換一個搜尋詞。</div>';
$('resultItems').querySelectorAll('.restaurant-card').forEach(b=>b.onclick=()=>openDetail(Number(b.dataset.id)));$('resultItems').querySelectorAll('[data-logo]').forEach(e=>logoInto(e,RESTAURANTS.find(r=>r.id===Number(e.dataset.logo))));}
function submitSearch(){closeJourney();$('manualControls').classList.add('hidden');$('manualToggle').setAttribute('aria-expanded','false');state.meal=null;const q=$('searchInput').value.trim();if(!q){$('manualControls').classList.remove('hidden');$('searchInput').focus();return;}state.query=q;state.area='all';state.cuisine=$('typeSelect').value;state.budget=$('budgetSelect').value;state.mood=$('moodSelect').value;state.sort='relevant';state.from=`「${q}」的搜尋結果`;resetRefine();paintZones();openResults(state.from);}
$('searchForm').onsubmit=e=>{e.preventDefault();submitSearch();};$('manualToggle').onclick=()=>{const closed=$('manualControls').classList.toggle('hidden');$('manualToggle').setAttribute('aria-expanded',String(!closed));};$('filterApply').onclick=()=>{closeJourney();state.meal=null;state.query=$('searchInput').value.trim();state.area=$('areaSelect').value;state.cuisine=$('typeSelect').value;state.budget=$('budgetSelect').value;state.mood=$('moodSelect').value;state.sort='relevant';state.from=state.area==='all'?'條件篩選結果':(AREAS.find(a=>a.id===state.area)?.name||'條件篩選結果');resetRefine();paintZones(state.area);$('manualControls').classList.add('hidden');$('manualToggle').setAttribute('aria-expanded','false');openResults(state.from);};
$('resultsClose').onclick=()=>{$('results').classList.remove('open');state.results=false;};$('resultsDismiss').onclick=()=>$('resultsClose').click();$('filterDismiss').onclick=()=>{$('manualControls').classList.add('hidden');$('manualToggle').setAttribute('aria-expanded','false');};$('homeBtn').onclick=()=>{closeJourney();$('resultsClose').click();closeDetail();$('mapWrap').scrollLeft=($('mapWrap').scrollWidth-$('mapWrap').clientWidth)*.53;};$('refinePrice').onchange=e=>{state.budget=e.target.value;renderResults();};$('refineCuisine').onchange=e=>{state.cuisine=e.target.value;renderResults();};$('refineSort').onchange=e=>{state.sort=e.target.value;renderResults();};document.querySelectorAll('[data-key]').forEach(b=>b.onclick=()=>{$('searchInput').value=b.dataset.key;submitSearch();});document.querySelectorAll('.zone-group').forEach(e=>{e.addEventListener('click',()=>chooseArea(e.dataset.area));e.addEventListener('keydown',ev=>{if(ev.key==='Enter'||ev.key===' '){ev.preventDefault();chooseArea(e.dataset.area);}})});
for(const a of AREAS){$('areaSelect').insertAdjacentHTML('beforeend',`<option value="${a.id}">${a.name}</option>`);}for(const t of CUISINES){$('typeSelect').insertAdjacentHTML('beforeend',`<option value="${t}">${t}</option>`);$('refineCuisine').insertAdjacentHTML('beforeend',`<option value="${t}">${t}</option>`);}
function markSvg(r){const palettes=[['#e6f1e8','#4b8b70'],['#f8e9db','#b77851'],['#e6ecf6','#6488b6'],['#f1e7f5','#9b6ea6'],['#f8eedb','#ae9055']];const [bg,ink]=palettes[r.id%palettes.length];const short=r.name.replace(/[（）()·\s]/g,'').slice(0,2);const art=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160"><rect width="160" height="160" rx="28" fill="${bg}"/><circle cx="80" cy="75" r="52" fill="none" stroke="${ink}" stroke-width="2" opacity=".28"/><circle cx="80" cy="75" r="43" fill="none" stroke="${ink}" stroke-width="1.5" opacity=".3"/><path d="M24 125Q80 98 136 125" stroke="${ink}" stroke-width="2" fill="none" opacity=".38"/><text x="80" y="89" fill="${ink}" text-anchor="middle" font-weight="900" font-family="Noto Sans TC,Arial,sans-serif" font-size="41">${escapeXml(short)}</text><text x="80" y="141" fill="${ink}" text-anchor="middle" font-family="Arial,sans-serif" font-weight="700" font-size="10" letter-spacing="3">FOOD MAP</text></svg>`;return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(art);}
function escapeXml(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
function logoInfo(r){const exact=OFFICIAL_LOGOS[r.name]||OFFICIAL_LOGOS[r.name.replace(/[（(].*$/,'')];return exact||null;}
function logoInto(el,r){if(!r)return;const info=logoInfo(r);const fallback=markSvg(r);el.innerHTML='';const img=new Image();img.alt=r.name+(info?' 網路品牌識別圖':' 原創非官方識別圖');img.loading='lazy';img.decoding='async';img.onerror=()=>{if(img.src!==fallback)img.src=fallback;};img.src=info?info.src:fallback;el.appendChild(img);}
function foodRecommendations(r){return [...new Set(r.dish.split(/[、，,／/]/g).map(x=>x.trim()).filter(Boolean))];}
function timeHint(r){if(/待確認|歷史|資料不一致/.test(r.hours))return '營業時間尚待確認，出發前先確認店家是否開門。';if(r.zone==='north')return '建議平日 14:00–16:00，但須留意部分老店午後休息。';if(['south','west'].includes(r.zone))return '建議 11:00 前後或 14:00–17:00；分段供餐店家需避開午休。';return '建議 11:00–11:30 或 14:00–16:30，晚餐可選 17:00–17:30。';}
function aiText(r){const budget=r.low<=150?'較平價':r.low<=350?'中等預算':'偏中高預算';const situation=isFast(r)?'適合想快速解決一餐、或單獨用餐的人':isGroup(r)?'適合想坐下來用餐或與朋友聚餐':'可作為當日想換口味時的選擇';return `${r.name}屬於${classify(r)}類型，預估每人 NT$ ${r.low}–${r.high}，是${budget}的選項。${situation}。可以先點「${foodRecommendations(r)[0]||r.dish}」；優勢是${r.good}，但需要考慮${r.bad}。${timeHint(r)}以上為已整理資料的 AI 規則化判斷，不是即時評論分析。`;}
function mapsUrl(r){return 'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(r.name+' '+r.zoneLabel+' 台北');}
function menuUrl(r){return 'https://www.google.com/search?q='+encodeURIComponent(r.name+' '+r.zoneLabel+' 菜單 2026');}
function openDetail(id,fromJourney=false){$('detailBack').innerHTML=`<svg class="icon"><use href="#i-back"/></svg>${fromJourney?'返回美食行程':'返回店家清單'}`;const r=RESTAURANTS.find(x=>x.id===id);if(!r)return;state.selected=r;$('detailName').textContent=r.name;$('detailLocation').textContent=r.zoneLabel;$('detailCuisine').textContent=classify(r)+' · '+r.kind;$('detailPills').innerHTML=`<span class="pill">NT$ ${r.low}–${r.high} / 人</span><span class="pill">${escapeHtml(r.distance)}</span>`;$('detailMeals').innerHTML=foodRecommendations(r).map(x=>`<span class="meal-item">${escapeHtml(x)}</span>`).join('');$('detailGood').textContent=r.good;$('detailBad').textContent=r.bad;$('detailAi').textContent=aiText(r) + (r.data_status?' 資料狀態：'+r.data_status+'。':'');$('detailFacts').innerHTML=[['類型',r.kind],['營業時間（參考）',r.hours],['預估價格',`NT$ ${r.low}–${r.high} / 人`],['建議避峰',timeHint(r)],['範圍',r.zoneLabel],['步行資訊',r.distance],['資料查證',r.data_status||'先前整理，未逐店核實']].map(([k,v])=>`<div class="fact"><small>${escapeHtml(k)}</small><strong>${escapeHtml(v)}</strong></div>`).join('');$('detailActions').innerHTML=`<a class="action-link" href="${mapsUrl(r)}" target="_blank" rel="noopener noreferrer">Google 地圖查看位置 ${icon('external')}</a><a class="action-link" href="${menuUrl(r)}" target="_blank" rel="noopener noreferrer">搜尋最新正式菜單 ${icon('external')}</a>`;const info=logoInfo(r);$('detailLogoSource').innerHTML=info?`Logo 圖源：<a href="${escapeHtml(info.source)}" target="_blank" rel="noopener noreferrer">${escapeHtml(info.label)}</a>；如無法讀取則自動顯示非官方識別圖。`:'此店目前使用程式生成的原創識別圖，並非官方 Logo。';logoInto($('detailLogo'),r);$('detail').classList.add('open');$('detail').scrollTop=0;}
function closeDetail(){$('detail').classList.remove('open');state.selected=null;}
$('detailBack').onclick=closeDetail;$('detailDismiss').onclick=closeDetail;$('detailHome').onclick=()=>{closeDetail();closeJourney();$('resultsClose').click();};
const BREAKFAST_IDS=new Set([2,63,66,76,77,79,85,89,93,94,98,109,128,132,137]);
const DINNER_EXCLUDE=new Set([66,76,89,94,96,98]);
const MEAL_NAMES={breakfast:'早餐',lunch:'午餐',dinner:'晚餐'};
// 餐期係依先前整理的營業時段、品項類型保守推估，非即時可訂餐狀態。
function fitsMeal(r,meal){
 if(meal==='breakfast')return BREAKFAST_IDS.has(r.id)||(/06:30|07:00|08:00/.test(r.hours)&&!classify(r).includes('甜點')); 
 if(classify(r)==='甜點／飲料')return false;
 if(meal==='lunch')return r.id!==95&&r.id!==66;
 if(meal==='dinner')return !DINNER_EXCLUDE.has(r.id)&&!(/待確認|歷史/.test(r.hours))&&r.id!==74&&r.id!==132&&r.id!==137;
 return true;
}
const wheelState={step:1,meal:null,selections:{},selected:null,options:[],degrees:0,spinning:false,serial:0};
function wheelCandidates(){return filtered({query:'',area:'all',cuisine:wheelState.selections.cuisine||'all',budget:'all',mood:'all',sort:'relevant'}).filter(r=>fitsMeal(r,wheelState.meal));}
function wheelOptions(){
 if(wheelState.step===1){const arr=wheelCandidates();const groups=CUISINES.filter(g=>arr.some(r=>classify(r)===g));return groups.map(g=>({label:g,value:g}));}
 const arr=wheelCandidates();const shuffle=arr.slice();for(let i=shuffle.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[shuffle[i],shuffle[j]]=[shuffle[j],shuffle[i]];}shuffle.length=Math.min(shuffle.length,8);return shuffle.map(r=>({label:r.name,value:r.id}));
}
function wedge(start,end,radius=194){const f=a=>[200+radius*Math.cos(a),200+radius*Math.sin(a)];const a=f(start),b=f(end);return `M200,200L${a[0]},${a[1]}A${radius},${radius} 0 ${end-start>Math.PI?1:0},1 ${b[0]},${b[1]}Z`;}
function renderWheel(){
 wheelState.options=wheelOptions();wheelState.selected=null;wheelState.degrees=0;
 $('wheelSvg').style.transition='none';$('wheelSvg').style.transform='rotate(0deg)';
 const n=wheelState.options.length;const colors=['#d6e9dd','#eecfbe','#d9e4f2','#e8deef','#f3e5c9','#d3e6e5','#f0dbd7','#dce8cd','#e8e0f0','#d6e9df'];let svg='';
 wheelState.options.forEach((o,i)=>{const a=-Math.PI/2+i*2*Math.PI/n,b=a+2*Math.PI/n,m=(a+b)/2;const p=132;const x=200+p*Math.cos(m),y=200+p*Math.sin(m);const label=o.label.length>7?o.label.slice(0,6)+'…':o.label;svg+=(n===1?`<circle cx="200" cy="200" r="194" fill="${colors[0]}"/>`:`<path d="${wedge(a,b)}" fill="${colors[i%colors.length]}" stroke="#fff" stroke-width="3"/>`)+`<text class="wheel-text" x="${x}" y="${y}" text-anchor="middle" dominant-baseline="middle" transform="rotate(${(m*180/Math.PI)+90},${x},${y})">${escapeHtml(label)}</text>`;});
 $('wheelSvg').innerHTML=svg+'<circle cx="200" cy="200" r="195" fill="none" stroke="#fff" stroke-width="8"/>';
 const meal=MEAL_NAMES[wheelState.meal];$('wheelCounter').textContent=(wheelState.step===1?'第一步｜轉料理類型':'第二步｜選出餐廳')+` · ${wheelCandidates().length} 家${meal}候選`;
 $('chosenMealLabel').textContent='目前選擇：'+meal;
 $('steps').innerHTML=[0,1,2].map(i=>`<div class="step ${i<=wheelState.step?'done':''}"></div>`).join('');
 $('wheelResult').textContent='轉動轉盤，看看下一餐吃什麼';$('spinBtn').textContent='轉動轉盤';$('spinBtn').classList.remove('hidden');$('spinBtn').disabled=!n;$('nextWheelBtn').classList.add('hidden');$('wheelSeeBtn').classList.add('hidden');
 if(!n)$('wheelResult').textContent='這個餐期暫時沒有符合條件的店家，請改選餐期。';
}
function showMealChoices(){wheelState.serial++;wheelState.meal=null;wheelState.step=1;wheelState.selections={};wheelState.spinning=false;$('mealStep').classList.remove('hidden');$('wheelSpinStep').classList.add('hidden');$('steps').innerHTML=[0,1,2].map((i)=>`<div class="step ${i===0?'done':''}"></div>`).join('');}
function startWheel(){closeJourney();wheelState.spinning=false;$('wheelMask').classList.add('open');showMealChoices();}
function closeWheel(){wheelState.serial++;$('wheelMask').classList.remove('open');wheelState.spinning=false;}
$('wheelOpen').onclick=startWheel;$('wheelClose').onclick=closeWheel;$('wheelMask').addEventListener('click',e=>{if(e.target===$('wheelMask'))closeWheel();});
document.querySelectorAll('[data-meal]').forEach(b=>b.onclick=()=>{wheelState.meal=b.dataset.meal;wheelState.step=1;wheelState.selections={};$('mealStep').classList.add('hidden');$('wheelSpinStep').classList.remove('hidden');renderWheel();});
$('changeMealBtn').onclick=showMealChoices;
$('spinBtn').onclick=()=>{
 if(wheelState.spinning||!wheelState.options.length)return;
 wheelState.spinning=true;$('spinBtn').disabled=true;const call=++wheelState.serial;const n=wheelState.options.length,i=Math.floor(Math.random()*n),angle=360/n;
 const target=(360-((i+.5)*angle)%360)%360;const diff=(target-(wheelState.degrees%360)+360)%360;wheelState.degrees+=1440+diff;
 $('wheelSvg').style.transition='transform 2.4s cubic-bezier(.13,.73,.11,1)';requestAnimationFrame(()=>requestAnimationFrame(()=>$('wheelSvg').style.transform=`rotate(${wheelState.degrees}deg)`));
 setTimeout(()=>{if(call!==wheelState.serial||!$('wheelMask').classList.contains('open'))return;const result=wheelState.options[i];wheelState.selected=result;const key=wheelState.step===1?'cuisine':'shop';wheelState.selections[key]=result.value;$('wheelResult').textContent=`選到：${result.label}`;wheelState.spinning=false;$('spinBtn').disabled=false;$('spinBtn').textContent='重新轉一次';if(wheelState.step===1)$('nextWheelBtn').classList.remove('hidden');else{$('wheelSeeBtn').classList.remove('hidden');$('wheelSeeBtn').textContent='查看這家餐廳';}},2500);
};
$('nextWheelBtn').onclick=()=>{wheelState.serial++;wheelState.step=2;renderWheel();};
$('wheelSeeBtn').onclick=()=>{const r=RESTAURANTS.find(x=>x.id===wheelState.selections.shop);closeWheel();if(!r)return;state.area='all';state.query='';state.meal=wheelState.meal;state.cuisine=wheelState.selections.cuisine||'all';state.budget='all';state.mood='all';state.from=MEAL_NAMES[wheelState.meal]+'轉盤推薦';resetRefine();openResults(state.from);openDetail(r.id);};

// V7 行程：預設主題切換及使用者自訂（儲存於目前瀏覽器的 localStorage）。
// 前三條行程完全保留 V6 時段與店家，並以原有名單擴充其他主題。
const JOURNEY_TEMPLATES=[
 {uid:'preset-0',theme:'taiwan',title:'經典台味線',sub:'早餐與老店小吃一路吃到海鮮晚餐',steps:[
  {id:132,time:'08:15',meal:'早餐',note:'青島西路的外帶飯糰，先選好口味'},
  {id:76,time:'11:30',meal:'午餐',note:'用清燉牛肉麵作為午餐，避開正午人潮'},
  {id:96,time:'14:30',meal:'午後點心',note:'轉往後車站，吃份傳統芋圓；請確認當日供應'},
  {id:83,time:'17:15',meal:'晚餐',note:'海鮮丼晚餐；三多屋週日、週一通常休息'}]},
 {uid:'preset-1',theme:'station',title:'車站周邊線',sub:'交通方便，餐期安排較有彈性',steps:[
  {id:128,time:'08:30',meal:'早餐',note:'先吃一份沖繩飯糰，方便出發'},
  {id:11,time:'11:30',meal:'午餐',note:'站內炭烤丼飯，適合一人或同行'},
  {id:141,time:'15:00',meal:'午後點心',note:'車站 1 樓選一份甜點，外帶也方便'},
  {id:16,time:'17:30',meal:'晚餐',note:'京站火鍋聚餐；熱門時段建議先查現場候位'}]},
 {uid:'preset-2',theme:'alley',title:'巷弄探索線',sub:'從長安西路走回北車站前',steps:[
  {id:137,time:'08:30',meal:'早餐',note:'長安西路巷內傳統碗粿；週一多半休息'},
  {id:135,time:'11:40',meal:'午餐',note:'日式或南洋咖哩，座位不多建議早到'},
  {id:141,time:'15:00',meal:'下午茶',note:'回到台北車站，外帶玫瑰塔'},
  {id:139,time:'18:00',meal:'晚餐',note:'站前百貨蔬食自助餐；請先確認餐期與席次'}]},
 {uid:'preset-3',theme:'budget',title:'平價吃遍北車',sub:'以街邊小吃、麵食和銅板點心安排一日',steps:[
  {id:63,time:'08:30',meal:'早餐',note:'飯糰霸週日休息，尖峰時段可能排隊'},
  {id:70,time:'11:30',meal:'午餐',note:'手工水餃與酸辣湯，店家週日休息'},
  {id:87,time:'15:00',meal:'午後點心',note:'現炸蔥油餅，週一公休'},
  {id:77,time:'17:30',meal:'晚餐',note:'以牛肉麵作結；實際營業請再確認'}]},
 {uid:'preset-4',theme:'japan',title:'日式料理巡禮',sub:'從早晨飯糰到天丼、日式甜點及握壽司',steps:[
  {id:128,time:'08:30',meal:'早餐',note:'沖繩飯糰作為輕早餐'},
  {id:5,time:'11:00',meal:'午餐',note:'天婦羅丼飯較熱門，建議避開午間人潮'},
  {id:25,time:'15:00',meal:'下午茶',note:'洋食店的鬆餅，留意供餐時段'},
  {id:27,time:'18:00',meal:'晚餐',note:'握壽司可以依食量單點'}]},
 {uid:'preset-5',theme:'world',title:'異國風味環遊線',sub:'從亞洲主食轉到印度、洋食與泰式料理',steps:[
  {id:128,time:'08:30',meal:'早餐',note:'先吃沖繩飯糰'},
  {id:44,time:'11:30',meal:'午餐',note:'印度料理咖哩，建議確認辣度'},
  {id:25,time:'15:00',meal:'午後甜點',note:'洋食與鬆餅，適合休息聊天'},
  {id:21,time:'18:00',meal:'晚餐',note:'泰式料理；請查當日菜單及營業時間'}]},
 {uid:'preset-6',theme:'vegan',title:'蔬食友善探索',sub:'從蔬食簡餐到甜食及蔬食自助餐；品項須逐店確認',steps:[
  {id:130,time:'10:00',meal:'早午餐',note:'雙連方向延伸路線，超過核心五分鐘範圍'},
  {id:28,time:'12:15',meal:'午餐',note:'義式植物性料理；請向店家確認飲食需求'},
  {id:97,time:'15:30',meal:'下午點心',note:'可選古早味冰或素麵線，確認配料'},
  {id:139,time:'17:30',meal:'晚餐',note:'蔬食自助餐，依場次營業'}]},
 {uid:'preset-7',theme:'dessert',title:'甜點慢慢吃',sub:'搭配正餐、芋圓、法式塔與鬆餅，適合分享',steps:[
  {id:94,time:'09:30',meal:'早午餐',note:'早餐輕食店；假日人潮可能較多'},
  {id:74,time:'12:00',meal:'午間甜品',note:'綠豆蒜特色甜品，部分人喜歡濃稠口感'},
  {id:141,time:'15:00',meal:'下午茶',note:'法式玫瑰塔，適合外帶分食'},
  {id:25,time:'18:00',meal:'晚餐',note:'洋食搭配鬆餅；可只挑想吃的站點'}]},
 {uid:'preset-8',theme:'late',title:'晚餐接深夜',sub:'從午餐到深夜火鍋；不含早餐，適合晚起的一天',steps:[
  {id:120,time:'12:00',meal:'午餐',note:'K 區義大利料理'},
  {id:129,time:'15:30',meal:'午後點心',note:'往中山方向延伸，請留意步行距離'},
  {id:18,time:'18:00',meal:'晚餐',note:'京站義式料理，可多人分享'},
  {id:16,time:'21:30',meal:'宵夜',note:'火鍋營業較晚；請確認最後入場與候位'}]}
];
const JOURNEY_STORAGE='beiche-food-custom-journeys-v1';
const JOURNEY_MEALS=['早餐','早午餐','午餐','下午茶','午後點心','晚餐','宵夜'];
const journeyThemeNames={taiwan:'經典台味',station:'車站周邊',alley:'巷弄探索',budget:'平價美食',japan:'日式料理',world:'異國料理',vegan:'蔬食',dessert:'甜食慢旅',late:'夜間美食'};
let customJourneys=readSavedJourneys();
let activeJourneyId='preset-0';
let journeyTheme='all';
let editingJourney=null;
let draftJourney=null;
function readSavedJourneys(){
 try{const raw=JSON.parse(localStorage.getItem(JOURNEY_STORAGE)||'[]');
  if(!Array.isArray(raw))return [];
  return raw.slice(0,50).filter(r=>r&&typeof r.uid==='string'&&Array.isArray(r.steps)&&r.uid.startsWith('my-'))
   .map(r=>({uid:r.uid.slice(0,70),title:String(r.title||'我的行程').slice(0,32),sub:String(r.sub||'').slice(0,100),theme:journeyThemeNames[r.theme]?r.theme:'station',custom:true,
   steps:r.steps.slice(0,8).filter(s=>RESTAURANTS.some(x=>x.id===Number(s.id))).map(s=>({id:Number(s.id),time:/^\d\d:\d\d$/.test(s.time)?s.time:'12:00',meal:JOURNEY_MEALS.includes(s.meal)?s.meal:'午餐',note:String(s.note||'').slice(0,160)}))})).filter(r=>r.steps.length>=2);
 }catch(_){return []}
}
function persistJourneys(next){try{localStorage.setItem(JOURNEY_STORAGE,JSON.stringify(next));return true}catch(_){return false}}
function journeyList(){return JOURNEY_TEMPLATES.concat(customJourneys)}
function journeyCurrent(){return journeyList().find(x=>x.uid===activeJourneyId)||journeyList()[0]}
function visibleJourneys(){return journeyList().filter(x=>journeyTheme==='all'||(journeyTheme==='mine'?x.custom:x.theme===journeyTheme))}
function journeyNotice(msg,problem=false){const el=$('journeyNotice');el.textContent=msg;el.classList.toggle('is-error',problem);el.classList.toggle('shown',!!msg);}
function journeyMapsLink(stops){const names=stops.map(s=>RESTAURANTS.find(r=>r.id===Number(s.id))).filter(Boolean).map(r=>r.name+' '+r.zoneLabel+' 台北');return 'https://www.google.com/maps/dir/?api=1&origin='+encodeURIComponent(names[0]||'台北車站')+'&destination='+encodeURIComponent(names[names.length-1]||'台北車站')+'&travelmode=walking&waypoints='+encodeURIComponent(names.slice(1,-1).join('|'));}
function renderJourney(){
 const lists=visibleJourneys();let j=lists.find(x=>x.uid===activeJourneyId);
 if(!j){j=lists[0];if(j)activeJourneyId=j.uid;}
 $('journeyTheme').value=journeyTheme;
 $('journeyTabs').innerHTML=lists.map(x=>`<button type="button" class="journey-tab ${x.uid===activeJourneyId?'is-active':''}" data-uid="${escapeHtml(x.uid)}">${escapeHtml(x.title)}${x.custom?' <small>已儲存</small>':''}</button>`).join('')||'<div class="journey-empty">這個主題還沒有自訂行程。按「新增我的行程」開始規劃。</div>';
 $('journeyTabs').querySelectorAll('[data-uid]').forEach(b=>b.onclick=()=>{activeJourneyId=b.dataset.uid;renderJourney();});
 $('journeyView').classList.toggle('hidden',!j);
 if(!j)return;
 const found=j.steps.map(s=>({...s,restaurant:RESTAURANTS.find(r=>r.id===Number(s.id))})).filter(s=>s.restaurant);
 const min=found.reduce((a,s)=>a+s.restaurant.low,0),max=found.reduce((a,s)=>a+s.restaurant.high,0);
 $('journeySummary').innerHTML=`<strong>${escapeHtml(j.sub)}</strong><span>${found.length} 站 · ${escapeHtml(journeyThemeNames[j.theme]||'自訂')} · 餐飲預估總額 NT$ ${min.toLocaleString('zh-TW')}–${max.toLocaleString('zh-TW')}／人</span>`;
 $('journeyStops').innerHTML=found.map((s,i)=>`<button type="button" class="journey-stop" data-id="${s.id}"><span class="journey-rail"><i>${i+1}</i></span><span class="journey-time">${escapeHtml(s.time)}<small>${escapeHtml(s.meal)}</small></span><span class="journey-stop-body"><b>${escapeHtml(s.restaurant.name)}</b><small>${escapeHtml(s.restaurant.zoneLabel)}</small><span>${escapeHtml(s.restaurant.dish)}</span><em>${escapeHtml(s.note)}</em></span><svg class="icon"><use href="#i-arrow"/></svg></button>`).join('');
 $('journeyStops').querySelectorAll('[data-id]').forEach(b=>b.onclick=()=>openDetail(Number(b.dataset.id),true));
 $('journeyRoute').href=journeyMapsLink(found);
 $('journeyEdit').classList.toggle('hidden',!j.custom);$('journeyDelete').classList.toggle('hidden',!j.custom);
 $('journeyCopy').textContent=j.custom?'複製成新行程':'複製範例並自訂';
}
function editingView(show){$('journeyEditor').classList.toggle('hidden',!show);$('journeyView').classList.toggle('hidden',show||!visibleJourneys().length);$('journeyTabs').classList.toggle('hidden',show);$('journeyToolbarHidden')?.classList?.toggle('hidden',show);$('itinerary').scrollTop=0;}
function defaultJourneyDraft(){return {title:'',theme:'taiwan',sub:'',steps:[{id:null,time:'08:30',meal:'早餐',note:''},{id:null,time:'11:30',meal:'午餐',note:''},{id:null,time:'15:00',meal:'下午茶',note:''},{id:null,time:'18:00',meal:'晚餐',note:''}]}}
function openJourneyEditor(template=null,existing=false){
 editingJourney=existing?template.uid:null;
 draftJourney=template?{title:existing?template.title:template.title+'（我的版本）',sub:template.sub,theme:template.theme,steps:template.steps.map(x=>({...x}))}:defaultJourneyDraft();
 $('journeyEditorTitle').textContent=existing?'編輯我的行程':template?'從範例建立自己的行程':'建立我的美食行程';
 $('editJourneyTitle').value=draftJourney.title;
 $('editJourneyTheme').value=draftJourney.theme;
 $('editJourneySub').value=draftJourney.sub;
 journeyNotice('');editingView(true);renderStopEditor();$('editJourneyTitle').focus();
}
function stopRestaurantOptions(selected){const rows=RESTAURANTS.slice().sort((a,b)=>a.name.localeCompare(b.name,'zh-Hant'));
 return '<option value="">選擇一家餐廳</option>'+rows.map(r=>`<option value="${r.id}" ${selected===r.id?'selected':''}>${escapeHtml(r.name)}｜${escapeHtml(r.zoneLabel)}</option>`).join('');}
function renderStopEditor(){
 $('journeyEditStops').innerHTML=draftJourney.steps.map((s,i)=>`<div class="journey-edit-stop" data-row="${i}"><div class="edit-stop-title"><strong>第 ${i+1} 站</strong><div><button type="button" data-up="${i}" ${i===0?'disabled':''} title="往上移動">↑</button><button type="button" data-down="${i}" ${i===draftJourney.steps.length-1?'disabled':''} title="往下移動">↓</button><button type="button" data-remove="${i}" ${draftJourney.steps.length<=2?'disabled':''} aria-label="移除第 ${i+1} 站"><span class="close-mark" aria-hidden="true"></span></button></div></div><div class="edit-stop-grid"><label>到店時間<input type="time" data-field="time" value="${escapeHtml(s.time)}" required></label><label>餐期<select data-field="meal">${JOURNEY_MEALS.map(x=>`<option ${x===s.meal?'selected':''}>${x}</option>`).join('')}</select></label><label class="full">店家<select data-field="id" required>${stopRestaurantOptions(s.id)}</select></label><label class="full">這一站的小提醒<input type="text" data-field="note" maxlength="160" value="${escapeHtml(s.note)}" placeholder="可留空，或寫要吃的餐點、注意事項"></label></div></div>`).join('');
 $('journeyAddStop').disabled=draftJourney.steps.length>=8;
}
$('journeyEditStops').addEventListener('input',e=>{const row=e.target.closest('[data-row]');if(!row||!e.target.dataset.field)return;const i=Number(row.dataset.row),field=e.target.dataset.field;draftJourney.steps[i][field]=field==='id'?(Number(e.target.value)||null):e.target.value;});
$('journeyEditStops').addEventListener('change',e=>{const row=e.target.closest('[data-row]');if(!row||!e.target.dataset.field)return;const i=Number(row.dataset.row),field=e.target.dataset.field;draftJourney.steps[i][field]=field==='id'?(Number(e.target.value)||null):e.target.value;});
$('journeyEditStops').addEventListener('click',e=>{const b=e.target.closest('button[data-remove],button[data-up],button[data-down]');if(!b)return;
 if(b.dataset.remove!==undefined){const i=Number(b.dataset.remove);if(draftJourney.steps.length>2)draftJourney.steps.splice(i,1)}
 else{const from=Number(b.dataset.up??b.dataset.down),to=b.dataset.up!==undefined?from-1:from+1;if(to>=0&&to<draftJourney.steps.length){const [s]=draftJourney.steps.splice(from,1);draftJourney.steps.splice(to,0,s);}}
 renderStopEditor();});
$('journeyAddStop').onclick=()=>{if(draftJourney.steps.length>=8)return;const last=draftJourney.steps[draftJourney.steps.length-1],hour=Math.min(23,Number(last.time?.slice(0,2)||12)+2);draftJourney.steps.push({id:null,time:String(hour).padStart(2,'0')+':00',meal:'下午茶',note:''});renderStopEditor();$('journeyEditStops').lastElementChild.scrollIntoView({block:'nearest',behavior:'smooth'});};
function cancelJourneyEditor(){editingJourney=null;draftJourney=null;editingView(false);renderJourney();journeyNotice('');}
$('journeyCancel').onclick=cancelJourneyEditor;$('journeyCancelTop').onclick=cancelJourneyEditor;
$('journeyEditor').onsubmit=e=>{
 e.preventDefault();const title=$('editJourneyTitle').value.trim(),sub=$('editJourneySub').value.trim(),theme=$('editJourneyTheme').value;
 if(!title){journeyNotice('請先幫這條行程取名稱。',true);return}
 if(draftJourney.steps.some(s=>!s.id||!RESTAURANTS.some(r=>r.id===s.id))){journeyNotice('每一站都需要選擇餐廳。',true);return}
 if(draftJourney.steps.some(s=>!/^\d\d:\d\d$/.test(s.time||''))){journeyNotice('請填寫每一站的到店時間。',true);return}
 const steps=draftJourney.steps.map(s=>({...s,note:String(s.note||'').slice(0,160)}));
 const uid=editingJourney||'my-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,6);
 const saved={uid,custom:true,theme,title:title.slice(0,32),sub:sub.slice(0,100),steps};
 const next=editingJourney?customJourneys.map(j=>j.uid===editingJourney?saved:j):customJourneys.concat(saved);
 if(next.length>50){journeyNotice('最多可以儲存 50 條行程，請先刪除舊行程。',true);return}
 if(!persistJourneys(next)){journeyNotice('儲存失敗：瀏覽器可能禁止本機儲存。請確認隱私設定或改用正常瀏覽模式。',true);return}
 customJourneys=next;editingJourney=null;draftJourney=null;activeJourneyId=uid;journeyTheme='mine';$('journeyTheme').value='mine';editingView(false);renderJourney();journeyNotice('已儲存到這個瀏覽器的「我的行程」，重新開啟仍可查看。');
};
$('journeyNew').onclick=()=>openJourneyEditor();
$('journeyCopy').onclick=()=>openJourneyEditor(journeyCurrent(),false);
$('journeyEdit').onclick=()=>{const j=journeyCurrent();if(j.custom)openJourneyEditor(j,true)};
$('journeyDelete').onclick=()=>{const j=journeyCurrent();if(!j.custom)return;if(!confirm('確定刪除「'+j.title+'」？刪除後無法復原。'))return;
 const next=customJourneys.filter(x=>x.uid!==j.uid);if(!persistJourneys(next)){journeyNotice('無法更新本機儲存資料。',true);return}customJourneys=next;activeJourneyId=next[0]?.uid||'preset-0';renderJourney();journeyNotice('行程已刪除。')};
$('journeyTheme').onchange=e=>{journeyTheme=e.target.value;renderJourney();journeyNotice('')};
function openJourney(){if($('wheelMask').classList.contains('open'))closeWheel();$('itinerary').classList.add('open');$('itinerary').setAttribute('aria-hidden','false');if(!draftJourney){editingView(false);renderJourney()}else editingView(true);}
function closeJourney(){$('itinerary').classList.remove('open');$('itinerary').setAttribute('aria-hidden','true');}
$('itineraryOpen').onclick=openJourney;$('itineraryMobile').onclick=openJourney;$('itineraryClose').onclick=closeJourney;

$('navCount').textContent=RESTAURANTS.length;
$('searchInput').placeholder=RESTAURANTS.length+' 家美食，開始探索';
document.querySelectorAll('[data-zone-count]').forEach(el=>{const area=AREAS.find(a=>a.id===el.dataset.zoneCount);const count=RESTAURANTS.filter(r=>area?.zones.includes(r.zone)).length;el.textContent='收錄 '+count+' 家';});
sizeMap();window.addEventListener('resize',()=>sizeMap(true));$('mapWrap').addEventListener('scroll',()=>{}, {passive:true});document.addEventListener('keydown',e=>{if(e.key==='Escape'){if($('wheelMask').classList.contains('open'))closeWheel();else if($('detail').classList.contains('open'))closeDetail();else if($('itinerary').classList.contains('open'))closeJourney();else $('resultsClose').click();}});
