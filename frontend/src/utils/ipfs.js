import axios from 'axios';

const PINATA_API_KEY = import.meta.env.VITE_PINATA_API_KEY;
const PINATA_SECRET = import.meta.env.VITE_PINATA_SECRET;
const PINATA_JWT = import.meta.env.VITE_PINATA_JWT;

// Upload JSON data to IPFS via Pinata
export async function uploadToIPFS(data) {
  const url = 'https://api.pinata.cloud/pinning/pinJSONToIPFS';
  
  // Check if Pinata credentials are configured
  if (!PINATA_API_KEY || !PINATA_SECRET) {
    console.warn('Pinata API keys not configured. Using localStorage fallback.');
    // Store in localStorage as fallback for development
    const hash = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem(`ipfs_${hash}`, JSON.stringify(data));
    console.log('Data stored in localStorage with hash:', hash);
    return hash;
  }
  
  try {
    const response = await axios.post(url, data, {
      headers: {
        'Content-Type': 'application/json',
        'pinata_api_key': PINATA_API_KEY,
        'pinata_secret_api_key': PINATA_SECRET,
      },
    });
    
    console.log('Successfully uploaded to IPFS:', response.data.IpfsHash);
    return response.data.IpfsHash;
  } catch (error) {
    console.error('IPFS upload error:', error);
    // Fallback to localStorage
    const hash = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem(`ipfs_${hash}`, JSON.stringify(data));
    console.log('IPFS failed. Data stored in localStorage with hash:', hash);
    return hash;
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
  // Check if it's a localStorage hash
  if (hash.startsWith('local_')) {
    console.log('Fetching from localStorage:', hash);
    const data = localStorage.getItem(`ipfs_${hash}`);
    if (data) {
      try {
        return JSON.parse(data);
      } catch (error) {
        console.error('Failed to parse localStorage data:', error);
        throw new Error('Invalid data in localStorage');
      }
    } else {
      throw new Error('Data not found in localStorage');
    }
  }
  
  // Check if it's a development placeholder hash
  if (hash.includes('DevelopmentHash')) {
    console.warn('Attempting to fetch development placeholder hash:', hash);
    throw new Error('This is a placeholder hash. Please re-upload your menu using the Menu Management feature.');
  }
  
  // Use Pinata gateway or public IPFS gateway
  const gateways = [
    `https://gateway.pinata.cloud/ipfs/${hash}`,
    `https://ipfs.io/ipfs/${hash}`,
    `https://cloudflare-ipfs.com/ipfs/${hash}`,
  ];
  
  for (const url of gateways) {
    try {
      const response = await axios.get(url, { timeout: 5000 });
      console.log(`Successfully fetched from ${url}`);
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
    customerPhone: orderDetails.customerPhone || '',
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

