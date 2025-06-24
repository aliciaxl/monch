#import router and register URLs

from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import token_refresh_view
from .views import user_views, post_views, follow_views, like_views, auth_views, me_view, token_refresh_view, whoami_view


router = DefaultRouter()
router.register(r'users', user_views.UserViewSet, basename='user')
router.register(r'posts', post_views.PostViewSet)
router.register(r'follows', follow_views.FollowViewSet)
router.register(r'likes', like_views.LikeViewSet)

urlpatterns = [
    path('login/', auth_views.LoginView.as_view(), name='login'),
    path('logout/', auth_views.LogoutView.as_view(), name='logout'),
    path('me/', me_view.MeView.as_view()),
    path('', include(router.urls)),
    path('token/refresh/', token_refresh_view.TokenRefreshView.as_view(), name='token_refresh'),
    path("whoami/", whoami_view.WhoAmIView.as_view()),
]