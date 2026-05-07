export const BRAND_CONFIG = {
  name: "DHAGA",
  tagline: "Threads of Elegance",
  contact: {
    phone: "+91 9975579200",
    whatsapp: "919975579200", // Format: CountryCode + Number (No + or spaces)
    email: "contact@dhaga.com",
    address: "Shop no. 5 muktashram apartment rajarampuri 7th lane main road Kolhapur, Kolhapur 416008"
  },
  social: {
    instagram: "https://instagram.com/dhaga_kolhapur",
    facebook: "", // Left empty to remove from site
    youtube: ""   // Left empty to remove from site
  },
  whatsapp_messages: {
    product_inquiry: (productName: string) => 
      `Hi Dhaga! I'm interested in the "${productName}". Could you please provide more details?`,
    general_inquiry: "Hi Dhaga! I'd like to know more about your collection."
  }
};
