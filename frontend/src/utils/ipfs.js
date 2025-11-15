import axios from 'axios';

const PINATA_API_KEY = import.meta.env.VITE_PINATA_API_KEY;
const PINATA_SECRET = import.meta.env.VITE_PINATA_SECRET;
const PINATA_JWT = import.meta.env.VITE_PINATA_JWT;

// Upload JSON data to IPFS via Pinata
export async function uploadToIPFS(data) {
  const url = 'https://api.pinata.cloud/pinning/pinJSONToIPFS';
  
  try {
    const response = await axios.post(url, data, {
      headers: {
        'Content-Type': 'application/json',
        'pinata_api_key': PINATA_API_KEY,
        'pinata_secret_api_key': PINATA_SECRET,
      },
    });
    
    return response.data.IpfsHash;
  } catch (error) {
    console.error('IPFS upload error:', error);
    // Return a placeholder hash for development
    return `Qm${Date.now()}DevelopmentHash`;
  }
}

// Upload image file to IPFS via Pinata
export async function uploadImageToIPFS(file) {
  const url = 'https://api.pinata.cloud/pinning/pinFileToIPFS';
  
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await axios.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'pinata_api_key': PINATA_API_KEY,
        'pinata_secret_api_key': PINATA_SECRET,
      },
    });
    
    return response.data.IpfsHash;
  } catch (error) {
    console.error('Image upload error:', error);
    return null;
  }
}

// Fetch data from IPFS
export async function fetchFromIPFS(hash) {
  // Use Pinata gateway or public IPFS gateway
  const gateways = [
    `https://gateway.pinata.cloud/ipfs/${hash}`,
    `https://ipfs.io/ipfs/${hash}`,
    `https://cloudflare-ipfs.com/ipfs/${hash}`,
  ];
  
  for (const url of gateways) {
    try {
      const response = await axios.get(url, { timeout: 5000 });
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch from ${url}:`, error.message);
      continue;
    }
  }
  
  throw new Error('Failed to fetch from IPFS from all gateways');
}

// Get IPFS gateway URL for displaying images
export function getIPFSUrl(hash) {
  if (!hash) return '';
  return `https://gateway.pinata.cloud/ipfs/${hash}`;
}

// Create metadata for restaurant registration
export async function createRestaurantMetadata(restaurantData) {
  const metadata = {
    name: restaurantData.name,
    description: restaurantData.description,
    image: restaurantData.imageHash || '',
    address: restaurantData.address || '',
    cuisine: restaurantData.cuisine || '',
    contactInfo: restaurantData.contactInfo || '',
    timestamp: Date.now(),
  };
  
  return await uploadToIPFS(metadata);
}

// Create menu data structure
export async function createMenuData(menuItems) {
  const menuData = {
    items: menuItems,
    lastUpdated: Date.now(),
    version: '1.0',
  };
  
  return await uploadToIPFS(menuData);
}

// Create order data structure
export async function createOrderData(orderDetails) {
  const orderData = {
    items: orderDetails.items,
    restaurantId: orderDetails.restaurantId,
    customer: orderDetails.customer,
    deliveryAddress: orderDetails.deliveryAddress || '',
    specialInstructions: orderDetails.specialInstructions || '',
    timestamp: Date.now(),
  };
  
  return await uploadToIPFS(orderData);
}

// Create rider metadata
export async function createRiderMetadata(riderData) {
  const metadata = {
    name: riderData.name,
    vehicleType: riderData.vehicleType || 'bike',
    phoneNumber: riderData.phoneNumber || '',
    profileImage: riderData.profileImageHash || '',
    timestamp: Date.now(),
  };
  
  return await uploadToIPFS(metadata);
}

