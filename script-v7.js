const LINKEDIN_URL = "https://www.linkedin.com/in/joffrey-achard/";
const PORTFOLIO_STORAGE_KEY = "joffrey-portfolio-content";

if (window.DEFAULT_PORTFOLIO) {
  window.DEFAULT_PORTFOLIO.linkedin = LINKEDIN_URL;
}

try {
  const savedPortfolio = localStorage.getItem(PORTFOLIO_STORAGE_KEY);
  if (savedPortfolio) {
    const portfolioData = JSON.parse(savedPortfolio);
    portfolioData.linkedin = LINKEDIN_URL;
    localStorage.setItem(PORTFOLIO_STORAGE_KEY, JSON.stringify(portfolioData));
  }
} catch (error) {
  // The default portfolio data still provides the correct public link.
}

const portfolioScript = document.createElement("script");
portfolioScript.src = "https://cdn.jsdelivr.net/gh/Joffrey117/Portfolio@a0c9bad87ccf903e39b795614d68d9ec48a31b35/script-v7.js";
portfolioScript.onload = () => {
  document.querySelectorAll('[data-field-href="linkedin"]').forEach((link) => {
    link.href = LINKEDIN_URL;
  });
};
document.head.appendChild(portfolioScript);
