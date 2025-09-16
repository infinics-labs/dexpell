'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, Link, FileText, Copy, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ShippingProcessMessageProps {
  language?: 'en' | 'tr';
}

export function ShippingProcessMessage({ language = 'en' }: ShippingProcessMessageProps) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  const handleFormNavigation = () => {
    router.push('/gonderi-talep-formu');
  };

  const handleCopyMngCode = async () => {
    try {
      await navigator.clipboard.writeText('157381919');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const getText = (key: string) => {
    const texts = {
      shippingProcessTitle: language === 'tr' ? 'Gönderim Süreci' : 'Shipping Process',
      shippingProcess1: language === 'tr' ? 'Kargo Gönderimi: Gönderinizi, 157381919 MNG Anlaşma Kodu ile ücretsiz olarak tarafımıza gönderebilirsiniz.' : 'Cargo Shipment: You can send your shipment to us free of charge with the 157381919 MNG Agreement Code.',
      shippingProcess2: language === 'tr' ? 'Ölçüm ve Fiyatlandırma: Depomuza ulaşan kargonuzun ağırlık ve ölçümleri yapılarak ücretlendirme tarafınıza bildirilir.' : 'Measurement and Pricing: Weight and measurements of your cargo reaching our warehouse will be made and pricing will be notified to you.',
      shippingProcess3: language === 'tr' ? 'Erken Takip Kodu: Dilerseniz, gönderiniz henüz depomuza ulaşmadan erken takip kodu alabilirsiniz.' : 'Early Tracking Code: If you wish, you can get an early tracking code before your shipment reaches our warehouse.',
      shippingProcess4: language === 'tr' ? 'Onay ve Ödeme: Ücreti onaylamanızın ardından ödeme faturanız hazırlanır.' : 'Approval and Payment: After you approve the fee, your payment invoice is prepared.',
      shippingProcess5: language === 'tr' ? 'Takip ve Çıkış: Ödeme sonrasında takip kodunuz ve gerekli evraklar paylaşılır, gönderiniz çıkışa hazırlanır.' : 'Tracking and Departure: After payment, your tracking code and necessary documents are shared, your shipment is prepared for departure.',
      pickupService: language === 'tr' ? 'İstanbul veya Adana\'daysanız, kargonuzu kapınızdan ücretsiz olarak kendi kuryelerimizle alabiliriz.' : 'If you are in Istanbul or Adana, we can pick up your cargo from your door free of charge with our own couriers.',
      hipexInfo: language === 'tr' ? 'Hipex Cargo olarak, her gün dünyanın dört bir yanına hava kargo ve karayolu ile kargo gönderimi yapıyoruz!' : 'As Hipex Cargo, we make cargo shipments by air cargo and road to all over the world every day!',
      proceedWith: language === 'tr' ? 'Gönderinizi ilerletmek için lütfen şunları kullanın:' : 'To proceed with your shipment, please use:',
      shipmentForm: language === 'tr' ? 'Gönderi Talep Formu' : 'Shipment Request Form',
      mngCode: language === 'tr' ? 'MNG Anlaşma Kodu: 157381919' : 'MNG Agreement Code: 157381919',
      copied: language === 'tr' ? 'Kopyalandı!' : 'Copied!',
      clickToCopy: language === 'tr' ? 'Kopyalamak için tıklayın' : 'Click to copy'
    };
    return texts[key as keyof typeof texts] || key;
  };

  return (
    <Card className="mt-4 border border-gray-200 dark:border-gray-700 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Title */}
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Package className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
              {getText('shippingProcessTitle')}
            </h3>
          </div>

          {/* Process Steps */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
                1
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                {getText('shippingProcess1')}
              </p>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
                2
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                {getText('shippingProcess2')}
              </p>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
                3
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                {getText('shippingProcess3')}
              </p>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
                4
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                {getText('shippingProcess4')}
              </p>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
                5
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                {getText('shippingProcess5')}
              </p>
            </div>
          </div>

          {/* Additional Information */}
          <div className="mt-6 space-y-4 text-center">
            <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
              {getText('pickupService')}
            </p>
            
            <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
              {getText('hipexInfo')}
            </p>
          </div>

          {/* Call to Action */}
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              {getText('proceedWith')}
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={handleFormNavigation}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Link className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {getText('shipmentForm')}
                </span>
              </Button>
              
              <Button 
                onClick={handleCopyMngCode}
                variant="outline"
                className="flex items-center gap-2 border-orange-200 hover:border-orange-300 hover:bg-orange-50 dark:border-orange-800 dark:hover:border-orange-700 dark:hover:bg-orange-950"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                )}
                <span className="text-sm font-medium text-orange-600 dark:text-orange-400">
                  {copied ? getText('copied') : getText('mngCode')}
                </span>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default ShippingProcessMessage;
