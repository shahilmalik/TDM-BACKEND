from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ContentItemViewSet, ContentCommentViewSet

router = DefaultRouter()
router.register(r'content-items', ContentItemViewSet, basename='content-item')
router.register(r'comments', ContentCommentViewSet, basename='content-comment')

urlpatterns = [
    path('', include(router.urls)),
]
