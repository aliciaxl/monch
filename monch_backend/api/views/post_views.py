from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import viewsets, permissions, filters
from ..models import Post, Follow, Like
from ..serializers import PostSerializer
from rest_framework import status
    
class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter]
    search_fields = ['content', 'user__username']

    def get_queryset(self):
        # Return only parent posts (no parent_post)
        return Post.objects.filter(parent_post__isnull=True).order_by('-created_at')

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
    
    @action(detail=False, methods=["get"], url_path="following")
    def following_posts(self, request):
        user = request.user
        print("Authenticated user:", user)

        if not user.is_authenticated:
            return Response({"detail": "Authentication required."}, status=401)

        # Get the users this user is following
        followed_user_ids = Follow.objects.filter(follower=user).values_list("following_id", flat=True)

        # Get posts from those users
        posts = Post.objects.filter(user__id__in=followed_user_ids).order_by("-created_at")
        serializer = PostSerializer(posts, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post', 'delete'], permission_classes=[permissions.IsAuthenticated])
    def like(self, request, pk=None):
        post = self.get_object()
        user = request.user

        if request.method == 'POST':
            like, created = Like.objects.get_or_create(user=user, post=post)
            if created:
                return Response({'detail': 'Post liked'}, status=status.HTTP_201_CREATED)
            else:
                return Response({'detail': 'Already liked'}, status=status.HTTP_400_BAD_REQUEST)

        elif request.method == 'DELETE':
            try:
                like = Like.objects.get(user=user, post=post)
                like.delete()
                return Response({'detail': 'Like removed'}, status=status.HTTP_204_NO_CONTENT)
            except Like.DoesNotExist:
                return Response({'detail': 'Not liked yet'}, status=status.HTTP_400_BAD_REQUEST)
            
    def get_serializer_context(self):
        return {'request': self.request}
    
   
   #update to show posts already liked, allow unlike