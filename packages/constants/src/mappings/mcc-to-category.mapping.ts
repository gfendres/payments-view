import { CategoryId } from '../enums/category-id.enum';

/**
 * MCC (Merchant Category Code) to CategoryId mapping
 * Based on ISO 18245 standard
 */
export const MCC_TO_CATEGORY: Record<string, CategoryId> = {
  // Groceries (5411-5499)
  '5411': CategoryId.GROCERIES, // Grocery Stores, Supermarkets
  '5422': CategoryId.GROCERIES, // Freezer and Locker Meat Provisioners
  '5441': CategoryId.GROCERIES, // Candy, Nut, and Confectionery Stores
  '5451': CategoryId.GROCERIES, // Dairy Products Stores
  '5462': CategoryId.GROCERIES, // Bakeries
  '5499': CategoryId.GROCERIES, // Miscellaneous Food Stores

  // Dining (5812-5814)
  '5812': CategoryId.DINING, // Eating Places, Restaurants
  '5813': CategoryId.DINING, // Drinking Places (Bars, Taverns)
  '5814': CategoryId.DINING, // Fast Food Restaurants

  // Transport (4000-4799, 5541-5599)
  '4111': CategoryId.TRANSPORT, // Transportation - Suburban and Local Commuter
  '4112': CategoryId.TRANSPORT, // Passenger Railways
  '4121': CategoryId.TRANSPORT, // Taxicabs and Limousines
  '4131': CategoryId.TRANSPORT, // Bus Lines
  '4411': CategoryId.TRANSPORT, // Cruise Lines
  '4457': CategoryId.TRANSPORT, // Boat Rentals and Leasing
  '4468': CategoryId.TRANSPORT, // Marinas, Marine Service and Supplies
  '4511': CategoryId.TRAVEL, // Airlines, Air Carriers
  '4722': CategoryId.TRAVEL, // Travel Agencies and Tour Operators
  '4784': CategoryId.TRANSPORT, // Tolls and Bridge Fees
  '4789': CategoryId.TRANSPORT, // Transportation Services
  '5541': CategoryId.TRANSPORT, // Service Stations
  '5542': CategoryId.TRANSPORT, // Automated Fuel Dispensers
  '5571': CategoryId.TRANSPORT, // Motorcycle Shops and Dealers
  '5592': CategoryId.TRANSPORT, // Motor Home Dealers
  '5598': CategoryId.TRANSPORT, // Snowmobile Dealers
  '5599': CategoryId.TRANSPORT, // Miscellaneous Automotive Dealers

  // Shopping (5200-5399, 5600-5699, 5900-5999)
  '5200': CategoryId.SHOPPING, // Home Supply Warehouse Stores
  '5211': CategoryId.SHOPPING, // Lumber and Building Materials Stores
  '5231': CategoryId.SHOPPING, // Glass, Paint, and Wallpaper Stores
  '5251': CategoryId.SHOPPING, // Hardware Stores
  '5261': CategoryId.SHOPPING, // Lawn and Garden Supply Stores
  '5271': CategoryId.SHOPPING, // Mobile Home Dealers
  '5300': CategoryId.SHOPPING, // Wholesale Clubs
  '5309': CategoryId.SHOPPING, // Duty Free Stores
  '5310': CategoryId.SHOPPING, // Discount Stores
  '5311': CategoryId.SHOPPING, // Department Stores
  '5331': CategoryId.SHOPPING, // Variety Stores
  '5399': CategoryId.SHOPPING, // Miscellaneous General Merchandise
  '5611': CategoryId.SHOPPING, // Men's and Boy's Clothing Stores
  '5621': CategoryId.SHOPPING, // Women's Ready-To-Wear Stores
  '5631': CategoryId.SHOPPING, // Women's Accessory Stores
  '5641': CategoryId.SHOPPING, // Children's and Infant's Wear Stores
  '5651': CategoryId.SHOPPING, // Family Clothing Stores
  '5655': CategoryId.SHOPPING, // Sports and Riding Apparel Stores
  '5661': CategoryId.SHOPPING, // Shoe Stores
  '5681': CategoryId.SHOPPING, // Furriers and Fur Shops
  '5691': CategoryId.SHOPPING, // Men's and Women's Clothing Stores
  '5697': CategoryId.SHOPPING, // Tailors, Seamstresses, Mending
  '5698': CategoryId.SHOPPING, // Wig and Toupee Stores
  '5699': CategoryId.SHOPPING, // Miscellaneous Apparel Stores
  '5712': CategoryId.SHOPPING, // Furniture, Home Furnishings Stores
  '5713': CategoryId.SHOPPING, // Floor Covering Stores
  '5714': CategoryId.SHOPPING, // Drapery and Upholstery Stores
  '5718': CategoryId.SHOPPING, // Fireplace, Fireplace Screens Stores
  '5719': CategoryId.SHOPPING, // Miscellaneous Home Furnishing Stores
  '5722': CategoryId.SHOPPING, // Household Appliance Stores
  '5732': CategoryId.SHOPPING, // Electronics Stores
  '5733': CategoryId.SHOPPING, // Music Stores
  '5734': CategoryId.SHOPPING, // Computer Software Stores
  '5735': CategoryId.SHOPPING, // Record Stores
  '5912': CategoryId.HEALTH, // Drug Stores and Pharmacies
  '5921': CategoryId.SHOPPING, // Package Stores - Beer, Wine, Liquor
  '5931': CategoryId.SHOPPING, // Used Merchandise and Secondhand Stores
  '5932': CategoryId.SHOPPING, // Antique Shops
  '5933': CategoryId.SHOPPING, // Pawn Shops
  '5935': CategoryId.SHOPPING, // Wrecking and Salvage Yards
  '5937': CategoryId.SHOPPING, // Antique Reproductions
  '5940': CategoryId.SHOPPING, // Bicycle Shops
  '5941': CategoryId.SHOPPING, // Sporting Goods Stores
  '5942': CategoryId.SHOPPING, // Book Stores
  '5943': CategoryId.SHOPPING, // Stationery Stores
  '5944': CategoryId.SHOPPING, // Jewelry Stores
  '5945': CategoryId.SHOPPING, // Hobby, Toy, and Game Shops
  '5946': CategoryId.SHOPPING, // Camera and Photographic Supply Stores
  '5947': CategoryId.SHOPPING, // Gift, Card, Novelty Stores
  '5948': CategoryId.SHOPPING, // Luggage and Leather Goods Stores
  '5949': CategoryId.SHOPPING, // Sewing, Needlework Stores
  '5950': CategoryId.SHOPPING, // Glassware/Crystal Stores
  '5970': CategoryId.SHOPPING, // Artist Supply and Craft Shops
  '5971': CategoryId.SHOPPING, // Art Dealers and Galleries
  '5972': CategoryId.SHOPPING, // Stamp and Coin Stores
  '5973': CategoryId.SHOPPING, // Religious Goods Stores
  '5975': CategoryId.SHOPPING, // Hearing Aids
  '5976': CategoryId.SHOPPING, // Orthopedic Goods
  '5977': CategoryId.SHOPPING, // Cosmetic Stores
  '5978': CategoryId.SHOPPING, // Typewriter Stores
  '5983': CategoryId.SHOPPING, // Fuel Dealers
  '5992': CategoryId.SHOPPING, // Florists
  '5993': CategoryId.SHOPPING, // Cigar Stores and Stands
  '5994': CategoryId.SHOPPING, // News Dealers and Newsstands
  '5995': CategoryId.SHOPPING, // Pet Shops
  '5996': CategoryId.SHOPPING, // Swimming Pools
  '5997': CategoryId.SHOPPING, // Electric Razor Stores
  '5998': CategoryId.SHOPPING, // Tent and Awning Shops
  '5999': CategoryId.SHOPPING, // Miscellaneous Specialty Retail

  // Travel (Hotels, Airlines, etc.)
  '3000': CategoryId.TRAVEL, // Airlines
  '3501': CategoryId.TRAVEL, // Holiday Inns
  '7011': CategoryId.TRAVEL, // Lodging - Hotels, Motels, Resorts
  '7012': CategoryId.TRAVEL, // Timeshares
  '7032': CategoryId.TRAVEL, // Sporting and Recreational Camps
  '7033': CategoryId.TRAVEL, // Trailer Parks and Campgrounds

  // Entertainment (7800-7999)
  '7829': CategoryId.ENTERTAINMENT, // Motion Picture and Video Production
  '7832': CategoryId.ENTERTAINMENT, // Motion Picture Theaters
  '7841': CategoryId.ENTERTAINMENT, // Video Tape Rental Stores
  '7911': CategoryId.ENTERTAINMENT, // Dance Halls, Studios, Schools
  '7922': CategoryId.ENTERTAINMENT, // Theatrical Producers
  '7929': CategoryId.ENTERTAINMENT, // Bands, Orchestras, Entertainers
  '7932': CategoryId.ENTERTAINMENT, // Billiard and Pool Establishments
  '7933': CategoryId.ENTERTAINMENT, // Bowling Alleys
  '7941': CategoryId.ENTERTAINMENT, // Commercial Sports
  '7991': CategoryId.ENTERTAINMENT, // Tourist Attractions and Exhibits
  '7992': CategoryId.ENTERTAINMENT, // Golf Courses
  '7993': CategoryId.ENTERTAINMENT, // Video Amusement Game Supplies
  '7994': CategoryId.ENTERTAINMENT, // Video Game Arcades
  '7995': CategoryId.ENTERTAINMENT, // Betting
  '7996': CategoryId.ENTERTAINMENT, // Amusement Parks
  '7997': CategoryId.ENTERTAINMENT, // Membership Clubs
  '7998': CategoryId.ENTERTAINMENT, // Aquariums, Seaquariums
  '7999': CategoryId.ENTERTAINMENT, // Recreation Services

  // Health (8000-8099)
  '8011': CategoryId.HEALTH, // Doctors
  '8021': CategoryId.HEALTH, // Dentists
  '8031': CategoryId.HEALTH, // Osteopaths
  '8041': CategoryId.HEALTH, // Chiropractors
  '8042': CategoryId.HEALTH, // Optometrists
  '8043': CategoryId.HEALTH, // Opticians
  '8049': CategoryId.HEALTH, // Podiatrists
  '8050': CategoryId.HEALTH, // Nursing Care Facilities
  '8062': CategoryId.HEALTH, // Hospitals
  '8071': CategoryId.HEALTH, // Medical and Dental Labs
  '8099': CategoryId.HEALTH, // Medical Services

  // Utilities
  '4814': CategoryId.UTILITIES, // Telecommunication Services
  '4816': CategoryId.UTILITIES, // Computer Network Services
  '4899': CategoryId.UTILITIES, // Cable and Other Pay TV Services
  '4900': CategoryId.UTILITIES, // Utilities - Electric, Gas, Water

  // Digital Services
  '5815': CategoryId.DIGITAL, // Digital Goods Media
  '5816': CategoryId.DIGITAL, // Digital Goods Games
  '5817': CategoryId.DIGITAL, // Digital Goods Applications
  '5818': CategoryId.DIGITAL, // Digital Goods - Large Volume

  // ATM
  '6010': CategoryId.ATM, // Manual Cash Disbursements
  '6011': CategoryId.ATM, // Automated Cash Disbursements
};

/**
 * Get category from MCC code
 */
export function getCategoryFromMcc(mcc: string): CategoryId {
  return MCC_TO_CATEGORY[mcc] ?? CategoryId.OTHER;
}

