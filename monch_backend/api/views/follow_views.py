
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import viewsets, permissions, status
from django.contrib.auth import get_user_model
from ..models import Follow
from ..serializers import FollowSerializer

User = get_user_model()

class FollowViewSet(viewsets.ModelViewSet):
    queryset = Follow.objects.all()
    serializer_class = FollowSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['get'])
    def test_follow(self, request):
        return Response({'status': 'ok'})

    @action(detail=False, methods=['post'])
    def toggle(self, request):
        username = request.data.get('username')
        if not username:
            return Response({'error': 'Username required'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            to_follow = User.objects.get(username=username)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

        user = request.user
        follow = Follow.objects.filter(follower=user, following=to_follow).first()

        if follow:
            follow.delete()
            return Response({'status': 'unfollowed'})
        else:
            Follow.objects.create(follower=user, following=to_follow)
            return Response({'status': 'followed'})
    
    @action(detail=False, methods=['get'])
    def is_following(self, request):
        username = request.query_params.get("username")
        if not username:
            return Response({"error": "Username required"}, status=400)
        try:
            target = User.objects.get(username=username)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=404)

        is_following = Follow.objects.filter(follower=request.user, following=target).exists()
        return Response({"is_following": is_following})


    class Meta:
        unique_together = ('follower', 'following')