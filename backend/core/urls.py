from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UserViewSet,
    ServiceViewSet,
    ClientProfileViewSet,
    EmployeeViewSet,
    ClientSignupInitiateAPIView,
    ClientSignupVerifyAPIView,
    ClientUsersAPIView,
    ServiceCategoryViewSet,
    ClientViewSet,
    ClientSignupResendAPIView
)
router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'employee', EmployeeViewSet, basename='employee')
router.register(r'services', ServiceViewSet)
router.register(r'categories', ServiceCategoryViewSet)
router.register(r'profiles', ClientProfileViewSet)
router.register(r'clients', ClientViewSet, basename='client')

urlpatterns = [
    path('', include(router.urls)),
    # Employee CRUD
    # Provides: GET/POST /employee/  and GET/PUT/PATCH/DELETE /employee/{id}/
    # Implemented by `EmployeeViewSet` registered below.
    path('signup/client/initiate/', ClientSignupInitiateAPIView.as_view()),
    path('signup/client/verify/', ClientSignupVerifyAPIView.as_view()),
    path('signup/client/resend/', ClientSignupResendAPIView.as_view()),
    path('clients/users/', ClientUsersAPIView.as_view()),
]
