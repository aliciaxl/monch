from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.pagination import PageNumberPagination
from rest_framework import viewsets, permissions, filters, status
from ..models import Post, Follow, Like, PostMedia
from ..serializers import PostSerializer

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 50
    
class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter]
    search_fields = ['content', 'user__username']
    parser_classes = [MultiPartParser, FormParser]

    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        if self.action == 'list':
            return Post.objects.filter(parent_post__isnull=True).order_by('-created_at')
        return Post.objects.all().order_by('-created_at')

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

        if not user.is_authenticated:
            return Response({"detail": "Authentication required."}, status=401)

        followed_user_ids = Follow.objects.filter(follower=user).values_list("following_id", flat=True)
        posts = Post.objects.filter(user__id__in=followed_user_ids, parent_post__isnull=True).order_by("-created_at")

        paginator = self.pagination_class()
        page = paginator.paginate_queryset(posts, request)
        if page is not None:
            serializer = PostSerializer(page, many=True, context={'request': request})
            return paginator.get_paginated_response(serializer.data)
        else:
            serializer = PostSerializer(posts, many=True, context={'request': request})
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
    
    def create(self, request, *args, **kwargs):
        user = request.user
        content = request.data.get("content")
        parent_post = request.data.get("parent_post")
        repost_of = request.data.get("repost_of")

        media_file = request.FILES.get("media")

        try:
            if repost_of:
                
                original_post = Post.objects.get(id=repost_of)

                post = Post.objects.create(
                    user=user,
                    content=original_post.content,
                    parent_post_id=parent_post if parent_post else None,
                    repost_of=original_post,
                )

                for media in original_post.media.all():
                    PostMedia.objects.create(
                        post=post,
                        media_file=media.media_file,
                        media_type=media.media_type
                    )

            else:
                post = Post.objects.create(
                    user=user,
                    content=content,
                    parent_post_id=parent_post if parent_post else None,
                    repost_of_id=None,
                )

                if media_file:
                    PostMedia.objects.create(post=post, media_file=media_file)

        except Post.DoesNotExist:
            return Response({"detail": "Original post to repost not found."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        serializer = self.get_serializer(post)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
