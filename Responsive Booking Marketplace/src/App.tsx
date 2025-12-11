import { useState, useEffect } from 'react';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner';
import { ScrollToTop } from './components/shared/ScrollToTop';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Hero } from './components/home/Hero';
import { SearchResults } from './components/pages/SearchResults';
import { BusinessProfile } from './components/pages/BusinessProfile';
import { BookingFlow } from './components/booking/BookingFlow';
import { ConfirmationPage } from './components/booking/ConfirmationPage';

// Helper: Fix image URLs from backend
const getImageUrl = (path: string) => {
  if (!path) return 'https://images.unsplash.com/photo-1600948836101-f9ffda59d250?w=800'; 
  if (path.startsWith('http')) return path;
  return `http://localhost:5000/${path.replace(/\\/g, '/')}`;
};

// Helper: Check if business is open right now
const checkIsOpen = (hoursJson: string) => {
    if (!hoursJson) return false;
    try {
        const schedule = JSON.parse(hoursJson);
        const now = new Date();
        const currentDay = now.toLocaleDateString('en-US', { weekday: 'Long' }); // e.g., "Monday"
        const currentTime = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }); // e.g., "14:30"

        const todaySchedule = schedule.find((s: any) => s.day === currentDay);
        
        if (todaySchedule && todaySchedule.isOpen === 1) {
            return currentTime >= todaySchedule.open && currentTime <= todaySchedule.close;
        }
        return false;
    } catch (e) {
        return false;
    }
};

