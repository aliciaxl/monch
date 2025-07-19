from rest_framework import serializers
from rest_framework.response import Response
from .models import User, Post, PostMedia, Follow, Like

class UserSerializer(serializers.ModelSerializer):
    posts = serializers.PrimaryKeyRelatedField(many=True, read_only=True)
    follower_count = serializers.SerializerMethodField()
    following_count = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'display_name', 'bio', 'avatar', 'posts', 'follower_count', 'following_count']
    
    def update(self, instance, validated_data):
        avatar = validated_data.pop('avatar', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if avatar is not None:
            instance.avatar = avatar
        instance.save()
        return instance

    def get_follower_count(self, obj):
        return obj.followers.count()

    def get_following_count(self, obj):
        return obj.following.count()
    
    def get_is_following(self, obj):
        request = self.context.get('request', None)
        if request and request.user.is_authenticated:
            return Follow.objects.filter(follower=request.user, following=obj).exists()
        return False
    
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, context={'request': request})
        return Response(serializer.data)

class RepostOfSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Post
        fields = ['id', 'content', 'user']
    
class PostMediaSerializer(serializers.ModelSerializer):
    class Meta:
        model = PostMedia
        fields = ['id', 'media_file', 'media_type', 'uploaded_at']
        read_only_fields = ['id', 'uploaded_at']

class ParentPostSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    media = PostMediaSerializer(many=True, read_only=True)
    likes = serializers.IntegerField(source='likes.count', read_only=True)
    liked_by_user = serializers.SerializerMethodField()
    reposted_by_user = serializers.SerializerMethodField()
    replies_count = serializers.SerializerMethodField()
    repost_of_detail = RepostOfSerializer(source='repost_of', read_only=True)

    class Meta:
        model = Post
        fields = [
            'id',
            'user',
            'content',
            'created_at',
            'media',
            'likes',
            'liked_by_user',
            'reposted_by_user',
            'replies_count',
            'repost_of_detail',
        ]

    def get_liked_by_user(self, obj):
        user = self.context['request'].user
        if user.is_anonymous:
            return False
        return obj.likes.filter(user=user).exists()

    def get_reposted_by_user(self, obj):
        user = self.context['request'].user
        if user.is_anonymous:
            return False
        return Post.objects.filter(repost_of=obj, user=user).exists()

    def get_replies_count(self, obj):
        return obj.replies.count()

    
class PostSerializer(serializers.ModelSerializer):
    likes = serializers.IntegerField(source='likes.count', read_only=True)
    user = UserSerializer(read_only=True)
    user_repost_id = serializers.SerializerMethodField()

    parent_post = serializers.PrimaryKeyRelatedField(
        queryset=Post.objects.all(),
        required=False,
        allow_null=True,
        write_only=True
    )
    # Nested parent post info for output
    parent_post_detail = ParentPostSerializer(source='parent_post', read_only=True)

    repost_of = serializers.PrimaryKeyRelatedField(
        queryset=Post.objects.all(),
        required=False,
        allow_null=True,
        write_only=True  # <-- This field is only for input, not output
    )
    repost_of_detail = RepostOfSerializer(source='repost_of', read_only=True)  # nested read-only output
    replies = serializers.SerializerMethodField()
    liked_by_user = serializers.SerializerMethodField()
    reposted_by_user = serializers.SerializerMethodField()
    replies_count = serializers.SerializerMethodField()
    media = PostMediaSerializer(many=True, required=False)
    user_repost_id = serializers.SerializerMethodField()
    
    class Meta:
        model = Post
        fields = ['id', 'user', 'content', 'created_at', 'parent_post', 'parent_post_detail', 'repost_of', 'repost_of_detail', 'replies', 'likes', 'liked_by_user', 'reposted_by_user', 'replies_count', 'media', 'user_repost_id']

    def get_likes(self, obj):
        return obj.likes.count()
    
    def get_liked_by_user(self, obj):
        user = self.context['request'].user
        if user.is_anonymous:
            return False
        return obj.likes.filter(user=user).exists()
    
    def get_reposted_by_user(self, obj):
        user = self.context['request'].user
        if user.is_anonymous:
            return False
        return Post.objects.filter(repost_of=obj, user=user).exists()

    def get_replies(self, obj):
        replies = obj.replies.all().order_by('created_at')
        return PostSerializer(replies, many=True, context=self.context).data
    
    def get_replies_count(self, obj):
        return obj.replies.count()
    
    def get_user_repost_id(self, obj):
        user = self.context['request'].user
        if user.is_anonymous:
            return None

        repost = Post.objects.filter(repost_of=obj, user=user).first()
        return repost.id if repost else None

    

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
