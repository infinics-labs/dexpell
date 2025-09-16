'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { User, MapPin, Package, Phone, Mail, Globe } from 'lucide-react';
import { translate, type SupportedLanguage } from '@/lib/i18n';
import { LanguageSwitcher } from '@/components/language-switcher';

interface FormData {
  // Sender Information
  sender_name: string;
  sender_tc: string;
  sender_address: string;
  sender_contact: string;
  
  // Receiver Information
  receiver_name: string;
  city_postal: string;
  receiver_address: string;
  destination: string;
  receiver_contact: string;
  receiver_email: string;
  
  // Shipment Information
  content_description: string;
  content_value: string;
}

export default function ShipmentRequestForm() {
  const [language, setLanguage] = useState<SupportedLanguage>('en');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  
  const [formData, setFormData] = useState<FormData>({
    sender_name: '',
    sender_tc: '',
    sender_address: '',
    sender_contact: '',
    receiver_name: '',
    city_postal: '',
    receiver_address: '',
    destination: '',
    receiver_contact: '',
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

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
          status: 'pending'
        }),
      });

      if (response.ok) {
        setSubmitStatus('success');
        // Reset form
        setFormData({
          sender_name: '',
          sender_tc: '',
          sender_address: '',
          sender_contact: '',
          receiver_name: '',
          city_postal: '',
          receiver_address: '',
          destination: '',
          receiver_contact: '',
          receiver_email: '',
          content_description: '',
          content_value: ''
        });
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
      contactPlaceholder: language === 'tr' ? 'Telefon numarası' : 'Phone number',
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
      contentValue: language === 'tr' ? 'İçerik Değeri' : 'Content Value',
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
      hipexInfo: language === 'tr' ? 'Hipex Cargo olarak, her gün dünyanın dört bir yanına hava kargo ve karayolu ile kargo gönderimi yapıyoruz!' : 'As Hipex Cargo, we make cargo shipments by air cargo and road to all over the world every day!'
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
            <LanguageSwitcher />
          </div>
          <p className="text-lg text-gray-300">
            {language === 'tr' ? 'Shipment Request Form' : 'Gönderi Talep Formu'}
          </p>
        </div>

        {/* Form */}
        <div className="max-w-6xl mx-auto">
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
                      className="h-12 bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500"
                    />
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
                      className="h-12 bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500"
                    />
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
                      className="min-h-[100px] bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <Label htmlFor="sender_contact" className="text-sm font-semibold text-gray-200">
                      {getText('contactNo')} <span className="text-red-400">*</span>
                    </Label>
                    <Input
                      id="sender_contact"
                      type="tel"
                      placeholder={getText('contactPlaceholder')}
                      value={formData.sender_contact}
                      onChange={(e) => handleInputChange('sender_contact', e.target.value)}
                      required
                      className="h-12 bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500"
                    />
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
                      className="h-12 bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-green-500 focus:ring-green-500"
                    />
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
                      className="h-12 bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-green-500 focus:ring-green-500"
                    />
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
                      className="min-h-[100px] bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-green-500 focus:ring-green-500"
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <Label htmlFor="destination" className="text-sm font-semibold text-gray-200">
                      {getText('destination')} <span className="text-red-400">*</span>
                    </Label>
                    <Input
                      id="destination"
                      type="text"
                      placeholder={getText('destinationPlaceholder')}
                      value={formData.destination}
                      onChange={(e) => handleInputChange('destination', e.target.value)}
                      required
                      className="h-12 bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-green-500 focus:ring-green-500"
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <Label htmlFor="receiver_contact" className="text-sm font-semibold text-gray-200">
                      {getText('contactNo')} <span className="text-red-400">*</span>
                    </Label>
                    <Input
                      id="receiver_contact"
                      type="tel"
                      placeholder={getText('contactPlaceholder')}
                      value={formData.receiver_contact}
                      onChange={(e) => handleInputChange('receiver_contact', e.target.value)}
                      required
                      className="h-12 bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-green-500 focus:ring-green-500"
                    />
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
                      className="h-12 bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-green-500 focus:ring-green-500"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

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
                      className="min-h-[100px] bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-purple-500 focus:ring-purple-500"
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <Label htmlFor="content_value" className="text-sm font-semibold text-gray-200">
                      {getText('contentValue')} <span className="text-red-400">*</span>
                    </Label>
                    <Input
                      id="content_value"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder={getText('valuePlaceholder')}
                      value={formData.content_value}
                      onChange={(e) => handleInputChange('content_value', e.target.value)}
                      required
                      className="h-12 bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-purple-500 focus:ring-purple-500"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Status Messages */}
            {submitStatus === 'success' && (
              <>
                <Card className="border-0 bg-gradient-to-r from-green-600/20 to-green-700/20 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 text-green-200">
                      <div className="p-3 bg-green-600 rounded-full">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="font-semibold text-lg">{getText('successMessage')}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Shipping Process Information */}
                <Card className="border-0 bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm shadow-2xl">
                  <CardHeader className="bg-gradient-to-r from-orange-600/20 to-orange-700/20 border-b border-orange-500/30">
                    <CardTitle className="flex items-center gap-4">
                      <div className="p-3 bg-orange-600 rounded-xl shadow-lg">
                        <Globe className="h-7 w-7 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-white">
                          {getText('shippingProcessTitle')}
                        </h2>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-8">
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 gap-4">
                        <div className="flex items-start gap-4 p-4 bg-slate-700/30 rounded-lg border border-slate-600/30">
                          <div className="flex-shrink-0 w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            1
                          </div>
                          <p className="text-gray-200 leading-relaxed">
                            {getText('shippingProcess1')}
                          </p>
                        </div>
                        
                        <div className="flex items-start gap-4 p-4 bg-slate-700/30 rounded-lg border border-slate-600/30">
                          <div className="flex-shrink-0 w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            2
                          </div>
                          <p className="text-gray-200 leading-relaxed">
                            {getText('shippingProcess2')}
                          </p>
                        </div>
                        
                        <div className="flex items-start gap-4 p-4 bg-slate-700/30 rounded-lg border border-slate-600/30">
                          <div className="flex-shrink-0 w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            3
                          </div>
                          <p className="text-gray-200 leading-relaxed">
                            {getText('shippingProcess3')}
                          </p>
                        </div>
                        
                        <div className="flex items-start gap-4 p-4 bg-slate-700/30 rounded-lg border border-slate-600/30">
                          <div className="flex-shrink-0 w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            4
                          </div>
                          <p className="text-gray-200 leading-relaxed">
                            {getText('shippingProcess4')}
                          </p>
                        </div>
                        
                        <div className="flex items-start gap-4 p-4 bg-slate-700/30 rounded-lg border border-slate-600/30">
                          <div className="flex-shrink-0 w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            5
                          </div>
                          <p className="text-gray-200 leading-relaxed">
                            {getText('shippingProcess5')}
                          </p>
                        </div>
                      </div>
                      
                      {/* Additional Information */}
                      <div className="mt-8 space-y-4">
                        <div className="p-4 bg-blue-600/20 rounded-lg border border-blue-500/30">
                          <p className="text-blue-200 leading-relaxed font-medium">
                            {getText('pickupService')}
                          </p>
                        </div>
                        
                        <div className="p-4 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-lg border border-purple-500/30">
                          <p className="text-purple-200 leading-relaxed font-medium text-center">
                            {getText('hipexInfo')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
            
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
        </div>

        {/* Support Information */}
        <div className="text-center mt-8 space-y-4">
          <Card className="border-0 bg-slate-800/50 backdrop-blur-sm max-w-md mx-auto">
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
    </div>
  );
}
