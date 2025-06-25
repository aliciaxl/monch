from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework import status

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

        secure_cookie = True # True in production, set False for dev
        samesite = "None" 

        res.set_cookie(
            key="access_token",
            value=str(refresh.access_token),
            httponly=True,
            secure=secure_cookie,
            samesite=samesite,
            path="/",
        )

        res.set_cookie(
            key="refresh_token",
            value=str(refresh),
            httponly=True,
            secure=secure_cookie,
            samesite=samesite,
            path="/",
        )
        print("Access token set:", refresh.access_token)
        return res

class LogoutView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        res = Response({'detail': 'Logged out'}, status=200)
        res.delete_cookie("access_token", path="/")
        res.delete_cookie("refresh_token", path="/")
        return res
    
class CookieTokenRefreshView(TokenRefreshView):
    def post(self, request, *args, **kwargs):
        # Read refresh token from cookie
        refresh_token = request.COOKIES.get('refresh_token')

        if refresh_token is None:
            return Response({"detail": "Refresh token cookie not found."}, status=status.HTTP_401_UNAUTHORIZED)

        # Create a new request data dict with the refresh token
        request.data._mutable = True  # if request.data is immutable (QueryDict)
        request.data['refresh'] = refresh_token
        request.data._mutable = False

        response = super().post(request, *args, **kwargs)

        if response.status_code == 200:
            access_token = response.data.get('access')

            # Set new access token cookie
            response.set_cookie(
                key="access_token",
                value=access_token,
                httponly=True,
                secure=False,  # set to True in production (HTTPS)
                samesite="Lax",
                path="/",
            )
            # Optionally, you can also update the refresh token cookie if returned
            refresh = response.data.get('refresh')
            if refresh:
                response.set_cookie(
                    key="refresh_token",
                    value=refresh,
                    httponly=True,
                    secure=False,
                    samesite="Lax",
                    path="/",
                )
            
            # Clear the response body for security (optional)
            response.data = {"detail": "Token refreshed"}

        return response