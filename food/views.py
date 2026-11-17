import json
from pathlib import Path
from django.conf import settings
from django.core.cache import cache
from django.http import JsonResponse,Http404
from django.shortcuts import render,get_object_or_404
from django.views.decorators.cache import cache_page
from .models import Restaurant
FIELDS=['id','name','kind','dish','hours','low','high','good','bad','zone','zoneLabel','verified','distance','source','data_status','coverage']

def get_restaurants():
    data=cache.get('restaurants-all-v6')
    if data is None:
        data=list(Restaurant.objects.order_by('id').values(*FIELDS))
        cache.set('restaurants-all-v6',data,300)
    return data

def index(request):
    logos=json.loads((settings.BASE_DIR/'data/logos.json').read_text(encoding='utf-8'))
    return render(request,'food/index.html',{'restaurant_data':get_restaurants(),'logos_data':logos})

@cache_page(300)
def restaurants_api(request):
    data=get_restaurants()
    zone=request.GET.get('zone','')
    if zone:data=[r for r in data if r['zone']==zone]
    return JsonResponse({'count':len(data),'results':data},json_dumps_params={'ensure_ascii':False})

@cache_page(300)
def restaurant_api(request,pk):
    rest=get_object_or_404(Restaurant,pk=pk)
    return JsonResponse({k:getattr(rest,k) for k in FIELDS},json_dumps_params={'ensure_ascii':False})
