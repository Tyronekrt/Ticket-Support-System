from rest_framework import serializers
from .models import Ticket

class TicketSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ticket
        fields = '__all__'

class ClassifySerializer(serializers.Serializer):
    description = serializers.CharField(required=True)
