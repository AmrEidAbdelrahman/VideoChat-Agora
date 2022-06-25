from django.db import models

# Create your models here.


class Member(models.Model):
    UID = models.IntegerField()
    name = models.CharField(max_length=255)
    channel = models.CharField(max_length=255)

    def __str__(self):
        return f'{self.name}'

