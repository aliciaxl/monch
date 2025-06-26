from rest_framework import serializers
from rest_framework.response import Response
from .models import User, Post, Follow, Like

# Model serializer converts data to JSON. Auto generate fields corresponding to model, generate validators
class UserSerializer(serializers.ModelSerializer):
    posts = serializers.PrimaryKeyRelatedField(many=True, read_only=True)
    follower_count = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'display_name', 'bio', 'avatar_url', 'posts', 'follower_count']

    def get_follower_count(self, obj):
        return obj.followers.count()
    
    def get_is_following(self, obj):
        request = self.context.get('request', None)
        if request and request.user.is_authenticated:
            # Check if the current logged-in user follows 'obj'
            return Follow.objects.filter(follower=request.user, following=obj).exists()
        return False
    
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, context={'request': request})
        return Response(serializer.data)
    
class PostSerializer(serializers.ModelSerializer):
    likes = serializers.IntegerField(source='likes.count', read_only=True)
    user = serializers.StringRelatedField(read_only=True) #nested user info
    parent_post = serializers.PrimaryKeyRelatedField(read_only=True)
    replies = serializers.SerializerMethodField()
    liked_by_user = serializers.SerializerMethodField()
    replies_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Post
        fields = ['id', 'user', 'content', 'created_at', 'parent_post', 'replies', 'likes', 'liked_by_user', 'replies_count']

    def get_likes(self, obj):
        return obj.likes.count()
    
    def get_liked_by_user(self, obj):
        user = self.context['request'].user
        if user.is_anonymous:
            return False
        return obj.likes.filter(user=user).exists()

    def get_replies(self, obj):
        replies = obj.replies.all().order_by('created_at')  # thanks to related_name='replies'
        return PostSerializer(replies, many=True, context=self.context).data
    
    def get_replies_count(self, obj):
        return obj.replies.count()

class FollowSerializer(serializers.ModelSerializer):
    follower = UserSerializer(read_only=True)
    following = UserSerializer(read_only=True)

    class Meta:
        model = Follow
        fields = ['id', 'follower', 'following']
        
    def create(self, validated_data):
        user = self.context['request'].user
        validated_data['follower'] = user
        return super().create(validated_data)
    
class LikeSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    post = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Like
        fields = ['id', 'user', 'post']
