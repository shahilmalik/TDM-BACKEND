from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import ContentItem
from .serializers import ContentItemMoveSerializer, ContentItemApprovalSerializer
from kanban.serializers import ContentItemSerializer
from rest_framework.permissions import IsAuthenticated

class ContentItemViewSet(viewsets.ModelViewSet):
    queryset = ContentItem.objects.select_related(
        "client",
        "created_by",
        "service",
        "invoice",
        "assigned_to",
        "approved_by",
    ).prefetch_related("media_assets")
    serializer_class = ContentItemSerializer
    permission_classes = [IsAuthenticated]

    # Move item to another column
    @action(detail=True, methods=['post'])
    def move(self, request, pk=None):
        item = self.get_object()
        serializer = ContentItemMoveSerializer(data=request.data, context={'request': request, 'content_item': item})
        if serializer.is_valid():
            serializer.save()
            return Response({"success": True, "item": ContentItemSerializer(item).data})
        return Response({"success": False, "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

    # Approve or revise in client approval
    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        item = self.get_object()
        serializer = ContentItemApprovalSerializer(data=request.data, context={'request': request, 'content_item': item})
        if serializer.is_valid():
            serializer.save()
            return Response({"success": True, "item": ContentItemSerializer(item).data})
        return Response({"success": False, "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
