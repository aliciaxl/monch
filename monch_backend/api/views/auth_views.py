from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken, TokenError
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

        refresh_token = request.COOKIES.get("refresh_token")
        access_token = request.COOKIES.get("access_token")

        print("Logging out:")

        res = Response({'detail': 'Logged out'}, status=200)

        # Force-expire access_token
        res.set_cookie(
            key="access_token",
            value="",
            max_age=0,
            path="/",
            samesite="None",
            secure=True,
            httponly=True,
        )

        # Force-expire refresh_token
        res.set_cookie(
            key="refresh_token",
            value="",
            max_age=0,
            path="/",
            samesite="None",
            secure=True,
            httponly=True,
        )

        if refresh_token:
            try:
                token = RefreshToken(refresh_token)
                token.blacklist()
                print("Refresh token successfully blacklisted.")
            except TokenError as e:
                print("TokenError during blacklist:", str(e))
            except Exception as e:
                print("Unexpected error during token blacklist:", str(e))
        else:
            print("No refresh token found in cookies.")

        return res
    
class CookieTokenRefreshView(TokenRefreshView):
    def post(self, request, *args, **kwargs):
        refresh_token = request.COOKIES.get('refresh_token')

        if not refresh_token:
            return Response({"detail": "Refresh token cookie not found."}, status=status.HTTP_401_UNAUTHORIZED)

        # Inject refresh token into request data
        request.data._mutable = True if hasattr(request.data, "_mutable") else False
        request.data['refresh'] = refresh_token

        response = super().post(request, *args, **kwargs)

        if response.status_code == 200:
            access_token = response.data.get('access')

            secure_cookie = True  # True in production HTTPS
            samesite = "None"       

            # Set access token as HttpOnly cookie
            response.set_cookie(
                key="access_token",
                value=access_token,
                httponly=True,
                secure=secure_cookie,  # Change to True in production!
                samesite=samesite,
                path="/",
            )

            # Optional: Refresh refresh token if returned
            refresh = response.data.get('refresh')
            if refresh:
                response.set_cookie(
                    key="refresh_token",
                    value=refresh,
                    httponly=True,
                    secure=secure_cookie,
                    samesite=samesite,
                    path="/",
                )

            # Optionally remove tokens from body
            response.data = {"detail": "Token refreshed"}

        return response