const User = require('./models/User');

const DEMO_USERS = [
  { email: 'demo-alex@soulfinder.local', name: 'Alex' },
  { email: 'demo-zora@soulfinder.local', name: 'Zora' },
  { email: 'demo-lois@soulfinder.local', name: 'Lois' },
];

const randomAge = () => Math.floor(Math.random() * (35 - 25 + 1)) + 25;

// ~0.005 deg offset is roughly 400-500m, keeps demo users within the nearby radius
const randomOffset = () => (Math.random() - 0.5) * 0.01;

const seedDemoUsersNearLocation = async (location) => {
  if (!location?.latitude || !location?.longitude) return;

  await Promise.all(
    DEMO_USERS.map(({ email, name }) =>
      User.findOneAndUpdate(
        { email },
        {
          email,
          name,
          age: randomAge(),
          location: {
            latitude: location.latitude + randomOffset(),
            longitude: location.longitude + randomOffset(),
          },
          lastSeenAt: Date.now(),
        },
        { upsert: true, new: true, runValidators: true }
      )
    )
  );
};

module.exports = { seedDemoUsersNearLocation };
