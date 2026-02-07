from django import forms
from .models import Transaction, Category

class TransactionForm(forms.ModelForm):
    class Meta:
        model = Transaction
        fields = ['amount', 'description', 'type', 'category', 'date']
        widgets = {
            'date': forms.DateTimeInput(attrs={'type': 'datetime-local'}),
            'description': forms.TextInput(attrs={'placeholder': 'Ex: Salary, Uber...'}),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Add Tailwind classes to all fields
        common_classes = 'w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-purple transition placeholder-gray-500'
        
        for field in self.fields:
            self.fields[field].widget.attrs.update({
                'class': common_classes
            })
            
        # Specific overrides
        self.fields['category'].widget.attrs.update({'class': common_classes + ' appearance-none cursor-pointer'})
        self.fields['date'].widget.attrs.update({'class': common_classes + ' [color-scheme:dark]'}) # Force dark calendar
        self.fields['amount'].widget.attrs.update({'placeholder': '0.00', 'step': '0.01'})
