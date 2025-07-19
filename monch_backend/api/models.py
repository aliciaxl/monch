from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.exceptions import ValidationError
from django.utils.timezone import now
from PIL import Image, UnidentifiedImageError
from io import BytesIO
from django.core.files.base import ContentFile
import uuid
import os

def validate_file_size(file):
    max_size_mb = 5 
    if file.size > max_size_mb * 1024 * 1024:
        raise ValidationError(f"Max file size is {max_size_mb} MB")

# Create models using Django ORM. Each model class maps to a table in db.

class User(AbstractUser):
    username = models.CharField(max_length=20, unique=True)
    display_name = models.CharField(max_length=30)
    bio = models.CharField(max_length=150, blank=True, null=True)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)

    def save(self, *args, **kwargs):
        if self.username:
            self.username = self.username.lower()
        super().save(*args, **kwargs)
    
    def delete(self, *args, **kwargs):
        storage = self.avatar.storage
        if self.avatar.name and storage.exists(self.avatar.name):
            storage.delete(self.avatar.name)
        super().delete(*args, **kwargs)

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
        if self.media_file:
            try:
                img = Image.open(self.media_file)
                img_format = img.format

                if img_format == "GIF":
                    self.media_type = "gif"
                    ext = ".gif"
                    self.media_file.seek(0)
                    content = self.media_file.read()
                else:
                    self.media_type = "image"
                    max_size = (1080, 1080)
                    img.thumbnail(max_size, Image.LANCZOS)

                    if img.mode in ("RGBA", "P"):
                        img = img.convert("RGB")

                    output = BytesIO()
                    if img_format == "PNG":
                        img.save(output, format='PNG', optimize=True)
                        ext = ".png"
                    else:
                        img.save(output, format='JPEG', quality=75)
                        ext = ".jpg"

                    output.seek(0)
                    content = output.read()

                # Always assign a UUID filename
                unique_filename = f"{uuid.uuid4().hex}{ext}"

                self.media_file = ContentFile(content, name=unique_filename)

            except UnidentifiedImageError:
                pass

        super().save(*args, **kwargs)


    def delete(self, *args, **kwargs):
        storage = self.media_file.storage
        if self.media_file.name and storage.exists(self.media_file.name):
            storage.delete(self.media_file.name)
        super().delete(*args, **kwargs)

class Like(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='likes')
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='likes')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'post')