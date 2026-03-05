// 5 preset users with complete data

const establishments = [
    { id: 1, name: "Bloemen Food Court", location: "DLSU Lobby", description: "Affordable and diverse food options", rating: 4.2  },
    { id: 2, name: "Agno Food Court", location: "Near Taft Avenue", description: "Best coffee and pastries", rating: 4.8 },
    { id: 3, name: "GreenBites", location: "DLSU Engineering", description: "Fast service and tasty meals", rating: 4.5 },
    { id: 4, name: "TaftCafe", location: "Around Taft", description: "Traditional Filipino comfort food", rating: 4.3 },
    { id: 5, name: "Cafe Breton", location: "Recto Avenue", description: "Premium burgers and shakes", rating: 4.6 },
    { id: 6, name: "IDK's Diner", location: "Taft MRT Station", description: "Quick meals near MRT", rating: 3.9 },
    { id: 7, name: "Jollibee", location: "Student Village", description: "Bubble tea and desserts", rating: 4.4 },
    { id: 8, name: "Sunny Side Cafe", location: "León Guinto St", description: "BBQ and grilled specialties", rating: 4.7 },
    { id: 9, name: "Brew & Chill", location: "Near DLSU", description: "Italian cuisine favorites", rating: 4.5 },
];

const users = [
    {
        id: 1,
        name: "Luis Harold",
        email: "luis_harold@gmail.com",
        password: "1234",
        joinDate: "February 2026",
        bio: "Sophomore student, ID124!",
        phone: "09112123231",
        image: "sample_profile.jpg",
        reviews: [
            { id: 1, establishmentId: 1, title: "Affordable and delicious", rating: 4, comment: "Great variety of food options at reasonable prices. The food court is always clean and well-maintained. Highly recommended for students!" },
            { id: 2, establishmentId: 2, title: "Best coffee in town", rating: 5, comment: "The baristas here are amazing! Every cup is perfectly crafted. I come here every morning before class." },
            { id: 3, establishmentId: 3, title: "Fast service and tasty meals", rating: 4, comment: "Quick service even during rush hour. The meals are fresh and filling. Perfect for grab-and-go lunch." },
            { id: 4, establishmentId: 4, title: "Comfort food at its finest", rating: 4, comment: "Authentic Filipino dishes that remind me of home. The sopas are particularly good!" },
            { id: 5, establishmentId: 5, title: "Premium burgers worth every peso", rating: 5, comment: "The burger patties are juicy and flavorful. Worth the price. Shakes are creamy too!" }
        ]
    },

    {
        id: 2,
        name: "Maria Santos",
        email: "maria_santos@gmail.com",
        password: "1234",
        joinDate: "March 2025",
        bio: "Mukhbang eater!",
        phone: "09181517222",
        image: "sample_profile2.png",
        reviews: [
            { id: 6, establishmentId: 2, title: "Cozy atmosphere perfect for studying", rating: 5, comment: "The ambiance is so relaxing. I love studying here with their iced lattes. WiFi is strong too!" },
            { id: 7, establishmentId: 6, title: "Convenient location near MRT", rating: 4, comment: "Super accessible. Quick meals available. Good for when you're in a hurry to catch the train." },
            { id: 8, establishmentId: 7, title: "Best milktea flavors", rating: 5, comment: "Their taro and matcha flavors are incredible! The boba is perfectly chewy. Addicted already!" },
            { id: 9, establishmentId: 8, title: "BBQ that's always fresh", rating: 4, comment: "The grilled items are always hot and juicy. Great for group dinners. Reasonable prices too." },
            { id: 10, establishmentId: 9, title: "Authentic Italian pasta", rating: 4, comment: "The carbonara here is close to authentic. Fresh ingredients used. Will definitely come back!" }
        ]
    },

    {
        id: 3,
        name: "Karlie Chirk",
        email: "karlofdachirk@gmail.com",
        password: "1234",
        joinDate: "April 2024",
        bio: "Food lover :)",
        phone: "09097623483",
        image: "sample_profile3.png",
        reviews: [
            { id: 11, establishmentId: 3, title: "Consistently good quality", rating: 4, comment: "Never disappointed with their food. The service staff are attentive and friendly. Great value!" },
            { id: 12, establishmentId: 5, title: "Gourmet burger experience", rating: 5, comment: "Every burger here tastes like it's made with love. Premium ingredients shine through. Must-visit!" },
            { id: 13, establishmentId: 8, title: "Grilling expertise", rating: 5, comment: "The owners really know how to grill. Every bite is perfectly seasoned. Been here 10+ times!" },
            { id: 15, establishmentId: 1, title: "Student-friendly prices", rating: 3, comment: "Good affordable options. Can get crowded during lunch rush. Overall decent quality for the price." }
        ]
    },

    {
        id: 4,
        name: "Bob Builder",
        email: "Bob@gmail.com",
        password: "1234",
        joinDate: "January 2026",
        bio: "Hello po",
        phone: "09251185412",
        image: "sample_profile4.jpg",
        reviews: [
            { id: 16, establishmentId: 7, title: "Sweet escape from studying", rating: 5, comment: "Perfect place to take a break. Their desserts are amazing. Milktea is creamy and delicious!" },
            { id: 17, establishmentId: 4, title: "Home-cooked meals", rating: 4, comment: "Tastes like home. The soups are warm and comforting. Great for rainy days!" },
            { id: 18, establishmentId: 9, title: "Date night spot", rating: 5, comment: "Romantic ambiance with great Italian food. Perfect for special occasions. Highly recommend!" },
            { id: 19, establishmentId: 2, title: "Coffee shop vibes", rating: 4, comment: "Love the interior design. Coffee is consistently good. Great WiFi for work." },
            { id: 20, establishmentId: 6, title: "Quick meal solution", rating: 3, comment: "Convenient but can be inconsistent. Food quality varies sometimes. Good for emergencies!" }
        ]
    },

    {
        id: 5,
        name: "John Doe",
        email: "John@yahoo.com",
        password: "1234",
        joinDate: "December 2025",
        bio: "Nice nice",
        phone: "09332145678",
        image: "sample_profile5.webp",
        reviews: [
            { id: 22, establishmentId: 1, title: "Daily campus staple", rating: 4, comment: "My go-to lunch spot during school days. Variety keeps it interesting. Good portions!" },
            { id: 23, establishmentId: 3, title: "Reliable and quick", rating: 4, comment: "Never lets you down. Food is always prepared well. Staff are super friendly too!" },
            { id: 24, establishmentId: 5, title: "Burger perfection", rating: 5, comment: "Every element is perfect. From the bun to the sauce. Best burgers in the area hands down!" },
            { id: 25, establishmentId: 8, title: "Grilled expertise", rating: 5, comment: "The char and flavor on their grilled items is unmatched. Every visit is a treat!" }
        ]
    }
];