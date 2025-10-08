import colors from "../_colors.scss";

export const monthNames = [
	{ value: "January", text: "January", no: 1 },
	{ value: "February", text: "February", no: 2 },
	{ value: "March", text: "March", no: 3 },
	{ value: "April", text: "April", no: 4 },
	{ value: "May", text: "May", no: 5 },
	{ value: "June", text: "June", no: 6 },
	{ value: "July", text: "July", no: 7 },
	{ value: "August", text: "August", no: 8 },
	{ value: "September", text: "September", no: 9 },
	{ value: "October", text: "October", no: 10 },
	{ value: "November", text: "November", no: 11 },
	{ value: "December", text: "December", no: 12 },
];

export const labs = [
	{
		title: "AIDEMEC",
		path: "../aidemec",
		logo: "/ll_logos/AIDEMEC.png",
		image: "/ll_images/AIDEMEC.png",
		region: "Mediterranean",
		coordinates: [40.575_348, 15.882_535],
		products: ["barley", "olive", "wheat", "tomato", "beans"],
		description: "Combines AI and agronomic tools to detect crop stress early, helping Mediterranean farmers protect yields from climate challenges.",
	},
	{
		title: "CONCATLL",
		path: "../concatll",
		logo: "/ll_logos/CONCATLL.png",
		image: "/ll_images/CONCATLL.png",
		region: "Mediterranean",
		coordinates: [41.586_168, 1.514_272],
		products: ["apple", "olive", "wheat", "poultry", "fish"],
		description: "Develops data-driven strategies to improve the resilience of Catalonia's agriculture against droughts, soil degradation, and other climate impacts.",
	},
	{
		title: "EcoReadyMasuria",
		path: "../ecoreadymasuria",
		logo: "/ll_logos/EcoReadyMasuria.png",
		image: "/ll_images/EcoReadyMasuria.png",
		region: "Central Europe",
		coordinates: [53.619_53, 20.366_513],
		products: ["barley", "maize", "sunflower", "red clover", "milk"],
		description: "A Polish innovation hub supporting farmers with climate adaptation trials, data collection, and policy recommendations to enhance food security and biodiversity.",
	},
	{
		title: "EcoVita LL",
		path: "../ecovitall",
		logo: "/ll_logos/EcoVitaLL.png",
		image: "/ll_images/EcoVitaLL.png",
		region: "Central Europe",
		coordinates: [47.492_367, 19.044_356],
		products: ["vertival farm", "leafy greens"],
		description: "Investigates vertical farming as a sustainable and resilient solution to address climate and food security challenges.",
	},
	{
		title: "Esappin",
		path: "../esappin",
		logo: "/ll_logos/Esappin.png",
		image: "/ll_images/Esappin.png",
		region: "Western Europe",
		coordinates: [51.443_657, 7.657_856],
		products: ["barley", "oats", "raspberry", "rapeseed", "mushroom"],
		description: "A German collaboration integrating academia, industry, and policy to advance sustainable farming practices and food security in North Rhine-Westphalia.",
	},
	{
		title: "LivOrganic",
		path: "../livorganic",
		logo: "/ll_logos/LivOrganic.png",
		image: "/ll_images/LivOrganic.png",
		region: "Scandinavia",
		coordinates: [55.939_112_079_462_35, 12.490_630_314_430_565],
		products: ["barley", "potato"],
		description: "Builds on Denmark's organic farming expertise to co-develop climate-adaptive, biodiversity-friendly solutions for food security in Scandinavia and the Baltic region.",
	},
	{
		title: "LOFS",
		path: "../lofs",
		logo: "/ll_logos/LOFS.png",
		image: "/ll_images/LOFS.png",
		region: "Western Europe",
		coordinates: [47.710_385, 1.727_322],
		// coordinates: { cite1: [47.710_385, 1.727_322], cite2: [47.769_127, -0.327_92] },
		products: ["mushroom", "grass"],
		description: "Addresses climate and biodiversity challenges in France's Loire Valley through future scenario modeling and farmer-driven adaptive strategies.",
	},
	{
		title: "Probio",
		path: "../probio",
		logo: "/ll_logos/Probio.png",
		image: "/ll_images/Probio.png",
		region: "Central Europe",
		coordinates: [49.039_97, 16.864_949],
		products: ["apple", "olive", "wheat", "poultry", "fish"],
		description: "Harnesses 15+ years of organic farming experience to co-create solutions for biodiversity, ecosystem health, and sustainable agriculture.",
	},
	{
		title: "Seco Collab",
		path: "../secocollab",
		logo: "/ll_logos/SecoCollab.png",
		image: "/ll_images/SecoCollab.png",
		region: "Scandinavia",
		coordinates: [59.618_634_049_219_36, 16.540_738_729_629_07],
		products: ["vertical farm", "leafy greens"],
		description: "Focuses on vertical farming, and uses technology and data to promote sustainable, urban food production and climate-resilient consumption in Scandinavia and Europe.",
	},
	{
		title: "THALLA",
		path: "../thalla",
		logo: "/ll_logos/Thalla.png",
		image: "/ll_images/Thalla.png",
		region: "Mediterranean",
		coordinates: [38.533_333, 22.366_667],
		products: ["honey", "olive", "wheat", "tomato", "fish"],
		description: "Co-creates agroecological practices in Greece, tackling food security, biodiversity, and climate resilience through stakeholder collaboration.",
	},
];

