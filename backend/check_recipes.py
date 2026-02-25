import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

async def check():
    client = AsyncIOMotorClient('mongodb+srv://priyadharshini:Ezhilithanya@cluster0.crvutrr.mongodb.net/restaurant_db')
    db = client['restaurant_db']
    
    total_menu = await db.menu_items.count_documents({})
    total_recipes = await db.recipes.count_documents({})
    
    recipes = await db.recipes.find({}, {'menuItemId': 1}).to_list(500)
    mapped_ids = {r['menuItemId'] for r in recipes}
    
    menu_items = await db.menu_items.find({}, {'_id': 1, 'name': 1, 'category': 1}).to_list(500)
    unmapped = [i for i in menu_items if str(i['_id']) not in mapped_ids]
    
    print(f'Total menu items: {total_menu}')
    print(f'Total recipes: {total_recipes}')
    print(f'Un-mapped items: {len(unmapped)}')
    print()
    print('=== ITEMS WITHOUT RECIPES ===')
    for i in unmapped:
        print(str(i['_id']) + ' | ' + i['name'] + ' | ' + i['category'])
    
    print()
    print('=== INGREDIENTS LIST ===')
    ings = await db.ingredients.find({}, {'_id': 1, 'name': 1, 'unit': 1, 'stockLevel': 1}).to_list(100)
    for i in ings:
        print(str(i['_id']) + ' | ' + i['name'] + ' | ' + str(i.get('unit','')) + ' | stock=' + str(i.get('stockLevel',0)))

asyncio.run(check())
