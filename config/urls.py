from django.contrib import admin
from django.urls import path
from food import views
urlpatterns=[path('admin/',admin.site.urls),path('',views.index,name='home'),path('api/restaurants/',views.restaurants_api,name='restaurants-api'),path('api/restaurants/<int:pk>/',views.restaurant_api,name='restaurant-api')]