export const europeanCountries = [
	// Change key from region to country code
	// Region 1: AT - CZ - DK - FI - HU - LT - PL - SE - SK
	// Region 2: BE - DE - FR - NL
	// Region 3: BG - ES - HR - IT - PT - RO
	{ value: "EU", text: "European Union", flag: "🇪🇺", region: "EU Average", isEU: true },
	{ value: "AL", text: "Albania", flag: "🇦🇱", isEU: false },
	{ value: "AT", text: "Austria", flag: "🇦🇹", region: "Region 1", isEU: true },
	{ value: "BE", text: "Belgium", flag: "🇧🇪", region: "Region 2", isEU: true },
	{ value: "BA", text: "Bosnia and Herzegovina", flag: "🇧🇦", isEU: false },
	{ value: "BG", text: "Bulgaria", flag: "🇧🇬", region: "Region 3", isEU: true },
	{ value: "HR", text: "Croatia", flag: "🇭🇷", region: "Region 3", isEU: true },
	{ value: "CY", text: "Cyprus", flag: "🇨🇾", isEU: true },
	{ value: "CZ", text: "Czech Republic", flag: "🇨🇿", region: "Region 1", isEU: true },
	{ value: "DK", text: "Denmark", flag: "🇩🇰", region: "Region 1", isEU: true },
	{ value: "EE", text: "Estonia", flag: "🇪🇪", isEU: true },
	{ value: "FI", text: "Finland", flag: "🇫🇮", region: "Region 1", isEU: true },
	{ value: "FR", text: "France", flag: "🇫🇷", region: "Region 2", isEU: true },
	{ value: "DE", text: "Germany", flag: "🇩🇪", region: "Region 2", isEU: true },
	{ value: "EL", text: "Greece", flag: "🇬🇷", isEU: true },
	{ value: "HU", text: "Hungary", flag: "🇭🇺", region: "Region 1", isEU: true },
	{ value: "IS", text: "Iceland", flag: "🇮🇸", isEU: false },
	{ value: "IE", text: "Ireland", flag: "🇮🇪", isEU: true },
	{ value: "IT", text: "Italy", flag: "🇮🇹", region: "Region 3", isEU: true },
	{ value: "LV", text: "Latvia", flag: "🇱🇻", isEU: true },
	{ value: "LI", text: "Liechtenstein", flag: "🇱🇮", isEU: false },
	{ value: "LT", text: "Lithuania", flag: "🇱🇹", region: "Region 1", isEU: true },
	{ value: "LU", text: "Luxembourg", flag: "🇱🇺", isEU: true },
	{ value: "MT", text: "Malta", flag: "🇲🇹", isEU: true },
	{ value: "MD", text: "Moldova", flag: "🇲🇩", isEU: false },
	{ value: "ME", text: "Montenegro", flag: "🇲🇪", isEU: false },
	{ value: "NL", text: "Netherlands", flag: "🇳🇱", region: "Region 2", isEU: true },
	{ value: "MK", text: "North Macedonia", flag: "🇲🇰", isEU: false },
	{ value: "NO", text: "Norway", flag: "🇳🇴", isEU: false },
	{ value: "PL", text: "Poland", flag: "🇵🇱", region: "Region 1", isEU: true },
	{ value: "PT", text: "Portugal", flag: "🇵🇹", region: "Region 3", isEU: true },
	{ value: "RO", text: "Romania", flag: "🇷🇴", region: "Region 3", isEU: true },
	{ value: "RS", text: "Serbia", flag: "🇷🇸", isEU: false },
	{ value: "SK", text: "Slovakia", flag: "🇸🇰", region: "Region 1", isEU: true },
	{ value: "SI", text: "Slovenia", flag: "🇸🇮", isEU: true },
	{ value: "ES", text: "Spain", flag: "🇪🇸", region: "Region 3", isEU: true },
	{ value: "SE", text: "Sweden", flag: "🇸🇪", region: "Region 1", isEU: true },
	{ value: "CH", text: "Switzerland", flag: "🇨🇭", isEU: false },
	{ value: "UA", text: "Ukraine", flag: "🇺🇦", isEU: false },
	{ value: "UK", text: "United Kingdom", flag: "🇬🇧", isEU: false },
];

