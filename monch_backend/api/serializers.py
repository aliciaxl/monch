from rest_framework import serializers
from .models import User, Post, Follow, Like, Reply

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'display_name', 'bio', 'avatar_url']
    
class PostSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True) #nested user info
    
    class Meta:
        model = Post
        fields = '__all__'

class FollowSerializer(serializers.ModelSerializer):
    follower = UserSerializer(read_only=True)
    following = UserSerializer(read_only=True)

    class Meta:
        model = Follow
        fields = '__all__'

class LikeSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    post = PostSerializer(read_only=True)

    class Meta:
        model = Like
        fields = '__all__'

class ReplySerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    post = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Reply
        fields = '__all__'