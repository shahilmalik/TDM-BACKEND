from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    InvoiceViewSet,
    PaymentModeViewSet,
    PaymentTermViewSet,
    SenderInfoView,
    PaymentViewSet,
    ClientsDropdownView,
    PaymentModesDropdownView,
    PaymentTermsDropdownView,
)

router = DefaultRouter()
router.register(r'invoices', InvoiceViewSet, basename='invoices')
router.register(r'payment-modes', PaymentModeViewSet, basename='payment-modes')
router.register(r'payment-terms', PaymentTermViewSet, basename='payment-terms')
router.register(r'payments', PaymentViewSet, basename='payments')

urlpatterns = [
    path('', include(router.urls)),
    path('senderinfo/', SenderInfoView.as_view(), name='senderinfo'),
    path('dropdowns/clients/', ClientsDropdownView.as_view(), name='dropdown-clients'),
    path('dropdowns/payment-modes/', PaymentModesDropdownView.as_view(), name='dropdown-payment-modes'),
    path('dropdowns/payment-terms/', PaymentTermsDropdownView.as_view(), name='dropdown-payment-terms'),
]