export const EU_COUNTRIES = europeanCountries.filter((country) => country.isEU === true);

export const products = [
	{
		value: "beef",
		text: "Beef",
		collections: [
			{ value: "carcass_prices", text: "Carcass" },
			{ value: "live_animal_prices", text: "Live Animal" },
		],
		carcass_prices: {
			products: ["Adult male indicative price", "Bulls",
				"Calves slaughtered <8M", "Cows", "Heifers", "Steers", "Young bulls", "Young cattle"],
		},
		live_animal_prices: {
			products: ["Male Calves Beef Type", "Male Calves Dairy Type", "Yearling Female Store Cattle",
				"Yearling Male Store Cattle", "Young Store Cattle"],
		},
		production: {
			products: ["Bull", "Bullock", "Calf", "Cow", "Heifer", "Young cattle"],
			productionMetrics: [
				{ value: "tonnes", text: "Tonnes" },
				{ value: "heads", text: "Heads" },
				{ value: "kg_per_head", text: "Kg/Head" },
			],
		},
		description: "No living labs currently working with beef",
		image: "/product_images/beef.png",
	},
	{
		value: "cereals",
		text: "Cereals",
		collections: ["prices", "production"],
		prices: {
			products: ["Durum wheat", "Feed barley", "Feed maize", "Feed oats", "Feed rye", "Feed wheat",
				"Malting barley", "Milling oats", "Milling rye", "Milling wheat", "Triticale", "Wheat bran"],
		},
		production: {
			products: ["Barley", "Durum wheat", "Maize", "Oat", "Other cereals", "Rye", "Soft wheat", "Sorghum", "Triticale"],
			productionMetrics: [
				{ value: "gross_production", text: "Gross Production" },
				{ value: "yield", text: "Yield" },
			],
		},
		mapSet: new Set(["barley", "wheat", "maize", "oats", "rye", "sorghum", "triticale"]),
		image: "/product_images/cereals.png",
	},
	{
		value: "eggs_poultry",
		text: "Eggs",
		collections: ["egg_prices"],
		prices: {
			products: ["Barn", "Cage", "Free range", "Organic"],
		},
		description: "CONCATLL, Probio",
		relevantLLs: ["CONCATLL", "Probio"],
		image: "/product_images/eggs.jpg",
	},
	{
		value: "eggs_poultry",
		text: "Poultry",
		collections: ["poultry_prices", "poultry_production"],
		prices: {
			products: ["Selling price", "Non-retail buying prices", "Retail buying prices"],
		},
		production: {
			products: ["Boiling hen", "Broiler", "Chicken", "Duck", "Goose", "Guinea fowl", "Other poultry", "Poultry meat", "Turkey"],
			productionMetrics: [
				{ value: "tonnes", text: "Tonnes" },
				{ value: "heads", text: "Heads" },
				{ value: "kg_per_head", text: "Kg/Head" },
			],
		},
		description: "CONCATLL, Probio",
		relevantLLs: ["CONCATLL", "Probio"],
		image: "/product_images/poultry.jpg",
	},
	// {
	// 	value: "fertiliser",
	// 	text: "Fertiliser",
	// 	collections: ["prices"],
	// 	prices: { products: ["K (Potash)", "N (Nitrogen)", "P (Phosphorus)"] },
	// 	description: "No living labs currently working with fertiliser",
	// 	image: "/product_images/fertiliser.png",
	// },
	{
		value: "fruit_vegetables",
		text: "Fruits & Vegetables",
		subheader: true,
		collections: ["prices"],
		prices: {
			products: ["abricots", "apples", "asparagus", "avocados", "beans", "cabbages", "carrots", "cauliflowers", "cherries", "clementines", "courgettes", "cucumbers", "egg plants, aubergines", "garlic", "kiwis", "leeks", "lemons", "lettuces", "mandarins", "melons", "mushrooms, cultivated", "nectarines", "onions", "oranges", "peaches", "pears", "peppers", "plums", "satsumas", "strawberries", "table grapes", "tomatoes", "water melons"],
		},
		image: "/product_images/fruit_vegetables.jpg",
	},
	{
		value: "pigmeat",
		text: "Pigmeat",
		collections: [{ value: "carcass_prices", text: "Carcass" }, { value: "cuts_prices", text: "Cuts" }],
		carcass_prices: [],
		cuts_prices: {
			products: ["Belly", "Ham", "Loin", "Minced Meat", "Shoulder"],
			productTypes: ["Selling price", "Non-retail buying price", "Retail buying price"],
		},
		production: {
			productionMetrics: [
				{ value: "tonnes", text: "Tonnes" },
				{ value: "heads", text: "Heads" },
				{ value: "kg_per_head", text: "Kg/Head" },
			],
		},
		description: "No living labs currently working with pigmeat",
		image: "/product_images/pigmeat.png",
	},
	{
		value: "milk_dairy",
		text: "Dairy",
		subheader: true,
		collections: ["dairy_prices", "dairy_production"],
		prices: {
			products: ["butter", "butteroil", "cheddar", "cream", "edam", "emmental", "gouda", "smp", "wheypowder", "wmp"],
		},
		description: "Dairy products derived from milk processing",
		image: "/product_images/dairy.jpg",
	},
	{
		value: "milk_dairy",
		text: "Milk",
		collections: ["raw_milk_prices"],
		prices: {
			products: ["Organic raw milk", "Raw milk"],
		},
		production: {
			products: ["Drinking milk", "Skimmed milk powder"],
		},
		description: "EcoReadyMasuria (milk)",
		image: "/product_images/milk.jpg",
	},
	{
		value: "oilseeds_protein_crops",
		text: "Oilseeds",
		collections: ["oilseeds_prices", "oilseeds_production"],
		prices: {
			products: ["Crude rape oil", "Crude soya bean oil", "Crude sunflower oil", "Rapeseed", "Rapeseed meal", "Soya beans", "Soya meal", "Sunflower seed", "Sunflower seed meal"],
			productTypes: ["30-35% protein content", "40-50% protein content", "Above 35% protein content", "Below 30% protein content", "Below 40% protein content", "From dehulled seeds", "High-oleic", "N.A.", "Standard"],
		},
		production: {
			products: ["Broad/field beans", "Field peas", "Linseed", "Lupins", "Rapeseed", "Soybean", "Sunflower seed"],
		},
		description: "EcoReadyMasuria (sunflower), Esappin (rapeseed)",
		image: "/product_images/oilseeds.jpg",
	},
	{
		value: "oilseeds_protein_crops",
		text: "Protein Crops",
		subheader: true,
		collections: ["protein_crops_prices"],
		prices: {
			products: ["Alfalfa", "Broad beans", "Chickpeas", "Lentils", "Lupins", "Peas"],
			productTypes: ["Bales", "Feed", "Food", "Not Defined", "Pellets"],
		},
		// production: {
		// 	products: ["Broad/field beans", "Field peas", "Linseed", "Lupins", "Rapeseed", "Soybean", "Sunflower seed"],
		// },
		description: "Protein rich crops for sustainable agriculture",
		image: "/product_images/protein_crops.jpg",
	},
	{
		value: "olive_oil",
		text: "Olive Oil",
		collections: ["prices", "annual_production"],
		prices: {
			products: ["Crude olive-pomace", "Crude olive-pomace oil (from 5 to 10%)", "Extra virgin",
				"Extra virgin olive oil (up to 0,8°)", "Lampante", "Lampante olive oil (2%)", "Olive-pomace oil (up to 1°)",
				"Refined", "Refined olive oil (up to 0,3°)", "Refined olive-pomace", "Refined olive-pomace oil (up to 0.3%)",
				"Virgin", "Virgin olive oil (up to 2%)"],
		},
		description: "AIDEMEC, CONCATLL, Probio, THALLA",
		image: "/product_images/olive_oil.jpg",
	},
	// {
	// 	value: "organic",
	// 	text: "Organic",
	// 	collections: ["prices"],
	// 	prices: { products: ["LivOrganic", "Probio"] },
	// 	description: "LivOrganic, Probio",
	// 	image: "/product_images/organic.jpg",
	// },
	{
		value: "rice",
		text: "Rice",
		collections: ["prices", "production"],
		prices: {
			products: ["Indica", "Japonica", "N.A.", "Not informed"],
			productTypes: ["Andalucia", "Arbiorio Volano", "Arborio", "Arborio - Volano", "Arborio -Volano", "Ariete", "Augusto", "Avarage", "Average", "Avg", "B", "Baldo", "Baldo E Cammeo", "Balilla", "Balilla - Centauro", "Balilla Centauro", "Balilla E Centauro", "Brisures Camargue", "Caravaggio", "Carnaroli", "Carolina", "Centauro", "Cl 388", "Corpetto", "Crono", "Gleva", "Gleva Valencia", "Gloria", "Grana Verde", "J. Sendra", "L", "Leonardo", "Lido", "Lolla", "Long", "Long A", "Long B", "Longo A", "Longo B", "Loto", "Luna-Ronaldo", "Mezzagrana", "Moyen", "Not informed", "Omega", "Originario", "Originario (Comune)", "Pula", "Pula Max 1% Silicio", "Puntal", "Puntal Andalucia", "Puntal Valencia", "Ribe", "Risetto", "Risetto Parboiled", "Roma", "Roma E Barone", "Rond", "S. Andrea", "Selenio", "Sendra Andalucia", "Sendra Valencia", "Sirio Andalucia", "Sirio Valencia", "Sole", "Sole Cl", "Terra", "Thaibonnet", "Tipo Ribe", "Valencia", "Volano"],
		},
		production: {
			products: ["(1) Round grain paddy rice", "(2) Medium grain paddy rice", "(3) Long grain A paddy rice", "(4) Long grain B paddy rice"],
			productionMetrics: [
				{ value: "milled_rice_equivalent_quantity", text: "Milled rice" },
				{ value: "rice_husk_quantity", text: "Rice husk" },
			],
		},
		description: "No living labs currently working with rice",
		image: "/product_images/rice.jpg",
	},
	{
		value: "sheep_goat_meat",
		text: "Sheep/Goat Meat",
		collections: ["meat_prices", "production"],
		prices: { products: ["Heavy Lamb", "Light Lamb"] },
		production: {
			products: ["Goat meat", "Sheepmeat"],
			productTypes: ["Slaughterings", "Slaughterings, other than in slaughterhouses"],
			productionMetrics: [
				{ value: "tonnes", text: "Tonnes" },
				{ value: "heads", text: "Heads" },
				{ value: "kg_per_head", text: "Kg/Head" },
			],
		},
		description: "No living labs currently working with sheep/goat meat",
		image: "/product_images/sheep_goat_meat.png",
	},
	{
		value: "sugar",
		text: "Sugar",
		collections: ["prices", "production"],
		prices: [],
		production: {
			productionMetrics: [
				{ value: "gross_production", text: "Gross Production" },
				{ value: "yield", text: "Yield" },
			],
		},
		description: "No living labs currently working with sugar",
		image: "/product_images/sugar.jpg",
	},
	{
		value: "wine",
		text: "Wine",
		collections: ["prices"],
		prices: {
			products: [
				"Albacete vino blanco sin DOP/IGP",
				"Albacete vino tinto sin DOP/IGP",
				"Altri Vini",
				"Badajoz vino blanco sin DOP/IGP",
				"Bari Vino bianco senza DOP/IGP",
				"Bari Vino rosso senza DOP/IGP",
				"Blancs / Vin AOP",
				"Blancs / Vin IGP",
				"Blancs / Vin sans IG avec mention de cépages",
				"Blancs / Vin sans IG sans mention de cépages",
				"Ciudad Real vino blanco sin DOP/IGP",
				"Ciudad Real vino tinto sin DOP/IGP",
				"Lugo Vino bianco senza DOP/IGP",
				"Lugo Vino rosso DOP",
				"Mosel Qba Weiß",
				"Pescara Vino bianco senza DOP/IGP",
				"Pescara Vino rosso senza DOP/IGP",
				"Pfalz QbA Rot Dornfelder",
				"Pfalz Qba Weiß",
				"Pfalz ohne Rebsorteangabe",
				"Ravenna Vino bianco senza DOP/IGP",
				"Rheingau Qba Weiß",
				"Rheinhessen Qba Weiß",
				"Rheinhessen ohne Rebsorteangabe",
				"Rioja DOP vino tinto",
				"Rouges et Rosés / Vin AOP",
				"Rouges et Rosés / Vin IGP",
				"Rouges et Rosés / Vin sans IG avec mention de cépages",
				"Rouges et Rosés / Vin sans IG sans mention de cépages",
				"Rueda DOP vino blanco",
				"Toledo vino blanco sin DOP/IGP",
				"Toledo vino tinto sin DOP/IGP",
				"Trapani Vino bianco senza DOP/IGP",
				"Trapani Vino rosso senza DOP/IGP",
				"Valencia vino tinto sin DOP/IGP",
				"Verona Vino bianco DOP",
				"Verona Vino bianco senza DOP/IGP",
			],
		},
		description: "No living labs currently working with wine",
		image: "/product_images/wine.jpg",
	},
];
products.sort((a, b) => a.text.localeCompare(b.text));

