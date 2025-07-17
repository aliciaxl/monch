#import router and register URLs

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import user_views, post_views, follow_views, like_views, auth_views, whoami_view

router = DefaultRouter()
router.register(r'users', user_views.UserViewSet, basename='user')
router.register(r'posts', post_views.PostViewSet, basename='posts')
router.register(r'follows', follow_views.FollowViewSet)
router.register(r'likes', like_views.LikeViewSet)

urlpatterns = [
    path("health/", health),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('login/', auth_views.LoginView.as_view(), name='login'),
    path('logout/', auth_views.LogoutView.as_view(), name='logout'),
    path("whoami/", whoami_view.WhoAmIView.as_view()),
    path('', include(router.urls)),
]