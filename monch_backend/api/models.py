from django.db import models
from django.contrib.auth.models import AbstractUser

# Create models using Django ORM. Each model class maps to a table in db.

class User(AbstractUser):
    display_name = models.CharField(max_length=25)
    bio = models.TextField(blank=True, null=True)
    avatar_url = models.TextField(blank=True, null=True)

class Follow(models.Model):
    follower = models.ForeignKey(User, related_name="following", on_delete=models.CASCADE)
    following = models.ForeignKey(User, related_name='followers', on_delete=models.CASCADE)

    class Meta:
        unique_together = ('follower', 'following')

class Post(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='posts')
    content = models.CharField(max_length=500)
    created_at = models.DateTimeField(auto_now_add=True)

class Like(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='likes')
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='likes')

    class Meta:
        unique_together = ('user', 'post')

class Reply(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='replies')
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='replies')
    content = models.CharField(max_length=500)
    created_at = models.DateTimeField(auto_now_add=True)