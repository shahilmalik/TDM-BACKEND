from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.template.loader import render_to_string
from django.http import HttpResponse
from xhtml2pdf import pisa
from io import BytesIO
from .utils import render_invoice_html, build_invoice_context

from .models import Invoice, PaymentMode, PaymentTerm, BusinessInfo, Payment
from core.models import CustomUser, ClientProfile
from .serializers import InvoiceSerializer, PaymentModeSerializer, PaymentTermSerializer, BusinessInfoSerializer, PaymentSerializer
from core.permissions import IsOwnerOrAdmin
from rest_framework import mixins
from rest_framework import routers
from rest_framework.viewsets import GenericViewSet

class InvoiceViewSet(viewsets.ModelViewSet):
    queryset = Invoice.objects.all().select_related('client', 'authorized_by')
    serializer_class = InvoiceSerializer
    # permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            invoice = serializer.save()
            return Response({"success": True, "invoice": InvoiceSerializer(invoice).data}, status=status.HTTP_201_CREATED)
        return Response({"success": False, "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

    def list(self, request, *args, **kwargs):
        """List invoices - clients see only their own invoices, staff see all"""
        if request.user.type == 'client':
            queryset = self.get_queryset().filter(client=request.user)
        else:
            queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response({"success": True, "invoices": serializer.data})

    def retrieve(self, request, *args, **kwargs):
        """Retrieve invoice details - clients can only see their own invoices"""
        invoice = self.get_object()
        if request.user.type == 'client' and invoice.client != request.user:
            return Response({"success": False, "error": "You don't have permission to view this invoice"}, status=status.HTTP_403_FORBIDDEN)
        serializer = self.get_serializer(invoice)
        return Response({"success": True, "invoice": serializer.data})

    @action(detail=True, methods=['get'])
    def generate_pdf(self, request, pk=None):
        """Generate PDF invoice and return as downloadable file"""
        invoice = self.get_object()
        if request.user.type == 'client' and invoice.client != request.user:
            return Response({"success": False, "error": "You don't have permission to download this invoice"}, status=status.HTTP_403_FORBIDDEN)
        html, _ctx = render_invoice_html(invoice)
        buffer = BytesIO()
        pisa_status = pisa.CreatePDF(html, dest=buffer)
        if pisa_status.err:
            return Response({"success": False, "errors": {"error": "PDF generation failed"}}, status=500)

        buffer.seek(0)
        response = HttpResponse(buffer, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename=invoice_{invoice.invoice_id}.pdf'
        return response

    @action(detail=True, methods=['get'])
    def preview(self, request, pk=None):
        """Return invoice preview data and rendered HTML for frontend preview."""
        invoice = self.get_object()
        if request.user.type == 'client' and invoice.client != request.user:
            return Response({"success": False, "error": "You don't have permission to preview this invoice"}, status=status.HTTP_403_FORBIDDEN)
        html, context = render_invoice_html(invoice)
        return Response({
            'id': invoice.id,
            'html': html,
        })


class PaymentModeViewSet(viewsets.ModelViewSet):
    queryset = PaymentMode.objects.all()
    serializer_class = PaymentModeSerializer
    # permission_classes = [IsAuthenticated]


class PaymentTermViewSet(viewsets.ModelViewSet):
    queryset = PaymentTerm.objects.all()
    serializer_class = PaymentTermSerializer
    # permission_classes = [IsAuthenticated]


class SenderInfoView(APIView):
    """Return the latest BusinessInfo (sender data)."""
    # permission_classes = [IsAuthenticated]

    def get(self, request):
        bi = BusinessInfo.objects.order_by('-created_at').first()
        if not bi:
            return Response({'detail': 'No sender info configured'}, status=404)
        return Response(BusinessInfoSerializer(bi).data)


class ClientsDropdownView(APIView):
    """Return list of clients as id + name for dropdowns."""
    # permission_classes = [IsAuthenticated]

    def get(self, request):
        qs = CustomUser.objects.filter(type='client').select_related('profile')
        data = []
        for u in qs:
            name = None
            try:
                if hasattr(u, 'profile') and u.profile and getattr(u.profile, 'company_name', None):
                    name = u.profile.company_name
            except Exception:
                name = None
            if not name:
                name = f"{u.first_name or ''} {u.last_name or ''}".strip() or u.email or str(u.id)
            data.append({'id': u.id, 'name': name})
        return Response(data)


class PaymentModesDropdownView(APIView):
    # permission_classes = [IsAuthenticated]

    def get(self, request):
        items = PaymentMode.objects.all().values('id', 'name')
        return Response(list(items))


class PaymentTermsDropdownView(APIView):
    # permission_classes = [IsAuthenticated]

    def get(self, request):
        items = PaymentTerm.objects.all().values('id', 'name')
        return Response(list(items))


class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.all().select_related('invoice', 'payment_mode', 'received_by')
    serializer_class = PaymentSerializer
    # permission_classes = [IsAuthenticated]
    
