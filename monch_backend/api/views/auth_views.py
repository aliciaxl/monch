from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import AllowAny
from django.conf import settings

class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        user = authenticate(request, username=username, password=password)
        if user is None:
            return Response({"detail": "Invalid credentials"}, status=401)

        refresh = RefreshToken.for_user(user)
        res = Response({"detail": "Login successful"})

        secure_cookie = not settings.DEBUG

        res.set_cookie(
            key="access_token",
            value=str(refresh.access_token),
            httponly=True,
            secure=secure_cookie,  # True in production
            samesite="None" if secure_cookie else "Lax",
            path="/",
        )
        res.set_cookie(
            key="refresh_token",
            value=str(refresh),
            httponly=True,
            secure=secure_cookie,
            samesite="None" if secure_cookie else "Lax",
            path="/",
        )
        print("Access token set:", refresh.access_token)
        return res

class LogoutView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        res = Response({'detail': 'Logged out'})
        res.delete_cookie('access_token', path='/')
        res.delete_cookie('refresh_token', path='/')
        return res