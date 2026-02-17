from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Count, Min, Q
from datetime import datetime
import json
import logging
import os

# Try to use Gemini, fall back to OpenAI if not available
try:
    import google.generativeai as genai
    USE_GEMINI = True
except ImportError:
    try:
        import openai
        USE_GEMINI = False
    except ImportError:
        USE_GEMINI = False

from .models import Ticket
from .serializers import TicketSerializer, ClassifySerializer

class TicketListCreateView(generics.ListCreateAPIView):
    queryset = Ticket.objects.all()
    serializer_class = TicketSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        category = self.request.query_params.get('category')
        priority = self.request.query_params.get('priority')
        status_param = self.request.query_params.get('status')
        search = self.request.query_params.get('search')
        if category:
            queryset = queryset.filter(category=category)
        if priority:
            queryset = queryset.filter(priority=priority)
        if status_param:
            queryset = queryset.filter(status=status_param)
        if search:
            queryset = queryset.filter(Q(title__icontains=search) | Q(description__icontains=search))
        return queryset

class TicketUpdateView(generics.UpdateAPIView):
    queryset = Ticket.objects.all()
    serializer_class = TicketSerializer
    lookup_field = 'id'
    http_method_names = ['patch']

class TicketClassifyView(APIView):
    def post(self, request):
        serializer = ClassifySerializer(data=request.data)
        if serializer.is_valid():
            description = serializer.validated_data['description']
            try:
                if USE_GEMINI:
                    return self._classify_with_gemini(description)
                else:
                    return self._classify_with_openai(description)
            except Exception as e:
                # Log error silently and return empty suggestions
                logging.error(f"LLM classification error: {str(e)}")
                return Response(
                    {"suggested_category": "", "suggested_priority": ""}, 
                    status=status.HTTP_503_SERVICE_UNAVAILABLE
                )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def _classify_with_gemini(self, description):
        """Use Google Gemini for classification"""
        api_key = os.environ.get('GEMINI_API_KEY')
        if not api_key:
            return Response(
                {"suggested_category": "", "suggested_priority": ""}, 
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
        
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-pro')
        
        prompt = (
            "Categorize this support ticket description into one of: billing, technical, account, general. "
            "Suggest priority: low, medium, high, critical. "
            "Respond only in JSON: {\"category\": \"...\", \"priority\": \"...\"}. "
            f"Description: {description}"
        )
        
        response = model.generate_content(prompt)
        response_text = response.text.strip()
        
        # Try to extract JSON from response
        try:
            suggestions = json.loads(response_text)
        except json.JSONDecodeError:
            return Response(
                {"suggested_category": "", "suggested_priority": ""}, 
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
        
        category = suggestions.get("category", "").lower()
        priority = suggestions.get("priority", "").lower()
        
        # Validate suggestions are in allowed choices
        valid_categories = ['billing', 'technical', 'account', 'general']
        valid_priorities = ['low', 'medium', 'high', 'critical']
        
        if category not in valid_categories:
            category = ""
        if priority not in valid_priorities:
            priority = ""
            
        return Response({
            "suggested_category": category,
            "suggested_priority": priority
        })

    def _classify_with_openai(self, description):
        """Use OpenAI for classification (fallback)"""
        import openai
        openai.api_key = os.environ.get('OPENAI_API_KEY')
        
        prompt = (
            "Categorize this support ticket description into one of: billing, technical, account, general. "
            "Suggest priority: low, medium, high, critical. "
            "Respond only in JSON: {\"category\": \"...\", \"priority\": \"...\"}. "
            f"Description: {description}"
        )
        
        response = openai.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=100,
        )
        response_text = response.choices[0].message.content.strip()
        
        # Try to extract JSON from response
        try:
            suggestions = json.loads(response_text)
        except json.JSONDecodeError:
            return Response(
                {"suggested_category": "", "suggested_priority": ""}, 
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
        
        category = suggestions.get("category", "").lower()
        priority = suggestions.get("priority", "").lower()
        
        # Validate suggestions are in allowed choices
        valid_categories = ['billing', 'technical', 'account', 'general']
        valid_priorities = ['low', 'medium', 'high', 'critical']
        
        if category not in valid_categories:
            category = ""
        if priority not in valid_priorities:
            priority = ""
            
        return Response({
            "suggested_category": category,
            "suggested_priority": priority
        })

class TicketStatsView(APIView):
    def get(self, request):
        total_tickets = Ticket.objects.count()
        open_tickets = Ticket.objects.filter(status='open').count()
        min_date = Ticket.objects.aggregate(min_date=Min('created_at'))['min_date']
        avg_tickets_per_day = 0.0
        if min_date and total_tickets > 0:
            days = (datetime.now(min_date.tzinfo) - min_date).days + 1
            avg_tickets_per_day = round(total_tickets / days, 1)
        priority_breakdown = dict(Ticket.objects.values('priority').annotate(count=Count('priority')).values_list('priority', 'count'))
        category_breakdown = dict(Ticket.objects.values('category').annotate(count=Count('category')).values_list('category', 'count'))
        data = {
            "total_tickets": total_tickets,
            "open_tickets": open_tickets,
            "avg_tickets_per_day": avg_tickets_per_day,
            "priority_breakdown": priority_breakdown,
            "category_breakdown": category_breakdown,
        }
        return Response(data)