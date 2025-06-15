#import router and register URLs

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet, PostViewSet, FollowViewSet, LikeViewSet

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'posts', PostViewSet)
router.register(r'follows', FollowViewSet)
router.register(r'likes', LikeViewSet)

urlpatterns = [
    path('', include(router.urls)),
]