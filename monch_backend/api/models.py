from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.exceptions import ValidationError
from PIL import Image
from io import BytesIO
from django.core.files.base import ContentFile

def validate_file_size(file):
    max_size_mb = 5  # set your max size here (MB)
    if file.size > max_size_mb * 1024 * 1024:
        raise ValidationError(f"Max file size is {max_size_mb} MB")

# Create models using Django ORM. Each model class maps to a table in db.

class User(AbstractUser):
    username = models.CharField(max_length=20, unique=True)  # override default
    display_name = models.CharField(max_length=30)
    bio = models.CharField(max_length=150, blank=True, null=True)  # limit to 150 characters
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)

class Follow(models.Model):
    follower = models.ForeignKey(User, related_name="following", on_delete=models.CASCADE)
    following = models.ForeignKey(User, related_name='followers', on_delete=models.CASCADE)

    class Meta:
        unique_together = ('follower', 'following')

class Post(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='posts')
    content = models.CharField(max_length=500)
    parent_post = models.ForeignKey('self', null=True, blank=True, related_name='replies', on_delete=models.CASCADE)
    repost_of = models.ForeignKey('self', null=True, blank=True, related_name='reposts', on_delete=models.SET_NULL) 
    created_at = models.DateTimeField(auto_now_add=True)

class PostMedia(models.Model):
    post = models.ForeignKey(Post, related_name='media', on_delete=models.CASCADE)
    media_file = models.ImageField(
        upload_to='posts/media/', 
        blank=True, 
        null=True,
        validators=[validate_file_size]
    )
    media_type = models.CharField(max_length=20, choices=[('image', 'Image'), ('gif', 'GIF')], default='image')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if self.media_file and self.media_type == 'image':
            img = Image.open(self.media_file)

            # Resize
            max_size = (1080, 1080)
            img.thumbnail(max_size, Image.Resampling.LANCZOS)

            output = BytesIO()
            img.save(output, format='JPEG', quality=75)
            output.seek(0)

            self.media_file = ContentFile(output.read(), self.media_file.name)

        super().save(*args, **kwargs)

class Like(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='likes')
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='likes')

    class Meta:
        unique_together = ('user', 'post')