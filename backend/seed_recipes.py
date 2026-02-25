"""
Comprehensive recipe seed:
- Adds missing ingredients
- Creates ingredient mappings for all 197 unmapped menu items
Run: python seed_recipes.py
"""
import asyncio
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId

MONGO_URI = 'mongodb+srv://priyadharshini:Ezhilithanya@cluster0.crvutrr.mongodb.net/restaurant_db'

# ─── Existing ingredient IDs ────────────────────────────────────────────────
RICE        = '699c6dd4ff2351a478b8c011'  # Basmati Rice kg
TOMATOES    = '699c6dd4ff2351a478b8c012'  # Tomatoes kg
PANEER      = '699c6dd4ff2351a478b8c013'  # Paneer kg
CHICKEN     = '699c6dd4ff2351a478b8c014'  # Chicken Breast kg
ONIONS      = '699c6dd4ff2351a478b8c015'  # Onions kg
GINGER      = '699c6dd4ff2351a478b8c016'  # Ginger kg
GARLIC      = '699c6dd4ff2351a478b8c017'  # Garlic kg
CUMIN       = '699c6dd4ff2351a478b8c018'  # Cumin Seeds kg
GHEE        = '699c6dd4ff2351a478b8c019'  # Ghee liters
VEG_OIL     = '699c6dd4ff2351a478b8c01a'  # Vegetable Oil liters
OLIVE_OIL   = '699c77543be4daf341e99eba'  # Olive Oil L
MOZZ        = '699c77543be4daf341e99ebb'  # Mozzarella Cheese kg
SAFFRON     = '699c77543be4daf341e99ebc'  # Saffron kg
POTATOES    = '699c77543be4daf341e99ebd'  # Potatoes kg
BASIL       = '699c77553be4daf341e99ebe'  # Fresh Basil kg

# ─── New ingredients to add ─────────────────────────────────────────────────
NEW_INGREDIENTS = [
    {'name': 'Milk',              'unit': 'liters', 'stockLevel': 50, 'minThreshold': 10, 'status': 'Healthy'},
    {'name': 'Eggs',              'unit': 'units',  'stockLevel': 200,'minThreshold': 30, 'status': 'Healthy'},
    {'name': 'Butter',            'unit': 'kg',     'stockLevel': 10, 'minThreshold': 2,  'status': 'Healthy'},
    {'name': 'Maida (Flour)',     'unit': 'kg',     'stockLevel': 30, 'minThreshold': 5,  'status': 'Healthy'},
    {'name': 'Sugar',             'unit': 'kg',     'stockLevel': 20, 'minThreshold': 4,  'status': 'Healthy'},
    {'name': 'Fresh Cream',       'unit': 'liters', 'stockLevel': 15, 'minThreshold': 3,  'status': 'Healthy'},
    {'name': 'Coriander',         'unit': 'kg',     'stockLevel': 5,  'minThreshold': 1,  'status': 'Healthy'},
    {'name': 'Green Chilies',     'unit': 'kg',     'stockLevel': 4,  'minThreshold': 0.5,'status': 'Healthy'},
    {'name': 'Coconut',           'unit': 'kg',     'stockLevel': 10, 'minThreshold': 2,  'status': 'Healthy'},
    {'name': 'Yogurt',            'unit': 'liters', 'stockLevel': 12, 'minThreshold': 2,  'status': 'Healthy'},
    {'name': 'Mutton',            'unit': 'kg',     'stockLevel': 15, 'minThreshold': 3,  'status': 'Healthy'},
    {'name': 'Fish',              'unit': 'kg',     'stockLevel': 10, 'minThreshold': 2,  'status': 'Healthy'},
    {'name': 'Prawns',            'unit': 'kg',     'stockLevel': 8,  'minThreshold': 2,  'status': 'Healthy'},
    {'name': 'Lemon',             'unit': 'kg',     'stockLevel': 5,  'minThreshold': 1,  'status': 'Healthy'},
    {'name': 'Bell Pepper',       'unit': 'kg',     'stockLevel': 8,  'minThreshold': 1,  'status': 'Healthy'},
    {'name': 'Mushrooms',         'unit': 'kg',     'stockLevel': 6,  'minThreshold': 1,  'status': 'Healthy'},
    {'name': 'Pasta',             'unit': 'kg',     'stockLevel': 15, 'minThreshold': 3,  'status': 'Healthy'},
    {'name': 'Urad Dal',          'unit': 'kg',     'stockLevel': 10, 'minThreshold': 2,  'status': 'Healthy'},
    {'name': 'Semolina (Rava)',   'unit': 'kg',     'stockLevel': 8,  'minThreshold': 2,  'status': 'Healthy'},
    {'name': 'Chana Dal',         'unit': 'kg',     'stockLevel': 8,  'minThreshold': 2,  'status': 'Healthy'},
    {'name': 'Cauliflower',       'unit': 'kg',     'stockLevel': 10, 'minThreshold': 2,  'status': 'Healthy'},
    {'name': 'Capsicum',          'unit': 'kg',     'stockLevel': 8,  'minThreshold': 1,  'status': 'Healthy'},
    {'name': 'Noodles',           'unit': 'kg',     'stockLevel': 12, 'minThreshold': 2,  'status': 'Healthy'},
    {'name': 'Cornflour',         'unit': 'kg',     'stockLevel': 5,  'minThreshold': 1,  'status': 'Healthy'},
    {'name': 'Soy Sauce',         'unit': 'liters', 'stockLevel': 4,  'minThreshold': 0.5,'status': 'Healthy'},
    {'name': 'Vinegar',           'unit': 'liters', 'stockLevel': 3,  'minThreshold': 0.5,'status': 'Healthy'},
    {'name': 'Bread',             'unit': 'units',  'stockLevel': 100,'minThreshold': 20, 'status': 'Healthy'},
    {'name': 'Cheese',            'unit': 'kg',     'stockLevel': 10, 'minThreshold': 2,  'status': 'Healthy'},
    {'name': 'Coffee Powder',     'unit': 'kg',     'stockLevel': 3,  'minThreshold': 0.5,'status': 'Healthy'},
    {'name': 'Tea Leaves',        'unit': 'kg',     'stockLevel': 3,  'minThreshold': 0.5,'status': 'Healthy'},
    {'name': 'Honey',             'unit': 'kg',     'stockLevel': 3,  'minThreshold': 0.5,'status': 'Healthy'},
    {'name': 'Condensed Milk',    'unit': 'liters', 'stockLevel': 5,  'minThreshold': 1,  'status': 'Healthy'},
    {'name': 'Rice Flour',        'unit': 'kg',     'stockLevel': 8,  'minThreshold': 2,  'status': 'Healthy'},
    {'name': 'Cardamom',          'unit': 'kg',     'stockLevel': 0.5,'minThreshold': 0.1,'status': 'Healthy'},
    {'name': 'Turmeric',          'unit': 'kg',     'stockLevel': 1,  'minThreshold': 0.2,'status': 'Healthy'},
    {'name': 'Red Chili Powder',  'unit': 'kg',     'stockLevel': 2,  'minThreshold': 0.3,'status': 'Healthy'},
    {'name': 'Coriander Powder',  'unit': 'kg',     'stockLevel': 2,  'minThreshold': 0.3,'status': 'Healthy'},
    {'name': 'Garam Masala',      'unit': 'kg',     'stockLevel': 1,  'minThreshold': 0.2,'status': 'Healthy'},
    {'name': 'Coconut Milk',      'unit': 'liters', 'stockLevel': 6,  'minThreshold': 1,  'status': 'Healthy'},
    {'name': 'Parotta / Bread',   'unit': 'units',  'stockLevel': 80, 'minThreshold': 15, 'status': 'Healthy'},
]

