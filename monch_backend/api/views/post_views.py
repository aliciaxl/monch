from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import viewsets, permissions, filters
from ..models import Post
from ..serializers import PostSerializer
    
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
        serializer = PostSerializer(replies, many=True)
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