# Base Carbon Canopy - Admin Panel Guide

## Overview

The Admin Panel is a new administrative interface for the Base Carbon Canopy project that allows the **contract owner** to manage carbon credit projects through a user-friendly web interface, rather than using scripts or direct smart contract interactions.

## Key Features

### 🔐 **Secure Access Control**
- Only the contract owner can access the admin panel
- Automatic ownership verification through smart contract
- Clear access denied messages for unauthorized users
- Network verification (Base Sepolia only)

### ➕ **Add New Projects**
- Intuitive form interface for creating new carbon credit projects
- Real-time form validation with error handling
- Pre-defined project types and locations for consistency
- Automatic coordinate population when selecting locations
- Direct blockchain integration with transaction tracking

### 📊 **Project Management**
- View all existing projects with detailed information
- Real-time balance tracking for each project
- Summary statistics dashboard
- Live data fetching from the blockchain
- Integration with BaseScan for transaction verification

## Access the Admin Panel

### Navigation
1. **Desktop**: Look for the "Admin" link in the main navigation (only visible to contract owner)
2. **Mobile**: Find "Admin Panel" in the mobile menu
3. **Direct URL**: Navigate to `/admin`

### Prerequisites
- ✅ MetaMask wallet connected
- ✅ Connected to Base Sepolia testnet
- ✅ Account must be the contract owner

## Using the Admin Panel

### Adding a New Project

1. **Navigate to Admin Panel** (`/admin`)
2. **Select "Add New Project" Tab**
3. **Fill in Project Details**:
   - **Project Name**: Descriptive name (e.g., "Kenya Reforestation Initiative")
   - **Project Type**: Choose from predefined types (Reforestation, Renewable Energy, etc.)
   - **Location**: Select from dropdown (auto-fills coordinates)
   - **Latitude/Longitude**: Manual adjustment if needed
   - **Description**: Detailed project description (10-500 characters)
   - **Initial Credit Supply**: Number of carbon credits to mint (1-1,000,000)
   - **Price Per Credit**: Price in mock USDC (0.01-1000)
   - **Recipient Address**: Address to receive minted credits (defaults to your address)

4. **Submit Project**: Click "Create Project" button
5. **Track Transaction**: Monitor progress and view on BaseScan

### Managing Existing Projects

1. **Select "Manage Projects" Tab**
2. **View Summary Statistics**:
   - Total number of projects
   - Total credits minted
   - Your credit balance
   - Average price across projects

3. **Individual Project Information**:
   - Project details and metadata
   - Supply and balance information
   - Price and total value
   - Direct links to contract on BaseScan

4. **Refresh Data**: Use refresh button to update information

## Technical Implementation

### Smart Contract Integration
- **Function Used**: `mintNewProject(name, location, initialSupply, pricePerTon, recipientAddress)`
- **Access Control**: `onlyOwner` modifier ensures security
- **Event Emission**: `ProjectCreated` event for transaction tracking
- **Price Format**: Converts decimal input to 6-decimal USDC format

### Validation & Error Handling
- **Client-side**: Zod schema validation with real-time feedback
- **Blockchain**: Smart contract validation and revert handling
- **Network**: Automatic network switching prompts
- **Addresses**: Ethereum address format validation

### User Experience Features
- **Responsive Design**: Works on desktop and mobile
- **Loading States**: Visual feedback during transactions
- **Success/Error Notifications**: Toast notifications for user feedback
- **Transaction Links**: Direct links to BaseScan for verification
- **Form Reset**: Automatic form clearing after successful submission

## Security Features

### Access Control
```typescript
// Automatic ownership verification
const owner = await carbonCreditContract.owner()
setIsOwner(account.toLowerCase() === owner.toLowerCase())
```

### Network Verification
- Ensures admin actions only occur on Base Sepolia
- Automatic network switching prompts
- Prevents accidental mainnet interactions

### Input Validation
- **Address Validation**: Ethereum address format checking
- **Numeric Validation**: Range checking for supplies and prices
- **String Validation**: Length limits and required fields
- **Coordinate Validation**: Latitude/longitude bounds checking

## Error Handling

### Common Issues & Solutions

1. **"Access Denied" Error**
   - **Cause**: Connected account is not the contract owner
   - **Solution**: Connect with the deployer/owner account

2. **"Wrong Network" Error**
   - **Cause**: Connected to wrong network
   - **Solution**: Switch to Base Sepolia testnet

3. **"Contract not initialized" Error**
   - **Cause**: Smart contract connection failed
   - **Solution**: Refresh page and reconnect wallet

4. **Transaction Failures**
   - **Cause**: Various (insufficient gas, network issues)
   - **Solution**: Check error message and retry

## Integration with Existing App

### No Disruption to Current Features
- ✅ All existing functionality remains unchanged
- ✅ Main app routes and components untouched
- ✅ Current user experience preserved
- ✅ Backward compatibility maintained

### Seamless Navigation
- Admin link appears only for contract owner
- Easy navigation between admin and main app
- Consistent UI/UX design language
- Mobile-responsive interface

## Development Notes

### File Structure
```
frontend/
├── app/
│   └── admin/
│       └── page.tsx              # Main admin page
├── components/
│   └── admin/
│       ├── admin-project-form.tsx    # Project creation form
│       └── admin-project-list.tsx    # Project management view
└── components/layout/
    └── navbar.tsx                # Updated with admin link
```

### Dependencies Added
- Form validation with `react-hook-form` and `zod`
- Toast notifications with existing toast system
- No new external dependencies required

### Smart Contract Compatibility
- Uses existing `mintNewProject` function
- No smart contract changes required
- Full compatibility with current deployment

## Future Enhancements

### Potential Features
- **Bulk Project Import**: CSV/JSON file upload for multiple projects
- **Project Editing**: Ability to update project metadata
- **Advanced Analytics**: Charts and graphs for project performance
- **User Management**: Grant admin access to multiple addresses
- **Audit Logs**: Track all admin actions and changes
- **Project Templates**: Pre-configured project types for faster creation

### Scalability Considerations
- Ready for additional admin features
- Modular component structure for easy extension
- Prepared for role-based access control
- Database integration potential for off-chain metadata

## Conclusion

The Admin Panel provides a powerful, secure, and user-friendly interface for managing carbon credit projects in the Base Carbon Canopy ecosystem. It maintains the integrity of the existing application while adding essential administrative capabilities that scale with the project's growth.

For technical support or feature requests, please refer to the main project documentation or create an issue in the project repository. 