import app from './app.js';

const PORT = Number(process.env.PORT || 3001);

app.listen(PORT, () => {
  console.log(`\n📜 Eber Hebrew Academy API running on http://localhost:${PORT}`);
});
