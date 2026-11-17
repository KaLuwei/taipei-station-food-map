import json
from django.conf import settings
from django.core.cache import cache
from django.core.management.base import BaseCommand
from food.models import Restaurant
class Command(BaseCommand):
 help='從已查證/整理資料匯入餐廳，依 id 更新，不重複建立'
 def handle(self,*args,**kwargs):
  rows=json.loads((settings.BASE_DIR/'data/restaurants.json').read_text(encoding='utf-8'))
  count=0
  for r in rows:
   key=r['id']; values={k:v for k,v in r.items() if k!='id'}
   Restaurant.objects.update_or_create(pk=key,defaults=values)
   count+=1
  cache.clear()
  self.stdout.write(self.style.SUCCESS(f'匯入/更新 {count} 家；不會清除自行新增的資料'))