export const agriColors = [
	colors.ag1, colors.ag2, colors.ag3, colors.ag4, colors.ag5,
	colors.ag6, colors.ag7, colors.ag8, colors.ag9, colors.ag10,
	colors.ag11, colors.ag12, colors.ag13, colors.ag14, colors.ag15,
	colors.ag16, colors.ag17, colors.ag18, colors.ag19, colors.ag20,
];

export const MAGNET_INDICATORS = [
	{
		label: "Child Labour & Forced Labour",
		options: [
			{ value: "Children in employment, total", text: "Children In Employment" },
			{ value: "Frequency of forced labour", text: "Frequency Of Forced Labour" },
			{ value: "Goods produced by forced labour", text: "Goods Produced By Forced Labour" },
			{ value: "Trafficking in persons", text: "Trafficking In Persons" },
		],
		desc: [
			"Indicates the percentage of children aged 5–17 engaged in labour within a sector",
			"Indicates how common forced labour is in a country per 1,000 inhabitants",
			"Indicates the number of goods in a sector linked to forced labour practices",
			"Indicates the presence or absence of trafficking in persons, including forced labour, slavery, and slavery-like practices, within a sector",
		],
	},
	{
		label: "Wage & Working Conditions",
		options: [
			{ value: "Gender wage gap", text: "Gender Wage Gap" },
			{ value: "Living wage, per month (AV)", text: "Living Wage, Per Month (AV)" },
			{ value: "Minimum wage, per month", text: "Minimum Wage, Per Month" },
			{ value: "Weekly hours of work per employee", text: "Weekly Hours Of Work Per Employee" },
			{ value: "Violations of mandatory health and safety standards", text: "Violations Of Mandatory Health And Safety Standards" },
		],
		desc: [
			"Indicates the percentage difference between male and female wages in a sector",
			"Evaluation of monthly income vs the monthly income required for a decent standard of living",
			"Evaluation of monthly income vs the legally mandated lowest monthly income for full-time work",
			"Indicates the average number of hours worked weekly by employees in a sector",
			"Indicates reported breaches of occupational health and safety laws",
		],
	},
	{
		label: "Labour Rights & Representation",
		options: [
			{ value: "Trade union density", text: "Trade Union Density" },
			{ value: "Right of Association", text: "Right Of Association" },
			{ value: "Right of Collective bargaining", text: "Right Of Collective Bargaining" },
			{ value: "Right to Strike", text: "Right To Strike" },
			{ value: "Presence of sufficient safety measures", text: "Presence Of Sufficient Safety Measures" },
		],
		desc: [
			"Indicates the percentage of workers who are members of trade unions",
			"Indicates the workers’ right to form and join organizations of their own choosing",
			"Indicates the  workers’ right to negotiate collectively with employers on working conditions",
			"Indicates the workers’ legal right to stop work to protest conditions or disputes",
			"Indicates the implementation of workplace safety protocols via OSHA violations",
		],
	},
	{
		label: "Employment & Workforce Composition",
		options: [
			{ value: "Men in the sectoral labour force", text: "Men In The Sectoral Labour Force" },
			{ value: "Women in the sectoral labour force", text: "Women In The Sectoral Labour Force" },
			{ value: "Evidence of violations of laws and employment regulations", text: "Evidence Of Violations Of Laws And Employment Regulations" },
			{ value: "Social security expenditures", text: "Social Security Expenditures" },
			{ value: "Rate of fatal accidents at workplace", text: "Rate Of Fatal Accidents At Workplace" },
			{ value: "Rate of non-fatal accidents at workplace", text: "Rate Of Non-Fatal Accidents At Workplace" },
		],
		desc: [
			"Represents the share of male workers in a specific sector",
			"Represents the share of female workers in a specific sector",
			"Indicates the frequency of legal breaches in employment practices",
			"Indicates the proportion of GDP spent on social protection programs",
			"Indicates the number of fatal workplace accidents per 100,000 employees",
			"Indicates the number of non-fatal workplace accidents per 100,000 employees",
		],
	},
	{
		label: "Economic & Social Development",
		options: [
			{ value: "Contribution of the sector to economic development", text: "Contribution Of The Sector To Economic Development" },
			{ value: "Public sector corruption", text: "Public Sector Corruption" },
			{ value: "Active involvement of enterprises in corruption and bribery", text: "Active Involvement Of Enterprises In Corruption And Bribery" },
			{ value: "Presence of anti-competitive behaviour or violation of anti-trust and monopoly legislation", text: "Presence Of Anti-Competitive Behaviour Or Violation Of Anti-Trust And Monopoly Legislation" },
			{ value: "Membership in an initiative that promotes social responsibility along the supply chain", text: "Membership In An Initiative That Promotes Social Responsibility Along The Supply Chain" },
		],
		desc: [
			"Indicates how much a sector contributes to national GDP",
			"Indicates perceived corruption in government institutions",
			"Indicates the percentage of businesses engaged in bribery",
			"Indicates reported cases of monopolistic or unfair business practices",
			"Indicates how many companies in a sector adopt social responsibility codes",
		],
	},
	{
		label: "Migration",
		options: [
			{ value: "Emigration rate", text: "Emigration Rate" },
			{ value: "Immigration rate", text: "Immigration Rate" },
			{ value: "International migrant workers in the sector", text: "International Migrant Workers In The Sector" },
			{ value: "Number of asylum seekers in relation to total population", text: "Number Of Asylum Seekers In Relation To Total Population" },
		],
		desc: [
			"Compares the rate of people leaving a country",
			"Compares the rate of people entering a country",
			"Indicates the percentage of migrant workers in a sector",
			"Indicates the number of asylum seekers relative to the population",
		],
	},
	{
		label: "Education & Literacy",
		options: [
			{ value: "Illiteracy rate, total", text: "Illiteracy Rate" },
			{ value: "Public expenditure on education", text: "Public Expenditure On Education" },
		],
		desc: [
			"Indicates the percentage of adults unable to read or write",
			"Indicates the percentage of GDP allocated to education",
		],
	},
	{
		label: "Health & Wellbeing",
		options: [
			{ value: "Health expenditure, total", text: "Health Expenditure" },
			{ value: "Life expectancy at birth", text: "Life Expectancy At Birth" },
			{ value: "Workers affected by natural disasters", text: "Workers Affected By Natural Disasters" },
			{ value: "Sanitation coverage", text: "Sanitation Coverage" },
		],
		desc: [
			"Indicates the health spending by source and total share of GDP",
			"Indicates the average lifespan expected for newborns",
			"Indicates the percentage of workers impacted by environmental disasters",
			"Indicates the percentage of the population with access to adequate sanitation",
		],
	},
	{
		label: "Indigenous & Minority Rights",
		options: [
			{ value: "Indigenous People Rights Protection Index", text: "Indigenous People Rights Protection Index" },
			{ value: "Presence of indigenous population", text: "Presence Of Indigenous Population" },
		],
		desc: [
			"Indicates the level of  the legal and practical protection of indigenous rights",
			"Indicates the presence of indigenous communities in a country",
		],
	},
];

