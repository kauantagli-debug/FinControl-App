from django.shortcuts import render, redirect, get_object_or_404
from .models import Transaction
from .forms import TransactionForm
from django.db.models import Sum, Q
from django.utils import timezone
from django.contrib.auth.models import User
from decimal import Decimal

from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
import json
from .services.whatsapp import handle_webhook
from .services.nlp import parse_message

# ... existing get_current_user ...
def get_current_user(request):
    # Helper to get user since we don't have full auth system yet
    if request.user.is_authenticated:
        return request.user
    return User.objects.first() or User.objects.create_user('admin', 'admin@example.com', 'admin')


@csrf_exempt
def api_parse_message(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            text = data.get('text', '')
            if not text:
                return JsonResponse({'error': 'No text provided'}, status=400)
                
            parsed = parse_message(text)
            
            # Create transaction immediately (Quick Add)
            user = get_current_user(request)
            transaction = Transaction.objects.create(
                user=user,
                amount=parsed['amount'],
                description=parsed['description'],
                type=parsed['type'],
                category=parsed['category'],
                source='AI_WEB',
                date=timezone.now()
            )
            
            return JsonResponse({
                'status': 'success',
                'description': transaction.description,
                'amount': str(transaction.amount),
                'category': transaction.category.name if transaction.category else 'None'
            })
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    return JsonResponse({'error': 'Method not allowed'}, status=405)

def dashboard(request):
    user = get_current_user(request)
    
    # Handle Creation
    if request.method == 'POST':
        form = TransactionForm(request.POST)
        if form.is_valid():
            transaction = form.save(commit=False)
            transaction.user = user
            transaction.source = 'WEB'
            transaction.save()
            return redirect('dashboard')
    else:
        form = TransactionForm()

    # Calculate Totals
    now = timezone.now()
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    
    transactions = Transaction.objects.filter(user=user).order_by('-date')
    
    # Chart Data: Expenses by Category
    category_data = (
        Transaction.objects
        .filter(user=user, type='EXPENSE')
        .values('category__name', 'category__color')
        .annotate(total=Sum('amount'))
        .order_by('-total')
    )
    # Convert Decimals for JSON serialization
    category_list = []
    for item in category_data:
        category_list.append({
            'category__name': item['category__name'],
            'category__color': item['category__color'],
            'total': float(item['total'])
        })

    aggregates = transactions.aggregate(
        total_income=Sum('amount', filter=Q(type='INCOME')),
        total_expense=Sum('amount', filter=Q(type='EXPENSE')),
        month_expense=Sum('amount', filter=Q(type='EXPENSE', date__gte=month_start))
    )

    total_income = aggregates['total_income'] or Decimal('0.00')
    total_expense = aggregates['total_expense'] or Decimal('0.00')
    total_balance = total_income - total_expense
    month_expense = aggregates['month_expense'] or Decimal('0.00')

    return render(request, 'dashboard.html', {
        'transactions': transactions[:10],
        'total_balance': total_balance,
        'month_expense': month_expense,
        'total_income': total_income,
        'total_expense': total_expense,
        'form': form,
        'category_data': json.dumps(category_list)
    })

def delete_transaction(request, id):
    user = get_current_user(request)
    transaction = get_object_or_404(Transaction, id=id, user=user)
    transaction.delete()
    return redirect('dashboard')

@csrf_exempt
def whatsapp_webhook(request):
    if request.method == 'GET':
        mode = request.GET.get('hub.mode')
        token = request.GET.get('hub.verify_token')
        challenge = request.GET.get('hub.challenge')
        if mode and token:
            if mode == 'subscribe' and token == 'mytesttoken':
               return HttpResponse(challenge, status=200)
            else:
               return HttpResponse('Forbidden', status=403)
        return HttpResponse('Hello', status=200)

    if request.method == 'POST':
        try:
            payload = json.loads(request.body)
            # Handle double encoded JSON if present
            if isinstance(payload, str):
                try:
                    payload = json.loads(payload)
                except:
                    pass
            result = handle_webhook(payload)
            return JsonResponse({'status': result}, status=200)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
