# your_app/views/user_views.py
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from ..models import User, Post
from ..serializers import UserSerializer, PostSerializer
from django.contrib.auth.hashers import make_password
from django.contrib.auth import get_user_model
import logging

User = get_user_model()

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    lookup_field = 'username'

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
        user = self.get_object()

        if request.user != user:
            return Response({'detail': 'You do not have permission to update this user.'}, status=status.HTTP_403_FORBIDDEN)

        return super().partial_update(request, *args, **kwargs)
