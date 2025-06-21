from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.contrib.auth import authenticate
from django.http import JsonResponse
from rest_framework_simplejwt.tokens import RefreshToken

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
        res.set_cookie(
            key="access_token",
            value=str(refresh.access_token),
            httponly=True,
            secure=True,  # True in production
            samesite="None",
            path="/",
        )
        res.set_cookie(
            key="refresh_token",
            value=str(refresh),
            httponly=True,
            secure=True,
            samesite="None",
            path="/",
        )
        print("Access token set:", refresh.access_token)
        return res

class LogoutView(APIView):
    def post(self, request):
        res = Response({'detail': 'Logged out'})
        res.delete_cookie('access_token', path='/')
        res.delete_cookie('refresh_token', path='/')
        return res