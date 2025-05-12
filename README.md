# Base Carbon Canopy

**Base Carbon Canopy** is a decentralized platform for trading tokenized carbon credits in the voluntary carbon market (VCM), built on the **Base Sepolia testnet** for the **Base Build India Hackathon** (Stablecoins track). It leverages **mock USDC** as the sole medium for peer-to-peer transactions, ensuring stable, low-cost trading. The platform features a **React DApp** with a **Leaflet.js map** to visualize projects, **AutoML** price forecasting for informed trading, and a **1% fee** mechanism, addressing VCM issues like opacity, high costs, and accessibility barriers. Aligned with **SDGs 13 (Climate Action), 9 (Industry, Innovation), and 10 (Reduced Inequality)**, it empowers small-scale projects in India.

## Problem Addressed

The VCM suffers from:
- **Opacity & Fragmentation**: Lack of transparency and siloed standards erode trust.
- **High Costs**: Intermediary fees (20–30%) reduce project funding.
- **Accessibility Barriers**: Small projects and buyers face complex, costly processes.
- **Liquidity Issues**: Slow settlements and double-counting risks hinder trading.

**Base Carbon Canopy** solves these by offering a transparent, low-cost (1% fee), and accessible platform with instant settlements, AutoML-driven price predictions, and on-chain retirement to prevent double-counting, prioritizing Indian projects.

## Features
- **Tokenized Carbon Credits**: ERC-1155 tokens on Base Sepolia for transparent trading and retirement.
- **Stablecoin Payments**: Mock USDC ensures stable, predictable transactions.
- **Interactive Map**: Leaflet.js displays 5–10 Indian projects (e.g., Rajasthan reforestation).
- **Price Forecasting**: AutoML (Auto-Keras) predicts credit prices, enhancing liquidity.
- **Low Fees**: 1% fee in mock USDC, maximizing funds for projects.
- **User-Friendly DApp**: React interface with MetaMask for easy access.

## Technologies
- **Solidity**: Smart contracts for ERC-1155 credits and mock USDC.
- **React**: Frontend DApp for trading and visualization.
- **OpenZeppelin**: Secure ERC-1155/ERC-20 templates.
- **ethers.js**: Blockchain interactions in the DApp.
- **Leaflet.js**: Interactive project map.
- **Hardhat**: Contract development and deployment.
- **Base Sepolia**: Layer-2 testnet for low-cost transactions.
- **Auto-Keras**: AutoML for price forecasting.
- **Python/pandas/scikit-learn**: Data preprocessing for AutoML.
- **Tailwind CSS**: Responsive DApp styling.
- **Chart.js**: Forecast visualization.
- **Vercel**: DApp hosting.
- **Google Colab**: AutoML training.

## Getting Started

### Prerequisites
- **Node.js** (v18+), **npm/yarn**
- **Python** (3.8+), **pip**
- **MetaMask** with Base Sepolia ETH (via faucet: https://www.alchemy.com/faucets/base-sepolia)
- **Vercel** account
- **Google Colab** account

### Installation
1. **Clone the Repository**:
   ```bash
   git clone https://github.com/S1056SAR/Base-Carbon-Canopy.git
   cd base-carbon-canopy
   ```

2. **Set Up Blockchain**:
   - Install Hardhat dependencies: `npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox @openzeppelin/contracts dotenv`
   - Configure `hardhat.config.js` with Base Sepolia RPC and MetaMask private key in `.env`.
   - Deploy contracts: `npx hardhat run scripts/deploy.js --network baseSepolia`

3. **Set Up AutoML**:
   - Install Python dependencies: `pip install pandas autokeras scikit-learn`
   - Run `train_model.py` in Google Colab with a mock VCM dataset (provided in repo) to generate `forecasts.json`.

4. **Set Up Frontend**:
   - Navigate to `frontend/`: `cd frontend`
   - Install dependencies: `npm install react react-leaflet ethers chart.js react-chartjs-2 tailwindcss`
   - Start DApp: `npm start`
   - Deploy to Vercel: Push to a Git repo and link to Vercel.

### Usage
- Connect MetaMask to Base Sepolia.
- Access the DApp (local or Vercel URL).
- Buy/sell/retire credits using mock USDC.
- View projects on the Leaflet.js map.
- Check AutoML price forecasts in the dashboard.

## Contributing
Contributions are welcome! To contribute:
1. Fork the repo.
2. Create a branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -m "Add your feature"`
4. Push to branch: `git push origin feature/your-feature`
5. Open a pull request.

## License
MIT License

## Contact
For inquiries, reach out via the hackathon platform or GitHub issues.
