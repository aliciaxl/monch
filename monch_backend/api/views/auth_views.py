from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.http import JsonResponse

class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        user = authenticate(request, username=username, password=password)

        if user is None:
            return Response({'detail': 'Invalid credentials'}, status=401)

        refresh = RefreshToken.for_user(user)
        res = JsonResponse({'detail': 'Login successful'})
        res.set_cookie(
            key='access_token',
            value=str(refresh.access_token),
            httponly=True,
            secure=False,  # True in production
            samesite='Lax',
        )
        res.set_cookie(
            key='refresh_token',
            value=str(refresh),
            httponly=True,
            secure=False,
            samesite='Lax',
        )
        return res

class LogoutView(APIView):
    def post(self, request):
        res = JsonResponse({'detail': 'Logged out'})
        res.delete_cookie('access_token')
        res.delete_cookie('refresh_token')
        return res