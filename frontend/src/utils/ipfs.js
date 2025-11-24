import axios from 'axios';

const PINATA_API_KEY = import.meta.env.VITE_PINATA_API_KEY;
const PINATA_SECRET = import.meta.env.VITE_PINATA_SECRET;
const PINATA_JWT = import.meta.env.VITE_PINATA_JWT;

// ============================================================================
// CRITICAL: NO LOCALSTORAGE FALLBACK
// ============================================================================
// All data MUST be stored on IPFS for cross-device compatibility
// If Pinata credentials are missing, operations will fail with clear errors
// ============================================================================

function validatePinataConfig() {
  if (!PINATA_API_KEY || !PINATA_SECRET) {
    throw new Error(
      '❌ IPFS NOT CONFIGURED\n\n' +
      'Pinata API credentials are required for this application to work across devices.\n\n' +
      'Please set the following environment variables:\n' +
      '  VITE_PINATA_API_KEY=your_api_key\n' +
      '  VITE_PINATA_SECRET=your_secret_key\n\n' +
      'Get your free Pinata API keys at: https://pinata.cloud\n' +
      'Then add them to your .env file or Vercel environment variables.'
    );
  }
}

/**
 * Upload JSON data to IPFS via Pinata
 * @throws {Error} If Pinata credentials are not configured or upload fails
 */
export async function uploadToIPFS(data) {
  // ALWAYS validate Pinata config - no fallback allowed
  validatePinataConfig();
  
  const url = 'https://api.pinata.cloud/pinning/pinJSONToIPFS';
  
  try {
    console.log('Uploading to IPFS via Pinata...');
    const response = await axios.post(url, data, {
      headers: {
        'Content-Type': 'application/json',
        'pinata_api_key': PINATA_API_KEY,
        'pinata_secret_api_key': PINATA_SECRET,
      },
      timeout: 30000, // 30 second timeout
    });
    
    const ipfsHash = response.data.IpfsHash;
    console.log('✅ Successfully uploaded to IPFS:', ipfsHash);
    return ipfsHash;
  } catch (error) {
    console.error('❌ IPFS upload failed:', error.response?.data || error.message);
    throw new Error(
      'Failed to upload to IPFS. Please check your internet connection and Pinata API credentials.\n' +
      `Error: ${error.response?.data?.error || error.message}`
    );
  }
}

/**
 * Upload image file to IPFS via Pinata
 * @throws {Error} If Pinata credentials are not configured or upload fails
 */
export async function uploadImageToIPFS(file) {
  validatePinataConfig();
  
  const url = 'https://api.pinata.cloud/pinning/pinFileToIPFS';
  const formData = new FormData();
  formData.append('file', file);

  try {
    console.log('Uploading image to IPFS via Pinata...');
    const response = await axios.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'pinata_api_key': PINATA_API_KEY,
        'pinata_secret_api_key': PINATA_SECRET,
      },
      timeout: 60000, // 60 second timeout for images
    });
    
    const ipfsHash = response.data.IpfsHash;
    console.log('✅ Successfully uploaded image to IPFS:', ipfsHash);
    return ipfsHash;
  } catch (error) {
    console.error('❌ Image upload to IPFS failed:', error.response?.data || error.message);
    throw new Error(
      'Failed to upload image to IPFS. Please check your internet connection.\n' +
      `Error: ${error.response?.data?.error || error.message}`
    );
  }
}

/**
 * Fetch data from IPFS via multiple gateways
 * @throws {Error} If hash is invalid or data cannot be fetched
 */
