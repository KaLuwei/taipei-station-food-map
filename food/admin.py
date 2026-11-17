from django.contrib import admin
from .models import Restaurant
@admin.register(Restaurant)
class RestaurantAdmin(admin.ModelAdmin):
 list_display=('name','zone','kind','low','high','data_status')
 list_filter=('zone','coverage','verified')
 search_fields=('name','kind','dish','zoneLabel')
 list_per_page=40
