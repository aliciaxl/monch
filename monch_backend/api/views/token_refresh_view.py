from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken, TokenError

class TokenRefreshView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        refresh_token = request.COOKIES.get('refresh_token')

        if refresh_token is None:
            return Response({"detail": "Refresh token not provided"}, status=401)

        try:
            refresh = RefreshToken(refresh_token)
            new_access_token = str(refresh.access_token)

            res = Response({"detail": "Token refreshed"})
            res.set_cookie(
                key="access_token",
                value=new_access_token,
                httponly=True,
                secure=False,  # True in production
                samesite="Lax",
                path="/",
            )
            return res

        except TokenError:
            return Response({"detail": "Invalid refresh token"}, status=401)