export async function fetchFromIPFS(hash) {
  if (!hash) {
    throw new Error('IPFS hash is required');
  }
  
  // Reject old localStorage hashes with helpful error
  if (hash.startsWith('local_')) {
    throw new Error(
      '❌ INVALID IPFS HASH\n\n' +
      'This data was stored locally on another device and cannot be accessed.\n\n' +
      'Please re-upload the data (menu, metadata, etc.) to save it to IPFS.\n' +
      'IPFS data is accessible from all devices, but local data is device-specific.'
    );
  }
  
  // Reject development placeholder hashes
  if (hash.includes('DevelopmentHash') || hash.includes('placeholder')) {
    throw new Error(
      '❌ PLACEHOLDER HASH\n\n' +
      'This is a development placeholder hash.\n' +
      'Please re-upload your data using the proper IPFS upload functionality.'
    );
  }
  
  // Try multiple IPFS gateways for reliability
  const gateways = [
    `https://gateway.pinata.cloud/ipfs/${hash}`,
    `https://ipfs.io/ipfs/${hash}`,
    `https://cloudflare-ipfs.com/ipfs/${hash}`,
    `https://dweb.link/ipfs/${hash}`,
  ];
  
  let lastError = null;
  
  for (const url of gateways) {
    try {
      console.log(`Fetching from IPFS gateway: ${url}`);
      const response = await axios.get(url, { 
        timeout: 10000, // 10 second timeout per gateway
        validateStatus: (status) => status === 200,
      });
      
      console.log(`✅ Successfully fetched from ${url}`);
      return response.data;
    } catch (error) {
      console.warn(`Failed to fetch from ${url}:`, error.message);
      lastError = error;
      continue; // Try next gateway
    }
  }
  
  // All gateways failed
  throw new Error(
    '❌ FAILED TO FETCH FROM IPFS\n\n' +
    'Could not retrieve data from any IPFS gateway.\n' +
    'This could mean:\n' +
    '  1. The IPFS hash is invalid\n' +
    '  2. The data was not properly uploaded to IPFS\n' +
    '  3. IPFS gateways are temporarily unavailable\n\n' +
    `Hash: ${hash}\n` +
    `Error: ${lastError?.message || 'Unknown error'}`
  );
}

/**
 * Get IPFS gateway URL for displaying images
 */
export function getIPFSUrl(hash) {
  if (!hash || hash.startsWith('local_')) return '';
  return `https://gateway.pinata.cloud/ipfs/${hash}`;
}

/**
 * Create metadata for restaurant registration
 * @throws {Error} If upload to IPFS fails
 */
export async function createRestaurantMetadata(restaurantData) {
  const metadata = {
    name: restaurantData.name,
    description: restaurantData.description,
    image: restaurantData.imageHash || '',
    address: restaurantData.address || '',
    cuisine: restaurantData.cuisine || '',
    contactInfo: restaurantData.contactInfo || '',
    timestamp: Date.now(),
    version: '1.0',
  };
  
  console.log('Creating restaurant metadata for IPFS...');
  return await uploadToIPFS(metadata);
}

/**
 * Create menu data structure
 * @throws {Error} If upload to IPFS fails
 */
export async function createMenuData(menuItems) {
  if (!menuItems || menuItems.length === 0) {
    throw new Error('Menu must have at least one item');
  }
  
  const menuData = {
    items: menuItems,
    lastUpdated: Date.now(),
    version: '1.0',
  };
  
  console.log('Creating menu data for IPFS...', { itemCount: menuItems.length });
  return await uploadToIPFS(menuData);
}

/**
 * Create order data structure
 * @throws {Error} If upload to IPFS fails
 */
export async function createOrderData(orderDetails) {
  if (!orderDetails.items || orderDetails.items.length === 0) {
    throw new Error('Order must have at least one item');
  }
  
  const orderData = {
    items: orderDetails.items,
    restaurantId: orderDetails.restaurantId,
    customer: orderDetails.customer,
    deliveryAddress: orderDetails.deliveryAddress || '',
    customerPhone: orderDetails.customerPhone || '',
    specialInstructions: orderDetails.specialInstructions || '',
    timestamp: Date.now(),
    version: '1.0',
  };
  
  console.log('Creating order data for IPFS...');
  return await uploadToIPFS(orderData);
}

/**
 * Create rider metadata
 * @throws {Error} If upload to IPFS fails
 */
export async function createRiderMetadata(riderData) {
  const metadata = {
    name: riderData.name,
    vehicleType: riderData.vehicleType || 'bike',
    phoneNumber: riderData.phoneNumber || '',
    profileImage: riderData.profileImageHash || '',
    timestamp: Date.now(),
    version: '1.0',
  };
  
  console.log('Creating rider metadata for IPFS...');
  return await uploadToIPFS(metadata);
}

/**
 * Check if Pinata is properly configured
 * Returns true if credentials are set, false otherwise
 */
export function isPinataConfigured() {
  return !!(PINATA_API_KEY && PINATA_SECRET);
}
