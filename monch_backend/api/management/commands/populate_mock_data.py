from django.core.management.base import BaseCommand
from api.factories import UserFactory, PostFactory, FollowFactory, LikeFactory
import random

class Command(BaseCommand):
    help = 'Populate the database with mock data'

    def handle(self, *args, **kwargs):
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
            LikeFactory.create(user=users[0], post=post)

        self.stdout.write(self.style.SUCCESS('Successfully populated the database with mock data'))