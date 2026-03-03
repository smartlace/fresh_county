"use client"

import React, { Fragment } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { MainLayout } from '@/components/layout/main-layout'
import { Button } from '@/components/ui/button'
import { useCart } from '@/contexts/CartContext'
import { formatPriceSimple, getImageUrl } from '@/lib/utils'
import { Minus, Plus, Trash2 } from 'lucide-react'
import { Listbox, Transition } from '@headlessui/react'
import { ChevronUpDownIcon, CheckIcon } from '@heroicons/react/24/outline'

export default function CartPage() {
  const { 
    items, 
    subtotal, 
    total, 
    deliveryCost, 
    taxAmount, 
    taxRate, 
    delivery, 
    shippingZones, 
    selectedShippingZone, 
    loadingShippingZones,
    updateQuantity, 
    removeItem, 
    setDelivery, 
    setSelectedShippingZone 
  } = useCart()

  // Set white background for cart page only
  React.useEffect(() => {
    document.body.style.backgroundColor = 'white'
    return () => {
      document.body.style.backgroundColor = '#f5f5f5'
    }
  }, [])

  if (items.length === 0) {
    return (
      <MainLayout>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🛒</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-8">Looks like you haven&apos;t added any items to your cart yet.</p>
            <Link href="/categories">
              <Button className="bg-[#FE4501] hover:bg-[#FE4501]/90 cursor-pointer">
                Start Shopping
              </Button>
            </Link>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Page Title */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">YOUR CART</h1>
        
        {/* Delivery Information */}
        <p className="text-gray-600 mb-8 text-sm">
          Choose pickup (free) or select your delivery zone. Delivery costs vary by Lagos area.
        </p>

        <div className="bg-white">
          {/* Table Headers */}
          <div className="grid grid-cols-12 gap-4 py-4 border-b border-gray-200 font-medium text-gray-700">
            <div className="col-span-6">Product</div>
            <div className="col-span-3 text-center">Quantity</div>
            <div className="col-span-3 text-right">Total</div>
          </div>

          {/* Cart Items */}
          {items.map((item) => (
            <div key={`${item.id}-${item.size}`} className="grid grid-cols-12 gap-4 py-6 border-b border-gray-200 items-center">
              {/* Product Info */}
              <div className="col-span-6 flex items-center gap-4">
                <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                  {item.image ? (
                    <Image
                      src={getImageUrl(item.image)}
                      alt={item.name}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400 text-xs">No Image</span>
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 uppercase tracking-wide">
                    {item.name}
                  </h3>
                  <p className="text-sm text-gray-600">{(() => {
                    // Display actual variant type name and value
                    // e.g., "Cup Size: Large" stays "Cup Size: Large", "Regular" becomes "Size: Regular"
                    if (item.size.includes(':')) {
                      return item.size
                    }
                    return `Size: ${item.size}`
                  })()}</p>
                  <p className="text-sm text-gray-600">₦{formatPriceSimple(item.price)} each</p>
                </div>
              </div>

              {/* Quantity Controls */}
              <div className="col-span-3 flex items-center justify-center">
                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden p-0.5">
                  <button
                    onClick={() => updateQuantity(item.id, item.size, item.quantity - 1)}
                    className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    disabled={item.quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <div className="w-12 h-10 flex items-center justify-center bg-white">
                    <span className="font-medium text-gray-900">{item.quantity}</span>
                  </div>
                  <button
                    onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)}
                    className="w-10 h-10 rounded-lg bg-[#FE4501] text-white flex items-center justify-center hover:bg-[#FE4501]/90 transition-colors cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Delete & Total */}
              <div className="col-span-3 flex items-center justify-end gap-4">
                <button
                  onClick={() => removeItem(item.id, item.size)}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <span className="text-base font-semibold text-black">
                  ₦{formatPriceSimple(item.price * item.quantity)}
                </span>
              </div>
            </div>
          ))}

          {/* Delivery Options */}
          <div className="grid grid-cols-12 gap-4 py-6 border-b border-gray-200">
            <div className="col-span-8"></div>
            <div className="col-span-4 space-y-4">
              {/* Delivery Type Selection */}
              <div className="flex items-center gap-8 justify-end">
                <span className="font-medium text-gray-700 text-base">Delivery</span>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <div className="relative">
                      <input
                        type="radio"
                        name="delivery"
                        value="pickup"
                        checked={delivery === 'pickup'}
                        onChange={() => setDelivery('pickup')}
                        className="sr-only"
                      />
                      <div className={`w-5 h-5 rounded-full border transition-colors flex items-center justify-center ${
                        delivery === 'pickup' 
                          ? 'border-[#FE4501] bg-white' 
                          : 'border-[#FF7A40] bg-[#FFF4F0]'
                      }`}>
                        {delivery === 'pickup' && (
                          <div className="w-2.5 h-2.5 rounded-full bg-[#FE4501]"></div>
                        )}
                      </div>
                    </div>
                    <span className="text-gray-900 font-medium text-base">Pickup</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <div className="relative">
                      <input
                        type="radio"
                        name="delivery"
                        value="home"
                        checked={delivery === 'home'}
                        onChange={() => setDelivery('home')}
                        className="sr-only"
                      />
                      <div className={`w-5 h-5 rounded-full border transition-colors flex items-center justify-center ${
                        delivery === 'home' 
                          ? 'border-[#FE4501] bg-white' 
                          : 'border-[#FF7A40] bg-[#FFF4F0]'
                      }`}>
                        {delivery === 'home' && (
                          <div className="w-2.5 h-2.5 rounded-full bg-[#FE4501]"></div>
                        )}
                      </div>
                    </div>
                    <span className="text-gray-900 font-medium text-base">Home Delivery</span>
                  </label>
                </div>
              </div>

              {/* Shipping Zones Selection - Only show when home delivery is selected */}
              {delivery === 'home' && (
                <div className="flex items-center justify-end">
                  <div className="relative min-w-[300px]">
                    {loadingShippingZones ? (
                      <div className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-sm text-gray-600">
                        <div className="animate-spin w-4 h-4 border-2 border-[#FE4501] border-t-transparent rounded-full"></div>
                        Loading zones...
                      </div>
                    ) : (
                      <>
                        <Listbox value={selectedShippingZone} onChange={setSelectedShippingZone}>
                          <div className="relative">
                            <Listbox.Button className="relative w-full cursor-pointer rounded-lg border border-gray-200 bg-white py-2.5 pl-4 pr-10 text-left text-base font-medium text-gray-900 focus:border-[#FE4501] focus:outline-none focus:ring-2 focus:ring-[#FE4501]/10 hover:border-gray-300">
                              <span className="block truncate">
                                {selectedShippingZone 
                                  ? `${selectedShippingZone.name} • ₦${formatPriceSimple(selectedShippingZone.price)}`
                                  : 'Choose your area'
                                }
                              </span>
                              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                <ChevronUpDownIcon
                                  className="h-5 w-5 text-gray-400"
                                  aria-hidden="true"
                                />
                              </span>
                            </Listbox.Button>

                            <Transition
                              as={Fragment}
                              leave="transition ease-in duration-100"
                              leaveFrom="opacity-100"
                              leaveTo="opacity-0"
                            >
                              <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg border border-gray-200 focus:outline-none">
                                <Listbox.Option
                                  className={({ active }) =>
                                    `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                                      active ? 'bg-[#FE4501]/10' : ''
                                    }`
                                  }
                                  value={null}
                                >
                                  {({ selected }) => (
                                    <>
                                      <span
                                        className={`block truncate text-gray-500 ${
                                          selected ? 'font-medium' : 'font-normal'
                                        }`}
                                      >
                                        Choose your area
                                      </span>
                                      {selected ? (
                                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#FE4501]">
                                          <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                        </span>
                                      ) : null}
                                    </>
                                  )}
                                </Listbox.Option>
                                {shippingZones.map((zone) => (
                                  <Listbox.Option
                                    key={zone.id}
                                    className={({ active }) =>
                                      `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                                        active ? 'bg-[#FE4501]/10' : ''
                                      }`
                                    }
                                    value={zone}
                                  >
                                    {({ selected }) => (
                                      <>
                                        <span
                                          className={`block truncate text-gray-900 ${
                                            selected ? 'font-medium' : 'font-normal'
                                          }`}
                                        >
                                          {zone.name} • ₦{formatPriceSimple(zone.price)}
                                        </span>
                                        {selected ? (
                                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#FE4501]">
                                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                          </span>
                                        ) : null}
                                      </>
                                    )}
                                  </Listbox.Option>
                                ))}
                              </Listbox.Options>
                            </Transition>
                          </div>
                        </Listbox>
                      </>
                    )}
                    {delivery === 'home' && !selectedShippingZone && !loadingShippingZones && (
                      <p className="text-xs text-red-500 mt-1.5">
                        Select shipping zone
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="py-6 space-y-4">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-8"></div>
              <div className="col-span-4">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Subtotal</span>
                    <span className="font-medium text-black text-base">₦{formatPriceSimple(subtotal)}</span>
                  </div>
                  {taxAmount > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Tax ({taxRate}%)</span>
                      <span className="font-medium text-black text-base">₦{formatPriceSimple(taxAmount)}</span>
                    </div>
                  )}
                  {delivery === 'home' && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">
                        Delivery{selectedShippingZone ? ` (${selectedShippingZone.name})` : ' (Select Zone Required)'}
                      </span>
                      <span className="font-medium text-black text-base">₦{formatPriceSimple(deliveryCost)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center text-base font-bold">
                    <span className="text-gray-900">Total</span>
                    <span className="text-black text-base">₦{formatPriceSimple(total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Checkout Button */}
          <div className="py-6">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-8"></div>
              <div className="col-span-4">
                {delivery === 'home' && !selectedShippingZone ? (
                  <Button 
                    disabled 
                    className="w-full bg-gray-400 cursor-not-allowed text-white font-semibold py-4 text-base"
                  >
                    SELECT DELIVERY ZONE
                  </Button>
                ) : (
                  <Link href="/checkout">
                    <Button className="w-full bg-[#FE4501] hover:bg-[#FE4501]/90 text-white font-semibold py-4 text-base cursor-pointer">
                      CHECKOUT
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}