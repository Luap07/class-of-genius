export const phraseCategories = [
  {
    id: "greetings",
    title: "Greetings",
    icon: "👋",
    description:
      "Common greetings, introductions and polite expressions used every day.",
    phrases: [
      {
        id: 1,
        english: "Hello",
        translation: "Hola",
        pronunciation: "OH-lah",
        meaning: "A common greeting.",
        tip: "Use at any time of the day.",
        explanation: {
          title: "Greeting Someone",
          content:
            "Hola is the standard way to greet someone in Spanish.",
          grammar:
            "Hola is an interjection and does not change.",
          culture:
            "Used in both formal and informal situations.",
          whenToUse: [
            "Meeting someone",
            "Entering a room",
            "Answering the phone"
          ],
          examples: [
            "Hola, ¿cómo estás?",
            "Hola, mucho gusto."
          ]
        }
      },
      {
        id: 2,
        english: "Good morning",
        translation: "Buenos días",
        pronunciation: "BWEH-nos DEE-as",
        meaning: "A morning greeting.",
        tip: "Use until around noon.",
        explanation: {
          title: "Morning Greeting",
          content:
            "Buenos días is used to greet people before midday.",
          grammar:
            "Buenos means 'good' and días means 'days'.",
          culture:
            "Very common in schools and workplaces.",
          whenToUse: [
            "Morning",
            "School",
            "Office"
          ],
          examples: [
            "Buenos días.",
            "Buenos días, profesor."
          ]
        }
      },
      {
        id: 3,
        english: "Good afternoon",
        translation: "Buenas tardes",
        pronunciation: "BWEH-nas TAR-des",
        meaning: "An afternoon greeting.",
        tip: "Usually used after noon.",
        explanation: {
          title: "Afternoon Greeting",
          content:
            "Buenas tardes is used from midday until evening.",
          grammar:
            "Buenas agrees with tardes.",
          culture:
            "A respectful greeting.",
          whenToUse: [
            "Afternoon",
            "Business",
            "Visiting someone"
          ],
          examples: [
            "Buenas tardes.",
            "Buenas tardes, señora."
          ]
        }
      },
      {
        id: 4,
        english: "Good evening",
        translation: "Buenas noches",
        pronunciation: "BWEH-nas NO-ches",
        meaning: "Evening greeting or goodbye.",
        tip: "Also used before going to bed.",
        explanation: {
          title: "Evening Greeting",
          content:
            "Buenas noches is used in the evening and at night.",
          grammar:
            "Noches means 'nights'.",
          culture:
            "Can mean both hello and goodbye.",
          whenToUse: [
            "Evening",
            "Night",
            "Before sleeping"
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
        translation: "¿Cómo está?",
        pronunciation: "KO-mo es-TA",
        meaning: "A polite way to ask someone's wellbeing.",
        tip: "Use the formal version with strangers.",
        explanation: {
          title: "Checking on Someone",
          content:
            "This phrase politely asks how someone is doing.",
          grammar:
            "Cómo means 'how'.",
          culture:
            "Often followed by a handshake.",
          whenToUse: [
            "Meeting someone",
            "Business",
            "Formal conversation"
          ],
          examples: [
            "¿Cómo está?",
            "Hola, ¿cómo está?"
          ]
        }
      }
    ]
  },

  {
    id: "travel",
    title: "Travel",
    icon: "🧳",
    description:
      "Useful phrases while travelling around a city or country.",
    phrases: [
      {
        id: 101,
        english: "Where is the train station?",
        translation: "¿Dónde está la estación de tren?",
        pronunciation: "DON-de es-TA la es-ta-SYON de tren",
        meaning: "Ask for the train station.",
        tip: "Useful in every city.",
        explanation: {
          title: "Finding the Train Station",
          content: "Helps you locate the nearest railway station.",
          grammar: "Dónde means 'where'.",
          culture: "Most cities have signs pointing to stations.",
          whenToUse: [
            "Travelling",
            "Public transport",
            "Tourism"
          ],
          examples: [
            "¿Dónde está la estación de tren?",
            "Busco la estación de tren."
          ]
        }
      },
      {
        id: 102,
        english: "Where is the bus stop?",
        translation: "¿Dónde está la parada de autobús?",
        pronunciation: "DON-de es-TA la pa-RA-da de ow-to-BOOS",
        meaning: "Ask for the nearest bus stop.",
        tip: "Useful when using public buses.",
        explanation: {
          title: "Finding the Bus Stop",
          content: "Use this to locate public transportation.",
          grammar: "Parada means 'stop'.",
          culture: "Bus routes vary by city.",
          whenToUse: [
            "Travel",
            "Public transport"
          ],
          examples: [
            "¿Dónde está la parada de autobús?",
            "Necesito el autobús."
          ]
        }
      },
      {
        id: 103,
        english: "Where is the airport?",
        translation: "¿Dónde está el aeropuerto?",
        pronunciation: "DON-de es-TA el a-e-ro-PWER-to",
        meaning: "Ask for the airport.",
        tip: "Useful when taking a flight.",
        explanation: {
          title: "Finding the Airport",
          content: "Use this while travelling.",
          grammar: "Aeropuerto means airport.",
          culture: "Taxi drivers know airports well.",
          whenToUse: [
            "Travel",
            "Taxi",
            "Directions"
          ],
          examples: [
            "¿Dónde está el aeropuerto?",
            "Voy al aeropuerto."
          ]
        }
      },
      {
        id: 104,
        english: "Can you help me?",
        translation: "¿Puede ayudarme?",
        pronunciation: "PWE-de ah-yoo-DAR-me",
        meaning: "Politely ask for help.",
        tip: "Smile while asking.",
        explanation: {
          title: "Requesting Help",
          content: "Useful whenever you need assistance.",
          grammar: "Ayudar means 'to help'.",
          culture: "Politeness is appreciated.",
          whenToUse: [
            "Lost",
            "Travel",
            "Emergency"
          ],
          examples: [
            "¿Puede ayudarme?",
            "Disculpe, ¿puede ayudarme?"
          ]
        }
      },
      {
        id: 105,
        english: "Where is my hotel?",
        translation: "¿Dónde está mi hotel?",
        pronunciation: "DON-de es-TA mee oh-TEL",
        meaning: "Ask for directions to your hotel.",
        tip: "Keep the hotel address handy.",
        explanation: {
          title: "Finding Your Hotel",
          content: "Useful after arriving in a new city.",
          grammar: "Mi means 'my'.",
          culture: "Locals often recognize hotel names.",
          whenToUse: [
            "Travel",
            "Taxi",
            "Walking"
          ],
          examples: [
            "¿Dónde está mi hotel?",
            "Busco mi hotel."
          ]
        }
      }
    ]
  },
    {
    id: "restaurant",
    title: "Restaurant",
    icon: "🍽️",
    description:
      "Useful phrases for ordering food, drinks and communicating in restaurants.",
    phrases: [
      {
        id: 201,
        english: "A table for two, please.",
        translation: "Una mesa para dos, por favor.",
        pronunciation: "OO-na ME-sa PA-ra dos por fa-BOR",
        meaning: "Used when requesting a table.",
        tip: "Say this when entering a restaurant.",
        explanation: {
          title: "Requesting a Table",
          content:
            "This phrase helps you ask for seating at a restaurant.",
          grammar:
            "Mesa means 'table' while para dos means 'for two'.",
          culture:
            "Many restaurants ask how many people are in your group.",
          whenToUse: [
            "Restaurant entrance",
            "Lunch",
            "Dinner"
          ],
          examples: [
            "Una mesa para dos, por favor.",
            "Buenas noches, una mesa para dos."
          ]
        }
      },
      {
        id: 202,
        english: "May I see the menu?",
        translation: "¿Puedo ver el menú?",
        pronunciation: "PWEH-do ber el meh-NOO",
        meaning: "Ask for the menu.",
        tip: "Useful if the waiter hasn't given you one.",
        explanation: {
          title: "Requesting the Menu",
          content:
            "This phrase politely asks to see the restaurant menu.",
          grammar:
            "Puedo means 'may I' while ver means 'to see'.",
          culture:
            "Menus are sometimes available digitally.",
          whenToUse: [
            "Restaurant",
            "Cafe",
            "Food court"
          ],
          examples: [
            "¿Puedo ver el menú?",
            "¿Tiene un menú en inglés?"
          ]
        }
      },
      {
        id: 203,
        english: "I would like this.",
        translation: "Quisiera esto.",
        pronunciation: "Kee-see-EH-ra ES-to",
        meaning: "Used while ordering food.",
        tip: "Point at the menu while saying it.",
        explanation: {
          title: "Ordering Food",
          content:
            "A polite way to tell the waiter what you want.",
          grammar:
            "Quisiera is a polite form of 'I would like'.",
          culture:
            "Pointing politely at the menu is common.",
          whenToUse: [
            "Ordering",
            "Cafe",
            "Restaurant"
          ],
          examples: [
            "Quisiera esto.",
            "Quisiera esta comida."
          ]
        }
      },
      {
        id: 204,
        english: "The bill, please.",
        translation: "La cuenta, por favor.",
        pronunciation: "La KWEN-ta por fa-BOR",
        meaning: "Ask for the bill.",
        tip: "Say this when you're ready to pay.",
        explanation: {
          title: "Paying the Bill",
          content:
            "Use this phrase after finishing your meal.",
          grammar:
            "Cuenta means 'bill' or 'check'.",
          culture:
            "In many countries the bill isn't brought until requested.",
          whenToUse: [
            "After eating",
            "Restaurant",
            "Cafe"
          ],
          examples: [
            "La cuenta, por favor.",
            "¿Me trae la cuenta?"
          ]
        }
      },
      {
        id: 205,
        english: "The food was delicious.",
        translation: "La comida estuvo deliciosa.",
        pronunciation: "La ko-MEE-da es-TOO-bo de-lee-see-O-sa",
        meaning: "Compliment the meal.",
        tip: "A nice way to thank the chef.",
        explanation: {
          title: "Complimenting the Meal",
          content:
            "Shows appreciation for good food and service.",
          grammar:
            "Deliciosa means 'delicious'.",
          culture:
            "Restaurant staff appreciate positive feedback.",
          whenToUse: [
            "After eating",
            "Leaving the restaurant",
            "Speaking to the waiter"
          ],
          examples: [
            "La comida estuvo deliciosa.",
            "Muchas gracias, estuvo deliciosa."
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
      "Essential phrases for shopping, paying and asking about products.",
    phrases: [
      {
        id: 301,
        english: "How much does this cost?",
        translation: "¿Cuánto cuesta esto?",
        pronunciation: "KWAN-to KWES-ta ES-to",
        meaning: "Ask for the price of an item.",
        tip: "Point to the item while asking.",
        explanation: {
          title: "Asking the Price",
          content:
            "Use this phrase when shopping.",
          grammar:
            "Cuánto means 'how much'.",
          culture:
            "Prices are usually fixed in stores.",
          whenToUse: [
            "Store",
            "Market",
            "Mall"
          ],
          examples: [
            "¿Cuánto cuesta esto?",
            "¿Cuánto cuesta esta camisa?"
          ]
        }
      },
      {
        id: 302,
        english: "It's too expensive.",
        translation: "Es demasiado caro.",
        pronunciation: "Es de-ma-see-A-do KA-ro",
        meaning: "Say the price is high.",
        tip: "Useful when bargaining.",
        explanation: {
          title: "Talking About Price",
          content:
            "Expresses that something costs more than expected.",
          grammar:
            "Caro means 'expensive'.",
          culture:
            "Negotiation is common in street markets.",
          whenToUse: [
            "Shopping",
            "Markets",
            "Souvenir shops"
          ],
          examples: [
            "Es demasiado caro.",
            "¿Puede bajar el precio?"
          ]
        }
      },
      {
        id: 303,
        english: "Do you accept credit cards?",
        translation: "¿Aceptan tarjetas de crédito?",
        pronunciation: "A-sep-TAN tar-HE-tas de KRE-di-to",
        meaning: "Ask about card payment.",
        tip: "Useful before paying.",
        explanation: {
          title: "Payment Method",
          content:
            "Checks whether card payments are accepted.",
          grammar:
            "Aceptan means 'do you accept'.",
          culture:
            "Some small shops only accept cash.",
          whenToUse: [
            "Checkout",
            "Store",
            "Restaurant"
          ],
          examples: [
            "¿Aceptan tarjetas de crédito?",
            "¿Puedo pagar con tarjeta?"
          ]
        }
      },
      {
        id: 304,
        english: "Can I try it on?",
        translation: "¿Puedo probármelo?",
        pronunciation: "PWEH-do pro-BAR-me-lo",
        meaning: "Ask to try on clothes.",
        tip: "Common in clothing stores.",
        explanation: {
          title: "Trying on Clothes",
          content:
            "Ask before entering the fitting room.",
          grammar:
            "Probar means 'to try'.",
          culture:
            "Most clothing stores have fitting rooms.",
          whenToUse: [
            "Clothing store",
            "Mall"
          ],
          examples: [
            "¿Puedo probármelo?",
            "¿Dónde está el probador?"
          ]
        }
      },
      {
        id: 305,
        english: "I'm just looking.",
        translation: "Solo estoy mirando.",
        pronunciation: "SO-lo es-TOY mee-RAN-do",
        meaning: "Tell staff you're browsing.",
        tip: "A polite response to sales assistants.",
        explanation: {
          title: "Browsing",
          content:
            "Lets employees know you don't need help yet.",
          grammar:
            "Mirando means 'looking'.",
          culture:
            "Very common in shops.",
          whenToUse: [
            "Shopping",
            "Browsing",
            "Stores"
          ],
          examples: [
            "Solo estoy mirando.",
            "Gracias, solo estoy mirando."
          ]
        }
      }
    ]
  },
    {
    id: "school",
    title: "School",
    icon: "🏫",
    description:
      "Useful phrases for students, teachers and everyday classroom situations.",
    phrases: [
      {
        id: 401,
        english: "Where is the classroom?",
        translation: "¿Dónde está el salón de clases?",
        pronunciation: "DON-de es-TA el sa-LON de KLA-ses",
        meaning: "Ask where your classroom is.",
        tip: "Useful on your first day at school.",
        explanation: {
          title: "Finding the Classroom",
          content:
            "This phrase helps you locate your classroom inside a school or university.",
          grammar:
            "Salón de clases means 'classroom'.",
          culture:
            "Students often ask staff or classmates for directions.",
          whenToUse: [
            "First day",
            "School",
            "University"
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
        meaning: "Ask permission before entering.",
        tip: "Use this if you arrive late.",
        explanation: {
          title: "Entering the Classroom",
          content:
            "A polite way to ask permission before entering.",
          grammar:
            "Entrar means 'to enter'.",
          culture:
            "Teachers appreciate students asking politely.",
          whenToUse: [
            "Late arrival",
            "Classroom",
            "Lecture"
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
        pronunciation: "No en-tee-EN-do",
        meaning: "Tell the teacher you need help.",
        tip: "Don't hesitate to ask questions.",
        explanation: {
          title: "Asking for Help",
          content:
            "Use this phrase when something isn't clear.",
          grammar:
            "Entiendo means 'I understand'.",
          culture:
            "Teachers encourage students to ask questions.",
          whenToUse: [
            "Class",
            "Lesson",
            "Homework"
          ],
          examples: [
            "No entiendo.",
            "No entiendo la pregunta."
          ]
        }
      },
      {
        id: 404,
        english: "Can you repeat that?",
        translation: "¿Puede repetir eso?",
        pronunciation: "PWE-de re-pe-TEER EH-so",
        meaning: "Ask someone to say it again.",
        tip: "Useful during lessons.",
        explanation: {
          title: "Requesting Repetition",
          content:
            "Use this phrase when you didn't hear or understand.",
          grammar:
            "Repetir means 'to repeat'.",
          culture:
            "It's polite and common in classrooms.",
          whenToUse: [
            "Lecture",
            "Classroom",
            "Conversation"
          ],
          examples: [
            "¿Puede repetir eso?",
            "Perdón, ¿puede repetirlo?"
          ]
        }
      },
      {
        id: 405,
        english: "Thank you, teacher.",
        translation: "Gracias, profesor.",
        pronunciation: "GRA-see-as pro-fe-SOR",
        meaning: "Thank your teacher.",
        tip: "A respectful way to end a class.",
        explanation: {
          title: "Showing Respect",
          content:
            "Expresses appreciation to your teacher.",
          grammar:
            "Profesor means 'teacher'.",
          culture:
            "Respect for teachers is valued in Spanish-speaking countries.",
          whenToUse: [
            "After class",
            "Receiving help",
            "Graduation"
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
      "Professional phrases for meetings, presentations and workplace communication.",
    phrases: [
      {
        id: 501,
        english: "Nice to meet you.",
        translation: "Mucho gusto.",
        pronunciation: "MOO-cho GOOS-to",
        meaning: "A polite business greeting.",
        tip: "Often used during introductions.",
        explanation: {
          title: "Business Introduction",
          content:
            "A professional way to greet someone for the first time.",
          grammar:
            "Mucho gusto literally means 'much pleasure'.",
          culture:
            "Usually accompanied by a handshake.",
          whenToUse: [
            "Meeting",
            "Interview",
            "Conference"
          ],
          examples: [
            "Mucho gusto.",
            "Mucho gusto en conocerle."
          ]
        }
      },
      {
        id: 502,
        english: "Can we schedule a meeting?",
        translation: "¿Podemos programar una reunión?",
        pronunciation: "Po-DE-mos pro-gra-MAR OO-na re-u-NYON",
        meaning: "Request a meeting.",
        tip: "Useful in professional settings.",
        explanation: {
          title: "Scheduling Meetings",
          content:
            "Use this phrase to arrange a meeting.",
          grammar:
            "Programar means 'to schedule'.",
          culture:
            "Business meetings are often arranged in advance.",
          whenToUse: [
            "Office",
            "Email",
            "Conference"
          ],
          examples: [
            "¿Podemos programar una reunión?",
            "¿Qué día le conviene?"
          ]
        }
      },
      {
        id: 503,
        english: "I agree.",
        translation: "Estoy de acuerdo.",
        pronunciation: "Es-TOY de a-KWER-do",
        meaning: "Express agreement.",
        tip: "Useful during discussions.",
        explanation: {
          title: "Expressing Agreement",
          content:
            "Shows that you support an idea.",
          grammar:
            "Acuerdo means 'agreement'.",
          culture:
            "Common in meetings and negotiations.",
          whenToUse: [
            "Meeting",
            "Discussion",
            "Negotiation"
          ],
          examples: [
            "Estoy de acuerdo.",
            "Estoy completamente de acuerdo."
          ]
        }
      },
      {
        id: 504,
        english: "I'll send you an email.",
        translation: "Le enviaré un correo electrónico.",
        pronunciation: "Le en-bee-a-RE un ko-RRE-o e-lek-TRO-ni-ko",
        meaning: "Promise to send an email.",
        tip: "Useful after meetings.",
        explanation: {
          title: "Business Follow-up",
          content:
            "Indicates you'll send more information by email.",
          grammar:
            "Enviaré is the future tense of enviar.",
          culture:
            "Email is the standard follow-up method.",
          whenToUse: [
            "Office",
            "Business",
            "Conference"
          ],
          examples: [
            "Le enviaré un correo electrónico.",
            "Le enviaré los documentos."
          ]
        }
      },
      {
        id: 505,
        english: "Thank you for your time.",
        translation: "Gracias por su tiempo.",
        pronunciation: "GRA-see-as por soo tee-EM-po",
        meaning: "A polite closing expression.",
        tip: "Use it after meetings.",
        explanation: {
          title: "Ending a Meeting",
          content:
            "Shows appreciation for someone's time.",
          grammar:
            "Su tiempo means 'your time'.",
          culture:
            "A standard professional courtesy.",
          whenToUse: [
            "Meeting",
            "Interview",
            "Presentation"
          ],
          examples: [
            "Gracias por su tiempo.",
            "Muchas gracias por su tiempo."
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
          "Say this immediately during a medical emergency.",
        explanation: {
          title: "Requesting Medical Help",
          content:
            "This phrase lets medical staff know that you urgently need a doctor.",
          grammar:
            "Necesito means 'I need' while médico means 'doctor'.",
          culture:
            "Hospital staff usually respond immediately when hearing this phrase.",
          whenToUse: [
            "Hospital",
            "Clinic",
            "Emergency room"
          ],
          examples: [
            "Necesito un médico.",
            "Por favor, necesito un médico."
          ]
        }
      },
      {
        id: 602,
        english: "I don't feel well.",
        translation: "No me siento bien.",
        pronunciation: "No meh see-EN-to bee-EN",
        meaning:
          "Explain that you are feeling sick.",
        tip:
          "Use this before describing your symptoms.",
        explanation: {
          title: "Describing Your Condition",
          content:
            "This phrase tells others that you are unwell and may need medical attention.",
          grammar:
            "Me siento means 'I feel' while bien means 'well'.",
          culture:
            "Doctors often ask you to explain your symptoms after hearing this.",
          whenToUse: [
            "Hospital",
            "Clinic",
            "Pharmacy"
          ],
          examples: [
            "No me siento bien.",
            "Desde ayer no me siento bien."
          ]
        }
      },
      {
        id: 603,
        english: "It hurts here.",
        translation: "Me duele aquí.",
        pronunciation: "Meh DWEH-le a-KEE",
        meaning:
          "Point out where you have pain.",
        tip:
          "Point to the painful area while speaking.",
        explanation: {
          title: "Describing Pain",
          content:
            "This phrase helps medical staff identify the location of your pain.",
          grammar:
            "Duele means 'hurts' while aquí means 'here'.",
          culture:
            "Doctors often ask patients where the pain is located.",
          whenToUse: [
            "Hospital",
            "Doctor's office",
            "Emergency"
          ],
          examples: [
            "Me duele aquí.",
            "Me duele el brazo."
          ]
        }
      },
      {
        id: 604,
        english: "I have a fever.",
        translation: "Tengo fiebre.",
        pronunciation: "TEN-go fee-E-bre",
        meaning:
          "Tell medical staff you have a fever.",
        tip:
          "Useful when explaining your symptoms.",
        explanation: {
          title: "Reporting Symptoms",
          content:
            "This phrase lets the doctor know that your body temperature is high.",
          grammar:
            "Tengo means 'I have' while fiebre means 'fever'.",
          culture:
            "A temperature check usually follows.",
          whenToUse: [
            "Hospital",
            "Clinic",
            "Pharmacy"
          ],
          examples: [
            "Tengo fiebre.",
            "Tengo fiebre desde anoche."
          ]
        }
      },
      {
        id: 605,
        english: "Where is the pharmacy?",
        translation: "¿Dónde está la farmacia?",
        pronunciation: "DON-de es-TA la far-MA-see-a",
        meaning:
          "Ask where to buy medicine.",
        tip:
          "Useful after visiting the doctor.",
        explanation: {
          title: "Finding a Pharmacy",
          content:
            "Use this phrase when you need medicine or prescriptions.",
          grammar:
            "Farmacia means 'pharmacy'.",
          culture:
            "Many pharmacies display a green cross sign.",
          whenToUse: [
            "Hospital",
            "Clinic",
            "City"
          ],
          examples: [
            "¿Dónde está la farmacia?",
            "Necesito una farmacia."
          ]
        }
      }
    ]
  },

  {
    id: "airport",
    title: "Airport",
    icon: "✈️",
    description:
      "Useful phrases for airports, flights and air travel.",
    phrases: [
      {
        id: 701,
        english: "Where is the check-in counter?",
        translation: "¿Dónde está el mostrador de facturación?",
        pronunciation: "DON-de es-TA el mos-tra-DOR de fak-too-ra-see-ON",
        meaning:
          "Ask where to check in for your flight.",
        tip:
          "Use this immediately after entering the airport.",
        explanation: {
          title: "Checking In",
          content:
            "This phrase helps you find your airline's check-in desk.",
          grammar:
            "Mostrador means 'counter' while facturación means 'check-in'.",
          culture:
            "Most airports have information screens showing check-in counters.",
          whenToUse: [
            "Airport entrance",
            "Departure hall",
            "International flights"
          ],
          examples: [
            "¿Dónde está el mostrador de facturación?",
            "Necesito hacer el check-in."
          ]
        }
      },
      {
        id: 702,
        english: "Where is my gate?",
        translation: "¿Dónde está mi puerta de embarque?",
        pronunciation: "DON-de es-TA mee PWER-ta de em-BAR-ke",
        meaning:
          "Ask for your boarding gate.",
        tip:
          "Check your boarding pass first.",
        explanation: {
          title: "Finding Your Gate",
          content:
            "Use this phrase to locate your departure gate.",
          grammar:
            "Puerta means 'gate' while embarque means 'boarding'.",
          culture:
            "Gate numbers sometimes change before departure.",
          whenToUse: [
            "Airport",
            "Departure lounge",
            "Boarding"
          ],
          examples: [
            "¿Dónde está mi puerta de embarque?",
            "¿Dónde sale este vuelo?"
          ]
        }
      },
      {
        id: 703,
        english: "Where is baggage claim?",
        translation: "¿Dónde está la recogida de equipaje?",
        pronunciation: "DON-de es-TA la re-ko-HEE-da de e-kee-PA-he",
        meaning:
          "Ask where to collect your luggage.",
        tip:
          "Use this after landing.",
        explanation: {
          title: "Collecting Luggage",
          content:
            "This phrase helps you find the baggage carousel.",
          grammar:
            "Equipaje means 'luggage'.",
          culture:
            "Airport screens show which carousel your luggage arrives on.",
          whenToUse: [
            "Arrival hall",
            "After landing",
            "Airport"
          ],
          examples: [
            "¿Dónde está la recogida de equipaje?",
            "Estoy buscando mi equipaje."
          ]
        }
      },
      {
        id: 704,
        english: "I lost my luggage.",
        translation: "Perdí mi equipaje.",
        pronunciation: "Per-DEE mee e-kee-PA-he",
        meaning:
          "Report missing luggage.",
        tip:
          "Visit the airline baggage service desk.",
        explanation: {
          title: "Lost Luggage",
          content:
            "Use this phrase when your suitcase cannot be found.",
          grammar:
            "Perdí means 'I lost'.",
          culture:
            "Airlines usually ask for your baggage tag.",
          whenToUse: [
            "Airport",
            "Baggage office",
            "Arrival"
          ],
          examples: [
            "Perdí mi equipaje.",
            "No encuentro mi maleta."
          ]
        }
      },
      {
        id: 705,
        english: "When does boarding begin?",
        translation: "¿Cuándo comienza el embarque?",
        pronunciation: "KWAN-do ko-mee-EN-sa el em-BAR-ke",
        meaning:
          "Ask when passengers may board.",
        tip:
          "Useful if the gate is crowded.",
        explanation: {
          title: "Boarding Time",
          content:
            "This phrase helps you know when boarding starts.",
          grammar:
            "Comienza means 'begins'.",
          culture:
            "Boarding often starts 30–45 minutes before departure.",
          whenToUse: [
            "Airport gate",
            "Waiting area",
            "Before departure"
          ],
          examples: [
            "¿Cuándo comienza el embarque?",
            "¿Ya empezó el embarque?"
          ]
        }
      }
    ]
  },
    {
    id: "customs",
    title: "Customs",
    icon: "🛂",
    description:
      "Important phrases for customs inspections and border control.",
    phrases: [
      {
        id: 706,
        english: "Where is the customs area?",
        translation: "¿Dónde está la zona de aduanas?",
        pronunciation: "DON-de es-TA la SO-na de a-dwa-nas",
        meaning:
          "Ask where customs is located.",
        tip:
          "Follow airport signs marked 'Aduanas'.",
        explanation: {
          title: "Finding Customs",
          content:
            "This phrase helps travelers locate the customs inspection area.",
          grammar:
            "Zona means 'area' while aduanas means 'customs'.",
          culture:
            "Customs is usually after baggage claim.",
          whenToUse: [
            "Airport",
            "Border crossing",
            "Arrival hall"
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
          "Ask where to declare goods.",
        tip:
          "Declare restricted or valuable items.",
        explanation: {
          title: "Declaring Goods",
          content:
            "Use this phrase when carrying items that must be declared.",
          grammar:
            "Declarar means 'to declare'.",
          culture:
            "Some countries require declarations for food, cash or electronics.",
          whenToUse: [
            "Customs",
            "Airport",
            "Border"
          ],
          examples: [
            "¿Dónde puedo declarar mis artículos?",
            "Tengo algo que declarar."
          ]
        }
      },
      {
        id: 708,
        english: "These are my personal belongings.",
        translation: "Estas son mis pertenencias personales.",
        pronunciation: "ES-tas son mees per-te-NEN-see-as per-so-NA-les",
        meaning:
          "Explain that your items are personal.",
        tip:
          "Useful during inspections.",
        explanation: {
          title: "Explaining Your Luggage",
          content:
            "This phrase tells customs officers that your belongings are for personal use.",
          grammar:
            "Pertenencias means 'belongings'.",
          culture:
            "Officers may ask about expensive items.",
          whenToUse: [
            "Inspection",
            "Customs desk",
            "Border control"
          ],
          examples: [
            "Estas son mis pertenencias personales.",
            "Todo es para uso personal."
          ]
        }
      },
      {
        id: 709,
        english: "Do I need to pay duty?",
        translation: "¿Necesito pagar impuestos?",
        pronunciation: "Ne-se-SEE-to pa-GAR im-PWES-tos",
        meaning:
          "Ask if customs taxes apply.",
        tip:
          "Useful before leaving customs.",
        explanation: {
          title: "Customs Duty",
          content:
            "Ask whether your imported items are taxable.",
          grammar:
            "Impuestos means 'taxes'.",
          culture:
            "Duty rules vary by country.",
          whenToUse: [
            "Customs",
            "Airport",
            "Border"
          ],
          examples: [
            "¿Necesito pagar impuestos?",
            "¿Hay que pagar impuestos?"
          ]
        }
      },
      {
        id: 710,
        english: "My flight has been delayed.",
        translation: "Mi vuelo se ha retrasado.",
        pronunciation: "Mee BWEH-lo se a reh-tra-SA-do",
        meaning:
          "Tell someone your flight is delayed.",
        tip:
          "Useful when updating family or transport.",
        explanation: {
          title: "Flight Delay",
          content:
            "Explains that your flight will arrive or depart later than expected.",
          grammar:
            "Retrasado means 'delayed'.",
          culture:
            "Delays are announced on airport screens.",
          whenToUse: [
            "Airport",
            "Airline desk",
            "Travel communication"
          ],
          examples: [
            "Mi vuelo se ha retrasado.",
            "¿Cuál es la nueva hora de salida?"
          ]
        }
      }
    ]
  },

  {
    id: "hotel",
    title: "Hotel",
    icon: "🏨",
    description:
      "Useful phrases for checking in, requesting services and staying at a hotel.",
    phrases: [
      {
        id: 801,
        english: "I have a reservation.",
        translation: "Tengo una reserva.",
        pronunciation: "TEN-go OO-na re-SER-va",
        meaning:
          "Tell the receptionist you booked a room.",
        tip:
          "Show your booking confirmation if requested.",
        explanation: {
          title: "Hotel Check-in",
          content:
            "Use this phrase when arriving at your hotel.",
          grammar:
            "Reserva means 'reservation'.",
          culture:
            "Hotels usually ask for identification.",
          whenToUse: [
            "Reception",
            "Check-in",
            "Arrival"
          ],
          examples: [
            "Tengo una reserva.",
            "Tengo una reserva a nombre de Smith."
          ]
        }
      },
      {
        id: 802,
        english: "What time is check-out?",
        translation: "¿A qué hora es la salida?",
        pronunciation: "A kay O-ra es la sa-LEE-da",
        meaning:
          "Ask when you must leave your room.",
        tip:
          "Useful when planning your departure.",
        explanation: {
          title: "Check-out Time",
          content:
            "Ask about the hotel's departure time.",
          grammar:
            "Salida means 'departure' or 'check-out'.",
          culture:
            "Late check-out may have an extra fee.",
          whenToUse: [
            "Reception",
            "Hotel",
            "Before leaving"
          ],
          examples: [
            "¿A qué hora es la salida?",
            "¿Puedo salir más tarde?"
          ]
        }
      },
      {
        id: 803,
        english: "Can I have the room key?",
        translation: "¿Me puede dar la llave de la habitación?",
        pronunciation: "Meh PWE-de dar la YA-ve de la a-bee-ta-see-ON",
        meaning:
          "Request your room key.",
        tip:
          "Useful if you misplaced it.",
        explanation: {
          title: "Room Key",
          content:
            "Ask the receptionist for your room key or key card.",
          grammar:
            "Llave means 'key'.",
          culture:
            "Many hotels now use electronic key cards.",
          whenToUse: [
            "Reception",
            "Hotel"
          ],
          examples: [
            "¿Me puede dar la llave de la habitación?",
            "Perdí mi llave."
          ]
        }
      },
      {
        id: 804,
        english: "I need clean towels.",
        translation: "Necesito toallas limpias.",
        pronunciation: "Ne-se-SEE-to to-WA-yas LEEM-pyas",
        meaning:
          "Request fresh towels.",
        tip:
          "Call housekeeping if needed.",
        explanation: {
          title: "Housekeeping",
          content:
            "Use this phrase when requesting clean towels.",
          grammar:
            "Limpias means 'clean'.",
          culture:
            "Housekeeping is available in most hotels.",
          whenToUse: [
            "Hotel room",
            "Reception",
            "Housekeeping"
          ],
          examples: [
            "Necesito toallas limpias.",
            "¿Puede traer toallas limpias?"
          ]
        }
      },
      {
        id: 805,
        english: "The air conditioner isn't working.",
        translation: "El aire acondicionado no funciona.",
        pronunciation: "El AI-re a-kon-dee-see-o-NA-do no foon-see-O-na",
        meaning:
          "Report a problem with the air conditioner.",
        tip:
          "Useful when requesting maintenance.",
        explanation: {
          title: "Reporting a Problem",
          content:
            "Tell hotel staff that the room's air conditioner is broken.",
          grammar:
            "Funciona means 'works'.",
          culture:
            "Hotels normally send maintenance quickly.",
          whenToUse: [
            "Hotel room",
            "Reception",
            "Maintenance"
          ],
          examples: [
            "El aire acondicionado no funciona.",
            "¿Puede enviarnos a alguien?"
          ]
        }
      }
    ]
  },
    {
    id: "transportation",
    title: "Transportation",
    icon: "🚕",
    description:
      "Essential phrases for taxis, buses, trains and getting around.",
    phrases: [
      {
        id: 901,
        english: "Where is the bus stop?",
        translation: "¿Dónde está la parada de autobús?",
        pronunciation: "DON-de es-TA la pa-RA-da de ow-to-BOOS",
        meaning:
          "Ask where to catch the bus.",
        tip:
          "Useful when using public transportation.",
        explanation: {
          title: "Finding a Bus Stop",
          content:
            "Use this phrase to ask where the nearest bus stop is located.",
          grammar:
            "Parada means 'stop' while autobús means 'bus'.",
          culture:
            "Many cities have clearly marked bus stops.",
          whenToUse: [
            "Bus station",
            "Street",
            "Travel"
          ],
          examples: [
            "¿Dónde está la parada de autobús?",
            "Estoy buscando la parada de autobús."
          ]
        }
      },
      {
        id: 902,
        english: "Please take me to this address.",
        translation: "Lléveme a esta dirección, por favor.",
        pronunciation: "YE-be-me a ES-ta dee-rek-see-ON por fa-BOR",
        meaning:
          "Tell a taxi driver where to go.",
        tip:
          "Show the address on your phone if needed.",
        explanation: {
          title: "Taking a Taxi",
          content:
            "This phrase helps you communicate your destination to a driver.",
          grammar:
            "Lléveme means 'take me'.",
          culture:
            "Showing the address avoids misunderstandings.",
          whenToUse: [
            "Taxi",
            "Ride-share",
            "Airport"
          ],
          examples: [
            "Lléveme a esta dirección.",
            "Por favor, lléveme al hotel."
          ]
        }
      },
      {
        id: 903,
        english: "How much is the fare?",
        translation: "¿Cuánto cuesta el pasaje?",
        pronunciation: "KWAN-to KWES-ta el pa-SA-he",
        meaning:
          "Ask the transportation fare.",
        tip:
          "Useful before boarding.",
        explanation: {
          title: "Checking the Fare",
          content:
            "Ask how much your trip will cost.",
          grammar:
            "Pasaje means 'fare' or 'ticket'.",
          culture:
            "Some buses require exact change.",
          whenToUse: [
            "Bus",
            "Taxi",
            "Train"
          ],
          examples: [
            "¿Cuánto cuesta el pasaje?",
            "¿Cuánto cuesta el boleto?"
          ]
        }
      },
      {
        id: 904,
        english: "Does this bus go downtown?",
        translation: "¿Este autobús va al centro?",
        pronunciation: "ES-te ow-to-BOOS ba al SEN-tro",
        meaning:
          "Ask if the bus goes to the city center.",
        tip:
          "Confirm before boarding.",
        explanation: {
          title: "Confirming Your Route",
          content:
            "Use this phrase to make sure you're boarding the correct bus.",
          grammar:
            "Va means 'goes'.",
          culture:
            "Drivers usually answer simple destination questions.",
          whenToUse: [
            "Bus stop",
            "Terminal",
            "Public transport"
          ],
          examples: [
            "¿Este autobús va al centro?",
            "¿Va esta ruta al centro?"
          ]
        }
      },
      {
        id: 905,
        english: "Please stop here.",
        translation: "Pare aquí, por favor.",
        pronunciation: "PA-re a-KEE por fa-BOR",
        meaning:
          "Tell the driver to stop.",
        tip:
          "Say it a few seconds before your stop.",
        explanation: {
          title: "Stopping the Vehicle",
          content:
            "Use this phrase when you've reached your destination.",
          grammar:
            "Pare is the command form of parar ('to stop').",
          culture:
            "Passengers often notify drivers shortly before stopping.",
          whenToUse: [
            "Taxi",
            "Bus",
            "Ride-share"
          ],
          examples: [
            "Pare aquí, por favor.",
            "Aquí está bien, gracias."
          ]
        }
      }
    ]
  },

  {
    id: "directions",
    title: "Directions",
    icon: "🗺️",
    description:
      "Useful phrases for asking and understanding directions.",
    phrases: [
      {
        id: 1001,
        english: "Where is the nearest bank?",
        translation: "¿Dónde está el banco más cercano?",
        pronunciation: "DON-de es-TA el BAN-ko mas ser-KA-no",
        meaning:
          "Ask where the closest bank is.",
        tip:
          "Useful when you need cash.",
        explanation: {
          title: "Finding a Bank",
          content:
            "This phrase helps you locate the nearest bank.",
          grammar:
            "Más cercano means 'nearest'.",
          culture:
            "Many banks have ATMs outside.",
          whenToUse: [
            "Travel",
            "City",
            "Downtown"
          ],
          examples: [
            "¿Dónde está el banco más cercano?",
            "Necesito encontrar un banco."
          ]
        }
      },
      {
        id: 1002,
        english: "Can you show me on the map?",
        translation: "¿Puede mostrarme en el mapa?",
        pronunciation: "PWE-de mos-TRAR-me en el MA-pa",
        meaning:
          "Ask someone to point it out on a map.",
        tip:
          "Helpful if spoken directions are confusing.",
        explanation: {
          title: "Using a Map",
          content:
            "Ask someone to indicate the location visually.",
          grammar:
            "Mostrar means 'to show'.",
          culture:
            "People often use phone maps to help travelers.",
          whenToUse: [
            "Tourism",
            "Travel",
            "City"
          ],
          examples: [
            "¿Puede mostrarme en el mapa?",
            "¿Puede señalarlo en el mapa?"
          ]
        }
      },
      {
        id: 1003,
        english: "Is it far from here?",
        translation: "¿Está lejos de aquí?",
        pronunciation: "Es-TA LE-hos de a-KEE",
        meaning:
          "Ask if the destination is nearby.",
        tip:
          "Useful before walking.",
        explanation: {
          title: "Checking Distance",
          content:
            "Ask whether the destination is close or far away.",
          grammar:
            "Lejos means 'far'.",
          culture:
            "Locals often estimate walking time.",
          whenToUse: [
            "Walking",
            "City",
            "Travel"
          ],
          examples: [
            "¿Está lejos de aquí?",
            "¿Está cerca?"
          ]
        }
      },
      {
        id: 1004,
        english: "Turn left.",
        translation: "Gire a la izquierda.",
        pronunciation: "HEE-re a la ees-kee-ER-da",
        meaning:
          "Direction indicating a left turn.",
        tip:
          "Useful while following directions.",
        explanation: {
          title: "Turning Left",
          content:
            "One of the most common navigation phrases.",
          grammar:
            "Izquierda means 'left'.",
          culture:
            "Often heard from GPS systems.",
          whenToUse: [
            "Driving",
            "Walking",
            "Navigation"
          ],
          examples: [
            "Gire a la izquierda.",
            "Luego gire a la izquierda."
          ]
        }
      },
      {
        id: 1005,
        english: "Turn right.",
        translation: "Gire a la derecha.",
        pronunciation: "HEE-re a la de-RE-cha",
        meaning:
          "Direction indicating a right turn.",
        tip:
          "Common in navigation.",
        explanation: {
          title: "Turning Right",
          content:
            "Use when giving or following directions.",
          grammar:
            "Derecha means 'right'.",
          culture:
            "Common in spoken directions and GPS navigation.",
          whenToUse: [
            "Driving",
            "Walking",
            "Navigation"
          ],
          examples: [
            "Gire a la derecha.",
            "Después gire a la derecha."
          ]
        }
      }
    ]
  },
    {
    id: "social",
    title: "Social",
    icon: "👥",
    description:
      "Common phrases for making friends and everyday conversations.",
    phrases: [
      {
        id: 1101,
        english: "What's your name?",
        translation: "¿Cómo te llamas?",
        pronunciation: "KO-mo te YA-mas",
        meaning:
          "Ask someone their name.",
        tip:
          "Usually one of the first questions when meeting someone.",
        explanation: {
          title: "Introducing Yourself",
          content:
            "Use this phrase to politely ask someone's name.",
          grammar:
            "Cómo means 'how' while te llamas means 'are you called'.",
          culture:
            "Often followed by a handshake or smile.",
          whenToUse: [
            "Meeting someone",
            "School",
            "Social gathering"
          ],
          examples: [
            "¿Cómo te llamas?",
            "Hola, ¿cómo te llamas?"
          ]
        }
      },
      {
        id: 1102,
        english: "My name is...",
        translation: "Me llamo...",
        pronunciation: "Me YA-mo",
        meaning:
          "Introduce yourself.",
        tip:
          "Say your name clearly after the phrase.",
        explanation: {
          title: "Introducing Yourself",
          content:
            "A simple and natural way to tell someone your name.",
          grammar:
            "Me llamo literally means 'I call myself'.",
          culture:
            "Used in almost every introduction.",
          whenToUse: [
            "Meeting people",
            "Class",
            "Events"
          ],
          examples: [
            "Me llamo David.",
            "Hola, me llamo María."
          ]
        }
      },
      {
        id: 1103,
        english: "Where are you from?",
        translation: "¿De dónde eres?",
        pronunciation: "De DON-de EH-res",
        meaning:
          "Ask about someone's country or city.",
        tip:
          "A common conversation starter.",
        explanation: {
          title: "Getting to Know Someone",
          content:
            "Use this phrase when learning about someone's background.",
          grammar:
            "Eres is the verb 'to be' for 'you'.",
          culture:
            "People often answer with their country or hometown.",
          whenToUse: [
            "Travel",
            "School",
            "Social events"
          ],
          examples: [
            "¿De dónde eres?",
            "¿Eres de España?"
          ]
        }
      },
      {
        id: 1104,
        english: "Nice to meet you.",
        translation: "Mucho gusto.",
        pronunciation: "MOO-cho GOOS-to",
        meaning:
          "A polite greeting after introductions.",
        tip:
          "Smile while saying it.",
        explanation: {
          title: "Greeting Someone",
          content:
            "Shows friendliness after meeting someone for the first time.",
          grammar:
            "Mucho gusto literally means 'much pleasure'.",
          culture:
            "Often accompanied by a handshake.",
          whenToUse: [
            "Meeting someone",
            "Business",
            "School"
          ],
          examples: [
            "Mucho gusto.",
            "Mucho gusto en conocerte."
          ]
        }
      },
      {
        id: 1105,
        english: "See you later.",
        translation: "Hasta luego.",
        pronunciation: "AS-ta loo-E-go",
        meaning:
          "A friendly way to say goodbye.",
        tip:
          "Use when you expect to meet again.",
        explanation: {
          title: "Saying Goodbye",
          content:
            "A common farewell used in everyday conversations.",
          grammar:
            "Hasta means 'until' while luego means 'later'.",
          culture:
            "One of the most common goodbye expressions.",
          whenToUse: [
            "Leaving",
            "Friends",
            "Work"
          ],
          examples: [
            "Hasta luego.",
            "Nos vemos, hasta luego."
          ]
        }
      }
    ]
  },

  {
    id: "emergency",
    title: "Emergency",
    icon: "🚨",
    description:
      "Essential phrases for emergencies and urgent situations.",
    phrases: [
      {
        id: 1201,
        english: "Help!",
        translation: "¡Ayuda!",
        pronunciation: "Ah-YOO-da",
        meaning:
          "Call for immediate help.",
        tip:
          "Use only in emergencies.",
        explanation: {
          title: "Calling for Help",
          content:
            "This is the quickest way to attract attention during an emergency.",
          grammar:
            "Ayuda means 'help'.",
          culture:
            "People immediately recognize this word as an emergency.",
          whenToUse: [
            "Emergency",
            "Accident",
            "Danger"
          ],
          examples: [
            "¡Ayuda!",
            "¡Por favor, ayuda!"
          ]
        }
      },
      {
        id: 1202,
        english: "Call the police.",
        translation: "Llame a la policía.",
        pronunciation: "YA-me a la po-lee-SEE-a",
        meaning:
          "Ask someone to contact the police.",
        tip:
          "Use during dangerous situations.",
        explanation: {
          title: "Contacting Police",
          content:
            "This phrase requests immediate police assistance.",
          grammar:
            "Llame is the formal command form of 'call'.",
          culture:
            "Useful in emergencies involving crime or danger.",
          whenToUse: [
            "Emergency",
            "Crime",
            "Accident"
          ],
          examples: [
            "Llame a la policía.",
            "¡Por favor, llame a la policía!"
          ]
        }
      },
      {
        id: 1203,
        english: "Call an ambulance.",
        translation: "Llame a una ambulancia.",
        pronunciation: "YA-me a OO-na am-boo-LAN-see-a",
        meaning:
          "Request emergency medical services.",
        tip:
          "Use when someone needs urgent medical care.",
        explanation: {
          title: "Medical Emergency",
          content:
            "Use this phrase when immediate medical assistance is required.",
          grammar:
            "Ambulancia means 'ambulance'.",
          culture:
            "Emergency operators respond quickly to ambulance requests.",
          whenToUse: [
            "Emergency",
            "Hospital",
            "Accident"
          ],
          examples: [
            "Llame a una ambulancia.",
            "Necesitamos una ambulancia."
          ]
        }
      },
      {
        id: 1204,
        english: "I've been robbed.",
        translation: "Me han robado.",
        pronunciation: "Me an ro-BA-do",
        meaning:
          "Report that someone stole from you.",
        tip:
          "Tell the police as soon as possible.",
        explanation: {
          title: "Reporting Theft",
          content:
            "Use this phrase to explain that you were robbed.",
          grammar:
            "Robado means 'robbed'.",
          culture:
            "Police may ask for identification and details.",
          whenToUse: [
            "Police station",
            "Emergency",
            "Travel"
          ],
          examples: [
            "Me han robado.",
            "Me robaron la cartera."
          ]
        }
      },
      {
        id: 1205,
        english: "I need help immediately.",
        translation: "Necesito ayuda inmediatamente.",
        pronunciation: "Ne-se-SEE-to ah-YOO-da ee-me-dya-ta-MEN-te",
        meaning:
          "Explain that the situation is urgent.",
        tip:
          "Speak loudly and clearly.",
        explanation: {
          title: "Urgent Assistance",
          content:
            "This phrase emphasizes that help is needed without delay.",
          grammar:
            "Inmediatamente means 'immediately'.",
          culture:
            "Emergency responders prioritize urgent requests.",
          whenToUse: [
            "Emergency",
            "Hospital",
            "Public place"
          ],
          examples: [
            "Necesito ayuda inmediatamente.",
            "¡Por favor, necesito ayuda inmediatamente!"
          ]
        }
      }
    ]
  }
]