from django.test import TestCase
from .models import Restaurant
class FoodTests(TestCase):
 def setUp(self):
  Restaurant.objects.create(name='測試餐廳',kind='台式',dish='麵',hours='11:00-21:00',low=100,high=200,good='快',bad='排隊',zone='z',zoneLabel='Z 區')
 def test_index(self):
  resp=self.client.get('/')
  self.assertEqual(resp.status_code,200)
  self.assertContains(resp,'北車食旅')
  self.assertContains(resp,'測試餐廳')
 def test_api_filter(self):
  self.assertEqual(self.client.get('/api/restaurants/?zone=z').json()['count'],1)
  self.assertEqual(self.client.get('/api/restaurants/?zone=y').json()['count'],0)
 def test_api_detail(self):
  self.assertEqual(self.client.get('/api/restaurants/1/').json()['name'],'測試餐廳')
