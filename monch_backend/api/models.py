from django.db import models
from django.contrib.auth.models import AbstractUser

# Create models using Django ORM. Each model class maps to a table in db.

class User(AbstractUser):
    username = models.CharField(max_length=20, unique=True)  # override default
    display_name = models.CharField(max_length=30)
    bio = models.CharField(max_length=150, blank=True, null=True)  # limit to 150 characters
    avatar_url = models.TextField(blank=True, null=True)

class Follow(models.Model):
    follower = models.ForeignKey(User, related_name="following", on_delete=models.CASCADE)
    following = models.ForeignKey(User, related_name='followers', on_delete=models.CASCADE)

    class Meta:
        unique_together = ('follower', 'following')

class Post(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='posts')
    content = models.CharField(max_length=500)
    parent_post = models.ForeignKey('self', null=True, blank=True, related_name='replies', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

class Like(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='likes')
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='likes')

    class Meta:
        unique_together = ('user', 'post')