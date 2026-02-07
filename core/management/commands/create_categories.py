from django.core.management.base import BaseCommand
from core.models import Category

class Command(BaseCommand):
    help = 'Creates default categories'

    def handle(self, *args, **kwargs):
        categories = [
            # Expenses
            {'name': 'Moradia', 'icon': '🏠', 'is_income': False, 'color': '#f97316'}, # Orange
            {'name': 'Alimentação', 'icon': '🍔', 'is_income': False, 'color': '#ef4444'}, # Red
            {'name': 'Transporte', 'icon': '🚗', 'is_income': False, 'color': '#3b82f6'}, # Blue
            {'name': 'Lazer', 'icon': '🎉', 'is_income': False, 'color': '#8b5cf6'}, # Purple
            {'name': 'Saúde', 'icon': '💊', 'is_income': False, 'color': '#10b981'}, # Emerald
            {'name': 'Compras', 'icon': '🛍️', 'is_income': False, 'color': '#ec4899'}, # Pink
            
            # Income
            {'name': 'Salário', 'icon': '💰', 'is_income': True, 'color': '#22c55e'}, # Green
            {'name': 'Freelance', 'icon': '💻', 'is_income': True, 'color': '#06b6d4'}, # Cyan
            {'name': 'Investimentos', 'icon': '📈', 'is_income': True, 'color': '#eab308'}, # Yellow
            {'name': 'Outros', 'icon': '📦', 'is_income': False, 'color': '#6b7280'}, # Gray
        ]

        for cat_data in categories:
            Category.objects.get_or_create(
                name=cat_data['name'],
                defaults={
                    'icon': cat_data['icon'],
                    'is_income': cat_data['is_income'],
                    'color': cat_data['color']
                }
            )
        
        self.stdout.write(self.style.SUCCESS(f'Successfully created {len(categories)} categories'))
