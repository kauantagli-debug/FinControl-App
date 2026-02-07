import re
from decimal import Decimal
from ..models import Category

def parse_message(text):
    """
    Parses a natural language message into transaction data.
    Enhanced to find Categories.
    """
    text = text.lower()
    
    # 1. Extract Amount
    # Matches: "50", "R$ 50", "50.00", "50,00"
    amount_match = re.search(r'R?\$?\s?(\d+[,.]?\d*)', text)
    amount = Decimal('0.00')
    if amount_match:
        amount_str = amount_match.group(1).replace(',', '.')
        amount = Decimal(amount_str)

    is_expense = True # Default
    if any(word in text for word in ['recebi', 'ganhei', 'salário', 'depósito', 'pix recebido']):
        is_expense = False

    # 3. Extract Description (Everything else)
    # Remove the amount from the text to leave the description
    description = text
    if amount_match:
        description = text.replace(amount_match.group(0), '').strip()
    
    # Clean up common connector words
    for word in ['gastei', 'no', 'na', 'com', 'em', 'de', 'do', 'da']:
        description = re.sub(r'\b' + word + r'\b', '', description).strip()

    # 4. Extract Category (Keyword matching)
    category = None
    all_categories = Category.objects.all()
    
    # Map keywords to categories
    # ideally this should be a DB field 'keywords' but for now we hardcode mappin
    keywords_map = {
        'comida': 'Alimentação', 'lanche': 'Alimentação', 'ifood': 'Alimentação', 'restaurante': 'Alimentação', 'mercado': 'Alimentação',
        'uber': 'Transporte', 'gasolina': 'Transporte', 'ônibus': 'Transporte', 'transporte': 'Transporte',
        'aluguel': 'Moradia', 'luz': 'Moradia', 'internet': 'Moradia', 'casa': 'Moradia',
        'remedio': 'Saúde', 'farmacia': 'Saúde', 'medico': 'Saúde',
        'cinema': 'Lazer', 'jogo': 'Lazer', 'sair': 'Lazer',
        'salario': 'Salário', 'pagamento': 'Salário',
        'freela': 'Freelance', 'projeto': 'Freelance',
    }
    
    # Check description against map
    found_cat_name = 'Outros' # Fallback
    for word, cat_name in keywords_map.items():
        if word in text:
            found_cat_name = cat_name
            break
            
    # Try to find the category object
    category = all_categories.filter(name__iexact=found_cat_name).first()
    if not category and is_expense:
         category = all_categories.filter(name='Compras').first() # Final fallback

    return {
        'amount': amount,
        'description': description.title() or "Nova Transação",
        'type': 'EXPENSE' if is_expense else 'INCOME',
        'category': category
    }
