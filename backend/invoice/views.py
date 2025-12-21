from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.template.loader import render_to_string
from django.http import HttpResponse
from django.conf import settings
from .utils import render_invoice_html, build_invoice_context

from .models import Invoice, PaymentMode, PaymentTerm, BusinessInfo, Payment, INVOICE_STATUS
from core.models import CustomUser, ClientProfile
from .serializers import InvoiceSerializer, PaymentModeSerializer, PaymentTermSerializer, BusinessInfoSerializer, PaymentSerializer
from core.permissions import IsOwnerOrAdmin
from rest_framework import mixins
from rest_framework import routers
from rest_framework.viewsets import GenericViewSet
from kanban.models import ContentItem

class InvoiceViewSet(viewsets.ModelViewSet):
    queryset = Invoice.objects.all().select_related('client', 'authorized_by').prefetch_related('items__service')
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

        # Filters (backend-driven)
        status_value = request.query_params.get('status') or None
        client_id = request.query_params.get('client_id') or request.query_params.get('client') or None
        start_date = request.query_params.get('start_date') or request.query_params.get('date_start') or None
        end_date = request.query_params.get('end_date') or request.query_params.get('date_end') or None

        if status_value and status_value != 'All':
            queryset = queryset.filter(status=status_value)

        # Only allow staff to filter by arbitrary client.
        if client_id and client_id != 'All' and request.user.type != 'client':
            try:
                queryset = queryset.filter(client_id=int(client_id))
            except Exception:
                pass

        if start_date:
            try:
                queryset = queryset.filter(date__gte=start_date)
            except Exception:
                pass
        if end_date:
            try:
                queryset = queryset.filter(date__lte=end_date)
            except Exception:
                pass

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

        html = render_invoice_html(invoice, request=request, template_name='invoice.html')

        # base_url is important so relative URLs (if any) resolve correctly.
        base_url = request.build_absolute_uri('/') if request is not None else str(settings.BASE_DIR)
        try:
            from weasyprint import HTML

            pdf_bytes = HTML(string=html, base_url=base_url).write_pdf()
        except Exception:
            return Response(
                {
                    "success": False,
                    "errors": {
                        "error": (
                            "PDF generation failed. If you are on Windows, WeasyPrint "
                            "requires GTK/Pango libraries (libgobject-2.0-0, pango, etc.) "
                            "to be installed and available on PATH."
                        )
                    },
                },
                status=500,
            )

        response = HttpResponse(pdf_bytes, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename=invoice_{invoice.invoice_id}.pdf'
        return response

    @action(detail=True, methods=['get'])
    def preview(self, request, pk=None):
        """Return invoice preview data and rendered HTML for frontend preview."""
        invoice = self.get_object()
        if request.user.type == 'client' and invoice.client != request.user:
            return Response({"success": False, "error": "You don't have permission to preview this invoice"}, status=status.HTTP_403_FORBIDDEN)
        html = render_invoice_html(invoice, request=request, template_name='invoice.html')
        return Response({
            'id': invoice.id,
            'html': html,
        })

    @action(detail=True, methods=['post'])
    def start_pipeline(self, request, pk=None):
        """Create kanban ContentItems for pipeline services on this (paid) invoice.

        Idempotent: re-calling will only create missing items.
        """
        invoice = self.get_object()

        if invoice.status != 'paid':
            return Response(
                {"success": False, "error": "Pipeline can only be started for paid invoices."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        items = invoice.items.select_related('service').all()
        pipeline_items = [it for it in items if getattr(it.service, 'is_pipeline', False)]
        if not pipeline_items:
            return Response(
                {"success": False, "error": "No pipeline services found on this invoice."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        created = 0
        created_titles = []
        for it in pipeline_items:
            svc = it.service
            config = getattr(svc, 'pipeline_config', None) or []
            if not isinstance(config, list):
                continue

            for entry in config:
                if not isinstance(entry, dict):
                    continue
                prefix = (entry.get('prefix') or '').strip()
                try:
                    count = int(entry.get('count') or 0)
                except Exception:
                    count = 0
                if not prefix or count <= 0:
                    continue

                titles = [f"{prefix}-{i:03d}" for i in range(1, count + 1)]
                existing = set(
                    ContentItem.objects.filter(
                        invoice=invoice,
                        service=svc,
                        title__in=titles,
                    ).values_list('title', flat=True)
                )

                for title in titles:
                    if title in existing:
                        continue
                    ContentItem.objects.create(
                        title=title,
                        client=invoice.client,
                        service=svc,
                        invoice=invoice,
                        created_by=request.user,
                        due_date=invoice.start_date or None,
                    )
                    created += 1
                    created_titles.append(title)

        return Response(
            {
                "success": True,
                "created": created,
                "titles": created_titles,
            },
            status=status.HTTP_200_OK,
        )


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


class InvoiceStatusesDropdownView(APIView):
    """Return invoice status choices as value+label.

    value: stored DB value (first tuple element)
    label: human-readable label (second tuple element)
    """

    def get(self, request):
        data = [{'value': v, 'label': label} for (v, label) in INVOICE_STATUS]
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

    def perform_create(self, serializer):
        serializer.save(received_by=self.request.user)
    
