# your_app/views/user_views.py
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from django.db.models import Q
from rest_framework.response import Response
from rest_framework.parsers import JSONParser, MultiPartParser, FormParser
from ..models import User, Post
from ..serializers import UserSerializer, PostSerializer
from django.contrib.auth.hashers import make_password
from django.contrib.auth import get_user_model
from rest_framework.exceptions import ValidationError
from PIL import Image, UnidentifiedImageError
from io import BytesIO
from django.core.files.base import ContentFile
from PIL import ExifTags
import uuid
import os


User = get_user_model()

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    lookup_field = 'username'
    parser_classes = [JSONParser, MultiPartParser, FormParser]

    @action(detail=True, methods=['get'], url_path='followers')
    def followers(self, request, username=None):
        user = self.get_object()
        followers = User.objects.filter(following__following=user)
        serializer = UserSerializer(followers, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'], url_path='following')
    def following(self, request, username=None):
        user = self.get_object()
        following = User.objects.filter(followers__follower=user)
        serializer = UserSerializer(following, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'], url_path='posts')
    def posts(self, request, username=None):
        user = self.get_object()
        posts = Post.objects.filter(user=user, parent_post__isnull=True).order_by('-created_at')
        serializer = PostSerializer(posts, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=True, methods=['get'], url_path='replies')
    def replies(self, request, username=None):
        user = self.get_object()
        replies = Post.objects.filter(user=user, parent_post__isnull=False).order_by('-created_at')
        serializer = PostSerializer(replies, many=True, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], url_path='check-username', permission_classes=[permissions.AllowAny])
    def check_username(self, request):
        username = request.query_params.get('username', '').strip()
        if not username:
            return Response({"detail": "Username query parameter is required."}, status=status.HTTP_400_BAD_REQUEST)

        exists = User.objects.using('default').filter(username=username).exists()
        return Response({"username": username, "available": not exists})
    
    @action(detail=False, methods=['post'], url_path='register', permission_classes=[permissions.AllowAny])
    def register(self, request):
        data = request.data
        username = data.get('username')
        password = data.get('password')
        display_name = data.get('displayName')

        if not username or not password:
            return Response({'detail': 'Username and password are required.'}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(username=username).exists():
            return Response({'detail': 'Username already taken.'}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.create(
            username=username,
            password=make_password(password),
            display_name=display_name or ''
        )
        user.save()

        serializer = self.get_serializer(user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    def update(self, request, *args, **kwargs):
        user = self.get_object()

        if request.user != user:
            return Response({'detail': 'You do not have permission to update this user.'}, status=status.HTTP_403_FORBIDDEN)

        return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        print("Request Data:", request.data)
        print("Request Files:", request.FILES)
        user = self.get_object()

        if request.user != user:
            return Response({'detail': 'You do not have permission to update this user.'}, status=status.HTTP_403_FORBIDDEN)

        if 'avatar' in request.FILES:
            avatar = request.FILES['avatar']

            if avatar.size > 5 * 1024 * 1024:
                raise ValidationError("Avatar file exceeds size limit (5MB).")
            if avatar.content_type not in ['image/jpeg', 'image/png', 'image/gif']:
                raise ValidationError("Invalid avatar format. Only JPEG, PNG, and GIF are allowed.")
            
            try:
                img = Image.open(avatar)
                try:
                    for orientation in ExifTags.TAGS.keys():
                        if ExifTags.TAGS[orientation] == 'Orientation':
                            break

                    exif = img._getexif()
                    if exif is not None:
                        orientation_value = exif.get(orientation)
                        if orientation_value == 3:
                            img = img.rotate(180, expand=True)
                        elif orientation_value == 6:
                            img = img.rotate(270, expand=True)
                        elif orientation_value == 8:
                            img = img.rotate(90, expand=True)
                except Exception:
                    pass
                
                img_format = img.format 

                # GIFs stay as is
                if img_format == 'GIF':
                    ext = 'gif'
                    filename = f"{uuid.uuid4().hex}.{ext}"
                    user.avatar.save(filename, ContentFile(avatar.read()), save=False)
                else:
                    # Compress
                    max_size = (360, 360)
                    img.thumbnail(max_size, Image.LANCZOS)

                    if img.mode in ("RGBA", "P"):
                        img = img.convert("RGB")

                    output = BytesIO()
                    if img_format == "PNG":
                        img.save(output, format='PNG', optimize=True)
                        ext = "png"
                    else:
                        img.save(output, format='JPEG', quality=75)
                        ext = "jpg"

                    output.seek(0)
                    filename = f"{uuid.uuid4().hex}.{ext}"
                    print("Saving avatar with filename:", filename)
                    user.avatar.save(filename, ContentFile(output.read()), save=False)
                    print("user.avatar.name after save:", user.avatar.name)

            except UnidentifiedImageError:
                raise ValidationError("Uploaded file is not a valid image.")
        
        if 'display_name' in request.data:
            user.display_name = request.data['display_name']
        if 'bio' in request.data:
            user.bio = request.data['bio']

        user.save()

        serializer = self.get_serializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['get'], url_path='search')
    def search_users(self, request):
        query = request.query_params.get('q', '').strip()
        if not query:
            return Response([])

        matches = User.objects.filter(
            Q(username__icontains=query) |
            Q(display_name__icontains=query) |
            Q(bio__icontains=query)
        ).order_by('username')[:10]  # optional limit

        serializer = UserSerializer(matches, many=True, context={'request': request})
        return Response(serializer.data)