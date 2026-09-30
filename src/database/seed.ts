import bcrypt from "bcryptjs";
import User from "./models/User.js";
import Card from "./models/Card.js";
import { generateBizNumber } from "../services/cardsService.js";
import logger from "../logger/logger.js";

const SEED_PASSWORD = "Aa123456!";

const address = {
  state: "",
  country: "Israel",
  city: "Tel Aviv",
  street: "Rothschild",
  houseNumber: 10,
  zip: 6688101,
};

const seedUsers = [
  {
    name: { first: "Regular", middle: "", last: "User" },
    phone: "050-1111111",
    email: "regular@test.com",
    isBusiness: false,
    isAdmin: false,
  },
  {
    name: { first: "Business", middle: "", last: "User" },
    phone: "050-2222222",
    email: "business@test.com",
    isBusiness: true,
    isAdmin: false,
  },
  {
    name: { first: "Admin", middle: "", last: "User" },
    phone: "050-3333333",
    email: "admin@test.com",
    isBusiness: true,
    isAdmin: true,
  },
];

const seedCards = [
  { title: "Coffee Corner", subtitle: "Fresh coffee every morning", description: "A small neighborhood coffee shop." },
  { title: "Code Studio", subtitle: "Web development services", description: "Websites and web apps for small businesses." },
  { title: "Green Garden", subtitle: "Gardening and landscaping", description: "Garden design and maintenance." },
];

const seedDatabase = async () => {
  const password = await bcrypt.hash(SEED_PASSWORD, 10);

  for (const user of seedUsers) {
    if (!(await User.exists({ email: user.email }))) {
      await User.create({ ...user, password, address });
      logger.info(`Seeded user ${user.email}`);
    }
  }

  if ((await Card.countDocuments()) > 0) return;

  const owner = await User.findOne({ email: "business@test.com" });
  if (!owner) return;

  for (const card of seedCards) {
    await Card.create({
      ...card,
      phone: owner.phone,
      email: owner.email,
      web: "https://example.com",
      image: { url: "https://picsum.photos/400/300", alt: card.title },
      address,
      bizNumber: await generateBizNumber(),
      user_id: owner._id,
    });
  }
  logger.info(`Seeded ${seedCards.length} cards`);
};

export default seedDatabase;
