from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from api.factories import UserFactory, PostFactory, FollowFactory, LikeFactory
from api.models import Like, Follow, Post
import random

class Command(BaseCommand):
    help = 'Populate the database with mock data'

    def handle(self, *args, **kwargs):
        
        User = get_user_model()

        self.stdout.write('Cleaning old mock data...')
        Like.objects.all().delete()
        # Delete Follows
        Follow.objects.all().delete()
        # Delete Posts
        Post.objects.all().delete()
        # Delete Users who are NOT superusers
        User.objects.filter(is_superuser=False).delete()

        self.stdout.write('Creating mock users...')
        users = [UserFactory.create() for _ in range(10)]

        self.stdout.write('Creating mock posts...')
        posts = [PostFactory.create(user=user) for user in users for _ in range(3)]

        self.stdout.write('Creating mock replies...')
        for post in posts:
            # Randomly decide if a post should have a reply
            if random.choice([True, False]):
                replying_user = random.choice(users)
                PostFactory.create(user=replying_user, parent_post=post)

        self.stdout.write('Creating mock follows...')
        for user in users:
            following_user = random.choice([u for u in users if u != user])
            FollowFactory.create(follower=user, following=following_user)

        self.stdout.write('Creating mock likes...')
        for post in posts:
            num_likes = random.randint(1, 5)
            liker = random.choice(users)
            likers = random.sample(users, min(num_likes, len(users)))
            for liker in likers:
                LikeFactory.create(user=liker, post=post)

        self.stdout.write(self.style.SUCCESS('Successfully populated the database with mock data'))