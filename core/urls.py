from django.urls import path
from . import views

urlpatterns = [
    path('', views.dashboard, name='dashboard'),
    path('delete/<int:id>/', views.delete_transaction, name='delete_transaction'),
    path('api/nlp/', views.api_parse_message, name='api_nlp'),
    path('webhook/whatsapp/', views.whatsapp_webhook, name='whatsapp_webhook'),
]
