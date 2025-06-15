from rest_framework import serializers
from .models import User, Post, Follow, Like

# Model serializer converts data to JSON. Auto generate fields corresponding to model, generate validators
class UserSerializer(serializers.ModelSerializer):
    posts = serializers.PrimaryKeyRelatedField(many=True, read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'display_name', 'bio', 'avatar_url', 'posts']
    
class PostSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True) #nested user info
    parent_post = serializers.PrimaryKeyRelatedField(read_only=True)
    replies = serializers.SerializerMethodField()
    
    class Meta:
        model = Post
        fields = ['id', 'user', 'content', 'created_at', 'parent_post', 'replies']

    def get_replies(self, obj):
        replies = obj.replies.all().order_by('created_at')  # thanks to related_name='replies'
        return PostSerializer(replies, many=True, context=self.context).data

class FollowSerializer(serializers.ModelSerializer):
    follower = UserSerializer(read_only=True)
    following = UserSerializer(read_only=True)

    class Meta:
        model = Follow
        fields = ['id', 'follower', 'following']

class LikeSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    post = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Like
        fields = ['id', 'user', 'post']
