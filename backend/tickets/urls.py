from django.urls import path
from django.views.decorators.http import condition
from .views import (
    TicketListCreateView,
    TicketUpdateView,
    TicketClassifyView,
    TicketStatsView,
)

urlpatterns = [
    path('tickets/', TicketListCreateView.as_view(), name='ticket-list-create'),
    path('tickets/<int:id>/', TicketUpdateView.as_view(), name='ticket-update'),
    path('tickets/classify/', TicketClassifyView.as_view(), name='ticket-classify'),
    path('tickets/stats/', TicketStatsView.as_view(), name='ticket-stats'),
]