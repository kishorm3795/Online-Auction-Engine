import random

categories = {
    "Tech Gadgets": [
        "Quantum Laptop Pro", "Holographic Smartwatch", "Neural Link VR Headset", 
"Quantum Fitness Tracker",
        "Graphene Smartphone", "Wireless Energy Transmitter", "Biometric Data Pad",
        "Universal Translator Earbuds"
    ],
    "Rare Collectibles": [
        "1930s Golden Age Comic", "Signed Apollo 11 Patch", "First Edition Moon Map",
        "Ancient Egyptian Scarab", "Medieval Knight Armor", "Victorian Pocket Watch",
        "Samurai Katana (17th Century)", "Napoleon's Field Telescope", "Ming Dynasty Vase",
        "Original Star Wars Script"
    ],
    "Luxury Real Estate/Assets": [
        "Sky-High Penthouse Stay", "Private Island Lease (1 Month)", "Superyacht Weekend Charter",
        "Vintage Vineyard Barrel", "Elite Tennis Club Membership", "Luxury Space Resort Deposit",
        "Undersea Villa Experience", "Sustainable Eco-Mansion Voucher", "Alpine Chalet Stay",
        "Arctic Glass Igloo Suite"
    ],
    "Digital Assets (NFTs)": [
        "Ether-Tiger Avatar #42", "Pixelated Punk #831", "Bored Ape Yacht Club Access",
        "Digital Martian Land Parcel", "Legendary Hero Weapon Skin", "Crypto-Crown NFT",
        "Abstract Void Art piece", "Neon City Core Blueprint", "AI-Generated Symphony",
        "Exclusive Metaverse Club Card"
    ],
    "Vintage Artifacts": [
        "Grandfather Clock (1850)", "Gramophone with Original Records", "Rotary Dial Golden Phone",
        "Typewriter from the 20s", "Classic Retro Film Projector", "Antique Leather Trunk",
        "Silver Tea Set (Sterling)", "Vintage Map of the Orient", "Hand-Carved Totem Pole",
        "Ancient Greek Coin Set"
    ],
    "Automobiles & Transport": [
        "Electric Supercar Prototype", "Restored 1967 Mustang", "Vintage Vespa Scooter",
        "Personal Hoverboard", "Magnetic Levitation Bike", "Classic Rolls Royce",
        "Amphibious Vehicle", "Solar Powered Sailboat", "Luxury Private Jet Hours",
        "Retro Futuristic Motorcycle"
    ]
}

items = []
all_base_names = []
for cat in categories:
    all_base_names.extend(categories[cat])

# Duplicate and modify to reach 100 if needed, or just pick unique combinations
suffixes = ["Alpha", "Beta", "MK-I", "MK-II", "Limited Edition", "Platinum", "Gold", "Special Edition", "Signature"]

count = 0
while count < 100:
    cat_name = random.choice(list(categories.keys()))
    base_name = random.choice(categories[cat_name])
    
    if count >= len(all_base_names):
        name = f"{base_name} ({random.choice(suffixes)})"
    else:
        name = all_base_names[count]
        
    price = random.randint(50, 5000) * 10 # Multiples of 10
    items.append(f"{name},{price}")
    count += 1

with open('auction_items_generated.txt', 'w') as f:
    f.write('\n'.join(items))

print(f"Generated {len(items)} items in auction_items_generated.txt")
