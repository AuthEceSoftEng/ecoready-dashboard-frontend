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

export const lcaIndicators = [
	{
		label: "Child Labour & Forced Labour",
		options: [
			"Children in employment, total",
			"Frequency of forced labour",
			"Goods produced by forced labour",
			"Trafficking in persons",
		],
		desc: [
			"Employment of children below the minimum legal age or harmful to their physical, mental, or moral development",
			"Incidence of work or service exacted under threat or coercion, against a person's will",
			"Products manufactured with labour obtained through coercion or involuntary servitude",
			"Recruitment or transportation of persons through coercion, abduction, fraud, or deception for exploitation",
		],
	},
	{
		label: "Wage & Working Conditions",
		options: [
			"Gender wage gap",
			"Living wage, per month (AV)",
			"Minimum wage, per month",
			"Weekly hours of work per employee",
			"Violations of mandatory health and safety standards",
		],
		desc: [
			"Difference in average earnings between men and women doing similar work or work of equal value",
			"Income level sufficient to meet basic needs such as food, housing, education, and healthcare",
			"Legally mandated lowest wage that employers may pay workers",
			"Average number of hours employees work per week",
			"Failure to comply with legally required health and safety regulations in the workplace",
		],
	},
	{
		label: "Labour Rights & Representation",
		options: [
			"Trade union density",
			"Right of Association",
			"Right of Collective bargaining",
			"Right to Strike",
			"Presence of sufficient safety measures",
		],
		desc: [
			"Proportion of workers who are members of trade unions within a sector or country",
			"Workers' right to form and join organizations of their own choosing",
			"Workers' right to negotiate collectively with employers on working conditions",
			"Workers' legal right to stop work to protest working conditions or disputes",
			"Availability and implementation of safety protocols and equipment to protect workers",
		],
	},
	{
		label: "Employment & Workforce Composition",
		options: [
			"Men in the sectoral labour force",
			"Women in the sectoral labour force",
			"Evidence of violations of laws and employment regulations",
			"Social security expenditures",
			"Rate of fatal accidents at workplace",
			"Rate of non-fatal accidents at workplace",
		],
		desc: [
			"Percentage or number of men employed in the sector",
			"Percentage or number of women employed in the sector",
			"Instances where laws or employment standards are not respected by employers",
			"Public or private spending on social protection systems, including pensions, healthcare, and unemployment benefits",
			"Number of workplace deaths per unit of employment or time",
			"Number of non-fatal injuries occurring in the workplace per unit of employment or time",
		],
	},
	{
		label: "Economic & Social Development",
		options: [
			"Contribution of the sector to economic development",
			"Public sector corruption",
			"Active involvement of enterprises in corruption and bribery",
			"Presence of anti-competitive behaviour or violation of anti-trust and monopoly legislation",
			"Membership in an initiative that promotes social responsibility along the supply chain",
		],
		desc: [
			"Extent to which the sector promotes economic growth, job creation, and improved living standards",
			"Level of corruption perceived or recorded in government institutions affecting public services or policies",
			"Incidence of companies engaging in corrupt practices to gain advantage",
			"Existence of practices that limit competition or create monopolies in the market",
			"Participation of companies in voluntary programs aimed at improving social conditions in their supply chains",
		],
	},
	{
		label: "Migration",
		options: [
			"Emigration rate",
			"Immigration rate",
			"International migrant workers in the sector",
			"Number of asylum seekers in relation to total population",
		],
		desc: [
			"Proportion of population leaving the country or region to reside elsewhere",
			"Proportion of population entering the country or region from elsewhere",
			"Proportion or number of migrant workers employed in the sector",
			"Number of individuals seeking asylum relative to the total population size",
		],
	},
	{
		label: "Education & Literacy",
		options: [
			"Illiteracy rate, total",
			"Public expenditure on education",
		],
		desc: [
			"Percentage of the population over a certain age unable to read or write",
			"Government spending on education services as a share of total public expenditure",
		],
	},
	{
		label: "Health & Wellbeing",
		options: [
			"Health expenditure, total",
			"Life expectancy at birth",
			"Workers affected by natural disasters",
			"Sanitation coverage",
		],
		desc: [
			"Total health spending combining domestic, external, and private contributions",
			"Average number of years a newborn is expected to live under current mortality conditions",
			"Number or proportion of workers impacted by events like floods, storms, droughts, etc",
			"Percentage of the population with access to safe sanitation facilities",
		],
	},
	{
		label: "Indigenous & Minority Rights",
		options: [
			"Indigenous People Rights Protection Index",
			"Presence of indigenous population",
		],
		desc: [
			"Measure of the respect and protection of indigenous peoples' rights in a country or sector",
			"Existence of indigenous communities within the country or sector",
		],
	},
];

export const RISK_LEVELS = ["very low risk", "low risk", "medium risk", "high risk", "very high risk", "no data"];
export const OPPORTUNITY_LEVELS = ["no opportunity", "low opportunity", "medium opportunity", "high opportunity"];

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
	"no data": colors.noData,
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
