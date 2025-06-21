import factory
from factory.django import DjangoModelFactory
from faker import Faker
from .models import User, Post, Follow, Like
import random

fake = Faker()

class UserFactory(DjangoModelFactory):
    class Meta:
        model = User
    username = factory.Faker('user_name')
    display_name = factory.Faker('name')
    bio = factory.Faker('text')
    avatar_url = factory.Faker('image_url')

class PostFactory(DjangoModelFactory):
    class Meta:
        model = Post
    user = factory.SubFactory(UserFactory)
    content = factory.Faker('sentence')
    parent_post = None

class FollowFactory(DjangoModelFactory):
    class Meta:
        model = Follow
    follower = factory.SubFactory(UserFactory)
    following = factory.SubFactory(UserFactory)

class LikeFactory(DjangoModelFactory):
    class Meta:
        model = Like
    user = factory.LazyFunction(lambda: random.choice(User.objects.all()))
    post = factory.LazyFunction(lambda: random.choice(Post.objects.all()))