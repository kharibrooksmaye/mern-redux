export const subscriptionTiers = [
  {
    title: "Free",
    perks: ["Basic access to features", "3 unprocessed samples per month"],
    price: "$0/month",
    users: "5 users",
    samples: 3,
    stripeLookup: "free",
  },
  {
    title: "Bronze",
    perks: [
      "Access to standard features",
      "10 users",
      "5 unprocessed samples per month",
    ],
    price: "$10/month",
    samples: 5,
    stripeLookup: "bronze_monthly",
  },
  {
    title: "Silver",
    perks: [
      "Access to advanced features",
      "20 users",
      "10 unprocessed samples per month",
    ],
    price: "$20/month",
    samples: 10,
    stripeLookup: "silver_monthly",
  },
  {
    title: "Gold",
    perks: [
      "All features + priority support",
      "Unlimited users",
      "Unlimited unprocessed samples per month",
    ],
    price: "$30/month",
    samples: 100,
    stripeLookup: "gold_monthly",
    bestValue: true, // Mark this tier as the best value
  },
];

export const oneTimePackages = [
  { title: "Basic Package", price: "$100", stripeLookup: "basic_package" },
  {
    title: "Standard Package",
    price: "$200",
    stripeLookup: "standard_package",
  },
  {
    title: "Premium Package",
    price: "$300",
    stripeLookup: "premium_package",
  },
];