async def seed():
    client = AsyncIOMotorClient(MONGO_URI)
    db = client['restaurant_db']

    # ── Step 1: Add new ingredients ──────────────────────────────────────────
    print('Adding new ingredients...')
    ing_id_map = {}  # name → ObjectId string

    # Get existing
    existing_ings = await db.ingredients.find({}, {'_id': 1, 'name': 1}).to_list(200)
    for e in existing_ings:
        ing_id_map[e['name'].strip().lower()] = str(e['_id'])

    for ing in NEW_INGREDIENTS:
        key = ing['name'].strip().lower()
        if key not in ing_id_map:
            doc = dict(ing)
            doc['createdAt'] = datetime.utcnow()
            result = await db.ingredients.insert_one(doc)
            ing_id_map[key] = str(result.inserted_id)
            print(f'  + Added ingredient: {ing["name"]}')
        else:
            print(f'  ~ Skipped (exists): {ing["name"]}')

    # Helper: look up an ingredient id by key
    def I(name):
        return ing_id_map.get(name.strip().lower(), None)

    # Convenience short refs for new ingredients
    MILK      = I('milk')
    EGGS      = I('eggs')
    BUTTER    = I('butter')
    FLOUR     = I('maida (flour)')
    SUGAR     = I('sugar')
    CREAM     = I('fresh cream')
    CORIANDER = I('coriander')
    GCHILI    = I('green chilies')
    COCONUT   = I('coconut')
    YOGURT    = I('yogurt')
    MUTTON    = I('mutton')
    FISH_I    = I('fish')
    PRAWNS    = I('prawns')
    LEMON     = I('lemon')
    BELLPEP   = I('bell pepper')
    MUSH      = I('mushrooms')
    PASTA_I   = I('pasta')
    URAD      = I('urad dal')
    RAVA      = I('semolina (rava)')
    CHANA     = I('chana dal')
    CAULIFL   = I('cauliflower')
    CAPS      = I('capsicum')
    NOODLES   = I('noodles')
    CORNFL    = I('cornflour')
    SOY       = I('soy sauce')
    VINEGAR   = I('vinegar')
    BREAD_I   = I('bread')
    CHEESE    = I('cheese')
    COFFEE    = I('coffee powder')
    TEA       = I('tea leaves')
    HONEY     = I('honey')
    COND_MILK = I('condensed milk')
    RICE_FL   = I('rice flour')
    CARDAMOM  = I('cardamom')
    TURMERIC  = I('turmeric')
    RCHILI    = I('red chili powder')
    CORIPOW   = I('coriander powder')
    GARAM     = I('garam masala')
    COC_MILK  = I('coconut milk')
    PAROTTA   = I('parotta / bread')

    def r(ing_id, amt, unit='kg'):
        return {'ingredientId': ing_id, 'name': '', 'amount': amt, 'unit': unit}

    # ── Step 2: Define recipes per menu_item_id ───────────────────────────────
    RECIPES = {
        # ─── SOUTH INDIAN ──────────────────────────────────────────────────
        '698b0cdf6eaf8a8d0522f4a4': [  # Avial
            r(POTATOES, 0.1), r(ONIONS, 0.05), r(COCONUT, 0.08), r(YOGURT, 0.05, 'liters'), r(VEG_OIL, 0.02, 'liters'), r(TURMERIC, 0.002),
        ],
        '698b0e2e5b37aebcff6b958d': [  # Ghee Podi Dosa
            r(URAD, 0.05), r(RICE_FL, 0.1), r(GHEE, 0.02, 'liters'), r(ONIONS, 0.03),
        ],
        '698b65d114c8adf59d93bb1a': [  # Gobi 65
            r(CAULIFL, 0.2), r(CORNFL, 0.03), r(VEG_OIL, 0.05, 'liters'), r(GINGER, 0.01), r(GARLIC, 0.01), r(RCHILI, 0.005), r(YOGURT, 0.05, 'liters'),
        ],
        '698b666852bba9cc5b0698c8': [  # Masala Paniyaram
            r(RICE_FL, 0.1), r(URAD, 0.04), r(ONIONS, 0.04), r(GCHILI, 0.01), r(VEG_OIL, 0.02, 'liters'),
        ],
        '698b6b6e096bd11760ae1fdd': [  # Fish Fingers
            r(FISH_I, 0.2), r(CORNFL, 0.04), r(FLOUR, 0.03), r(EGGS, 1, 'units'), r(VEG_OIL, 0.05, 'liters'), r(LEMON, 0.02),
        ],
        '698b6c84e74795121b3a1757': [  # Chicken Nuggets
            r(CHICKEN, 0.15), r(FLOUR, 0.04), r(EGGS, 1, 'units'), r(VEG_OIL, 0.05, 'liters'), r(GARLIC, 0.01),
        ],
        '698b6d042babba3699f74257': [  # Prawn Tempura
            r(PRAWNS, 0.2), r(CORNFL, 0.03), r(FLOUR, 0.05), r(EGGS, 1, 'units'), r(VEG_OIL, 0.06, 'liters'),
        ],
        '698b6d85282d78a9d6192f4f': [  # Corn Cheese Balls
            r(POTATOES, 0.1), r(CHEESE, 0.05), r(CORNFL, 0.02), r(VEG_OIL, 0.04, 'liters'), r(GCHILI, 0.01),
        ],
        '698b6de83c2ca56112701adf': [  # Tandoori Chicken
            r(CHICKEN, 0.3), r(YOGURT, 0.08, 'liters'), r(GINGER, 0.02), r(GARLIC, 0.02), r(RCHILI, 0.01), r(GARAM, 0.005), r(LEMON, 0.02),
        ],
        '698ca009bb0fcbc71c1cef6c': [  # Chicken Tikka Masala
            r(CHICKEN, 0.25), r(TOMATOES, 0.15), r(CREAM, 0.08, 'liters'), r(ONIONS, 0.1), r(GINGER, 0.01), r(GARLIC, 0.01), r(GARAM, 0.005), r(VEG_OIL, 0.03, 'liters'),
        ],
        '698ca0653b05c4f0976a8cbc': [  # Vegetable Hakka Noodles
            r(NOODLES, 0.1), r(CAPS, 0.05), r(ONIONS, 0.04), r(SOY, 0.02, 'liters'), r(VEG_OIL, 0.03, 'liters'), r(GINGER, 0.01), r(GARLIC, 0.01),
        ],
        '698ca0943b946d26e046912a': [  # Chicken Hakka Noodles
            r(NOODLES, 0.1), r(CHICKEN, 0.12), r(CAPS, 0.04), r(ONIONS, 0.04), r(SOY, 0.02, 'liters'), r(VEG_OIL, 0.03, 'liters'),
        ],
        '698ca0b00c5de6ad98ab8cd6': [  # Veg Fried Rice
            r(RICE, 0.15), r(ONIONS, 0.04), r(CAPS, 0.03), r(EGGS, 1, 'units'), r(SOY, 0.02, 'liters'), r(VEG_OIL, 0.03, 'liters'),
        ],
        '698ca0d4051a4802d0980cf2': [  # Egg Fried Rice
            r(RICE, 0.15), r(EGGS, 2, 'units'), r(ONIONS, 0.04), r(SOY, 0.02, 'liters'), r(VEG_OIL, 0.03, 'liters'),
        ],
        '698ca0fceb960f6463d5dcaf': [  # Rajma Chawal
            r(RICE, 0.12), r(CHANA, 0.08), r(TOMATOES, 0.08), r(ONIONS, 0.06), r(GINGER, 0.01), r(VEG_OIL, 0.02, 'liters'), r(GARAM, 0.005),
        ],
        # ─── DESSERTS ──────────────────────────────────────────────────────
        '698ca1239b1d24a5f524d0ec': [  # Gulab Jamun
            r(FLOUR, 0.05), r(MILK, 0.03, 'liters'), r(SUGAR, 0.08), r(VEG_OIL, 0.04, 'liters'), r(CARDAMOM, 0.002),
        ],
        '698ca13ee523e44673fe0b27': [  # Chocolate Brownie
            r(FLOUR, 0.08), r(SUGAR, 0.1), r(BUTTER, 0.06), r(EGGS, 2, 'units'), r(MILK, 0.05, 'liters'),
        ],
        '698ca166561d035d3034668a': [  # Ice Cream Sundae
            r(MILK, 0.15, 'liters'), r(CREAM, 0.08, 'liters'), r(SUGAR, 0.06), r(HONEY, 0.02),
        ],
        '698ca186c5231d3a7db414bb': [  # Cheesecake
            r(CHEESE, 0.15), r(FLOUR, 0.06), r(SUGAR, 0.08), r(BUTTER, 0.05), r(EGGS, 2, 'units'),
        ],
        '698ca51acf0a7644c829bf05': [  # Rasmalai
            r(MILK, 0.2, 'liters'), r(SUGAR, 0.08), r(CARDAMOM, 0.002), r(SAFFRON, 0.001),
        ],
        '698ca53919983066f7585090': [  # Tiramisu
            r(CREAM, 0.12, 'liters'), r(COFFEE, 0.02), r(SUGAR, 0.05), r(EGGS, 3, 'units'), r(FLOUR, 0.04),
        ],
        '698ca57f29c8363e4f19a0c0': [  # Apple Pie
            r(FLOUR, 0.15), r(BUTTER, 0.08), r(SUGAR, 0.1), r(EGGS, 1, 'units'),
        ],
        '698ca59cae5ed0b9a807e8d1': [  # Chocolate Lava Cake
            r(FLOUR, 0.06), r(SUGAR, 0.07), r(BUTTER, 0.06), r(EGGS, 2, 'units'), r(MILK, 0.05, 'liters'),
        ],
        '698ca5b9aac17301508e4c5f': [  # Gajar Halwa
            r(MILK, 0.15, 'liters'), r(SUGAR, 0.08), r(GHEE, 0.04, 'liters'), r(CARDAMOM, 0.002),
        ],
        '698ca5d5b2cd933ad7ada4d6': [  # Rasgulla
            r(MILK, 0.25, 'liters'), r(SUGAR, 0.1), r(LEMON, 0.02),
        ],
        '698ca605988f11cc3c703f9f': [  # Panna Cotta
            r(CREAM, 0.15, 'liters'), r(SUGAR, 0.05), r(MILK, 0.05, 'liters'),
        ],
        '698ca62cde7e0fa1168a69c6': [  # Jalebi
            r(FLOUR, 0.08), r(SUGAR, 0.1), r(VEG_OIL, 0.04, 'liters'), r(YOGURT, 0.03, 'liters'),
        ],
        '698ca66e5ecebe67cc38c715': [  # Chocolate Mousse
            r(CREAM, 0.12, 'liters'), r(SUGAR, 0.05), r(EGGS, 2, 'units'), r(BUTTER, 0.03),
        ],
        '698cab11da79048c6e7e2483': [  # Kulfi
            r(MILK, 0.2, 'liters'), r(COND_MILK, 0.08, 'liters'), r(CARDAMOM, 0.002), r(SAFFRON, 0.001),
        ],
        '698cab3b80078884b782cb81': [  # Tres Leches Cake
            r(FLOUR, 0.12), r(SUGAR, 0.1), r(EGGS, 3, 'units'), r(MILK, 0.1, 'liters'), r(CREAM, 0.08, 'liters'),
        ],
        '698cab664e43b90125a7cfb8': [  # Fruit Salad
            r(SUGAR, 0.03), r(LEMON, 0.02), r(HONEY, 0.02),
        ],
        '698caba1ae4c3d25d1e86f3e': [  # Bread Pudding
            r(BREAD_I, 6, 'units'), r(MILK, 0.15, 'liters'), r(EGGS, 2, 'units'), r(SUGAR, 0.06), r(BUTTER, 0.03),
        ],
        # ─── BEVERAGES ─────────────────────────────────────────────────────
        '698cacf384894b26cc1bd6a6': [  # Fresh Juice
            r(LEMON, 0.05), r(SUGAR, 0.03),
        ],
        '698cad0a98509ab0866dcd81': [  # Coffee Latte
            r(COFFEE, 0.02), r(MILK, 0.2, 'liters'), r(SUGAR, 0.02),
        ],
        '698cad44be06d0d55cdfd57b': [  # Cold Coffee
            r(COFFEE, 0.02), r(MILK, 0.15, 'liters'), r(SUGAR, 0.03), r(CREAM, 0.05, 'liters'),
        ],
        '698daf66317e2805cb048c9d': [  # Green Tea
            r(TEA, 0.005), r(HONEY, 0.01), r(LEMON, 0.01),
        ],
        '698daf8506c86c042373eccb': [  # Mojito
            r(LEMON, 0.04), r(SUGAR, 0.02), r(HONEY, 0.01),
        ],
        '698dafa73d5a837a18991f26': [  # Cappuccino
            r(COFFEE, 0.02), r(MILK, 0.15, 'liters'), r(SUGAR, 0.02), r(CREAM, 0.04, 'liters'),
        ],
        '698dafc14d4f62b3b2de14d8': [  # Smoothie
            r(MILK, 0.15, 'liters'), r(HONEY, 0.02), r(SUGAR, 0.03),
        ],
        '698dafdb993ad89fccf18b16': [  # Buttermilk
            r(YOGURT, 0.15, 'liters'), r(GCHILI, 0.005), r(GINGER, 0.005), r(CORIANDER, 0.005),
        ],
        '698daff7be1d7feaea3596c0': [  # Espresso
            r(COFFEE, 0.015), r(SUGAR, 0.01),
        ],
        '698db00fb9f79ced07a52286': [  # Hot Chocolate
            r(MILK, 0.2, 'liters'), r(SUGAR, 0.03), r(BUTTER, 0.01),
        ],
        '698db02abcbe4476d23bbc1a': [  # Iced Tea
            r(TEA, 0.006), r(LEMON, 0.03), r(SUGAR, 0.02), r(HONEY, 0.01),
        ],
        '698db04054dc9c196c7f4ba8': [  # Milkshake
            r(MILK, 0.25, 'liters'), r(SUGAR, 0.04), r(CREAM, 0.04, 'liters'),
        ],
        '698db05c4940f0ff36182cd6': [  # Lemonade
            r(LEMON, 0.06), r(SUGAR, 0.04),
        ],
        '698db53bdc8cbdefa56bb8ee': [  # Americano
            r(COFFEE, 0.018), r(SUGAR, 0.01),
        ],
        '698db55c15ef4b86ce18f319': [  # Coconut Water
            r(COCONUT, 0.15),
        ],
        '698db59644553795cbea1998': [  # Badam Milk
            r(MILK, 0.2, 'liters'), r(SUGAR, 0.03), r(CARDAMOM, 0.002),
        ],
        '698db5b5944e5e12745d9911': [  # Thandai
            r(MILK, 0.2, 'liters'), r(SUGAR, 0.04), r(CARDAMOM, 0.003), r(SAFFRON, 0.001),
        ],
        # ─── SOUTH INDIAN MAIN COURSE ───────────────────────────────────────
        '698ddffc8489d1f81c52d9c3': [  # Chettinad Vegetable Biryani
            r(RICE, 0.18), r(ONIONS, 0.08), r(TOMATOES, 0.06), r(GINGER, 0.01), r(GARLIC, 0.01), r(VEG_OIL, 0.03, 'liters'), r(GARAM, 0.005),
        ],
        '698de091c8de0a5a31c6740a': [  # Paneer Dosa
            r(PANEER, 0.08), r(RICE_FL, 0.12), r(URAD, 0.04), r(ONIONS, 0.04), r(GHEE, 0.015, 'liters'),
        ],
        '698de0e1c02e5a665ed9c213': [  # South Indian Veg Meals
            r(RICE, 0.2), r(CHANA, 0.05), r(COCONUT, 0.06), r(YOGURT, 0.05, 'liters'), r(VEG_OIL, 0.02, 'liters'), r(CUMIN, 0.005),
        ],
        '698de389f28287157ed50073': [  # Chicken Curry Rice
            r(RICE, 0.18), r(CHICKEN, 0.2), r(ONIONS, 0.08), r(TOMATOES, 0.08), r(GINGER, 0.01), r(GARLIC, 0.01), r(COC_MILK, 0.06, 'liters'), r(VEG_OIL, 0.03, 'liters'),
        ],
        '698de438c018c81a26576ad7': [  # Mutton Pepper Fried Rice
            r(RICE, 0.18), r(MUTTON, 0.2), r(ONIONS, 0.08), r(GINGER, 0.01), r(GARLIC, 0.01), r(VEG_OIL, 0.04, 'liters'),
        ],
        '698de5ab724b80cb843d1860': [  # Fish Curry Kerala Style
            r(FISH_I, 0.25), r(COCONUT, 0.1), r(TOMATOES, 0.1), r(ONIONS, 0.08), r(GINGER, 0.01), r(COC_MILK, 0.1, 'liters'), r(VEG_OIL, 0.03, 'liters'), r(TURMERIC, 0.003),
        ],
        '698de69bda6c8b077d2ceaeb': [  # Nellore Chicken Curry
            r(CHICKEN, 0.25), r(ONIONS, 0.1), r(TOMATOES, 0.1), r(GINGER, 0.01), r(GARLIC, 0.01), r(RCHILI, 0.015), r(VEG_OIL, 0.04, 'liters'),
        ],
        # ─── BREADS ─────────────────────────────────────────────────────────
        '698de90f12decbad90dcb23a': [  # Onion Masala Dosa
            r(RICE_FL, 0.12), r(URAD, 0.04), r(ONIONS, 0.06), r(GHEE, 0.015, 'liters'), r(GCHILI, 0.01),
        ],
        '698dea2e69c8738692fa6968': [  # Set Dosa
            r(RICE_FL, 0.15), r(URAD, 0.05), r(VEG_OIL, 0.02, 'liters'),
        ],
        '698deaa4802b95ee29a6d568': [  # Rava Uttapam
            r(RAVA, 0.12), r(ONIONS, 0.05), r(TOMATOES, 0.04), r(GCHILI, 0.01), r(VEG_OIL, 0.02, 'liters'),
        ],
        '698def779e35cf24954b0cab': [  # Chicken Kothu Parotta
            r(PAROTTA, 2, 'units'), r(CHICKEN, 0.15), r(EGGS, 2, 'units'), r(ONIONS, 0.05), r(GINGER, 0.01), r(VEG_OIL, 0.03, 'liters'),
        ],
        '698df000d2c74dd7857f71f0': [  # Egg Dosa
            r(RICE_FL, 0.12), r(URAD, 0.04), r(EGGS, 1, 'units'), r(ONIONS, 0.03), r(VEG_OIL, 0.02, 'liters'),
        ],
        '698df0b2686c365cf8961a67': [  # Malabar Chicken Parotta
            r(PAROTTA, 2, 'units'), r(CHICKEN, 0.18), r(ONIONS, 0.06), r(TOMATOES, 0.05), r(COC_MILK, 0.05, 'liters'), r(VEG_OIL, 0.03, 'liters'),
        ],
        # ─── MORE MAIN COURSE ───────────────────────────────────────────────
        '698df272ae03d2d1dc64613e': [  # Veg Biryani
            r(RICE, 0.18), r(ONIONS, 0.08), r(TOMATOES, 0.06), r(POTATOES, 0.08), r(GHEE, 0.02, 'liters'), r(SAFFRON, 0.001), r(GARAM, 0.005),
        ],
        '698df36598cac1e1815a0477': [  # Malai Kofta (Starter)
            r(PANEER, 0.1), r(POTATOES, 0.08), r(CREAM, 0.08, 'liters'), r(ONIONS, 0.06), r(TOMATOES, 0.06), r(VEG_OIL, 0.03, 'liters'),
        ],
        '698dfb3f0ddfbed0b4f5d092': [  # Samosa
            r(FLOUR, 0.08), r(POTATOES, 0.12), r(ONIONS, 0.04), r(VEG_OIL, 0.04, 'liters'), r(CUMIN, 0.005),
        ],
        '698dfdee15e715221ca4a3cd': [  # Paal Payasam
            r(MILK, 0.25, 'liters'), r(RICE, 0.04), r(SUGAR, 0.08), r(CARDAMOM, 0.002),
        ],
        '698dfe3aa13fcbfc8108c3b6': [  # Kesari
            r(RAVA, 0.1), r(SUGAR, 0.1), r(GHEE, 0.04, 'liters'), r(CARDAMOM, 0.002),
        ],
        '698dfe8a513863b9c73c7cf6': [  # Mysore Pak
            r(FLOUR, 0.12), r(SUGAR, 0.15), r(GHEE, 0.1, 'liters'),
        ],
        '698dff0fb7de966397bde247': [  # Elaneer Payasam
            r(COCONUT, 0.15), r(MILK, 0.1, 'liters'), r(SUGAR, 0.05), r(CARDAMOM, 0.002),
        ],
        '698e02b27173fb24015479d4': [  # Garlic Naan
            r(FLOUR, 0.12), r(YOGURT, 0.04, 'liters'), r(GARLIC, 0.02), r(BUTTER, 0.03), r(VEG_OIL, 0.01, 'liters'),
        ],
        '698e02db019bc8d468f6bdef': [  # Tandoori Roti
            r(FLOUR, 0.1), r(YOGURT, 0.03, 'liters'), r(BUTTER, 0.02),
        ],
        '698e085e4ebc55f61a500f10': [  # Palak Paneer
            r(PANEER, 0.12), r(ONIONS, 0.06), r(TOMATOES, 0.06), r(CREAM, 0.05, 'liters'), r(GINGER, 0.01), r(GARLIC, 0.01), r(VEG_OIL, 0.03, 'liters'),
        ],
        '698e08a84ad732644cf5a52f': [  # Aloo Gobi
            r(POTATOES, 0.15), r(CAULIFL, 0.15), r(ONIONS, 0.05), r(TOMATOES, 0.05), r(VEG_OIL, 0.03, 'liters'), r(TURMERIC, 0.003),
        ],
        '698e08c6167ca85ee3259990': [  # Dal Makhani
            r(CHANA, 0.1), r(BUTTER, 0.04), r(CREAM, 0.06, 'liters'), r(TOMATOES, 0.08), r(ONIONS, 0.06), r(GINGER, 0.01), r(GARLIC, 0.01),
        ],
        '698e0a152996a87bb2b860e1': [  # Chicken Kabab
            r(CHICKEN, 0.2), r(YOGURT, 0.06, 'liters'), r(ONIONS, 0.05), r(GINGER, 0.01), r(GARLIC, 0.01), r(RCHILI, 0.01), r(LEMON, 0.02),
        ],
        '698e0a6430e8ee20b84c1a07': [  # Fish Fry
            r(FISH_I, 0.25), r(VEG_OIL, 0.06, 'liters'), r(RCHILI, 0.01), r(TURMERIC, 0.003), r(LEMON, 0.02),
        ],
        '698e0a8b16710509167571ee': [  # Mutton Kofte
            r(MUTTON, 0.2), r(ONIONS, 0.06), r(GINGER, 0.01), r(GARLIC, 0.01), r(GARAM, 0.005), r(VEG_OIL, 0.04, 'liters'),
        ],
        '698e0aea97f34d3d490e0509': [  # Chicken Momos
            r(CHICKEN, 0.15), r(FLOUR, 0.1), r(ONIONS, 0.04), r(GINGER, 0.01), r(GARLIC, 0.01), r(SOY, 0.01, 'liters'),
        ],
        '698e0bf47b332bd41e136e95': [  # Chicken Shawarma
            r(CHICKEN, 0.2), r(YOGURT, 0.06, 'liters'), r(ONIONS, 0.05), r(GARLIC, 0.015), r(BREAD_I, 1, 'units'), r(LEMON, 0.02),
        ],
        '698e0d997b675e0b5e77f1b6': [  # Salted Lassi
            r(YOGURT, 0.2, 'liters'), r(CUMIN, 0.003), r(LEMON, 0.01),
        ],
        '698e0e408640690ce8a3bd75': [  # Masala Chaas
            r(YOGURT, 0.15, 'liters'), r(GINGER, 0.005), r(GCHILI, 0.005), r(CUMIN, 0.003), r(CORIANDER, 0.005),
        ],
        '698e0ec94bff27d3d7729e81': [  # Kesar Badam Milk
            r(MILK, 0.2, 'liters'), r(SAFFRON, 0.001), r(SUGAR, 0.03), r(CARDAMOM, 0.002),
        ],
        '698e0f58dfb572a4de177272': [  # Fresh Lime Soda
            r(LEMON, 0.05), r(SUGAR, 0.02),
        ],
        # ─── ITALIAN STARTERS ───────────────────────────────────────────────
        '698ef725349ead3b8dd783bd': [  # Janine Ratcliffe Special Tomato Salad
            r(TOMATOES, 0.2), r(OLIVE_OIL, 0.03, 'L'), r(BASIL, 0.01), r(LEMON, 0.02),
        ],
        '698ef73db9225b9926a7a888': [  # Burrata al Tartufo
            r(CHEESE, 0.12), r(OLIVE_OIL, 0.04, 'L'), r(BASIL, 0.01), r(LEMON, 0.02),
        ],
        '698ef75becb4cd6fd5fc41f3': [  # Sicilian Salad
            r(TOMATOES, 0.15), r(ONIONS, 0.05), r(OLIVE_OIL, 0.03, 'L'), r(LEMON, 0.02),
        ],
        '698ef9576e2383453fc145c3': [  # Grilled Peaches with Burrata
            r(CHEESE, 0.1), r(OLIVE_OIL, 0.03, 'L'), r(HONEY, 0.02), r(BASIL, 0.01),
        ],
        '698ef9bb07b301d0b859fdca': [  # Tomato Salad with Burrata
            r(TOMATOES, 0.18), r(CHEESE, 0.1), r(OLIVE_OIL, 0.03, 'L'), r(BASIL, 0.01),
        ],
        '698efa5431074320141bb800': [  # Chicken Bruschetta
            r(CHICKEN, 0.1), r(BREAD_I, 2, 'units'), r(TOMATOES, 0.08), r(GARLIC, 0.01), r(OLIVE_OIL, 0.02, 'L'), r(BASIL, 0.008),
        ],
        '698efac9a5306e020c3c3541': [  # Fried Calamari
            r(FLOUR, 0.08), r(CORNFL, 0.03), r(VEG_OIL, 0.06, 'liters'), r(LEMON, 0.03),
        ],
        # ─── ITALIAN MAIN COURSE ────────────────────────────────────────────
        '698efdb3bbc170078ad5be4b': [  # Mushroom and Capsicum Pizza
            r(FLOUR, 0.15), r(MOZZ, 0.12), r(MUSH, 0.08), r(CAPS, 0.06), r(TOMATOES, 0.08), r(OLIVE_OIL, 0.02, 'L'),
        ],
        '698efdc93c312ccf838ee1a4': [  # Red Sauce Pasta
            r(PASTA_I, 0.12), r(TOMATOES, 0.15), r(GARLIC, 0.01), r(ONIONS, 0.04), r(OLIVE_OIL, 0.03, 'L'), r(BASIL, 0.008),
        ],
        '698efde80659ccd2c71a4f7a': [  # Potato Gnocchi
            r(POTATOES, 0.2), r(FLOUR, 0.06), r(EGGS, 1, 'units'), r(BUTTER, 0.03), r(MOZZ, 0.08),
        ],
        '698efe13406522ec0aa412d3': [  # Sweet Potato Panzanella
            r(POTATOES, 0.15), r(TOMATOES, 0.1), r(BREAD_I, 2, 'units'), r(OLIVE_OIL, 0.04, 'L'), r(BASIL, 0.008),
        ],
        '698efe29299c65d82dff010c': [  # Slow-Cooker Ratatouille
            r(TOMATOES, 0.15), r(CAPS, 0.08), r(MUSH, 0.06), r(ONIONS, 0.06), r(OLIVE_OIL, 0.04, 'L'), r(GARLIC, 0.01),
        ],
        '698eff501307e1cf6617fe71': [  # Grilled Caprese
            r(TOMATOES, 0.15), r(MOZZ, 0.1), r(BASIL, 0.01), r(OLIVE_OIL, 0.03, 'L'),
        ],
        '698eff99be4cc17dac00be45': [  # Chicken Alfredo Pasta
            r(PASTA_I, 0.12), r(CHICKEN, 0.15), r(CREAM, 0.1, 'liters'), r(MOZZ, 0.06), r(GARLIC, 0.01), r(BUTTER, 0.03),
        ],
        '698f000c2c42975bbd08427a': [  # Pepperoni Pizza
            r(FLOUR, 0.15), r(MOZZ, 0.12), r(TOMATOES, 0.08), r(OLIVE_OIL, 0.02, 'L'), r(GARLIC, 0.01),
        ],
        '698f0201779146ddfe5d6934': [  # Italian Chicken Lasagna
            r(PASTA_I, 0.15), r(CHICKEN, 0.18), r(MOZZ, 0.12), r(TOMATOES, 0.1), r(ONIONS, 0.06), r(CREAM, 0.08, 'liters'),
        ],
        # ─── ITALIAN BREADS ─────────────────────────────────────────────────
        '698f03a2db7cf30d7bb98bca': [  # Cream Cheese Panini
            r(BREAD_I, 2, 'units'), r(CHEESE, 0.06), r(BUTTER, 0.02),
        ],
        '698f03ba7adf7e47204a9ba3': [  # Herb Bread
            r(FLOUR, 0.15), r(BUTTER, 0.04), r(GARLIC, 0.01), r(BASIL, 0.008),
        ],
        '698f03d300d88bce096c6552': [  # Garlic Crostini
            r(BREAD_I, 3, 'units'), r(GARLIC, 0.01), r(OLIVE_OIL, 0.02, 'L'), r(BASIL, 0.005),
        ],
        '698f03f3cecc610a5642078f': [  # Paneer Bhurji Panini
            r(PANEER, 0.08), r(BREAD_I, 2, 'units'), r(ONIONS, 0.04), r(CAPS, 0.03), r(VEG_OIL, 0.02, 'liters'),
        ],
        '698f0484ef745ac04fd634cc': [  # Chicken Pesto Sandwich
            r(CHICKEN, 0.12), r(BREAD_I, 2, 'units'), r(BASIL, 0.01), r(OLIVE_OIL, 0.02, 'L'),
        ],
        '698f04da130d98e016873c6b': [  # Italian Meatball Sub
            r(CHICKEN, 0.15), r(FLOUR, 0.04), r(EGGS, 1, 'units'), r(BREAD_I, 1, 'units'), r(TOMATOES, 0.08),
        ],
        '698f051964a1fa8c4ad82931': [  # Tuna Melt Panini
            r(FISH_I, 0.12), r(BREAD_I, 2, 'units'), r(MOZZ, 0.05), r(BUTTER, 0.02),
        ],
        '698f0581fd4b46d31648cec1': [  # Chicken Focaccia Sandwich
            r(CHICKEN, 0.12), r(FLOUR, 0.12), r(OLIVE_OIL, 0.03, 'L'), r(GARLIC, 0.01), r(BASIL, 0.005),
        ],
        # ─── ITALIAN DESSERTS ───────────────────────────────────────────────
        '698f061cf49c80f16e2663b2': [  # Cannoli
            r(FLOUR, 0.1), r(SUGAR, 0.06), r(EGGS, 1, 'units'), r(CREAM, 0.08, 'liters'),
        ],
        '698f3a29f30d5e3a5c11edb9': [  # Stracciatella Cheesecake
            r(CHEESE, 0.15), r(SUGAR, 0.08), r(EGGS, 2, 'units'), r(BUTTER, 0.05), r(CREAM, 0.08, 'liters'),
        ],
        '698f3a8a08b9d3ad0bdef75b': [  # Affogato
            r(COFFEE, 0.018), r(MILK, 0.12, 'liters'), r(SUGAR, 0.02),
        ],
        '698f3b0604dde92a81df98c8': [  # Gelato
            r(MILK, 0.2, 'liters'), r(CREAM, 0.08, 'liters'), r(SUGAR, 0.06),
        ],
        # ─── COCKTAILS ──────────────────────────────────────────────────────
        '698f3c1552a12627a3ae1174': [  # Cynar Boulevardier
            r(LEMON, 0.03), r(SUGAR, 0.02), r(HONEY, 0.01),
        ],
        '698f3c2e47e0a60d796419c7': [  # Venetian Spritz
            r(LEMON, 0.03), r(SUGAR, 0.02),
        ],
        '698f3c426afbe4027fcc9600': [  # Paper Plane Cocktail
            r(LEMON, 0.04), r(HONEY, 0.015), r(SUGAR, 0.02),
        ],
        '698f3c599a1ca521455a47e4': [  # Hugo Spritz
            r(LEMON, 0.03), r(HONEY, 0.015),
        ],
        # ─── CHINESE STARTERS ───────────────────────────────────────────────
        '698f3dd55268440e2c8debcd': [  # Chinese Spring Roll
            r(FLOUR, 0.08), r(CAPS, 0.04), r(ONIONS, 0.04), r(VEG_OIL, 0.05, 'liters'), r(SOY, 0.01, 'liters'),
        ],
        '698f3e4aa675d466f8513b83': [  # Veg Manchurian (Dry)
            r(CAULIFL, 0.15), r(CORNFL, 0.03), r(SOY, 0.02, 'liters'), r(GARLIC, 0.01), r(GINGER, 0.01), r(VEG_OIL, 0.05, 'liters'),
        ],
        '698f3e633ae9da50e8ea2bb9': [  # Wheat Dimsum
            r(FLOUR, 0.12), r(CAPS, 0.04), r(ONIONS, 0.04), r(SOY, 0.01, 'liters'), r(GINGER, 0.01),
        ],
        '698f3e749519f92c44477d1a': [  # Garlic Schezwan Cauliflower
            r(CAULIFL, 0.2), r(GARLIC, 0.02), r(SOY, 0.015, 'liters'), r(VEG_OIL, 0.05, 'liters'), r(CORNFL, 0.02),
        ],
        '698f3e998360d62895544dbd': [  # Chinese Crispy Veggies
            r(CAPS, 0.06), r(ONIONS, 0.05), r(CORNFL, 0.03), r(SOY, 0.015, 'liters'), r(VEG_OIL, 0.05, 'liters'),
        ],
        '698f3fe0271ad08b1c7375da': [  # Fish Hot Garlic
            r(FISH_I, 0.2), r(GARLIC, 0.02), r(SOY, 0.015, 'liters'), r(VEG_OIL, 0.04, 'liters'), r(CORNFL, 0.02),
        ],
        '698f3ff744ad74fafdc2674e': [  # Chilli Chicken
            r(CHICKEN, 0.2), r(CAPS, 0.05), r(ONIONS, 0.05), r(SOY, 0.02, 'liters'), r(GARLIC, 0.01), r(GINGER, 0.01), r(VEG_OIL, 0.04, 'liters'), r(CORNFL, 0.02),
        ],
        '698f400f086184932d4d0385': [  # Chicken Black Pepper
            r(CHICKEN, 0.2), r(ONIONS, 0.05), r(CAPS, 0.04), r(SOY, 0.015, 'liters'), r(VEG_OIL, 0.04, 'liters'), r(GARLIC, 0.01),
        ],
        '698f40273d771d288530faae': [  # Egg Chilli
            r(EGGS, 3, 'units'), r(CAPS, 0.04), r(ONIONS, 0.04), r(SOY, 0.015, 'liters'), r(VEG_OIL, 0.04, 'liters'),
        ],
        '698f403e191c5b3e6a643924': [  # Chinese Fish Fry
            r(FISH_I, 0.2), r(CORNFL, 0.03), r(SOY, 0.015, 'liters'), r(VEG_OIL, 0.05, 'liters'), r(GINGER, 0.01),
        ],
        # ─── CHINESE MAIN COURSE ────────────────────────────────────────────
        '698f411a61111b589fcf6c70': [  # Veg Hakka Noodles
            r(NOODLES, 0.12), r(CAPS, 0.05), r(ONIONS, 0.04), r(SOY, 0.02, 'liters'), r(VEG_OIL, 0.03, 'liters'),
        ],
        '698f415f7acdaaa81d93ad3c': [  # Schezwan Fried Rice
            r(RICE, 0.15), r(EGGS, 1, 'units'), r(CAPS, 0.04), r(ONIONS, 0.04), r(SOY, 0.025, 'liters'), r(VEG_OIL, 0.03, 'liters'),
        ],
        '698f41b37732f019063a33bd': [  # Veg Manchurian Gravy
            r(CAULIFL, 0.15), r(ONIONS, 0.06), r(TOMATOES, 0.06), r(SOY, 0.02, 'liters'), r(VEG_OIL, 0.04, 'liters'), r(CORNFL, 0.03),
        ],
        '698f42045235c1783c3fd109': [  # Paneer Chilli Gravy
            r(PANEER, 0.12), r(CAPS, 0.05), r(ONIONS, 0.05), r(SOY, 0.02, 'liters'), r(VEG_OIL, 0.04, 'liters'), r(CORNFL, 0.02),
        ],
        '698f44cd49de46b05c0b0c7e': [  # Burnt Garlic Vegetable Noodles
            r(NOODLES, 0.12), r(GARLIC, 0.02), r(CAPS, 0.04), r(SOY, 0.02, 'liters'), r(VEG_OIL, 0.03, 'liters'),
        ],
        '698f454dba0a3fe93234c0d5': [  # Chicken Hakka Noodles (Chinese)
            r(NOODLES, 0.12), r(CHICKEN, 0.12), r(CAPS, 0.04), r(SOY, 0.02, 'liters'), r(VEG_OIL, 0.03, 'liters'),
        ],
        '698f45fb6878a3d25e3c1f7b': [  # Chicken Fried Rice
            r(RICE, 0.15), r(CHICKEN, 0.12), r(EGGS, 1, 'units'), r(SOY, 0.02, 'liters'), r(VEG_OIL, 0.03, 'liters'),
        ],
        '698f4639185922b50c222de2': [  # Chilli Chicken Gravy
            r(CHICKEN, 0.2), r(CAPS, 0.05), r(ONIONS, 0.05), r(SOY, 0.02, 'liters'), r(VEG_OIL, 0.04, 'liters'), r(CORNFL, 0.03),
        ],
        '698f4699a60bfe3cc634d126': [  # Fish Schezwan Fried Rice
            r(RICE, 0.15), r(FISH_I, 0.12), r(SOY, 0.025, 'liters'), r(VEG_OIL, 0.03, 'liters'), r(GARLIC, 0.01),
        ],
        '698f47129df3a3d9d2684830': [  # Chicken Black Pepper Gravy
            r(CHICKEN, 0.2), r(CAPS, 0.04), r(ONIONS, 0.05), r(SOY, 0.02, 'liters'), r(VEG_OIL, 0.04, 'liters'), r(CORNFL, 0.03),
        ],
        # ─── CHINESE BREADS ─────────────────────────────────────────────────
        '698f4a9b41786a9a0397c53b': [  # Scallion Pancakes
            r(FLOUR, 0.12), r(VEG_OIL, 0.03, 'liters'), r(GARLIC, 0.01),
        ],
        '698f4afd32bbe0bc23258df0': [  # Veg Stuffed Chinese Bun
            r(FLOUR, 0.12), r(CAPS, 0.04), r(ONIONS, 0.04), r(SOY, 0.01, 'liters'), r(VEG_OIL, 0.02, 'liters'),
        ],
        '698f4b45880e8ef4d9c066ae': [  # Chicken Steamed Bao
            r(FLOUR, 0.12), r(CHICKEN, 0.1), r(SOY, 0.01, 'liters'), r(GINGER, 0.01),
        ],
        '698f4c2b423dea47a5fa0012': [  # BBQ Chicken Bao Bun
            r(FLOUR, 0.12), r(CHICKEN, 0.12), r(HONEY, 0.01), r(SOY, 0.015, 'liters'),
        ],
        '698f4c95e2c3250cf92ed300': [  # Chicken Scallion Pancake Wrap
            r(FLOUR, 0.12), r(CHICKEN, 0.1), r(VEG_OIL, 0.03, 'liters'), r(SOY, 0.01, 'liters'),
        ],
        # ─── CHINESE DESSERTS ───────────────────────────────────────────────
        '698f4d9deb37593e160d9a33': [  # Honey Noodles with Ice Cream
            r(NOODLES, 0.06), r(HONEY, 0.03), r(MILK, 0.1, 'liters'), r(SUGAR, 0.04),
        ],
        '698f4e393cf3d11ff24a2e69': [  # Sesame Balls
            r(RICE_FL, 0.1), r(SUGAR, 0.06), r(VEG_OIL, 0.04, 'liters'),
        ],
        '698f4e9ef0f9b0de34f6aaa9': [  # Date Pancakes
            r(FLOUR, 0.1), r(EGGS, 1, 'units'), r(MILK, 0.08, 'liters'), r(HONEY, 0.02), r(SUGAR, 0.03),
        ],
        '698f4f10eb12e957437b0eea': [  # Mango Sago Pudding
            r(COND_MILK, 0.1, 'liters'), r(SUGAR, 0.04),
        ],
        '698f4fb7314ebc43a2f2abca': [  # Fortune Cookie & Ice Cream
            r(FLOUR, 0.06), r(SUGAR, 0.05), r(EGGS, 1, 'units'), r(MILK, 0.1, 'liters'), r(CREAM, 0.06, 'liters'),
        ],
        # ─── CHINESE BEVERAGES ──────────────────────────────────────────────
        '698f500324e7ca8edd485808': [  # Jasmine Green Tea
            r(TEA, 0.005), r(HONEY, 0.01),
        ],
        '698f5045d81a7dcfd2af6721': [  # Bubble Tea
            r(TEA, 0.006), r(MILK, 0.15, 'liters'), r(SUGAR, 0.04), r(COND_MILK, 0.04, 'liters'),
        ],
        '698f508d2d9f5c12340ab835': [  # Lemon Iced Tea
            r(TEA, 0.006), r(LEMON, 0.04), r(SUGAR, 0.03),
        ],
        '698f514b8803d100930c81ed': [  # Lychee Cooler
            r(SUGAR, 0.03), r(LEMON, 0.02), r(HONEY, 0.015),
        ],
        '698f519d5a4a00b8ff22d985': [  # Fresh Watermelon Juice
            r(SUGAR, 0.02), r(LEMON, 0.02),
        ],
        # ─── CONTINENTAL STARTERS ───────────────────────────────────────────
        '698f53dc294504e2721a71b8': [  # Bruschetta
            r(BREAD_I, 2, 'units'), r(TOMATOES, 0.1), r(GARLIC, 0.01), r(OLIVE_OIL, 0.02, 'L'), r(BASIL, 0.008),
        ],
        '698f545efa870b17bce7a0b9': [  # Stuffed Mushrooms
            r(MUSH, 0.15), r(CHEESE, 0.06), r(GARLIC, 0.01), r(BUTTER, 0.02), r(BASIL, 0.006),
        ],
        '698f55049e08f881a40e404d': [  # Vegetable Croquettes
            r(POTATOES, 0.15), r(ONIONS, 0.05), r(FLOUR, 0.05), r(EGGS, 1, 'units'), r(VEG_OIL, 0.04, 'liters'),
        ],
        '698f5715c536ccd6a6d45e96': [  # Grilled Chicken Skewers
            r(CHICKEN, 0.2), r(BELLPEP, 0.06), r(ONIONS, 0.05), r(OLIVE_OIL, 0.03, 'L'), r(LEMON, 0.02), r(GARLIC, 0.01),
        ],
        '698f57fa0a38356aa665afa4': [  # Fish and Chips
            r(FISH_I, 0.2), r(POTATOES, 0.15), r(FLOUR, 0.06), r(EGGS, 1, 'units'), r(VEG_OIL, 0.06, 'liters'),
        ],
        '698f58b19cdb36a39a215066': [  # Chicken Meatballs
            r(CHICKEN, 0.2), r(ONIONS, 0.04), r(GARLIC, 0.01), r(EGGS, 1, 'units'), r(FLOUR, 0.03),
        ],
        # ─── CONTINENTAL MAIN COURSE ────────────────────────────────────────
        '698f59bfac3defbc56eadd64': [  # Grilled Vegetable Steak
            r(BELLPEP, 0.08), r(MUSH, 0.08), r(OLIVE_OIL, 0.04, 'L'), r(GARLIC, 0.01), r(BUTTER, 0.03),
        ],
        '698f5a7cc6f3f5adc8fcb48f': [  # Penne Alfredo
            r(PASTA_I, 0.12), r(CREAM, 0.1, 'liters'), r(BUTTER, 0.03), r(MOZZ, 0.06), r(GARLIC, 0.01),
        ],
        '698f5afb4fd3c095cc5dc5e0': [  # Mushroom Risotto
            r(RICE, 0.15), r(MUSH, 0.12), r(ONIONS, 0.05), r(CREAM, 0.08, 'liters'), r(BUTTER, 0.03), r(GARLIC, 0.01),
        ],
        '698f5b52a13843828786a5b8': [  # Stuffed Bell Peppers
            r(BELLPEP, 0.2), r(RICE, 0.06), r(CHEESE, 0.05), r(TOMATOES, 0.06), r(ONIONS, 0.04), r(VEG_OIL, 0.02, 'liters'),
        ],
        '698f5ba338945c6af5fcf0c0': [  # Grilled Chicken Steak
            r(CHICKEN, 0.25), r(GARLIC, 0.01), r(BUTTER, 0.04), r(LEMON, 0.02), r(OLIVE_OIL, 0.03, 'L'),
        ],
        '698f5c39b823be781b610322': [  # Chicken Stroganoff
            r(CHICKEN, 0.2), r(MUSH, 0.08), r(ONIONS, 0.06), r(CREAM, 0.1, 'liters'), r(BUTTER, 0.03), r(GARLIC, 0.01),
        ],
        '698f5c9895562a249cfc75d2': [  # Fish Meuniere
            r(FISH_I, 0.25), r(BUTTER, 0.05), r(LEMON, 0.03), r(FLOUR, 0.04), r(CORIANDER, 0.01),
        ],
        '698f5cdefe5d9dbfef6790a6': [  # Beef Lasagna (using mutton sub)
            r(MUTTON, 0.2), r(PASTA_I, 0.15), r(MOZZ, 0.1), r(TOMATOES, 0.1), r(ONIONS, 0.06), r(CREAM, 0.08, 'liters'),
        ],
        '698f5d5344a7f3e24ceeef7f': [  # Herb Crusted Salmon
            r(FISH_I, 0.25), r(BUTTER, 0.04), r(GARLIC, 0.01), r(BASIL, 0.01), r(LEMON, 0.02),
        ],
        # ─── CONTINENTAL BREADS ─────────────────────────────────────────────
        '698f5dbcca60dc15d3febf59': [  # Garlic Herb Focaccia
            r(FLOUR, 0.18), r(GARLIC, 0.015), r(OLIVE_OIL, 0.04, 'L'), r(BASIL, 0.008),
        ],
        '698f5e5a54401326f773bca4': [  # Cheese Panini
            r(BREAD_I, 2, 'units'), r(MOZZ, 0.08), r(BUTTER, 0.02),
        ],
        '698f5eb7d0508b68132e7284': [  # Vegetable Calzone
            r(FLOUR, 0.15), r(MOZZ, 0.08), r(CAPS, 0.05), r(MUSH, 0.05), r(TOMATOES, 0.06), r(OLIVE_OIL, 0.02, 'L'),
        ],
        '698f5f0ee873018854c08caf': [  # Bruschetta Platter
            r(BREAD_I, 4, 'units'), r(TOMATOES, 0.15), r(GARLIC, 0.01), r(OLIVE_OIL, 0.03, 'L'), r(BASIL, 0.01),
        ],
        '698f5f929974f8b3739bfe05': [  # Chicken Tikka Pizza
            r(FLOUR, 0.15), r(MOZZ, 0.12), r(CHICKEN, 0.12), r(ONIONS, 0.04), r(TOMATOES, 0.06), r(OLIVE_OIL, 0.02, 'L'),
        ],
        '698f5fe3eed08020da8a0b20': [  # Grilled Chicken Panini
            r(CHICKEN, 0.12), r(BREAD_I, 2, 'units'), r(MOZZ, 0.06), r(BUTTER, 0.02), r(GARLIC, 0.01),
        ],
        '698f6059a74860d4b8a7f40d': [  # Pepperoni Calzone
            r(FLOUR, 0.15), r(MOZZ, 0.1), r(TOMATOES, 0.08), r(OLIVE_OIL, 0.02, 'L'),
        ],
        '698f60b18ef513ebd92f3a61': [  # Tuna Melt Sandwich
            r(FISH_I, 0.1), r(BREAD_I, 2, 'units'), r(CHEESE, 0.05), r(BUTTER, 0.02),
        ],
        '698f613195788cd43ceab903': [  # BBQ Chicken Flatbread
            r(FLOUR, 0.15), r(CHICKEN, 0.12), r(HONEY, 0.02), r(ONIONS, 0.04), r(MOZZ, 0.08),
        ],
        # ─── INDIAN STARTERS ────────────────────────────────────────────────
        '6995d3bbcfe3e07c3e3afc96': [  # Paneer Tikka
            r(PANEER, 0.15), r(YOGURT, 0.06, 'liters'), r(BELLPEP, 0.06), r(ONIONS, 0.05), r(RCHILI, 0.01), r(VEG_OIL, 0.03, 'liters'),
        ],
        '6995d3bbcfe3e07c3e3afc97': [  # Vegetable Spring Rolls
            r(CAPS, 0.05), r(ONIONS, 0.04), r(FLOUR, 0.08), r(VEG_OIL, 0.05, 'liters'), r(SOY, 0.01, 'liters'),
        ],
        '6995d3bbcfe3e07c3e3afc98': [  # Hara Bhara Kabab
            r(POTATOES, 0.12), r(ONIONS, 0.04), r(GCHILI, 0.01), r(CORIANDER, 0.01), r(VEG_OIL, 0.04, 'liters'),
        ],
        '6995d3bbcfe3e07c3e3afc9e': [  # Chicken Tikka
            r(CHICKEN, 0.2), r(YOGURT, 0.06, 'liters'), r(GINGER, 0.01), r(GARLIC, 0.01), r(RCHILI, 0.01), r(LEMON, 0.02),
        ],
        '6995d3bbcfe3e07c3e3afc9f': [  # Fish Amritsari
            r(FISH_I, 0.2), r(YOGURT, 0.05, 'liters'), r(RCHILI, 0.01), r(GINGER, 0.01), r(GARLIC, 0.01), r(VEG_OIL, 0.05, 'liters'),
        ],
        '6995d3bccfe3e07c3e3afca0': [  # Mutton Seekh Kabab
            r(MUTTON, 0.2), r(ONIONS, 0.05), r(GINGER, 0.01), r(GARLIC, 0.01), r(GARAM, 0.005), r(VEG_OIL, 0.03, 'liters'),
        ],
        # ─── INDIAN MAIN COURSE ─────────────────────────────────────────────
        '6995d3bbcfe3e07c3e3afc99': [  # Dal Makhani (dup)
            r(CHANA, 0.1), r(BUTTER, 0.04), r(CREAM, 0.06, 'liters'), r(TOMATOES, 0.08), r(ONIONS, 0.06), r(GINGER, 0.01), r(GARLIC, 0.01),
        ],
        '6995d3bbcfe3e07c3e3afc9a': [  # Paneer Butter Masala
            r(PANEER, 0.15), r(TOMATOES, 0.15), r(CREAM, 0.08, 'liters'), r(BUTTER, 0.04), r(ONIONS, 0.06), r(GINGER, 0.01), r(GARLIC, 0.01),
        ],
        '6995d3bbcfe3e07c3e3afc9b': [  # Veg Biryani (dup)
            r(RICE, 0.18), r(ONIONS, 0.08), r(TOMATOES, 0.06), r(POTATOES, 0.08), r(GHEE, 0.02, 'liters'), r(SAFFRON, 0.001), r(GARAM, 0.005),
        ],
        '6995d3bbcfe3e07c3e3afc9d': [  # Chole Bhature
            r(CHANA, 0.12), r(FLOUR, 0.15), r(ONIONS, 0.08), r(TOMATOES, 0.08), r(VEG_OIL, 0.04, 'liters'), r(GARAM, 0.005),
        ],
        '6995d3bccfe3e07c3e3afca3': [  # Mutton Rogan Josh
            r(MUTTON, 0.25), r(ONIONS, 0.1), r(YOGURT, 0.08, 'liters'), r(GINGER, 0.01), r(GARLIC, 0.01), r(RCHILI, 0.015), r(VEG_OIL, 0.04, 'liters'),
        ],
        '6995d3bccfe3e07c3e3afca4': [  # Fish Curry
            r(FISH_I, 0.25), r(TOMATOES, 0.1), r(ONIONS, 0.08), r(GINGER, 0.01), r(GARLIC, 0.01), r(COC_MILK, 0.08, 'liters'), r(VEG_OIL, 0.03, 'liters'),
        ],
        '6995d3bccfe3e07c3e3afca5': [  # Chicken Korma
            r(CHICKEN, 0.25), r(CREAM, 0.1, 'liters'), r(ONIONS, 0.08), r(YOGURT, 0.06, 'liters'), r(GINGER, 0.01), r(GARLIC, 0.01), r(VEG_OIL, 0.03, 'liters'),
        ],
        # ─── INDIAN BREADS ──────────────────────────────────────────────────
        '6995d3bccfe3e07c3e3afca7': [  # Garlic Naan (dup)
            r(FLOUR, 0.12), r(YOGURT, 0.04, 'liters'), r(GARLIC, 0.02), r(BUTTER, 0.03), r(VEG_OIL, 0.01, 'liters'),
        ],
        '6995d3bccfe3e07c3e3afca8': [  # Tandoori Roti (dup)
            r(FLOUR, 0.1), r(YOGURT, 0.03, 'liters'), r(BUTTER, 0.02),
        ],
        # ─── INDIAN BEVERAGES ───────────────────────────────────────────────
        '6995d3bccfe3e07c3e3afcac': [  # Mango Lassi
            r(YOGURT, 0.15, 'liters'), r(MILK, 0.1, 'liters'), r(SUGAR, 0.04), r(CARDAMOM, 0.002),
        ],
        '6995d3bccfe3e07c3e3afcad': [  # Masala Chai
            r(TEA, 0.005), r(MILK, 0.12, 'liters'), r(SUGAR, 0.02), r(GINGER, 0.005), r(CARDAMOM, 0.002),
        ],
        '6995d3bdcfe3e07c3e3afcae': [  # Fresh Lime Soda (dup)
            r(LEMON, 0.05), r(SUGAR, 0.02),
        ],
        # ─── LEGACY DUPLICATES ──────────────────────────────────────────────
        '699a7cddcfe3e07c3e3b2a2b': [  # Malai Kofta (Main Course)
            r(PANEER, 0.1), r(POTATOES, 0.08), r(CREAM, 0.08, 'liters'), r(ONIONS, 0.06), r(TOMATOES, 0.06), r(VEG_OIL, 0.03, 'liters'),
        ],
        '699a7ce0cfe3e07c3e3b2a2c': [  # Butter Naan
            r(FLOUR, 0.12), r(YOGURT, 0.04, 'liters'), r(BUTTER, 0.04), r(VEG_OIL, 0.01, 'liters'),
        ],
        '699a7ce1cfe3e07c3e3b2a2d': [  # Gulab Jamun (dup)
            r(FLOUR, 0.05), r(MILK, 0.03, 'liters'), r(SUGAR, 0.08), r(VEG_OIL, 0.04, 'liters'), r(CARDAMOM, 0.002),
        ],
        '699a7ce2cfe3e07c3e3b2a2e': [  # Rasmalai (dup)
            r(MILK, 0.2, 'liters'), r(SUGAR, 0.08), r(CARDAMOM, 0.002), r(SAFFRON, 0.001),
        ],
        '699a7ce2cfe3e07c3e3b2a2f': [  # Kulfi (dup)
            r(MILK, 0.2, 'liters'), r(COND_MILK, 0.08, 'liters'), r(CARDAMOM, 0.002), r(SAFFRON, 0.001),
        ],
    }

    # ── Step 3: Get ingredient name map ─────────────────────────────────────
    all_ings = await db.ingredients.find({}, {'_id': 1, 'name': 1}).to_list(200)
    ing_name_by_id = {str(i['_id']): i['name'] for i in all_ings}

    # ── Step 4: Insert recipes ───────────────────────────────────────────────
    print(f'\nCreating recipes for {len(RECIPES)} menu items...')
    created = 0
    skipped = 0

    for menu_item_id, ingredients in RECIPES.items():
        existing = await db.recipes.find_one({'menuItemId': menu_item_id})
        if existing:
            skipped += 1
            continue

        # Fetch menu item name
        try:
            mi = await db.menu_items.find_one({'_id': ObjectId(menu_item_id)})
        except Exception:
            mi = None
        item_name = mi['name'] if mi else menu_item_id

        # Resolve ingredient names
        resolved = []
        for ing in ingredients:
            iid = ing['ingredientId']
            if iid is None:
                print(f'  !! Missing ingredient ID for item: {item_name}')
                continue
            resolved.append({
                'ingredientId': iid,
                'name': ing_name_by_id.get(iid, 'Unknown'),
                'amount': ing['amount'],
                'unit': ing['unit'],
            })

        if not resolved:
            print(f'  !! No valid ingredients for: {item_name}, skipping')
            continue

        doc = {
            'menuItemId': menu_item_id,
            'menuItemName': item_name,
            'ingredients': resolved,
            'createdAt': datetime.utcnow(),
        }
        await db.recipes.insert_one(doc)
        created += 1
        print(f'  + Recipe: {item_name} ({len(resolved)} ingredients)')

    print(f'\nDone! Created: {created}, Skipped (already existed): {skipped}')
    total = await db.recipes.count_documents({})
    print(f'Total recipes in DB: {total}')

    client.close()


asyncio.run(seed())
