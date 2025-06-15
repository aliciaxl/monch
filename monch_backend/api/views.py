from django.shortcuts import render

# Create your views here.

from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import viewsets, permissions, filters
from .models import User, Post, Follow, Like
from .serializers import UserSerializer, PostSerializer, FollowSerializer, LikeSerializer

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]

    @action(detail=True, methods=['get'], url_path='followers')
    def followers(self, request, pk=None):
        user = self.get_object()
        followers = User.objects.filter(following__following=user)  # users who follow this user
        serializer = UserSerializer(followers, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'], url_path='following')
    def following(self, request, pk=None):
        user = self.get_object()
        following = User.objects.filter(followers__follower=user)  # users this user follows
        serializer = UserSerializer(following, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def posts(self, request, pk=None):
        user = self.get_object()
        posts = Post.objects.filter(user=user).order_by('-created_at')
        serializer = PostSerializer(posts, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def replies(self, request, pk=None):
        user = self.get_object()
        replies = Post.objects.filter(user=user, parent_post__isnull=False).order_by('-created_at')
        serializer = ReplySerializer(replies, many=True)
        return Response(serializer.data)
    
class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter]
    search_fields = ['content', 'user__username']

    #override perform_create to attach user to post
    def perform_create(self, serializer):
        serializer.save(user = self.request.user)

    @action(detail=True, methods=['get'])
    def replies(self, request, pk=None):
        post = self.get_object()
        replies = post.replies.all().order_by('created_at')
        serializer = ReplySerializer(replies, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def thread(self, request, pk=None):
        post = self.get_object()
        replies = post.replies.all().order_by('created_at')
        data = {
            "original": PostSerializer(post).data,
            "replies": PostSerializer(replies, many=True).data
        }
        return Response(data)

class FollowViewSet(viewsets.ModelViewSet):
    queryset = Follow.objects.all()
    serializer_class = FollowSerializer
    permission_classes = [permissions.IsAuthenticated]

class LikeViewSet(viewsets.ModelViewSet):
    queryset = Like.objects.all()
    serializer_class = LikeSerializer
    permission_classes = [permissions.IsAuthenticated]


