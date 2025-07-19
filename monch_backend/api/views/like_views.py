from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import viewsets, permissions, filters
from ..models import Like
from ..serializers import LikeSerializer, PostSerializer

class LikeViewSet(viewsets.ModelViewSet):
    queryset = Like.objects.all()
    serializer_class = LikeSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['get'], url_path='liked-posts')
    def liked_posts(self, request):
        user = request.user
        likes = Like.objects.filter(user=user).select_related('post').order_by('created_at')
        posts = [like.post for like in likes]
        serializer = PostSerializer(posts, many=True, context={'request': request})
        return Response(serializer.data)