export const phraseCategories = [
  {
    id: "greetings",
    title: "Greetings",
    icon: "👋",
    description:
      "Common phrases used to greet people, introduce yourself and begin conversations politely.",
    phrases: [
      {
        id: 1,
        english: "Hello",
        translation: "Hola",
        pronunciation: "OH-lah",
        meaning: "A simple greeting used at any time of the day.",
        tip:
          "Smile while saying it. Native speakers pronounce it smoothly without stressing the last syllable.",
        explanation: {
          title: "Understanding 'Hello'",
          content:
            "Hola is the most common greeting in Spanish. It works in both formal and informal situations.",
          grammar:
            "Hola is an interjection and never changes regardless of who you are speaking to.",
          culture:
            "It is normal to say Hola before asking questions or starting a conversation.",
          whenToUse: [
            "Meeting someone",
            "Entering a shop",
            "Starting a conversation"
          ],
          examples: [
            "Hola, ¿cómo estás?",
            "Hola, buenos días."
          ]
        }
      },
      {
        id: 2,
        english: "Good morning",
        translation: "Buenos días",
        pronunciation: "BWEH-nos DEE-ahs",
        meaning: "A polite greeting used before noon.",
        tip:
          "Speak naturally and keep both words connected.",
        explanation: {
          title: "Understanding 'Good morning'",
          content:
            "Buenos días is the standard morning greeting used until around midday.",
          grammar:
            "Buenos means 'good' while días means 'days'. Together they form a fixed greeting.",
          culture:
            "It is commonly used in offices, schools, restaurants and hotels.",
          whenToUse: [
            "Morning meetings",
            "Greeting teachers",
            "Greeting customers"
          ],
          examples: [
            "Buenos días, señor.",
            "Buenos días, profesora."
          ]
        }
      },
      {
        id: 3,
        english: "Good afternoon",
        translation: "Buenas tardes",
        pronunciation: "BWEH-nas TAR-des",
        meaning: "A greeting used during the afternoon.",
        tip:
          "Use this after midday until evening.",
        explanation: {
          title: "Understanding 'Good afternoon'",
          content:
            "Buenas tardes is the standard greeting used after lunch until sunset.",
          grammar:
            "Buenas is the feminine plural adjective used with tardes.",
          culture:
            "It is considered respectful in professional environments.",
          whenToUse: [
            "Afternoon meetings",
            "Visiting offices",
            "Meeting friends"
          ],
          examples: [
            "Buenas tardes.",
            "Buenas tardes, ¿cómo está?"
          ]
        }
      },
      {
        id: 4,
        english: "Good evening",
        translation: "Buenas noches",
        pronunciation: "BWEH-nas NO-chehs",
        meaning: "Used in the evening or at night.",
        tip:
          "This phrase also means 'Good night' when leaving.",
        explanation: {
          title: "Understanding 'Good evening'",
          content:
            "Buenas noches can mean both Good evening and Good night depending on the situation.",
          grammar:
            "Buenas agrees with noches, which is feminine plural.",
          culture:
            "Many Spanish speakers use it when arriving somewhere in the evening and again when leaving to sleep.",
          whenToUse: [
            "Evening events",
            "Night greetings",
            "Before bedtime"
          ],
          examples: [
            "Buenas noches.",
            "Buenas noches, hasta mañana."
          ]
        }
      },
      {
        id: 5,
        english: "How are you?",
        translation: "¿Cómo estás?",
        pronunciation: "KOH-moh es-TAHS",
        meaning: "A friendly question asking about someone's well-being.",
        tip:
          "Raise your voice slightly at the end because it's a question.",
        explanation: {
          title: "Understanding 'How are you?'",
          content:
            "¿Cómo estás? is the informal way to ask someone how they are doing.",
          grammar:
            "Cómo means 'how' while estás comes from the verb estar.",
          culture:
            "Among friends this question is often asked after saying Hola.",
          whenToUse: [
            "Talking to friends",
            "Family",
            "Classmates"
          ],
          examples: [
            "Hola, ¿cómo estás?",
            "¿Cómo estás hoy?"
          ]
        }
      },
      {
        id: 6,
        english: "I'm fine, thank you.",
        translation: "Estoy bien, gracias.",
        pronunciation: "Es-TOY bee-EN GRAH-see-as",
        meaning: "A polite response when someone asks how you are.",
        tip:
          "Say 'gracias' warmly to sound more natural and friendly.",
        explanation: {
          title: "Understanding 'I'm fine, thank you.'",
          content:
            "Estoy bien, gracias is one of the first responses learners use in everyday conversations. It politely lets someone know that you are doing well.",
          grammar:
            "Estoy is the first-person form of the verb 'estar' (to be). Bien means 'well' and gracias means 'thank you'.",
          culture:
            "Spanish speakers often ask about your well-being as part of normal greetings.",
          whenToUse: [
            "Replying to friends",
            "Meeting new people",
            "Professional conversations"
          ],
          examples: [
            "—¿Cómo estás?\n—Estoy bien, gracias.",
            "Estoy bien, muchas gracias."
          ]
        }
      },
      {
        id: 7,
        english: "What's your name?",
        translation: "¿Cómo te llamas?",
        pronunciation: "KOH-moh te YAH-mas",
        meaning: "Used to ask someone's name.",
        tip:
          "Speak slowly and clearly when introducing yourself to someone new.",
        explanation: {
          title: "Understanding 'What's your name?'",
          content:
            "This is one of the most common questions used when meeting someone for the first time.",
          grammar:
            "Llamas comes from the reflexive verb llamarse, meaning 'to be called'.",
          culture:
            "People usually ask this after greeting each other.",
          whenToUse: [
            "Meeting classmates",
            "Meeting coworkers",
            "Making new friends"
          ],
          examples: [
            "¿Cómo te llamas?",
            "Hola, ¿cómo te llamas?"
          ]
        }
      },
      {
        id: 8,
        english: "My name is John.",
        translation: "Me llamo Juan.",
        pronunciation: "Me YAH-mo HWAN",
        meaning: "Used to introduce yourself.",
        tip:
          "Replace 'Juan' with your own name when speaking.",
        explanation: {
          title: "Understanding 'My name is...'",
          content:
            "Me llamo literally means 'I call myself' but is naturally translated as 'My name is'.",
          grammar:
            "Me is a reflexive pronoun while llamo is the first-person form of llamarse.",
          culture:
            "It is one of the most common self-introductions in Spanish-speaking countries.",
          whenToUse: [
            "Introducing yourself",
            "Starting conversations",
            "Meeting new people"
          ],
          examples: [
            "Me llamo Carlos.",
            "Hola, me llamo Ana."
          ]
        }
      },
      {
        id: 9,
        english: "Nice to meet you.",
        translation: "Mucho gusto.",
        pronunciation: "MOO-cho GOOS-to",
        meaning: "A polite expression after introductions.",
        tip:
          "Smile and maintain eye contact when saying this phrase.",
        explanation: {
          title: "Understanding 'Nice to meet you.'",
          content:
            "Mucho gusto is one of the most common expressions used after meeting someone for the first time.",
          grammar:
            "Mucho means 'much' while gusto means 'pleasure'.",
          culture:
            "A handshake often accompanies this expression in formal situations.",
          whenToUse: [
            "Business meetings",
            "Meeting classmates",
            "Social events"
          ],
          examples: [
            "Mucho gusto.",
            "Mucho gusto en conocerle."
          ]
        }
      },
      {
        id: 10,
        english: "See you later.",
        translation: "Hasta luego.",
        pronunciation: "AS-ta loo-EH-go",
        meaning: "A friendly way to say goodbye.",
        tip:
          "Use this when you expect to see the person again.",
        explanation: {
          title: "Understanding 'See you later.'",
          content:
            "Hasta luego is a very common farewell used in both formal and informal situations.",
          grammar:
            "Hasta means 'until' while luego means 'later'.",
          culture:
            "It doesn't necessarily mean you'll meet later today—it simply expresses that you'll see each other again.",
          whenToUse: [
            "Leaving work",
            "Leaving school",
            "Ending a conversation"
          ],
          examples: [
            "Hasta luego.",
            "Hasta luego, nos vemos mañana."
          ]
        }
      },
      {
        id: 101,
        english: "Where is the airport?",
        translation: "¿Dónde está el aeropuerto?",
        pronunciation: "DON-de es-TA el ah-eh-ro-PWER-to",
        meaning: "Used when asking for the location of the airport.",
        tip:
          "Speak clearly and politely when asking for directions.",
        explanation: {
          title: "Finding the Airport",
          content:
            "This phrase is commonly used when travelling and you need directions to the airport.",
          grammar:
            "Dónde means 'where', está means 'is', and aeropuerto means 'airport'.",
          culture:
            "Locals usually respond with directions or point you toward public transport.",
          whenToUse: [
            "Asking locals",
            "Taking a taxi",
            "Walking in a city"
          ],
          examples: [
            "¿Dónde está el aeropuerto?",
            "Disculpe, ¿dónde está el aeropuerto?"
          ]
        }
      },
      {
        id: 102,
        english: "I need a taxi.",
        translation: "Necesito un taxi.",
        pronunciation: "Ne-se-SEE-to oon TAK-see",
        meaning: "Used when requesting transportation.",
        tip:
          "Use this phrase at hotels, airports and train stations.",
        explanation: {
          title: "Requesting Transportation",
          content:
            "This is one of the most useful travel expressions for getting around.",
          grammar:
            "Necesito means 'I need'. Un is the article 'a'.",
          culture:
            "In many cities, hotel staff can help arrange taxis for visitors.",
          whenToUse: [
            "Leaving the airport",
            "Going to a hotel",
            "Travelling around town"
          ],
          examples: [
            "Necesito un taxi.",
            "Necesito un taxi al hotel."
          ]
        }
      },
      {
        id: 103,
        english: "How much is the ticket?",
        translation: "¿Cuánto cuesta el boleto?",
        pronunciation: "KWAN-to KWES-ta el bo-LE-to",
        meaning: "Used when asking for the price of a ticket.",
        tip:
          "Point to the ticket if pronunciation is difficult.",
        explanation: {
          title: "Asking About Prices",
          content:
            "Use this phrase before buying tickets for buses, trains or attractions.",
          grammar:
            "Cuánto means 'how much', cuesta means 'costs'.",
          culture:
            "Prices are usually fixed in airports and train stations.",
          whenToUse: [
            "Buying bus tickets",
            "Buying train tickets",
            "Tourist attractions"
          ],
          examples: [
            "¿Cuánto cuesta el boleto?",
            "¿Cuánto cuesta un boleto?"
          ]
        }
      },
      {
        id: 104,
        english: "Where is the train station?",
        translation: "¿Dónde está la estación de tren?",
        pronunciation: "DON-de es-TA la es-ta-SYON de tren",
        meaning: "Used when looking for the railway station.",
        tip:
          "Practice the word estación because you'll hear it often while travelling.",
        explanation: {
          title: "Finding the Train Station",
          content:
            "A useful phrase whenever you're travelling by rail.",
          grammar:
            "Estación means 'station' and tren means 'train'.",
          culture:
            "Large cities usually have more than one train station.",
          whenToUse: [
            "Travelling by train",
            "Asking for directions",
            "Public transport"
          ],
          examples: [
            "¿Dónde está la estación de tren?",
            "Busco la estación de tren."
          ]
        }
      },
      {
        id: 105,
        english: "Can you help me?",
        translation: "¿Puede ayudarme?",
        pronunciation: "PWE-de ah-yoo-DAR-me",
        meaning: "A polite request for assistance.",
        tip:
          "Remain calm and polite when asking for help.",
        explanation: {
          title: "Requesting Help",
          content:
            "This phrase is useful whenever you need assistance while travelling.",
          grammar:
            "Puede means 'can you' and ayudarme means 'help me'.",
          culture:
            "Most people appreciate being asked politely before offering assistance.",
          whenToUse: [
            "Lost in a city",
            "Airport assistance",
            "Hotel reception"
          ],
          examples: [
            "¿Puede ayudarme?",
            "Disculpe, ¿puede ayudarme?"
          ]
        }
      },
      {
        id: 106,
        english: "Where is my hotel?",
        translation: "¿Dónde está mi hotel?",
        pronunciation: "DON-de es-TA mee oh-TEL",
        meaning: "Used when asking for directions to your hotel.",
        tip:
          "Show the hotel address on your phone if needed to make communication easier.",
        explanation: {
          title: "Finding Your Hotel",
          content:
            "This phrase is useful after arriving in a new city when you need help locating your accommodation.",
          grammar:
            "Mi means 'my' and hotel remains the same in Spanish.",
          culture:
            "Taxi drivers and locals usually recognize popular hotels by name.",
          whenToUse: [
            "After arriving at the airport",
            "Walking in the city",
            "Asking a taxi driver"
          ],
          examples: [
            "¿Dónde está mi hotel?",
            "Disculpe, ¿dónde está mi hotel?"
          ]
        }
      },
      {
        id: 107,
        english: "I have a reservation.",
        translation: "Tengo una reserva.",
        pronunciation: "TEN-go OO-na reh-SER-va",
        meaning: "Used when checking into a hotel or confirming a booking.",
        tip:
          "Have your booking confirmation ready while saying this phrase.",
        explanation: {
          title: "Confirming Your Booking",
          content:
            "This is one of the first phrases you'll use when arriving at a hotel.",
          grammar:
            "Tengo means 'I have' while reserva means 'reservation'.",
          culture:
            "Receptionists often ask for your passport immediately after this.",
          whenToUse: [
            "Hotel check-in",
            "Restaurant booking",
            "Tour reservations"
          ],
          examples: [
            "Tengo una reserva.",
            "Tengo una reserva a nombre de David."
          ]
        }
      },
      {
        id: 108,
        english: "Where is the restroom?",
        translation: "¿Dónde está el baño?",
        pronunciation: "DON-de es-TA el BAN-yo",
        meaning: "Used when asking for the restroom.",
        tip:
          "This is one of the most useful travel phrases—memorize it well.",
        explanation: {
          title: "Finding the Restroom",
          content:
            "Use this phrase in airports, restaurants, shopping malls and hotels.",
          grammar:
            "Baño means 'bathroom' or 'restroom'.",
          culture:
            "Many public places display signs, but asking politely is perfectly acceptable.",
          whenToUse: [
            "Restaurants",
            "Shopping malls",
            "Airports"
          ],
          examples: [
            "¿Dónde está el baño?",
            "Perdón, ¿dónde está el baño?"
          ]
        }
      },
      {
        id: 109,
        english: "I am lost.",
        translation: "Estoy perdido.",
        pronunciation: "Es-TOY per-DEE-do",
        meaning: "Used when you don't know where you are.",
        tip:
          "Stay calm and combine this phrase with your destination if possible.",
        explanation: {
          title: "When You're Lost",
          content:
            "This phrase helps locals immediately understand that you need directions.",
          grammar:
            "Estoy means 'I am' and perdido means 'lost'.",
          culture:
            "People are generally willing to help tourists who ask politely.",
          whenToUse: [
            "Walking in an unfamiliar city",
            "Looking for a destination",
            "Needing directions"
          ],
          examples: [
            "Estoy perdido.",
            "Estoy perdido. ¿Puede ayudarme?"
          ]
        }
      },
      {
        id: 110,
        english: "Thank you very much.",
        translation: "Muchas gracias.",
        pronunciation: "MOO-chas GRAH-see-as",
        meaning: "A polite way to express gratitude.",
        tip:
          "Use this often while travelling. Politeness leaves a great impression.",
        explanation: {
          title: "Expressing Gratitude",
          content:
            "Muchas gracias is one of the most common and important polite expressions in Spanish.",
          grammar:
            "Muchas means 'many' and gracias means 'thanks'. Together they mean 'Thank you very much.'",
          culture:
            "People appreciate visitors who make an effort to speak their language politely.",
          whenToUse: [
            "After receiving directions",
            "After hotel service",
            "After buying something",
            "Ending conversations"
          ],
          examples: [
            "Muchas gracias.",
            "Muchas gracias por su ayuda."
          ]
        }
      }
    ]
  },
  {
    id: "food",
    title: "Food & Restaurant",
    icon: "🍽️",
    description:
      "Useful phrases for ordering food, asking about meals and communicating in restaurants.",
    phrases: [
      {
        id: 201,
        english: "Can I see the menu?",
        translation: "¿Puedo ver el menú?",
        pronunciation: "PWEH-do ver el meh-NOO",
        meaning:
          "A polite way to ask for the restaurant menu.",
        tip:
          "Always begin with a smile. This is one of the first phrases you'll use after sitting down.",
        explanation: {
          title: "Requesting the Menu",
          content:
            "Use this phrase when you would like to look at the food or drink options before ordering.",
          grammar:
            "Puedo means 'I can', ver means 'to see', and menú means 'menu'.",
          culture:
            "In many Spanish-speaking countries, the waiter may automatically bring the menu, but asking politely is perfectly acceptable.",
          whenToUse: [
            "Entering a restaurant",
            "Choosing your meal",
            "Ordering food"
          ],
          examples: [
            "¿Puedo ver el menú?",
            "Disculpe, ¿puedo ver el menú?"
          ]
        }
      },
      {
        id: 202,
        english: "I would like to order.",
        translation: "Me gustaría pedir.",
        pronunciation: "Me gus-ta-REE-ah peh-DEER",
        meaning:
          "A polite way to begin placing your order.",
        tip:
          "Pause briefly after saying it before mentioning the food you want.",
        explanation: {
          title: "Starting Your Order",
          content:
            "This expression lets the waiter know you're ready to order your meal.",
          grammar:
            "Me gustaría means 'I would like' while pedir means 'to order'.",
          culture:
            "Being polite while ordering is appreciated in restaurants.",
          whenToUse: [
            "Ordering lunch",
            "Ordering dinner",
            "Ordering drinks"
          ],
          examples: [
            "Me gustaría pedir una pizza.",
            "Me gustaría pedir café."
          ]
        }
      },
      {
        id: 203,
        english: "I would like this.",
        translation: "Quiero esto.",
        pronunciation: "KYEH-ro ES-to",
        meaning:
          "Used when pointing to something on the menu.",
        tip:
          "Pointing at the menu while saying this makes communication easier.",
        explanation: {
          title: "Choosing a Meal",
          content:
            "If you don't know the pronunciation of the dish, simply point at it while saying this phrase.",
          grammar:
            "Quiero means 'I want' while esto means 'this'.",
          culture:
            "Many tourists use this phrase successfully even with limited vocabulary.",
          whenToUse: [
            "Ordering unfamiliar food",
            "Fast food restaurants",
            "Cafés"
          ],
          examples: [
            "Quiero esto.",
            "Quiero esta bebida."
          ]
        }
      },
      {
        id: 204,
        english: "The food is delicious.",
        translation: "La comida está deliciosa.",
        pronunciation: "La koh-MEE-da es-TA deh-lee-see-OH-sa",
        meaning:
          "A compliment to the chef or restaurant.",
        tip:
          "Say it sincerely—it often brings a smile to the staff.",
        explanation: {
          title: "Complimenting the Food",
          content:
            "This phrase expresses that you really enjoyed your meal.",
          grammar:
            "Comida means 'food' while deliciosa means 'delicious'.",
          culture:
            "Restaurant staff appreciate compliments and may thank you warmly.",
          whenToUse: [
            "After eating",
            "Speaking to the chef",
            "Complimenting a host"
          ],
          examples: [
            "La comida está deliciosa.",
            "Muchas gracias, la comida está deliciosa."
          ]
        }
      },
      {
        id: 205,
        english: "Can I have some water?",
        translation: "¿Me puede traer agua?",
        pronunciation: "Meh PWEH-de trah-ER AH-gwa",
        meaning:
          "A polite request for water.",
        tip:
          "This phrase works in almost every restaurant.",
        explanation: {
          title: "Requesting Water",
          content:
            "Use this when you want the waiter to bring you water.",
          grammar:
            "Traer means 'to bring' while agua means 'water'.",
          culture:
            "Some countries serve bottled water by default, while others provide tap water only if requested.",
          whenToUse: [
            "Before eating",
            "During meals",
            "While waiting for food"
          ],
          examples: [
            "¿Me puede traer agua?",
            "Agua, por favor."
          ]
        }
      },
      {
        id: 206,
        english: "Can I have the bill, please?",
        translation: "La cuenta, por favor.",
        pronunciation: "La KWEN-ta por fah-VOR",
        meaning:
          "Used when you're ready to pay for your meal.",
        tip:
          "Make eye contact with the waiter before saying this phrase.",
        explanation: {
          title: "Asking for the Bill",
          content:
            "This is the standard way to request the check after finishing your meal.",
          grammar:
            "La cuenta means 'the bill' or 'the check' while por favor means 'please'.",
          culture:
            "In many Spanish-speaking countries, the bill isn't brought automatically—you usually have to ask for it.",
          whenToUse: [
            "After finishing your meal",
            "Before leaving the restaurant",
            "When ready to pay"
          ],
          examples: [
            "La cuenta, por favor.",
            "¿Me trae la cuenta, por favor?"
          ]
        }
      },
      {
        id: 207,
        english: "I am vegetarian.",
        translation: "Soy vegetariano.",
        pronunciation: "Soy veh-heh-tah-ree-AH-no",
        meaning:
          "Used to tell the waiter that you don't eat meat.",
        tip:
          "Mention this before ordering so suitable meals can be recommended.",
        explanation: {
          title: "Dietary Preference",
          content:
            "This phrase helps restaurant staff recommend vegetarian dishes.",
          grammar:
            "Soy means 'I am' while vegetariano means 'vegetarian'.",
          culture:
            "Many restaurants now provide vegetarian options, especially in cities.",
          whenToUse: [
            "Ordering food",
            "Explaining dietary needs",
            "Asking for recommendations"
          ],
          examples: [
            "Soy vegetariano.",
            "Soy vegetariano. ¿Qué recomienda?"
          ]
        }
      },
      {
        id: 208,
        english: "This is too spicy.",
        translation: "Está muy picante.",
        pronunciation: "Es-TA MOO-ee pee-KAN-te",
        meaning:
          "Used when food is hotter than expected.",
        tip:
          "Say it politely if you'd like a milder meal next time.",
        explanation: {
          title: "Talking About Spicy Food",
          content:
            "This phrase tells the waiter the food is very spicy.",
          grammar:
            "Muy means 'very' while picante means 'spicy'.",
          culture:
            "Different countries have different spice levels, so this phrase is very useful.",
          whenToUse: [
            "During a meal",
            "Requesting a replacement",
            "Giving feedback"
          ],
          examples: [
            "Está muy picante.",
            "La comida está muy picante."
          ]
        }
      },
      {
        id: 209,
        english: "Do you have dessert?",
        translation: "¿Tiene postre?",
        pronunciation: "TEE-eh-neh pos-TREH",
        meaning:
          "Used when asking whether desserts are available.",
        tip:
          "Many restaurants have a separate dessert menu after the main meal.",
        explanation: {
          title: "Ordering Dessert",
          content:
            "Use this phrase if you'd like something sweet after your meal.",
          grammar:
            "Tiene means 'do you have' while postre means 'dessert'.",
          culture:
            "Desserts vary widely across Spanish-speaking countries and are worth trying.",
          whenToUse: [
            "After the main course",
            "At cafés",
            "In restaurants"
          ],
          examples: [
            "¿Tiene postre?",
            "¿Qué postre recomienda?"
          ]
        }
      },
      {
        id: 210,
        english: "Everything was excellent.",
        translation: "Todo estuvo excelente.",
        pronunciation: "TOH-do es-TOO-vo ex-seh-LEN-te",
        meaning:
          "A compliment after enjoying your meal.",
        tip:
          "Restaurant staff appreciate sincere compliments before you leave.",
        explanation: {
          title: "Complimenting the Restaurant",
          content:
            "This phrase lets the staff know that you enjoyed the food and service.",
          grammar:
            "Todo means 'everything' while excelente means 'excellent'.",
          culture:
            "Complimenting the staff is considered polite and friendly.",
          whenToUse: [
            "Before paying",
            "Speaking to the waiter",
            "Thanking the restaurant"
          ],
          examples: [
            "Todo estuvo excelente.",
            "Muchas gracias. Todo estuvo excelente."
          ]
        }
      }
    ]
  },
  {
    id: "shopping",
    title: "Shopping",
    icon: "🛍️",
    description:
      "Essential phrases for buying products, negotiating prices, asking about sizes, and shopping with confidence.",
    phrases: [
      {
        id: 301,
        english: "How much is this?",
        translation: "¿Cuánto cuesta esto?",
        pronunciation: "KWAN-to KWES-ta ES-to",
        meaning:
          "Used to ask the price of an item.",
        tip:
          "Point at the product while asking to avoid confusion.",
        explanation: {
          title: "Asking the Price",
          content:
            "This is one of the most common shopping phrases and helps you know how much an item costs before buying it.",
          grammar:
            "Cuánto means 'how much', cuesta means 'costs', and esto means 'this'.",
          culture:
            "In local markets, asking the price is often the first step before negotiating.",
          whenToUse: [
            "Markets",
            "Shopping malls",
            "Street vendors",
            "Gift shops"
          ],
          examples: [
            "¿Cuánto cuesta esto?",
            "Disculpe, ¿cuánto cuesta esto?"
          ]
        }
      },
      {
        id: 302,
        english: "Do you have this in another size?",
        translation: "¿Tiene otra talla?",
        pronunciation: "TEE-eh-neh OH-tra TAH-ya",
        meaning:
          "Used when asking for another clothing size.",
        tip:
          "Useful when shopping for clothes or shoes.",
        explanation: {
          title: "Requesting Another Size",
          content:
            "Ask this if the item is too small or too large.",
          grammar:
            "Otra means 'another' while talla means 'size'.",
          culture:
            "Store assistants are usually happy to check available sizes.",
          whenToUse: [
            "Clothing stores",
            "Shoe shops",
            "Fashion boutiques"
          ],
          examples: [
            "¿Tiene otra talla?",
            "Necesito una talla más grande."
          ]
        }
      },
      {
        id: 303,
        english: "Can I try it on?",
        translation: "¿Puedo probármelo?",
        pronunciation: "PWEH-do pro-BAR-me-lo",
        meaning:
          "Used before trying on clothes.",
        tip:
          "Most clothing stores provide fitting rooms.",
        explanation: {
          title: "Trying Clothes On",
          content:
            "Use this before entering the fitting room.",
          grammar:
            "Puedo means 'can I' while probar means 'to try'.",
          culture:
            "Some stores may limit the number of items you can try at once.",
          whenToUse: [
            "Clothing stores",
            "Boutiques",
            "Fashion outlets"
          ],
          examples: [
            "¿Puedo probármelo?",
            "¿Dónde está el probador?"
          ]
        }
      },
      {
      id: 304,
      english: "I'll take it.",
      translation: "Me lo llevo.",
      pronunciation: "Me lo YEH-vo",
      meaning:
        "Used when you've decided to buy something.",
      tip:
        "Say this confidently when you're ready to pay.",
      explanation: {
        title: "Buying the Item",
        content:
          "This phrase tells the salesperson you've made your decision.",
        grammar:
          "Llevo literally means 'I take'.",
        culture:
          "It's a natural expression commonly used by native speakers.",
        whenToUse: [
          "After choosing an item",
          "At the checkout",
          "Completing a purchase"
        ],
        examples: [
          "Me lo llevo.",
          "Sí, me lo llevo."
        ]
      }
    },

    {
      id: 305,
      english: "Can I pay by card?",
      translation: "¿Puedo pagar con tarjeta?",
      pronunciation: "PWEH-do pa-GAR kon tar-HE-ta",
      meaning:
        "Used to ask whether card payments are accepted.",
      tip:
        "Ask before reaching the cashier if you're unsure.",
      explanation: {
        title: "Paying by Card",
        content:
          "This phrase helps you know if debit or credit cards are accepted.",
        grammar:
          "Pagar means 'to pay' while tarjeta means 'card'.",
        culture:
          "Some small shops still accept cash only.",
        whenToUse: [
          "Retail stores",
          "Restaurants",
          "Supermarkets"
        ],
        examples: [
          "¿Puedo pagar con tarjeta?",
          "¿Aceptan tarjetas?"
        ]
      }
    },
        {
      id: 306,
      english: "Can I pay with cash?",
      translation: "¿Puedo pagar en efectivo?",
      pronunciation: "PWEH-do pa-GAR en eh-fek-TEE-vo",
      meaning:
        "Used to ask if cash payment is accepted.",
      tip:
        "Useful in local markets where cards may not be accepted.",
      explanation: {
        title: "Paying with Cash",
        content:
          "This phrase lets the cashier know that you would like to pay using physical money instead of a card.",
        grammar:
          "Efectivo means 'cash' while pagar means 'to pay'.",
        culture:
          "Many local shops and markets still prefer cash payments.",
        whenToUse: [
          "Markets",
          "Small stores",
          "Street vendors",
          "Gift shops"
        ],
        examples: [
          "¿Puedo pagar en efectivo?",
          "Voy a pagar en efectivo."
        ]
      }
    },

    {
      id: 307,
      english: "Is there a discount?",
      translation: "¿Hay descuento?",
      pronunciation: "Eye des-KWEN-to",
      meaning:
        "Used when asking whether the price can be reduced.",
      tip:
        "Ask politely, especially in markets where bargaining is common.",
      explanation: {
        title: "Requesting a Discount",
        content:
          "This phrase is useful when shopping in places where negotiation is accepted.",
        grammar:
          "Hay means 'there is' while descuento means 'discount'.",
        culture:
          "Negotiating prices is common in many open-air markets but not usually in supermarkets.",
        whenToUse: [
          "Local markets",
          "Souvenir shops",
          "Clothing stores"
        ],
        examples: [
          "¿Hay descuento?",
          "¿Puede hacer un descuento?"
        ]
      }
    },

    {
      id: 308,
      english: "I'm just looking.",
      translation: "Solo estoy mirando.",
      pronunciation: "SO-lo es-TOY mee-RAHN-do",
      meaning:
        "Used when you don't need assistance while shopping.",
      tip:
        "A polite response when a salesperson offers help.",
      explanation: {
        title: "Browsing the Store",
        content:
          "This phrase lets staff know you're only looking around for now.",
        grammar:
          "Mirando means 'looking' while solo means 'just'.",
        culture:
          "Sales assistants often greet customers immediately, so this response is very common.",
        whenToUse: [
          "Shopping malls",
          "Fashion stores",
          "Bookshops",
          "Electronics stores"
        ],
        examples: [
          "Solo estoy mirando.",
          "Gracias, solo estoy mirando."
        ]
      }
    },

    {
      id: 309,
      english: "Where is the checkout?",
      translation: "¿Dónde está la caja?",
      pronunciation: "DON-de es-TA la KA-ha",
      meaning:
        "Used when looking for the payment counter.",
      tip:
        "Helpful in supermarkets and large department stores.",
      explanation: {
        title: "Finding the Checkout",
        content:
          "Use this phrase when you're ready to pay and need directions to the cashier.",
        grammar:
          "Caja means 'cash register' or 'checkout'.",
        culture:
          "Large stores often have several checkout counters.",
        whenToUse: [
          "Supermarkets",
          "Shopping malls",
          "Department stores"
        ],
        examples: [
          "¿Dónde está la caja?",
          "Disculpe, ¿dónde está la caja?"
        ]
      }
    },

    {
      id: 310,
      english: "Thank you, have a nice day.",
      translation: "Gracias, que tenga un buen día.",
      pronunciation: "GRA-see-as keh TEN-ga oon bwen DEE-ah",
      meaning:
        "A polite way to end a shopping conversation.",
      tip:
        "Always leave with a smile—it creates a friendly interaction.",
      explanation: {
        title: "Ending Your Purchase Politely",
        content:
          "This phrase is commonly used after paying or receiving assistance.",
        grammar:
          "Que tenga means 'have' while buen día means 'a good day'.",
        culture:
          "Ending conversations politely is appreciated throughout Spanish-speaking countries.",
        whenToUse: [
          "Leaving a shop",
          "After paying",
          "Thanking a cashier"
        ],
        examples: [
          "Gracias, que tenga un buen día.",
          "Muchas gracias, que tenga un buen día."
        ]
      }
    },
    {
  id: "school",
  title: "School",
  icon: "🎓",
  description:
    "Useful classroom phrases for students and teachers.",
  phrases: [

    {
      id: 401,
      english: "Where is the classroom?",
      translation: "¿Dónde está el salón de clases?",
      pronunciation: "DON-de es-TA el sa-LON de CLA-ses",
      meaning:
        "Used to ask where your classroom is located.",
      tip:
        "Very useful on your first day at school.",
      explanation: {
        title: "Finding Your Classroom",
        content:
          "Ask this question whenever you're trying to locate your assigned classroom.",
        grammar:
          "Salón de clases means 'classroom'.",
        culture:
          "Most schools have signs, but asking politely is common.",
        whenToUse: [
          "First day of school",
          "New semester",
          "Campus orientation"
        ],
        examples: [
          "¿Dónde está el salón de clases?",
          "Perdón, ¿dónde está mi salón?"
        ]
      }
    },

    {
      id: 402,
      english: "May I come in?",
      translation: "¿Puedo entrar?",
      pronunciation: "PWEH-do en-TRAR",
      meaning:
        "Used when asking permission to enter a classroom.",
      tip:
        "Always ask politely if you arrive late.",
      explanation: {
        title: "Entering the Classroom",
        content:
          "Students commonly use this phrase when the lesson has already started.",
        grammar:
          "Puedo means 'may I' while entrar means 'to enter'.",
        culture:
          "Respecting the teacher by asking permission is considered polite.",
        whenToUse: [
          "Late arrival",
          "Returning after break",
          "Entering a lecture hall"
        ],
        examples: [
          "¿Puedo entrar?",
          "Buenos días, ¿puedo entrar?"
        ]
      }
    },

    {
      id: 403,
      english: "I don't understand.",
      translation: "No entiendo.",
      pronunciation: "NO en-TYEN-do",
      meaning:
        "Used when something isn't clear.",
      tip:
        "Never hesitate to ask for clarification.",
      explanation: {
        title: "Asking for Clarification",
        content:
          "This phrase tells the teacher you need more explanation.",
        grammar:
          "Entiendo comes from entender, meaning 'to understand'.",
        culture:
          "Teachers appreciate students asking questions.",
        whenToUse: [
          "Class lessons",
          "Tutorials",
          "Group study"
        ],
        examples: [
          "No entiendo.",
          "Lo siento, no entiendo."
        ]
      }
    },

    {
      id: 404,
      english: "Can you repeat that?",
      translation: "¿Puede repetir eso?",
      pronunciation: "PWEH-de reh-pe-TEER EH-so",
      meaning:
        "Used when you need someone to say something again.",
      tip:
        "Very useful during lectures.",
      explanation: {
        title: "Requesting Repetition",
        content:
          "Ask this whenever you didn't hear or understand the explanation.",
        grammar:
          "Repetir means 'to repeat'.",
        culture:
          "Teachers are usually happy to repeat important information.",
        whenToUse: [
          "Classroom",
          "Lectures",
          "Language lessons"
        ],
        examples: [
          "¿Puede repetir eso?",
          "¿Puede repetir la pregunta?"
        ]
      }
    },

    {
      id: 405,
      english: "Can you help me?",
      translation: "¿Puede ayudarme?",
      pronunciation: "PWEH-de ah-yoo-DAR-me",
      meaning:
        "Used when asking for assistance.",
      tip:
        "Useful with teachers and classmates.",
      explanation: {
        title: "Requesting Help",
        content:
          "A polite way to ask someone for assistance.",
        grammar:
          "Ayudar means 'to help'.",
        culture:
          "Working together is encouraged in many schools.",
        whenToUse: [
          "Homework",
          "Projects",
          "Assignments"
        ],
        examples: [
          "¿Puede ayudarme?",
          "¿Puedes ayudarme?"
        ]
      }
    },

    {
      id: 406,
      english: "What is the homework?",
      translation: "¿Cuál es la tarea?",
      pronunciation: "KWAHL es la ta-RE-ah",
      meaning:
        "Used to ask about today's assignment.",
      tip:
        "Helpful if you missed part of the lesson.",
      explanation: {
        title: "Homework Questions",
        content:
          "Students use this phrase to ask what work needs to be completed.",
        grammar:
          "Tarea means 'homework'.",
        culture:
          "Homework is usually assigned at the end of class.",
        whenToUse: [
          "After class",
          "Before leaving school"
        ],
        examples: [
          "¿Cuál es la tarea?",
          "Profesor, ¿cuál es la tarea?"
        ]
      }
    },

    {
      id: 407,
      english: "Can I borrow a pen?",
      translation: "¿Puedo pedir prestado un bolígrafo?",
      pronunciation: "PWEH-do pe-DEER pres-TA-do oon bo-LEE-gra-fo",
      meaning:
        "Used when you need a pen.",
      tip:
        "Remember to return borrowed items.",
      explanation: {
        title: "Borrowing Supplies",
        content:
          "A polite phrase for borrowing classroom materials.",
        grammar:
          "Pedir prestado means 'to borrow'.",
        culture:
          "Students often help each other with supplies.",
        whenToUse: [
          "Classroom",
          "Exams",
          "Study groups"
        ],
        examples: [
          "¿Puedo pedir prestado un bolígrafo?",
          "Gracias por el bolígrafo."
        ]
      }
    },

    {
      id: 408,
      english: "Where is the library?",
      translation: "¿Dónde está la biblioteca?",
      pronunciation: "DON-de es-TA la bee-blee-o-TE-ka",
      meaning:
        "Used when looking for the library.",
      tip:
        "Useful on a large campus.",
      explanation: {
        title: "Finding the Library",
        content:
          "Ask this when searching for the school's library.",
        grammar:
          "Biblioteca means 'library'.",
        culture:
          "Libraries are common study spaces in schools and universities.",
        whenToUse: [
          "Campus",
          "University",
          "School"
        ],
        examples: [
          "¿Dónde está la biblioteca?",
          "Necesito ir a la biblioteca."
        ]
      }
    },

    {
      id: 409,
      english: "I have a question.",
      translation: "Tengo una pregunta.",
      pronunciation: "TEN-go OO-na pre-GOON-ta",
      meaning:
        "Used before asking a question.",
      tip:
        "Raise your hand before speaking in class.",
      explanation: {
        title: "Asking Questions",
        content:
          "This phrase politely tells the teacher you'd like to ask something.",
        grammar:
          "Pregunta means 'question'.",
        culture:
          "Questions are encouraged in active learning environments.",
        whenToUse: [
          "Lessons",
          "Seminars",
          "Tutorials"
        ],
        examples: [
          "Tengo una pregunta.",
          "Profesor, tengo una pregunta."
        ]
      }
    },

    {
      id: 410,
      english: "Thank you, teacher.",
      translation: "Gracias, profesor.",
      pronunciation: "GRA-see-as pro-fe-SOR",
      meaning:
        "A respectful way to thank your teacher.",
      tip:
        "Simple appreciation builds good relationships.",
      explanation: {
        title: "Showing Appreciation",
        content:
          "Use this phrase after receiving help or finishing class.",
        grammar:
          "Profesor means 'teacher'.",
        culture:
          "Showing gratitude is considered respectful in schools.",
        whenToUse: [
          "After class",
          "Receiving help",
          "End of lesson"
        ],
        examples: [
          "Gracias, profesor.",
          "Muchas gracias, profesor."
        ]
      }
    }

  ]
},
    {
  id: "business",
  title: "Business",
  icon: "💼",
  description:
    "Professional phrases used in meetings, offices, interviews and workplace communication.",
  phrases: [

    {
      id: 501,
      english: "Good morning, everyone.",
      translation: "Buenos días a todos.",
      pronunciation: "BWEH-nos DEE-as ah TO-dos",
      meaning:
        "A professional greeting for meetings or presentations.",
      tip:
        "Use this to confidently begin meetings.",
      explanation: {
        title: "Starting a Meeting",
        content:
          "This greeting is commonly used when addressing colleagues or clients at the beginning of a meeting.",
        grammar:
          "A todos means 'to everyone'.",
        culture:
          "Professional greetings help create a positive first impression.",
        whenToUse: [
          "Meetings",
          "Presentations",
          "Office gatherings",
          "Conferences"
        ],
        examples: [
          "Buenos días a todos.",
          "Buenos días a todos, gracias por venir."
        ]
      }
    },

    {
      id: 502,
      english: "Nice to meet you.",
      translation: "Mucho gusto.",
      pronunciation: "MOO-cho GOOS-to",
      meaning:
        "Used when meeting someone for the first time.",
      tip:
        "Smile and offer a handshake if appropriate.",
      explanation: {
        title: "Professional Introductions",
        content:
          "This phrase is perfect for networking events, interviews and business meetings.",
        grammar:
          "Mucho gusto literally means 'much pleasure'.",
        culture:
          "Introductions are usually followed by a handshake in many workplaces.",
        whenToUse: [
          "Interviews",
          "Networking",
          "Client meetings",
          "Office introductions"
        ],
        examples: [
          "Mucho gusto.",
          "Mucho gusto conocerle."
        ]
      }
    },

    {
      id: 503,
      english: "Let's begin the meeting.",
      translation: "Comencemos la reunión.",
      pronunciation: "Ko-men-SE-mos la reh-oo-NYON",
      meaning:
        "Used to officially start a meeting.",
      tip:
        "Speak clearly and confidently.",
      explanation: {
        title: "Opening a Meeting",
        content:
          "Use this phrase when everyone has arrived and you're ready to start.",
        grammar:
          "Comencemos means 'let's begin'.",
        culture:
          "Business meetings often start on time.",
        whenToUse: [
          "Board meetings",
          "Team meetings",
          "Project discussions"
        ],
        examples: [
          "Comencemos la reunión.",
          "Bien, comencemos la reunión."
        ]
      }
    },

    {
      id: 504,
      english: "I have a question.",
      translation: "Tengo una pregunta.",
      pronunciation: "TEN-go OO-na pre-GOON-ta",
      meaning:
        "Politely indicates that you would like to ask something.",
      tip:
        "Wait until the speaker finishes before asking.",
      explanation: {
        title: "Asking Questions",
        content:
          "This phrase helps you participate respectfully during discussions.",
        grammar:
          "Pregunta means 'question'.",
        culture:
          "Professional discussions encourage thoughtful questions.",
        whenToUse: [
          "Meetings",
          "Presentations",
          "Training sessions"
        ],
        examples: [
          "Tengo una pregunta.",
          "Disculpe, tengo una pregunta."
        ]
      }
    },

    {
      id: 505,
      english: "Can you repeat that?",
      translation: "¿Puede repetir eso?",
      pronunciation: "PWEH-de reh-pe-TEER EH-so",
      meaning:
        "Used when you didn't clearly hear something.",
      tip:
        "A polite way to avoid misunderstandings.",
      explanation: {
        title: "Clarifying Information",
        content:
          "This phrase requests that the speaker repeats what they said.",
        grammar:
          "Repetir means 'to repeat'.",
        culture:
          "It's better to ask than misunderstand business information.",
        whenToUse: [
          "Meetings",
          "Phone calls",
          "Interviews"
        ],
        examples: [
          "¿Puede repetir eso?",
          "Lo siento, ¿puede repetir eso?"
        ]
      }
    },

    {
      id: 506,
      english: "I'll send you an email.",
      translation: "Le enviaré un correo electrónico.",
      pronunciation: "Le en-vee-ah-RE oon ko-RRE-o eh-lek-TRO-nee-ko",
      meaning:
        "Used to continue communication after a discussion.",
      tip:
        "Useful after meetings or negotiations.",
      explanation: {
        title: "Following Up",
        content:
          "A professional phrase used when promising additional information later.",
        grammar:
          "Enviaré means 'I will send'.",
        culture:
          "Email remains the standard business communication tool.",
        whenToUse: [
          "Meetings",
          "Sales",
          "Client follow-ups"
        ],
        examples: [
          "Le enviaré un correo electrónico.",
          "Hoy le enviaré un correo."
        ]
      }
    },

    {
      id: 507,
      english: "Thank you for your time.",
      translation: "Gracias por su tiempo.",
      pronunciation: "GRA-see-as por soo tee-EM-po",
      meaning:
        "A polite closing phrase after meetings.",
      tip:
        "Always end business conversations courteously.",
      explanation: {
        title: "Ending a Meeting",
        content:
          "This expression shows appreciation for someone's attention and availability.",
        grammar:
          "Su tiempo means 'your time'.",
        culture:
          "Respecting people's time is highly valued professionally.",
        whenToUse: [
          "Interviews",
          "Meetings",
          "Presentations"
        ],
        examples: [
          "Gracias por su tiempo.",
          "Muchas gracias por su tiempo."
        ]
      }
    },

    {
      id: 508,
      english: "I agree.",
      translation: "Estoy de acuerdo.",
      pronunciation: "Es-TOY de ah-KWER-do",
      meaning:
        "Shows that you support someone's opinion.",
      tip:
        "Useful during discussions and negotiations.",
      explanation: {
        title: "Expressing Agreement",
        content:
          "This phrase politely indicates that you share the same opinion.",
        grammar:
          "De acuerdo means 'in agreement'.",
        culture:
          "Agreement is often followed by additional explanation.",
        whenToUse: [
          "Meetings",
          "Negotiations",
          "Brainstorming"
        ],
        examples: [
          "Estoy de acuerdo.",
          "Sí, estoy de acuerdo."
        ]
      }
    },

    {
      id: 509,
      english: "I don't agree.",
      translation: "No estoy de acuerdo.",
      pronunciation: "No es-TOY de ah-KWER-do",
      meaning:
        "Politely expresses disagreement.",
      tip:
        "Remain respectful when disagreeing.",
      explanation: {
        title: "Professional Disagreement",
        content:
          "Use this phrase to express a different opinion without sounding rude.",
        grammar:
          "Adding No changes the meaning to disagreement.",
        culture:
          "Professional disagreements should remain respectful.",
        whenToUse: [
          "Meetings",
          "Negotiations",
          "Project reviews"
        ],
        examples: [
          "No estoy de acuerdo.",
          "Lo siento, no estoy de acuerdo."
        ]
      }
    },

    {
      id: 510,
      english: "Have a great day.",
      translation: "Que tenga un excelente día.",
      pronunciation: "Ke TEN-ga oon ek-se-LEN-te DEE-a",
      meaning:
        "A polite farewell used in professional settings.",
      tip:
        "Finish every business conversation positively.",
      explanation: {
        title: "Professional Goodbye",
        content:
          "This phrase leaves a warm and respectful final impression.",
        grammar:
          "Que tenga means 'have'.",
        culture:
          "Ending conversations politely strengthens professional relationships.",
        whenToUse: [
          "Leaving the office",
          "Ending meetings",
          "Client conversations",
          "Phone calls"
        ],
        examples: [
          "Que tenga un excelente día.",
          "Muchas gracias, que tenga un excelente día."
        ]
      }
    }
  ]
  
},
 {
  id: "hospital",
  title: "Hospital",
  icon: "🏥",
  description:
    "Essential medical phrases for hospitals, clinics and emergencies.",
  phrases: [
    {
      id: 601,
      english: "I need a doctor.",
      translation: "Necesito un médico.",
      pronunciation: "Ne-se-SEE-to oon MEH-dee-ko",
      meaning:
        "Used when requesting medical assistance.",
      tip:
        "Say this immediately in an emergency.",
      explanation: {
        title: "Requesting Medical Help",
        content:
          "This phrase lets people know you require a doctor as soon as possible.",
        grammar:
          "Necesito means 'I need' while médico means 'doctor'.",
        culture:
          "Hospital staff respond quickly when hearing this phrase.",
        whenToUse: [
          "Hospital",
          "Clinic",
          "Emergency room",
          "Medical center"
        ],
        examples: [
          "Necesito un médico.",
          "Por favor, necesito un médico."
        ]
      }
      
    }

  ]
  
},
{
  id: 706,
  english: "Where is the customs area?",
  translation: "¿Dónde está la zona de aduanas?",
  pronunciation: "DON-de es-TA la SO-na de a-dwa-nas",
  meaning:
    "Used when looking for customs after arriving in a foreign country.",
  tip:
    "Follow signs for 'Aduanas' or 'Customs' after baggage claim.",
  explanation: {
    title: "Finding Customs",
    content:
      "This phrase helps travelers locate the customs inspection area after collecting their luggage.",
    grammar:
      "Zona means 'area' and aduanas means 'customs'.",
    culture:
      "International airports usually separate customs and immigration areas.",
    whenToUse: [
      "Arrival hall",
      "After baggage collection",
      "International arrivals"
    ],
    examples: [
      "¿Dónde está la zona de aduanas?",
      "Necesito pasar por aduanas."
    ]
  }
},

{
  id: 707,
  english: "Where can I declare my items?",
  translation: "¿Dónde puedo declarar mis artículos?",
  pronunciation: "DON-de PWEH-do de-kla-RAR mees ar-TEE-ku-los",
  meaning:
    "Used when you need to report goods to customs.",
  tip:
    "Declare expensive or restricted items before leaving customs.",
  explanation: {
    title: "Making a Customs Declaration",
    content:
      "This phrase helps you find the place where travelers declare goods they are bringing into a country.",
    grammar:
      "Declarar means 'to declare' and artículos means 'items or articles'.",
    culture:
      "Many countries require travelers to declare certain goods, money, or food products.",
    whenToUse: [
      "Customs checkpoint",
      "International arrival",
      "Border control"
    ],
    examples: [
      "¿Dónde puedo declarar mis artículos?",
      "Tengo algo que declarar."
    ]
  }
},

{
  id: 708,
  english: "Is this the right gate?",
  translation: "¿Es esta la puerta correcta?",
  pronunciation: "Es ES-ta la PWER-ta ko-REK-ta",
  meaning:
    "Used to confirm you are at the correct boarding gate.",
  tip:
    "Check your boarding pass and airport screens before boarding.",
  explanation: {
    title: "Confirming Your Gate",
    content:
      "This phrase helps travelers verify their departure gate before boarding.",
    grammar:
      "Puerta means 'door' but in airports it means 'gate'.",
    culture:
      "Gate numbers can change, so travelers should check display screens regularly.",
    whenToUse: [
      "Departure area",
      "Boarding gate",
      "Before boarding"
    ],
    examples: [
      "¿Es esta la puerta correcta?",
      "¿Este es el vuelo a Madrid?"
    ]
  }
},

{
  id: 709,
  english: "What time does boarding start?",
  translation: "¿A qué hora empieza el embarque?",
  pronunciation: "A KE O-ra em-PYE-sa el em-BAR-ke",
  meaning:
    "Used to ask when passengers can begin boarding the plane.",
  tip:
    "Arrive at the gate early because boarding may close before departure.",
  explanation: {
    title: "Asking About Boarding Time",
    content:
      "This phrase helps you know when passengers are allowed to enter the aircraft.",
    grammar:
      "A qué hora means 'at what time' and embarque means 'boarding'.",
    culture:
      "Many airlines begin boarding 30–45 minutes before departure.",
    whenToUse: [
      "Departure gate",
      "Airport announcements",
      "Before flight"
    ],
    examples: [
      "¿A qué hora empieza el embarque?",
      "¿Cuándo empieza el abordaje?"
    ]
  }
},

{
  id: 710,
  english: "My flight has been delayed.",
  translation: "Mi vuelo se ha retrasado.",
  pronunciation: "Mee BWEH-lo se a reh-tra-SA-do",
  meaning:
    "Used when informing someone that your flight is late.",
  tip:
    "Check airline updates for the new departure time.",
  explanation: {
    title: "Flight Delay",
    content:
      "This phrase helps you explain that your scheduled flight will leave later than planned.",
    grammar:
      "Vuelo means 'flight' and retrasado means 'delayed'.",
    culture:
      "Airports usually announce delays through screens, apps, and speakers.",
    whenToUse: [
      "Airline desk",
      "Airport information desk",
      "Travel communication"
    ],
    examples: [
      "Mi vuelo se ha retrasado.",
      "¿Cuál es la nueva hora de salida?"
    ]

  }
  }
   
    ]
    
  }  
]