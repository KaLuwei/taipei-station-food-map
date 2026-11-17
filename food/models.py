from django.db import models
class Restaurant(models.Model):
    name=models.CharField(max_length=180)
    kind=models.CharField(max_length=90)
    dish=models.TextField()
    hours=models.CharField(max_length=210)
    low=models.PositiveIntegerField()
    high=models.PositiveIntegerField()
    good=models.TextField()
    bad=models.TextField()
    zone=models.CharField(max_length=20,db_index=True)
    zoneLabel=models.CharField(max_length=130)
    verified=models.BooleanField(default=False)
    distance=models.CharField(max_length=120,blank=True)
    source=models.TextField(blank=True)
    data_status=models.CharField(max_length=150,blank=True)
    coverage=models.CharField(max_length=20,default='core',db_index=True)
    class Meta:
        ordering=['id']
        indexes=[models.Index(fields=['zone','low'],name='food_zone_low_idx')]
    def __str__(self):return self.name
