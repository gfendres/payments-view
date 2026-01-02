'use client';

import { useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { Button } from '@payments-view/ui';

interface LocationSelectorProps {
  cities: string[];
  countries: string[];
  selectedCity?: string;
  selectedCountry?: string;
  onCityChange: (city?: string) => void;
  onCountryChange: (country?: string) => void;
}

/**
 * Location selector component with separate dropdowns for city and country
 */
export function LocationSelector({
  cities,
  countries,
  selectedCity,
  selectedCountry,
  onCityChange,
  onCountryChange,
}: LocationSelectorProps) {
  const [isCityOpen, setIsCityOpen] = useState(false);
  const [isCountryOpen, setIsCountryOpen] = useState(false);

  return (
    <div className="flex gap-3">
      {/* Country Selector */}
      <div className="relative flex-1">
        <label className="text-muted-foreground mb-2 block text-sm font-medium">Country</label>
        <Button
          type="button"
          variant="outline"
          className="w-full justify-between"
          onClick={() => {
            setIsCountryOpen(!isCountryOpen);
            setIsCityOpen(false);
          }}
        >
          <span>{selectedCountry || 'All Countries'}</span>
          <ChevronDown className={`h-4 w-4 transition-transform ${isCountryOpen ? 'rotate-180' : ''}`} />
        </Button>

        {isCountryOpen && (
          <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-40" onClick={() => setIsCountryOpen(false)} />

            {/* Dropdown */}
            <div className="border-border bg-card absolute top-full left-0 z-50 mt-1 w-full rounded-xl border p-2 shadow-lg">
              <div className="max-h-64 overflow-y-auto">
                <button
                  type="button"
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors ${
                    !selectedCountry ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
                  }`}
                  onClick={() => {
                    onCountryChange(undefined);
                    setIsCountryOpen(false);
                  }}
                >
                  <span className="flex-1 font-medium">All Countries</span>
                  {!selectedCountry && <Check className="h-4 w-4" />}
                </button>
                {countries.map((country) => {
                  const isSelected = selectedCountry === country;
                  return (
                    <button
                      key={country}
                      type="button"
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors ${
                        isSelected ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
                      }`}
                      onClick={() => {
                        onCountryChange(country);
                        setIsCountryOpen(false);
                      }}
                    >
                      <span className="flex-1 font-medium">{country}</span>
                      {isSelected && <Check className="h-4 w-4" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>

      {/* City Selector */}
      <div className="relative flex-1">
        <label className="text-muted-foreground mb-2 block text-sm font-medium">City</label>
        <Button
          type="button"
          variant="outline"
          className="w-full justify-between"
          onClick={() => {
            setIsCityOpen(!isCityOpen);
            setIsCountryOpen(false);
          }}
        >
          <span>{selectedCity || 'All Cities'}</span>
          <ChevronDown className={`h-4 w-4 transition-transform ${isCityOpen ? 'rotate-180' : ''}`} />
        </Button>

        {isCityOpen && (
          <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-40" onClick={() => setIsCityOpen(false)} />

            {/* Dropdown */}
            <div className="border-border bg-card absolute top-full left-0 z-50 mt-1 w-full rounded-xl border p-2 shadow-lg">
              <div className="max-h-64 overflow-y-auto">
                <button
                  type="button"
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors ${
                    !selectedCity ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
                  }`}
                  onClick={() => {
                    onCityChange(undefined);
                    setIsCityOpen(false);
                  }}
                >
                  <span className="flex-1 font-medium">All Cities</span>
                  {!selectedCity && <Check className="h-4 w-4" />}
                </button>
                {cities.map((city) => {
                  const isSelected = selectedCity === city;
                  return (
                    <button
                      key={city}
                      type="button"
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors ${
                        isSelected ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
                      }`}
                      onClick={() => {
                        onCityChange(city);
                        setIsCityOpen(false);
                      }}
                    >
                      <span className="flex-1 font-medium">{city}</span>
                      {isSelected && <Check className="h-4 w-4" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

