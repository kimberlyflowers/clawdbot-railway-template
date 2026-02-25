const fs = require('fs');
const path = require('path');

// Load real product data
const shopData = JSON.parse(
  fs.readFileSync('/data/tiktok-intel/shop-products.json', 'utf8')
);

function calculateROI(videoData, salesData) {
  const views = videoData.views || 0;
  const clicks = views * 0.035; // 3.5% CTR benchmark
  const conversions = clicks * (salesData.conversion_rate || 0.08);
  const revenue = conversions * (salesData.aov || 32);
  const cost = videoData.production_cost || 200;
  const roi = ((revenue - cost) / cost) * 100;
  
  return {
    views,
    clicks: Math.floor(clicks),
    conversions: Math.floor(conversions),
    revenue: Math.floor(revenue),
    cost,
    roi: Math.round(roi),
    roiPercent: roi.toFixed(1) + '%'
  };
}

function analyzeProduct(productName) {
  const product = shopData.top_sellers.find(p => p.name === productName);
  if (!product) return null;
  
  const weeklyRevenue = product.weekly_sales * product.price;
  const monthlyRevenue = weeklyRevenue * 4;
  
  return {
    product: productName,
    price: product.price,
    rating: product.rating,
    weekly_sales: product.weekly_sales,
    weekly_revenue: weeklyRevenue,
    monthly_revenue: monthlyRevenue,
    velocity: product.velocity
  };
}

function rankProductsByROI() {
  return shopData.top_sellers
    .map(p => ({
      name: p.name,
      price: p.price,
      potential_monthly_revenue: p.weekly_sales * p.price * 4,
      rank_score: (p.rating * 10 + p.weekly_sales / 100)
    }))
    .sort((a, b) => b.rank_score - a.rank_score);
}

module.exports = {
  calculateROI,
  analyzeProduct,
  rankProductsByROI,
  getTopProducts: () => shopData.top_sellers
};
