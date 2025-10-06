'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { User, MapPin, Package, Phone, Mail, Globe } from 'lucide-react';
import { translate, type SupportedLanguage } from '@/lib/i18n';
import { SelectablePriceCard } from '@/components/selectable-price-card';
import PhoneCodeSelector from '@/components/phone-code-selector';
import DestinationCountrySelector from '@/components/destination-country-selector';
import usePriceCardStore from '@/stores/usePriceCardStore';

interface FormData {
  // Sender Information
  sender_name: string;
  sender_tc: string;
  sender_address: string;
  sender_contact: string;
  sender_phone_code: string;
  
  // Receiver Information
  receiver_name: string;
  city_postal: string;
  receiver_address: string;
  destination: string;
  receiver_contact: string;
  receiver_phone_code: string;
  receiver_email: string;
  
  // Shipment Information
  content_description: string;
  content_value: string;
  
  // Selected carrier information
  selected_carrier?: string;
  selected_quote?: any;
}

export default function ShipmentRequestForm() {
  const [language, setLanguage] = useState<SupportedLanguage>('en');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showOnlyPriceSelection, setShowOnlyPriceSelection] = useState(false);
  
  // Use price card store
  const { 
    currentPriceCardData, 
    selectedCarrier, 
    selectedQuote, 
    setSelectedCarrier,
    clearSelectedCarrier 
  } = usePriceCardStore();

  const handleCarrierSelect = (carrier: string, quote: any) => {
    setSelectedCarrier(carrier, quote);
    setFormData(prev => ({
      ...prev,
      selected_carrier: carrier,
      selected_quote: quote
    }));
  };
  
  const [formData, setFormData] = useState<FormData>({
    sender_name: '',
    sender_tc: '',
    sender_address: '',
    sender_contact: '',
    sender_phone_code: '+90',
    receiver_name: '',
    city_postal: '',
    receiver_address: '',
    destination: '',
    receiver_contact: '',
    receiver_phone_code: '+90',
    receiver_email: '',
    content_description: '',
    content_value: ''
  });

  useEffect(() => {
    const cookie = document.cookie
      .split('; ')
      .find((c) => c.startsWith('lang='));
    if (cookie) {
      const value = cookie.split('=')[1] as SupportedLanguage;
      if (value === 'en' || value === 'tr') setLanguage(value);
    }
  }, []);

  const handleLanguageChange = (newLanguage: SupportedLanguage) => {
    setLanguage(newLanguage);
    const expires = new Date(Date.now() + 365 * 24 * 3600 * 1000).toUTCString();
    document.cookie = `lang=${newLanguage}; path=/; expires=${expires}`;
    // Don't reload the page - just update the state
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    // Handle phone number formatting and restriction
    if (field === 'sender_contact' || field === 'receiver_contact') {
      // Remove all non-digits
      const digitsOnly = value.replace(/\D/g, '');
      // Limit to 10 digits
      const limitedDigits = digitsOnly.slice(0, 10);
      value = limitedDigits;
    }
    
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear field error when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    // Required fields validation
    const requiredFields = {
      sender_name: getText('senderName'),
      sender_tc: getText('senderTC'),
      sender_address: getText('address'),
      sender_contact: getText('contactNo'),
      receiver_name: getText('receiverName'),
      city_postal: getText('cityPostal'),
      receiver_address: getText('address'),
      destination: getText('destination'),
      receiver_contact: getText('contactNo'),
      receiver_email: getText('contactEmail'),
      content_description: getText('contentDescription')
    };

    Object.entries(requiredFields).forEach(([field, label]) => {
      if (!formData[field as keyof FormData]?.trim()) {
        errors[field] = language === 'tr' 
          ? `${label} alanı zorunludur` 
          : `${label} field is required`;
      }
    });

    // Email validation
    if (formData.receiver_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.receiver_email)) {
      errors.receiver_email = language === 'tr' 
        ? 'Geçerli bir email adresi giriniz' 
        : 'Please enter a valid email address';
    }

    // Phone number validation (must be exactly 10 digits)
    if (formData.sender_contact && formData.sender_contact.length !== 10) {
      errors.sender_contact = language === 'tr' 
        ? 'Telefon numarası 10 haneli olmalıdır' 
        : 'Phone number must be 10 digits';
    }
    
    if (formData.receiver_contact && formData.receiver_contact.length !== 10) {
      errors.receiver_contact = language === 'tr' 
        ? 'Telefon numarası 10 haneli olmalıdır' 
        : 'Phone number must be 10 digits';
    }

    // Carrier selection validation
    if (!selectedCarrier || !selectedQuote) {
      errors.selected_carrier = language === 'tr' 
        ? 'Lütfen bir kargo firması seçin' 
        : 'Please select a shipping carrier';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSuccessPopupClose = () => {
    setShowSuccessPopup(false);
    setSubmitStatus('idle');
    setShowOnlyPriceSelection(true);
    
    // Reset form
    setFormData({
      sender_name: '',
      sender_tc: '',
      sender_address: '',
      sender_contact: '',
      sender_phone_code: '+90',
      receiver_name: '',
      city_postal: '',
      receiver_address: '',
      destination: '',
      receiver_contact: '',
      receiver_phone_code: '+90',
      receiver_email: '',
      content_description: '',
      content_value: ''
    });
    
    // Clear field errors
    setFieldErrors({});
    
    // Clear selected carrier and price card
    clearSelectedCarrier();
  };

  const handleNewSubmission = () => {
    setShowOnlyPriceSelection(false);
    setSubmitStatus('idle');
    setFieldErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form before submission
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const response = await fetch('/api/admin/form-submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          user_type: 'guest',
          status: 'pending',
          // Include price card information
          selected_carrier: selectedCarrier,
          selected_quote: selectedQuote,
          destination_country: currentPriceCardData?.country,
          package_quantity: currentPriceCardData?.quantity,
          total_weight: currentPriceCardData?.totalWeight,
          price_card_timestamp: currentPriceCardData?.timestamp,
          // Enhanced shipping details
          chargeable_weight: selectedQuote?.chargeableWeight,
          cargo_price: selectedQuote?.totalPrice,
          service_type: selectedQuote?.serviceType
        }),
      });

      if (response.ok) {
        setSubmitStatus('success');
        setShowSuccessPopup(true);
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getText = (key: string) => {
    const texts = {
      title: language === 'tr' ? 'Gönderi Talep Formu' : 'Shipment Request Form',
      senderInfo: language === 'tr' ? 'Gönderici Bilgileri' : 'SENDER INFORMATION',
      receiverInfo: language === 'tr' ? 'Alıcı Bilgileri' : 'RECEIVER INFORMATION',
      shipmentInfo: language === 'tr' ? 'Gönderi Bilgisi' : 'SHIPMENT INFORMATION',
      senderName: language === 'tr' ? 'Gönderici Ad Soyad' : 'Sender Name Surname',
      senderNamePlaceholder: language === 'tr' ? 'Ad soyad' : 'Full name',
      senderTC: language === 'tr' ? 'Gönderici TC No' : 'Sender Tax No',
      senderTCPlaceholder: language === 'tr' ? 'TC kimlik numarası' : 'Tax number',
      address: language === 'tr' ? 'Adres' : 'Address',
      addressPlaceholder: language === 'tr' ? 'Detaylı adres bilgisi' : 'Detailed address information',
      contactNo: language === 'tr' ? 'İletişim No' : 'Contact No',
      contactPlaceholder: language === 'tr' ? '(___) (___) (__) (__)' : '(___) (___) (__) (__)',
      receiverName: language === 'tr' ? 'Alıcı Ad Soyad' : 'Receiver Name Surname',
      receiverNamePlaceholder: language === 'tr' ? 'Ad soyad' : 'Full name',
      cityPostal: language === 'tr' ? 'Şehir Posta Kodu' : 'City Postal Code',
      cityPostalPlaceholder: language === 'tr' ? 'Şehir ve posta kodu' : 'City and postal code',
      destination: language === 'tr' ? 'Varış Noktası' : 'Destination',
      destinationPlaceholder: language === 'tr' ? 'Hedef ülke/şehir' : 'Target country/city',
      contactEmail: language === 'tr' ? 'İletişim Email' : 'Contact Email',
      emailPlaceholder: language === 'tr' ? 'Email adresi' : 'Email address',
      contentDescription: language === 'tr' ? 'İçerik Açıklaması' : 'Content Description',
      contentPlaceholder: language === 'tr' ? 'Paket içeriği' : 'Package contents',
      contentValue: language === 'tr' ? 'İçerik Değeri $' : 'Content Value $',
      valuePlaceholder: language === 'tr' ? 'Değer (USD)' : 'Value (USD)',
      submitForm: language === 'tr' ? 'Formu Gönder' : 'Submit Form',
      submitting: language === 'tr' ? 'Gönderiliyor...' : 'Submitting...',
      successMessage: language === 'tr' ? 'Formunuz başarıyla gönderildi!' : 'Your form has been submitted successfully!',
      errorMessage: language === 'tr' ? 'Form gönderilirken bir hata oluştu. Lütfen tekrar deneyin.' : 'An error occurred while submitting the form. Please try again.',
      shippingProcessTitle: language === 'tr' ? 'Gönderim Süreci' : 'Shipping Process',
      shippingProcess1: language === 'tr' ? 'Kargo Gönderimi: Gönderinizi, 157381919 MNG Anlaşma Kodu ile ücretsiz olarak tarafımıza gönderebilirsiniz.' : 'Cargo Shipment: You can send your shipment to us free of charge with the 157381919 MNG Agreement Code.',
      shippingProcess2: language === 'tr' ? 'Ölçüm ve Fiyatlandırma: Depomuza ulaşan kargonuzun ağırlık ve ölçümleri yapılarak ücretlendirme tarafınıza bildirilir.' : 'Measurement and Pricing: Weight and measurements of your cargo reaching our warehouse will be made and pricing will be notified to you.',
      shippingProcess3: language === 'tr' ? 'Erken Takip Kodu: Dilerseniz, gönderiniz henüz depomuza ulaşmadan erken takip kodu alabilirsiniz.' : 'Early Tracking Code: If you wish, you can get an early tracking code before your shipment reaches our warehouse.',
      shippingProcess4: language === 'tr' ? 'Onay ve Ödeme: Ücreti onaylamanızın ardından ödeme faturanız hazırlanır.' : 'Approval and Payment: After you approve the fee, your payment invoice is prepared.',
      shippingProcess5: language === 'tr' ? 'Takip ve Çıkış: Ödeme sonrasında takip kodunuz ve gerekli evraklar paylaşılır, gönderiniz çıkışa hazırlanır.' : 'Tracking and Departure: After payment, your tracking code and necessary documents are shared, your shipment is prepared for departure.',
      pickupService: language === 'tr' ? 'İstanbul veya Adana\'daysanız, kargonuzu kapınızdan ücretsiz olarak kendi kuryelerimizle alabiliriz.' : 'If you are in Istanbul or Adana, we can pick up your cargo from your door free of charge with our own couriers.',
      hipexInfo: language === 'tr' ? 'Dexpell Cargo olarak, her gün dünyanın dört bir yanına hava kargo ve karayolu ile kargo gönderimi yapıyoruz!' : 'As Dexpell, we make cargo shipments by air cargo and road to all over the world every day!'
    };
    return texts[key as keyof typeof texts] || key;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center items-center gap-4 mb-4">
            <h1 className="text-4xl font-bold text-white">
              {getText('title')}
            </h1>
            <div className="flex items-center gap-2">
              <Button
                variant={language === 'en' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleLanguageChange('en')}
              >
                EN
              </Button>
              <Button
                variant={language === 'tr' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleLanguageChange('tr')}
              >
                TR
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content - Dynamic Layout */}
        <div className="max-w-7xl mx-auto">
          <div className={showOnlyPriceSelection ? "flex justify-center" : "grid grid-cols-1 lg:grid-cols-3 gap-8"}>
            
            {/* Left Column - Price Cards (hidden when showing success view) */}
            {!showOnlyPriceSelection && (
              <div className="lg:col-span-1">
                <div className="sticky top-8">
                  <Card className="border-0 bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm shadow-2xl">
                    <CardHeader className="bg-gradient-to-r from-indigo-600/20 to-purple-700/20 border-b border-indigo-500/30">
                      <CardTitle className="flex items-center gap-4">
                        <div className="p-3 bg-indigo-600 rounded-xl shadow-lg">
                          <Package className="h-7 w-7 text-white" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-white">
                            {language === 'tr' ? 'Kargo Seçenekleri' : 'Shipping Options'}
                          </h2>
                          <p className="text-sm text-gray-300 mt-1">
                            {language === 'tr' ? 'Bir kargo firması seçin' : 'Select a shipping carrier'}
                          </p>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      {currentPriceCardData ? (
                        <SelectablePriceCard
                          country={currentPriceCardData.country}
                          quotes={currentPriceCardData.quotes}
                          quantity={currentPriceCardData.quantity}
                          totalWeight={currentPriceCardData.totalWeight}
                          language={language}
                          selectedCarrier={selectedCarrier || ''}
                          onCarrierSelect={handleCarrierSelect}
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center py-8 space-y-4">
                          <div className="p-3 bg-gray-600/20 rounded-lg">
                            <Package className="h-6 w-6 text-gray-400" />
                          </div>
                          <p className="text-gray-400 text-sm text-center">
                            {language === 'tr' 
                              ? 'Önce chat\'te kargo fiyatı hesaplayın, sonra buradan seçim yapabilirsiniz' 
                              : 'Calculate shipping prices in chat first, then you can select here'
                            }
                          </p>
                        </div>
                      )}
                      {fieldErrors.selected_carrier && (
                        <div className="mt-4 p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
                          <p className="text-red-400 text-sm text-center">{fieldErrors.selected_carrier}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Support Information Card */}
                  <Card className="border-0 bg-slate-800/50 backdrop-blur-sm mt-6">
                    <CardContent className="p-6">
                      <div className="space-y-3">
                        <div className="flex items-center justify-center gap-3 text-gray-300">
                          <Mail className="h-5 w-5 text-blue-400" />
                          <span className="text-sm font-medium">SUPPORT: info@dexpell.com</span>
                        </div>
                        <div className="flex items-center justify-center gap-3 text-gray-300">
                          <Phone className="h-5 w-5 text-green-400" />
                          <span className="text-sm font-medium">PHONE: +90 212 852 55 00</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Right Column - Form */}
            <div className={showOnlyPriceSelection ? "w-full max-w-4xl" : "lg:col-span-2"}>
              {showOnlyPriceSelection ? (
                /* Shipping Process and Support Only View */
                <div className="space-y-8">
                  {/* Shipping Process Card */}
                  <Card className="border-0 bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm shadow-2xl">
                    <CardHeader className="bg-gradient-to-r from-green-600/20 to-green-700/20 border-b border-green-500/30">
                      <CardTitle className="flex items-center gap-4">
                        <div className="p-3 bg-green-600 rounded-xl shadow-lg">
                          <Package className="h-7 w-7 text-white" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-white">
                            {language === 'tr' ? 'Gönderim Süreci' : 'Shipping Process'}
                          </h2>
                          <p className="text-sm text-green-300 mt-1">
                            {language === 'tr' ? 'Formunuz başarıyla gönderildi!' : 'Your form has been submitted successfully!'}
                          </p>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 space-y-6">
                      <div className="space-y-4">
                        <div className="flex items-start gap-4 p-4 bg-blue-600/10 rounded-lg border border-blue-500/20">
                          <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                          <div>
                            <h4 className="font-semibold text-white mb-2">
                              {language === 'tr' ? 'Kargo Gönderimi' : 'Cargo Shipment'}
                            </h4>
                            <p className="text-gray-300 text-sm">
                              {language === 'tr' 
                                ? 'Gönderinizi, 157381919 MNG Anlaşma Kodu ile ücretsiz olarak tarafımıza gönderebilirsiniz.' 
                                : 'You can send your shipment to us free of charge with the 157381919 MNG Agreement Code.'
                              }
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-4 p-4 bg-purple-600/10 rounded-lg border border-purple-500/20">
                          <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                          <div>
                            <h4 className="font-semibold text-white mb-2">
                              {language === 'tr' ? 'Ölçüm ve Fiyatlandırma' : 'Measurement and Pricing'}
                            </h4>
                            <p className="text-gray-300 text-sm">
                              {language === 'tr' 
                                ? 'Depomuza ulaşan kargonuzun ağırlık ve ölçümleri yapılarak ücretlendirme tarafınıza bildirilir.' 
                                : 'Weight and measurements of your cargo reaching our warehouse will be made and pricing will be notified to you.'
                              }
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-4 p-4 bg-orange-600/10 rounded-lg border border-orange-500/20">
                          <div className="flex-shrink-0 w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                          <div>
                            <h4 className="font-semibold text-white mb-2">
                              {language === 'tr' ? 'Erken Takip Kodu' : 'Early Tracking Code'}
                            </h4>
                            <p className="text-gray-300 text-sm">
                              {language === 'tr' 
                                ? 'Dilerseniz, gönderiniz henüz depomuza ulaşmadan erken takip kodu alabilirsiniz.' 
                                : 'If you wish, you can get an early tracking code before your shipment reaches our warehouse.'
                              }
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-4 p-4 bg-green-600/10 rounded-lg border border-green-500/20">
                          <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
                          <div>
                            <h4 className="font-semibold text-white mb-2">
                              {language === 'tr' ? 'Onay ve Ödeme' : 'Approval and Payment'}
                            </h4>
                            <p className="text-gray-300 text-sm">
                              {language === 'tr' 
                                ? 'Ücreti onaylamanızın ardından ödeme faturanız hazırlanır.' 
                                : 'After you approve the fee, your payment invoice is prepared.'
                              }
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-4 p-4 bg-indigo-600/10 rounded-lg border border-indigo-500/20">
                          <div className="flex-shrink-0 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-bold">5</div>
                          <div>
                            <h4 className="font-semibold text-white mb-2">
                              {language === 'tr' ? 'Takip ve Çıkış' : 'Tracking and Departure'}
                            </h4>
                            <p className="text-gray-300 text-sm">
                              {language === 'tr' 
                                ? 'Ödeme sonrasında takip kodunuz ve gerekli evraklar paylaşılır, gönderiniz çıkışa hazırlanır.' 
                                : 'After payment, your tracking code and necessary documents are shared, your shipment is prepared for departure.'
                              }
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-8 p-4 bg-blue-600/10 rounded-lg border border-blue-500/20">
                        <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                          <Globe className="w-5 h-5 text-blue-400" />
                          {language === 'tr' ? 'Özel Hizmet' : 'Special Service'}
                        </h4>
                        <p className="text-gray-300 text-sm">
                          {language === 'tr' 
                            ? 'İstanbul veya Adana\'daysanız, kargonuzu kapınızdan ücretsiz olarak kendi kuryelerimizle alabiliriz.' 
                            : 'If you are in Istanbul or Adana, we can pick up your cargo from your door free of charge with our own couriers.'
                          }
                        </p>
                      </div>

                      <div className="text-center mt-8">
                        <Button
                          onClick={handleNewSubmission}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
                        >
                          {language === 'tr' ? 'Yeni Gönderi Formu' : 'New Shipment Form'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Contact Support Card */}
                  <Card className="border-0 bg-slate-800/50 backdrop-blur-sm">
                    <CardContent className="p-6">
                      <div className="text-center space-y-4">
                        <h3 className="text-lg font-semibold text-white">
                          {language === 'tr' ? 'Destek İletişim' : 'Support Contact'}
                        </h3>
                        <div className="space-y-3">
                          <div className="flex items-center justify-center gap-3 text-gray-300">
                            <Mail className="h-5 w-5 text-blue-400" />
                            <span className="text-sm font-medium">SUPPORT: info@dexpell.com</span>
                          </div>
                          <div className="flex items-center justify-center gap-3 text-gray-300">
                            <Phone className="h-5 w-5 text-green-400" />
                            <span className="text-sm font-medium">PHONE: +90 212 852 55 00</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Sender Information Block */}
            <Card className="border-0 bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm shadow-2xl">
              <CardHeader className="bg-gradient-to-r from-blue-600/20 to-blue-700/20 border-b border-blue-500/30">
                <CardTitle className="flex items-center gap-4">
                  <div className="p-3 bg-blue-600 rounded-xl shadow-lg">
                    <User className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      {getText('senderInfo')}
                    </h2>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="sender_name" className="text-sm font-semibold text-gray-200">
                      {getText('senderName')} <span className="text-red-400">*</span>
                    </Label>
                    <Input
                      id="sender_name"
                      type="text"
                      placeholder={getText('senderNamePlaceholder')}
                      value={formData.sender_name}
                      onChange={(e) => handleInputChange('sender_name', e.target.value)}
                      required
                      className={`h-12 bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500 ${fieldErrors.sender_name ? 'border-red-500' : ''}`}
                    />
                    {fieldErrors.sender_name && (
                      <p className="text-red-400 text-sm mt-1">{fieldErrors.sender_name}</p>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <Label htmlFor="sender_tc" className="text-sm font-semibold text-gray-200">
                      {getText('senderTC')} <span className="text-red-400">*</span>
                    </Label>
                    <Input
                      id="sender_tc"
                      type="text"
                      placeholder={getText('senderTCPlaceholder')}
                      value={formData.sender_tc}
                      onChange={(e) => handleInputChange('sender_tc', e.target.value)}
                      required
                      className={`h-12 bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500 ${fieldErrors.sender_tc ? 'border-red-500' : ''}`}
                    />
                    {fieldErrors.sender_tc && (
                      <p className="text-red-400 text-sm mt-1">{fieldErrors.sender_tc}</p>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <Label htmlFor="sender_address" className="text-sm font-semibold text-gray-200">
                      {getText('address')} <span className="text-red-400">*</span>
                    </Label>
                    <Textarea
                      id="sender_address"
                      placeholder={getText('addressPlaceholder')}
                      value={formData.sender_address}
                      onChange={(e) => handleInputChange('sender_address', e.target.value)}
                      required
                      className={`min-h-[100px] bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500 ${fieldErrors.sender_address ? 'border-red-500' : ''}`}
                    />
                    {fieldErrors.sender_address && (
                      <p className="text-red-400 text-sm mt-1">{fieldErrors.sender_address}</p>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <Label htmlFor="sender_contact" className="text-sm font-semibold text-gray-200">
                      {getText('contactNo')} <span className="text-red-400">*</span>
                    </Label>
                    <div className="flex gap-2">
                      <PhoneCodeSelector
                        value={formData.sender_phone_code}
                        onChange={(value) => handleInputChange('sender_phone_code', value)}
                      />
                      <Input
                        id="sender_contact"
                        type="tel"
                        placeholder={formData.sender_contact ? '' : getText('contactPlaceholder')}
                        value={formData.sender_contact}
                        onChange={(e) => handleInputChange('sender_contact', e.target.value)}
                        maxLength={10}
                        required
                        className={`h-12 bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500 flex-1 ${fieldErrors.sender_contact ? 'border-red-500' : ''}`}
                      />
                    </div>
                    {fieldErrors.sender_contact && (
                      <p className="text-red-400 text-sm mt-1">{fieldErrors.sender_contact}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Receiver Information Block */}
            <Card className="border-0 bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm shadow-2xl">
              <CardHeader className="bg-gradient-to-r from-green-600/20 to-green-700/20 border-b border-green-500/30">
                <CardTitle className="flex items-center gap-4">
                  <div className="p-3 bg-green-600 rounded-xl shadow-lg">
                    <MapPin className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      {getText('receiverInfo')}
                    </h2>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="receiver_name" className="text-sm font-semibold text-gray-200">
                      {getText('receiverName')} <span className="text-red-400">*</span>
                    </Label>
                    <Input
                      id="receiver_name"
                      type="text"
                      placeholder={getText('receiverNamePlaceholder')}
                      value={formData.receiver_name}
                      onChange={(e) => handleInputChange('receiver_name', e.target.value)}
                      required
                      className={`h-12 bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-green-500 focus:ring-green-500 ${fieldErrors.receiver_name ? 'border-red-500' : ''}`}
                    />
                    {fieldErrors.receiver_name && (
                      <p className="text-red-400 text-sm mt-1">{fieldErrors.receiver_name}</p>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <Label htmlFor="city_postal" className="text-sm font-semibold text-gray-200">
                      {getText('cityPostal')} <span className="text-red-400">*</span>
                    </Label>
                    <Input
                      id="city_postal"
                      type="text"
                      placeholder={getText('cityPostalPlaceholder')}
                      value={formData.city_postal}
                      onChange={(e) => handleInputChange('city_postal', e.target.value)}
                      required
                      className={`h-12 bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-green-500 focus:ring-green-500 ${fieldErrors.city_postal ? 'border-red-500' : ''}`}
                    />
                    {fieldErrors.city_postal && (
                      <p className="text-red-400 text-sm mt-1">{fieldErrors.city_postal}</p>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <Label htmlFor="receiver_address" className="text-sm font-semibold text-gray-200">
                      {getText('address')} <span className="text-red-400">*</span>
                    </Label>
                    <Textarea
                      id="receiver_address"
                      placeholder={getText('addressPlaceholder')}
                      value={formData.receiver_address}
                      onChange={(e) => handleInputChange('receiver_address', e.target.value)}
                      required
                      className={`min-h-[100px] bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-green-500 focus:ring-green-500 ${fieldErrors.receiver_address ? 'border-red-500' : ''}`}
                    />
                    {fieldErrors.receiver_address && (
                      <p className="text-red-400 text-sm mt-1">{fieldErrors.receiver_address}</p>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <Label htmlFor="destination" className="text-sm font-semibold text-gray-200">
                      {getText('destination')} <span className="text-red-400">*</span>
                    </Label>
                    <DestinationCountrySelector
                      value={formData.destination}
                      onChange={(value) => handleInputChange('destination', value)}
                      placeholder={getText('destinationPlaceholder')}
                    />
                    {fieldErrors.destination && (
                      <p className="text-red-400 text-sm mt-1">{fieldErrors.destination}</p>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <Label htmlFor="receiver_contact" className="text-sm font-semibold text-gray-200">
                      {getText('contactNo')} <span className="text-red-400">*</span>
                    </Label>
                    <div className="flex gap-2">
                      <PhoneCodeSelector
                        value={formData.receiver_phone_code}
                        onChange={(value) => handleInputChange('receiver_phone_code', value)}
                      />
                      <Input
                        id="receiver_contact"
                        type="tel"
                        placeholder={formData.receiver_contact ? '' : getText('contactPlaceholder')}
                        value={formData.receiver_contact}
                        onChange={(e) => handleInputChange('receiver_contact', e.target.value)}
                        maxLength={10}
                        required
                        className={`h-12 bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-green-500 focus:ring-green-500 flex-1 ${fieldErrors.receiver_contact ? 'border-red-500' : ''}`}
                      />
                    </div>
                    {fieldErrors.receiver_contact && (
                      <p className="text-red-400 text-sm mt-1">{fieldErrors.receiver_contact}</p>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <Label htmlFor="receiver_email" className="text-sm font-semibold text-gray-200">
                      {getText('contactEmail')} <span className="text-red-400">*</span>
                    </Label>
                    <Input
                      id="receiver_email"
                      type="email"
                      placeholder={getText('emailPlaceholder')}
                      value={formData.receiver_email}
                      onChange={(e) => handleInputChange('receiver_email', e.target.value)}
                      required
                      className={`h-12 bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-green-500 focus:ring-green-500 ${fieldErrors.receiver_email ? 'border-red-500' : ''}`}
                    />
                    {fieldErrors.receiver_email && (
                      <p className="text-red-400 text-sm mt-1">{fieldErrors.receiver_email}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Selected Carrier Information */}
            {selectedCarrier && selectedQuote && (
              <Card className="border-0 bg-gradient-to-br from-green-800/20 to-green-900/20 backdrop-blur-sm shadow-2xl border border-green-500/30">
                <CardHeader className="bg-gradient-to-r from-green-600/20 to-green-700/20 border-b border-green-500/30">
                  <CardTitle className="flex items-center gap-4">
                    <div className="p-3 bg-green-600 rounded-xl shadow-lg">
                      <Package className="h-7 w-7 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">
                        {language === 'tr' ? 'Seçilen Kargo' : 'Selected Carrier'}
                      </h2>
                      <p className="text-sm text-green-300 mt-1">
                        {selectedCarrier} - ${selectedQuote.totalPrice.toFixed(2)}
                      </p>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">{language === 'tr' ? 'Kargo Firması:' : 'Carrier:'}</span>
                      <p className="text-white font-semibold">{selectedCarrier}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">{language === 'tr' ? 'Toplam Fiyat:' : 'Total Price:'}</span>
                      <p className="text-green-400 font-bold">${selectedQuote.totalPrice.toFixed(2)}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">{language === 'tr' ? 'Servis Tipi:' : 'Service Type:'}</span>
                      <p className="text-white">{selectedQuote.serviceType}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">{language === 'tr' ? 'Bölge:' : 'Region:'}</span>
                      <p className="text-white">{selectedQuote.region || 'N/A'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Shipment Information Block */}
            <Card className="border-0 bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm shadow-2xl">
              <CardHeader className="bg-gradient-to-r from-purple-600/20 to-purple-700/20 border-b border-purple-500/30">
                <CardTitle className="flex items-center gap-4">
                  <div className="p-3 bg-purple-600 rounded-xl shadow-lg">
                    <Package className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      {getText('shipmentInfo')}
                    </h2>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="content_description" className="text-sm font-semibold text-gray-200">
                      {getText('contentDescription')} <span className="text-red-400">*</span>
                    </Label>
                    <Textarea
                      id="content_description"
                      placeholder={getText('contentPlaceholder')}
                      value={formData.content_description}
                      onChange={(e) => handleInputChange('content_description', e.target.value)}
                      required
                      className={`min-h-[100px] bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-purple-500 focus:ring-purple-500 ${fieldErrors.content_description ? 'border-red-500' : ''}`}
                    />
                    {fieldErrors.content_description && (
                      <p className="text-red-400 text-sm mt-1">{fieldErrors.content_description}</p>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <Label htmlFor="content_value" className="text-sm font-semibold text-gray-200">
                      {getText('contentValue')}
                    </Label>
                    <Input
                      id="content_value"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder={getText('valuePlaceholder')}
                      value={formData.content_value}
                      onChange={(e) => handleInputChange('content_value', e.target.value)}
                      className="h-12 bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-purple-500 focus:ring-purple-500"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Status Messages */}
            
            {submitStatus === 'error' && (
              <Card className="border-0 bg-gradient-to-r from-red-600/20 to-red-700/20 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 text-red-200">
                    <div className="p-3 bg-red-600 rounded-full">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                    <span className="font-semibold text-lg">{getText('errorMessage')}</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Submit Button */}
            <div className="flex justify-center">
              <Card className="border-0 bg-gradient-to-r from-blue-600 to-blue-700 shadow-xl max-w-md">
                <CardContent className="p-4">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-12 text-lg font-semibold bg-transparent hover:bg-white/10 text-white border-0 shadow-none transition-all duration-200"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                        {getText('submitting')}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                        {getText('submitForm')}
                      </div>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
                </form>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Success Popup */}
      <Dialog open={showSuccessPopup} onOpenChange={setShowSuccessPopup}>
        <DialogContent className="sm:max-w-md bg-gradient-to-br from-slate-800 to-slate-900 border-green-500/30">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-bold text-white flex items-center justify-center gap-3">
              <div className="p-3 bg-green-600 rounded-full">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              {language === 'tr' ? 'Gönderim Tamamlandı!' : 'Submission Completed!'}
            </DialogTitle>
          </DialogHeader>
          <div className="text-center py-6">
            <p className="text-gray-200 text-lg leading-relaxed">
              {language === 'tr' 
                ? 'Formunuz başarıyla gönderildi. En kısa sürede sizinle iletişime geçeceğiz.' 
                : 'Your form has been submitted successfully. We will contact you as soon as possible.'
              }
            </p>
          </div>
          <div className="flex justify-center">
            <Button
              onClick={handleSuccessPopupClose}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-2 rounded-lg font-semibold"
            >
              {language === 'tr' ? 'Tamam' : 'OK'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
