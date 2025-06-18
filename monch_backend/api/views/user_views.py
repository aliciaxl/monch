# your_app/views/user_views.py
from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from ..models import User, Post
from ..serializers import UserSerializer, PostSerializer

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    @action(detail=True, methods=['get'], url_path='followers')
    def followers(self, request, pk=None):
        user = self.get_object()
        followers = User.objects.filter(following__following=user)
        serializer = UserSerializer(followers, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'], url_path='following')
    def following(self, request, pk=None):
        user = self.get_object()
        following = User.objects.filter(followers__follower=user)
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
        serializer = PostSerializer(replies, many=True)
        return Response(serializer.data)