const PREDEFINED_CATEGORIES = ['Salon', 'Restaurant', 'Fitness'];

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  
  // Real Data State
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [filteredBusinesses, setFilteredBusinesses] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  
  const [selectedBusiness, setSelectedBusiness] = useState<any>(null);
  const [selectedServices, setSelectedServices] = useState<any[]>([]);
  const [bookingData, setBookingData] = useState<any>(null);

  // 1. Fetch Merchant List & Merge Categories
  useEffect(() => {
    fetch('http://localhost:5000/api/merchants')
      .then(res => res.json())
      .then(data => {
        // A. Categories Logic
        const dbCategories = data.map((m: any) => m.industry).filter(Boolean);
        const uniqueSet = new Set(PREDEFINED_CATEGORIES);
        dbCategories.forEach((cat: string) => {
             const exists = Array.from(uniqueSet).some(c => c.toLowerCase() === cat.toLowerCase());
             if (!exists) uniqueSet.add(cat);
        });
        setCategories(Array.from(uniqueSet));

        // B. Transform Data & Calculate Attributes
        const mappedData = data.map((b: any) => {
          const minPrice = b.min_price || 0;
          
          // Logic: Price Tier
          let tier = 1; 
          if (minPrice > 100) tier = 4;      
          else if (minPrice > 60) tier = 3;  
          else if (minPrice > 30) tier = 2;

          // Logic: Open Now
          const isOpenNow = checkIsOpen(b.hours_json);

          return {
            id: b.id.toString(),
            slug: b.slug,
            name: b.name,
            category: b.industry || 'Uncategorized',
            description: b.about || 'No description available',
            image: getImageUrl(b.cover_photo_path),
            location: b.address,
            rating: 5.0, 
            reviewCount: 0,
            depositRequired: b.deposit_required ? Boolean(b.deposit_required) : false,
            minPrice: minPrice,
            priceTier: tier,
            isOpen: isOpenNow,
            
            whatsappEnabled: true,
            instantConfirm: true,
            phone: '+1234567890',
            address: b.address,
            gallery: [getImageUrl(b.cover_photo_path)],
            hours: {},
            badges: isOpenNow ? ['Open Now'] : []
          };
        });
        
        setBusinesses(mappedData);
        setFilteredBusinesses(mappedData);
      })
      .catch(err => console.error("Failed to fetch merchants:", err));
  }, []);

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 2. Advanced Search Logic
  const handleSearch = (filters: any) => {
    if (!filters || Object.keys(filters).length === 0) {
        setFilteredBusinesses(businesses);
        handleNavigate('browse');
        return;
    }

    const results = businesses.filter(b => {
      // Filter 1: Text Search (Name OR Address)
      const matchQuery = filters.query 
        ? (b.name.toLowerCase().includes(filters.query.toLowerCase()) || 
           b.address.toLowerCase().includes(filters.query.toLowerCase()))
        : true;

      // Filter 2: Category
      const matchCategory = filters.categories?.length > 0 
        ? filters.categories.some((c: string) => c.toLowerCase() === b.category.toLowerCase())
        : true;

      // Filter 3: Deposit
      const matchDeposit = filters.noDeposit 
        ? b.depositRequired === false 
        : true;

      // Filter 4: Price Tier
      const matchPrice = filters.priceTiers?.length > 0 
        ? filters.priceTiers.includes(b.priceTier)
        : true;

      // Filter 5: Open Now
      const matchOpen = filters.openNow 
        ? b.isOpen === true 
        : true;

      // Filter 6: Location (Legacy)
      const matchLocation = filters.location 
        ? b.address.toLowerCase().includes(filters.location.toLowerCase()) 
        : true;

      return matchQuery && matchCategory && matchDeposit && matchPrice && matchOpen && matchLocation;
    });

    setFilteredBusinesses(results);
    handleNavigate('browse');
  };

  // 3. Fetch Details
  const handleBusinessClick = async (id: string) => {
    const business = businesses.find(b => b.id === id);
    if (!business) return;

    try {
      const res = await fetch(`http://localhost:5000/api/merchants/${business.slug}`);
      const fullData = await res.json();
      
      const formattedHours: any = {};
      if (fullData.hours) {
        fullData.hours.forEach((h: any) => {
           if(h.is_open) {
             formattedHours[h.day_of_week] = `${h.open_time} - ${h.close_time}`;
           } else {
             formattedHours[h.day_of_week] = 'Closed';
           }
        });
      }

      setSelectedBusiness({
        ...business,
        description: fullData.about || business.description,
        hours: formattedHours,
        policies: {
          cancellation: fullData.cancellation_policy || "Standard 24h cancellation",
          deposit: fullData.deposit_required ? "Deposit Required" : "No deposit required",
          lateArrival: "15 min grace period"
        },
        gallery: [
            getImageUrl(fullData.cover_photo_path), 
            getImageUrl(fullData.logo_path)
        ].filter(Boolean)
      });
      
      setSelectedServices(fullData.services || []);
      setCurrentPage('business-profile');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      toast.error("Could not load business details");
      console.error(err);
    }
  };

  const handleStartBooking = (data: any) => {
    setBookingData(data);
    setCurrentPage('booking-flow');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBookingComplete = async (finalData: any) => {
      try {
        const payload = {
          merchant_id: selectedBusiness.id,
          service_id: finalData.service.id,
          customer_name: finalData.name,
          customer_phone: finalData.phone,
          customer_email: finalData.email,
          booking_date: finalData.date.toISOString().split('T')[0], 
          booking_time: finalData.time,
          party_size: finalData.partySize,
          total_price: finalData.totalPrice,
          notes: finalData.notes
        };

        const response = await fetch('http://localhost:5000/api/bookings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          toast.success("Booking Confirmed! Check your WhatsApp.");
          handleNavigate('confirmation');
        } else {
          toast.error("Booking failed. Please try again.");
        }
      } catch (error) {
        console.error(error);
        toast.error("Network error. Please check your connection.");
      }
    };

  return (
    <div className="min-h-screen">
      <Navbar onNavigate={handleNavigate} currentPage={currentPage} onAuthClick={() => {}} />

      {currentPage === 'home' && (
        <>
          <Hero onSearch={handleSearch} />
          <Footer />
        </>
      )}

      {currentPage === 'browse' && (
        <>
          <SearchResults
            businesses={filteredBusinesses} 
            onBusinessClick={(id) => handleBusinessClick(id)}
            categories={categories}
            onFilterChange={handleSearch}
          />
          <Footer />
        </>
      )}

      {currentPage === 'business-profile' && selectedBusiness && (
        <>
          <BusinessProfile
            business={selectedBusiness}
            services={selectedServices}
            reviews={[]} 
            onStartBooking={handleStartBooking}
            onWhatsAppClick={() => {}}
          />
          <Footer />
        </>
      )}

      {currentPage === 'booking-flow' && selectedBusiness && (
        <BookingFlow
          business={selectedBusiness}
          initialData={bookingData}
          onComplete={handleBookingComplete}
          onBack={() => handleNavigate('business-profile')}
        />
      )}
      
      {currentPage === 'confirmation' && (
         <ConfirmationPage 
            booking={bookingData} 
            onHome={() => handleNavigate('home')}
            onReschedule={() => {}}
            onViewBookings={() => {}}
            onWhatsAppClick={() => {}}
         />
      )}

      <Toaster />
      <ScrollToTop />
    </div>
  );
}