export const RISK_LEVELS = ["very low risk", "low risk", "medium risk", "high risk", "very high risk", "no data"];
export const OPPORTUNITY_LEVELS = ["high opportunity", "medium opportunity", "low opportunity", "no opportunity"];

export const RISK_COLOR_MAP = {
	// Risk levels - Green to Red gradient
	"very low risk": colors.riskVeryLow,
	"low risk": colors.riskLow,
	"medium risk": colors.riskMedium,
	"high risk": colors.riskHigh,
	"very high risk": colors.riskVeryHigh,

	// Opportunity levels
	"no opportunity": colors.opportunityNo,
	"low opportunity": colors.opportunityLow,
	"medium opportunity": colors.opportunityMedium,
	"high opportunity": colors.opportunityHigh,

	// Data availability
	"no data": colors.greyDark,
};

export const RISK_LEVEL_ORDER = {
	"very high risk": 5,
	"high risk": 4,
	"medium risk": 3,
	"low risk": 2,
	"very low risk": 1,
	"no data": 0.05,
};

export const OPPORTUNITY_LEVEL_ORDER = {
	"high opportunity": 3,
	"medium opportunity": 2,
	"low opportunity": 1,
	"no opportunity": 0.05,
};

export const UNIT_CONVERSION_FACTORS = {
	// Direct mapping for common units to mg/kg
	"gram/hectoliter": 10,
	"gram/kilogram": 1000,
	"gram/litre": 1000,
	"microgram/gram": 1,
	"microgram/kilogram": 0.001,
	"microgram/litre": 0.001,
	"microgram/millilitre": 1,
	"milligram/gram": 1000,
	"milligram/kilogram": 1,
	"milligram/litre": 1,
	"milligram/millilitre": 1000,
	"nanogram/gram": 0.001,
	"nanogram/kilogram": 0.000_001,
	"nanogram/litre": 0.000_001,
	"nanogram/millilitre": 0.001,
	"picogram/gram": 0.000_001,
	"picogram/kilogram": 0.000_000_001,
};
