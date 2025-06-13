from django.db import models
from django.contrib.auth.models import AbstractUser

# Create models using Django ORM:

class User(AbstractUser):
    display_name = models.CharField(max_length=25, unique=True)